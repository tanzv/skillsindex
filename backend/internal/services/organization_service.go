package services

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"unicode"

	"skillsindex/internal/models"

	"gorm.io/gorm"
)

var (
	// ErrOrganizationNotFound means target organization does not exist.
	ErrOrganizationNotFound = errors.New("organization not found")
	// ErrOrganizationPermissionDenied means actor has no org permission.
	ErrOrganizationPermissionDenied = errors.New("organization permission denied")
	// ErrOrganizationMembershipNotFound means target membership does not exist.
	ErrOrganizationMembershipNotFound = errors.New("organization membership not found")
	// ErrOrganizationLastOwner means operation would remove the final owner in an organization.
	ErrOrganizationLastOwner = errors.New("cannot remove last organization owner")
)

// OrganizationService manages organizations and memberships.
type OrganizationService struct {
	db *gorm.DB
}

// NewOrganizationService creates organization service instance.
func NewOrganizationService(db *gorm.DB) *OrganizationService {
	return &OrganizationService{db: db}
}

// GetByID returns one organization by id.
func (s *OrganizationService) GetByID(ctx context.Context, organizationID uint) (models.Organization, error) {
	var organization models.Organization
	if err := s.db.WithContext(ctx).First(&organization, organizationID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.Organization{}, ErrOrganizationNotFound
		}
		return models.Organization{}, fmt.Errorf("failed to load organization: %w", err)
	}
	return organization, nil
}

// CreateOrganization creates organization and owner membership in one transaction.
func (s *OrganizationService) CreateOrganization(ctx context.Context, name string, creatorUserID uint) (models.Organization, error) {
	trimmedName := strings.TrimSpace(name)
	if len(trimmedName) < 2 {
		return models.Organization{}, fmt.Errorf("organization name must be at least 2 characters")
	}
	if creatorUserID == 0 {
		return models.Organization{}, fmt.Errorf("creator user id is required")
	}

	baseSlug := slugify(trimmedName)
	slug, err := s.generateUniqueSlug(ctx, baseSlug)
	if err != nil {
		return models.Organization{}, err
	}

	tx := s.db.WithContext(ctx).Begin()
	if tx.Error != nil {
		return models.Organization{}, fmt.Errorf("failed to start transaction: %w", tx.Error)
	}
	defer tx.Rollback()

	org := models.Organization{
		Name: trimmedName,
		Slug: slug,
	}
	if err := tx.Create(&org).Error; err != nil {
		return models.Organization{}, fmt.Errorf("failed to create organization: %w", err)
	}

	member := models.OrganizationMember{
		OrganizationID: org.ID,
		UserID:         creatorUserID,
		Role:           models.OrganizationRoleOwner,
	}
	if err := tx.Create(&member).Error; err != nil {
		return models.Organization{}, fmt.Errorf("failed to create owner membership: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		return models.Organization{}, fmt.Errorf("failed to commit organization create transaction: %w", err)
	}
	return org, nil
}

// ListOrganizations returns organizations visible to actor.
func (s *OrganizationService) ListOrganizations(ctx context.Context, actor models.User) ([]models.Organization, error) {
	query := s.db.WithContext(ctx).
		Model(&models.Organization{}).
		Order("organizations.created_at ASC")

	if !actor.CanViewAllSkills() {
		if actor.ID == 0 {
			return []models.Organization{}, nil
		}
		query = query.Joins(
			"JOIN organization_members ON organization_members.organization_id = organizations.id",
		).Where("organization_members.user_id = ?", actor.ID)
	}

	var organizations []models.Organization
	if err := query.Find(&organizations).Error; err != nil {
		return nil, fmt.Errorf("failed to list organizations: %w", err)
	}
	return organizations, nil
}

// GetMembership returns one organization membership by org and user.
func (s *OrganizationService) GetMembership(ctx context.Context, organizationID uint, userID uint) (models.OrganizationMember, error) {
	var member models.OrganizationMember
	err := s.db.WithContext(ctx).
		Preload("Organization").
		Preload("User").
		Where("organization_id = ? AND user_id = ?", organizationID, userID).
		First(&member).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return models.OrganizationMember{}, ErrOrganizationMembershipNotFound
	}
	if err != nil {
		return models.OrganizationMember{}, fmt.Errorf("failed to load membership: %w", err)
	}
	return member, nil
}

