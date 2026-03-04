package services

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"skillsindex/internal/models"

	"gorm.io/gorm"
)

var (
	// ErrOAuthGrantNotFound means the user has no grant with provider.
	ErrOAuthGrantNotFound = errors.New("oauth grant not found")
	// ErrOAuthExternalIdentityBound means external identity belongs to another local user.
	ErrOAuthExternalIdentityBound = errors.New("oauth external identity already bound")
)

// OAuthGrantService manages third-party temporary authorization grants.
type OAuthGrantService struct {
	db *gorm.DB
}

// UpsertOAuthGrantInput stores grant upsert parameters.
type UpsertOAuthGrantInput struct {
	UserID           uint
	Provider         models.OAuthProvider
	ExternalUserID   string
	AccessToken      string
	RefreshToken     string
	Scope            string
	ExpiresAt        time.Time
	RefreshExpiresAt time.Time
}

// NewOAuthGrantService creates OAuth grant service.
func NewOAuthGrantService(db *gorm.DB) *OAuthGrantService {
	return &OAuthGrantService{db: db}
}

// UpsertGrant creates or updates a user-provider grant.
func (s *OAuthGrantService) UpsertGrant(ctx context.Context, input UpsertOAuthGrantInput) (models.OAuthGrant, error) {
	if input.UserID == 0 {
		return models.OAuthGrant{}, fmt.Errorf("user id is required")
	}
	if strings.TrimSpace(string(input.Provider)) == "" {
		return models.OAuthGrant{}, fmt.Errorf("provider is required")
	}
	if strings.TrimSpace(input.ExternalUserID) == "" {
		return models.OAuthGrant{}, fmt.Errorf("external user id is required")
	}
	if strings.TrimSpace(input.AccessToken) == "" {
		return models.OAuthGrant{}, fmt.Errorf("access token is required")
	}
	if input.ExpiresAt.IsZero() {
		return models.OAuthGrant{}, fmt.Errorf("expires at is required")
	}

	normalizedProvider := models.OAuthProvider(strings.ToLower(strings.TrimSpace(string(input.Provider))))
	externalID := strings.TrimSpace(input.ExternalUserID)

	var externalGrant models.OAuthGrant
	err := s.db.WithContext(ctx).
		Where("provider = ? AND external_user_id = ?", normalizedProvider, externalID).
		First(&externalGrant).Error
	if err == nil && externalGrant.UserID != input.UserID {
		return models.OAuthGrant{}, ErrOAuthExternalIdentityBound
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return models.OAuthGrant{}, fmt.Errorf("failed to query oauth external mapping: %w", err)
	}

	var grant models.OAuthGrant
	queryErr := s.db.WithContext(ctx).
		Where("user_id = ? AND provider = ?", input.UserID, normalizedProvider).
		First(&grant).Error

	if errors.Is(queryErr, gorm.ErrRecordNotFound) {
		grant = models.OAuthGrant{
			UserID:           input.UserID,
			Provider:         normalizedProvider,
			ExternalUserID:   externalID,
			AccessToken:      input.AccessToken,
			RefreshToken:     strings.TrimSpace(input.RefreshToken),
			Scope:            strings.TrimSpace(input.Scope),
			ExpiresAt:        input.ExpiresAt.UTC(),
			RefreshExpiresAt: input.RefreshExpiresAt.UTC(),
		}
		if err := s.db.WithContext(ctx).Create(&grant).Error; err != nil {
			return models.OAuthGrant{}, fmt.Errorf("failed to create oauth grant: %w", err)
		}
		return grant, nil
	}
	if queryErr != nil {
		return models.OAuthGrant{}, fmt.Errorf("failed to query oauth grant: %w", queryErr)
	}

	updates := map[string]any{
		"external_user_id":   externalID,
		"access_token":       input.AccessToken,
		"refresh_token":      strings.TrimSpace(input.RefreshToken),
		"scope":              strings.TrimSpace(input.Scope),
		"expires_at":         input.ExpiresAt.UTC(),
		"refresh_expires_at": input.RefreshExpiresAt.UTC(),
	}
	if err := s.db.WithContext(ctx).Model(&grant).Updates(updates).Error; err != nil {
		return models.OAuthGrant{}, fmt.Errorf("failed to update oauth grant: %w", err)
	}
	grant.ExternalUserID = externalID
	grant.AccessToken = input.AccessToken
	grant.RefreshToken = strings.TrimSpace(input.RefreshToken)
	grant.Scope = strings.TrimSpace(input.Scope)
	grant.ExpiresAt = input.ExpiresAt.UTC()
	grant.RefreshExpiresAt = input.RefreshExpiresAt.UTC()
	return grant, nil
}

// GetGrantByUserProvider returns one grant by user and provider.
func (s *OAuthGrantService) GetGrantByUserProvider(
	ctx context.Context,
	userID uint,
	provider models.OAuthProvider,
) (models.OAuthGrant, error) {
	var grant models.OAuthGrant
	err := s.db.WithContext(ctx).
		Where("user_id = ? AND provider = ?", userID, strings.ToLower(strings.TrimSpace(string(provider)))).
		First(&grant).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return models.OAuthGrant{}, ErrOAuthGrantNotFound
	}
	if err != nil {
		return models.OAuthGrant{}, fmt.Errorf("failed to load oauth grant: %w", err)
	}
	return grant, nil
}

// FindUserByExternalID resolves local user from provider external ID.
func (s *OAuthGrantService) FindUserByExternalID(
	ctx context.Context,
	provider models.OAuthProvider,
	externalUserID string,
) (models.User, error) {
	var grant models.OAuthGrant
	err := s.db.WithContext(ctx).
		Where("provider = ? AND external_user_id = ?", strings.ToLower(strings.TrimSpace(string(provider))), strings.TrimSpace(externalUserID)).
		First(&grant).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return models.User{}, ErrOAuthGrantNotFound
	}
	if err != nil {
		return models.User{}, fmt.Errorf("failed to load oauth grant by external id: %w", err)
	}

	var user models.User
	if err := s.db.WithContext(ctx).First(&user, grant.UserID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.User{}, ErrUserNotFound
		}
		return models.User{}, fmt.Errorf("failed to load user by oauth grant: %w", err)
	}
	return user, nil
}

// RevokeGrant removes a user-provider grant.
func (s *OAuthGrantService) RevokeGrant(ctx context.Context, userID uint, provider models.OAuthProvider) error {
	result := s.db.WithContext(ctx).
		Where("user_id = ? AND provider = ?", userID, strings.ToLower(strings.TrimSpace(string(provider)))).
		Delete(&models.OAuthGrant{})
	if result.Error != nil {
		return fmt.Errorf("failed to revoke oauth grant: %w", result.Error)
	}
	return nil
}

// IsGrantActive reports whether grant access token is still valid.
func (s *OAuthGrantService) IsGrantActive(grant models.OAuthGrant, now time.Time) bool {
	if grant.ID == 0 {
		return false
	}
	if now.IsZero() {
		now = time.Now().UTC()
	}
	return now.Before(grant.ExpiresAt)
}