// ListMembershipsByUser returns all memberships for one user.
func (s *OrganizationService) ListMembershipsByUser(ctx context.Context, userID uint) ([]models.OrganizationMember, error) {
	var members []models.OrganizationMember
	if err := s.db.WithContext(ctx).
		Preload("Organization").
		Where("user_id = ?", userID).
		Order("created_at ASC").
		Find(&members).Error; err != nil {
		return nil, fmt.Errorf("failed to list memberships: %w", err)
	}
	return members, nil
}

// AddOrUpdateMember creates or updates target membership role.
func (s *OrganizationService) AddOrUpdateMember(
	ctx context.Context,
	organizationID uint,
	actor models.User,
	targetUserID uint,
	role models.OrganizationRole,
) error {
	if organizationID == 0 || targetUserID == 0 {
		return fmt.Errorf("organization id and target user id are required")
	}
	normalizedRole := models.NormalizeOrganizationRole(string(role))

	allowed, err := s.canManageMembership(ctx, organizationID, actor)
	if err != nil {
		return err
	}
	if !allowed {
		return ErrOrganizationPermissionDenied
	}

	var org models.Organization
	if err := s.db.WithContext(ctx).First(&org, organizationID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrOrganizationNotFound
		}
		return fmt.Errorf("failed to load organization: %w", err)
	}

	var member models.OrganizationMember
	queryErr := s.db.WithContext(ctx).
		Where("organization_id = ? AND user_id = ?", organizationID, targetUserID).
		First(&member).Error
	if queryErr == nil {
		if err := s.db.WithContext(ctx).
			Model(&member).
			Update("role", normalizedRole).Error; err != nil {
			return fmt.Errorf("failed to update membership role: %w", err)
		}
		return nil
	}
	if !errors.Is(queryErr, gorm.ErrRecordNotFound) {
		return fmt.Errorf("failed to query membership: %w", queryErr)
	}

	member = models.OrganizationMember{
		OrganizationID: organizationID,
		UserID:         targetUserID,
		Role:           normalizedRole,
	}
	if err := s.db.WithContext(ctx).Create(&member).Error; err != nil {
		return fmt.Errorf("failed to create organization member: %w", err)
	}
	return nil
}

// ListMembers returns all memberships in one organization when actor has management permission.
func (s *OrganizationService) ListMembers(
	ctx context.Context,
	organizationID uint,
	actor models.User,
) ([]models.OrganizationMember, error) {
	if organizationID == 0 {
		return nil, fmt.Errorf("organization id is required")
	}

	allowed, err := s.canManageMembership(ctx, organizationID, actor)
	if err != nil {
		return nil, err
	}
	if !allowed {
		return nil, ErrOrganizationPermissionDenied
	}

	var org models.Organization
	if err := s.db.WithContext(ctx).First(&org, organizationID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrOrganizationNotFound
		}
		return nil, fmt.Errorf("failed to load organization: %w", err)
	}

	var members []models.OrganizationMember
	if err := s.db.WithContext(ctx).
		Preload("User").
		Where("organization_id = ?", organizationID).
		Order("created_at ASC").
		Find(&members).Error; err != nil {
		return nil, fmt.Errorf("failed to list organization members: %w", err)
	}
	return members, nil
}

// RemoveMember removes one user membership from organization with owner guard.
func (s *OrganizationService) RemoveMember(
	ctx context.Context,
	organizationID uint,
	actor models.User,
	targetUserID uint,
) error {
	if organizationID == 0 || targetUserID == 0 {
		return fmt.Errorf("organization id and target user id are required")
	}

	allowed, err := s.canManageMembership(ctx, organizationID, actor)
	if err != nil {
		return err
	}
	if !allowed {
		return ErrOrganizationPermissionDenied
	}

	var target models.OrganizationMember
	if err := s.db.WithContext(ctx).
		Where("organization_id = ? AND user_id = ?", organizationID, targetUserID).
		First(&target).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrOrganizationMembershipNotFound
		}
		return fmt.Errorf("failed to load target membership: %w", err)
	}

	if target.Role == models.OrganizationRoleOwner {
		var ownerCount int64
		if err := s.db.WithContext(ctx).
			Model(&models.OrganizationMember{}).
			Where("organization_id = ? AND role = ?", organizationID, models.OrganizationRoleOwner).
			Count(&ownerCount).Error; err != nil {
			return fmt.Errorf("failed to count organization owners: %w", err)
		}
		if ownerCount <= 1 {
			return ErrOrganizationLastOwner
		}
	}

	if err := s.db.WithContext(ctx).
		Where("organization_id = ? AND user_id = ?", organizationID, targetUserID).
		Delete(&models.OrganizationMember{}).Error; err != nil {
		return fmt.Errorf("failed to remove organization member: %w", err)
	}
	return nil
}

// CanManageSkillInOrganization checks whether user can mutate a skill in organization.
func (s *OrganizationService) CanManageSkillInOrganization(
	ctx context.Context,
	user models.User,
	organizationID uint,
	skillOwnerID uint,
) (bool, error) {
	if user.CanViewAllSkills() {
		return true, nil
	}

	member, err := s.GetMembership(ctx, organizationID, user.ID)
	if err != nil {
		if errors.Is(err, ErrOrganizationMembershipNotFound) {
			return false, nil
		}
		return false, err
	}

	switch member.Role {
	case models.OrganizationRoleOwner, models.OrganizationRoleAdmin:
		return true, nil
	case models.OrganizationRoleMember:
		return user.ID != 0 && user.ID == skillOwnerID, nil
	default:
		return false, nil
	}
}

func (s *OrganizationService) canManageMembership(ctx context.Context, organizationID uint, actor models.User) (bool, error) {
	if actor.CanViewAllSkills() {
		return true, nil
	}
	member, err := s.GetMembership(ctx, organizationID, actor.ID)
	if err != nil {
		if errors.Is(err, ErrOrganizationMembershipNotFound) {
			return false, nil
		}
		return false, err
	}
	return member.Role == models.OrganizationRoleOwner || member.Role == models.OrganizationRoleAdmin, nil
}

func (s *OrganizationService) generateUniqueSlug(ctx context.Context, baseSlug string) (string, error) {
	base := strings.TrimSpace(baseSlug)
	if base == "" {
		base = "organization"
	}
	candidate := base
	for idx := 1; idx <= 1000; idx++ {
		var total int64
		if err := s.db.WithContext(ctx).
			Model(&models.Organization{}).
			Where("slug = ?", candidate).
			Count(&total).Error; err != nil {
			return "", fmt.Errorf("failed to validate organization slug: %w", err)
		}
		if total == 0 {
			return candidate, nil
		}
		candidate = fmt.Sprintf("%s-%d", base, idx+1)
	}
	return "", fmt.Errorf("failed to allocate unique organization slug")
}

func slugify(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	if value == "" {
		return "organization"
	}

	var b strings.Builder
	lastDash := false
	for _, r := range value {
		if unicode.IsLetter(r) || unicode.IsDigit(r) {
			b.WriteRune(r)
			lastDash = false
			continue
		}
		if !lastDash {
			b.WriteRune('-')
			lastDash = true
		}
	}

	result := strings.Trim(b.String(), "-")
	if result == "" {
		return "organization"
	}
	return result
}
