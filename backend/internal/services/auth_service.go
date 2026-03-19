package services

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"skillsindex/internal/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var (
	// ErrInvalidCredentials indicates bad username or password.
	ErrInvalidCredentials = errors.New("invalid username or password")
	// ErrUserNotFound indicates user record is not found.
	ErrUserNotFound = errors.New("user not found")
	// ErrLastSuperAdmin indicates role update would remove the final super admin.
	ErrLastSuperAdmin = errors.New("cannot remove last super admin")
	// ErrInvalidCurrentPassword indicates password verification failed for password change.
	ErrInvalidCurrentPassword = errors.New("invalid current password")
	// ErrPasswordResetRateLimited indicates too many reset requests in a short period.
	ErrPasswordResetRateLimited = errors.New("password reset request rate limited")
	// ErrPasswordResetTokenInvalid indicates reset token does not exist.
	ErrPasswordResetTokenInvalid = errors.New("password reset token is invalid")
	// ErrPasswordResetTokenExpired indicates reset token has expired.
	ErrPasswordResetTokenExpired = errors.New("password reset token is expired")
	// ErrPasswordResetTokenUsed indicates reset token was already consumed.
	ErrPasswordResetTokenUsed = errors.New("password reset token was already used")
)

const passwordResetTokenTTL = 30 * time.Minute
const passwordResetRateLimitWindow = 15 * time.Minute
const passwordResetRateLimitPerUser = 5
const passwordResetRateLimitPerIP = 40

// UpdateUserProfileInput defines mutable account profile fields.
type UpdateUserProfileInput struct {
	DisplayName string
	AvatarURL   string
	Bio         string
}

// AuthService handles account registration and login validation.
type AuthService struct {
	db *gorm.DB
}

// NewAuthService creates a new auth service instance.
func NewAuthService(db *gorm.DB) *AuthService {
	return &AuthService{db: db}
}

// Register creates a new user with a bcrypt password hash.
func (s *AuthService) Register(ctx context.Context, username, password string) (models.User, error) {
	username = strings.TrimSpace(strings.ToLower(username))
	if len(username) < 3 {
		return models.User{}, fmt.Errorf("username must be at least 3 characters")
	}
	if len(password) < 8 {
		return models.User{}, fmt.Errorf("password must be at least 8 characters")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return models.User{}, fmt.Errorf("failed to hash password: %w", err)
	}

	user := models.User{
		Username:     username,
		PasswordHash: string(hash),
		Role:         models.RoleMember,
		Status:       models.UserStatusActive,
	}
	if err := s.db.WithContext(ctx).Create(&user).Error; err != nil {
		return models.User{}, fmt.Errorf("failed to create user: %w", err)
	}
	return user, nil
}

// CreateOAuthUser creates local account for third-party login flow.
func (s *AuthService) CreateOAuthUser(ctx context.Context, preferredUsername string, role models.UserRole) (models.User, error) {
	normalizedRole := models.NormalizeUserRole(string(role))
	baseUsername := normalizeOAuthUsername(preferredUsername)
	if len(baseUsername) < 3 {
		baseUsername = "user"
	}

	randomPassword, err := generateRandomPassword()
	if err != nil {
		return models.User{}, fmt.Errorf("failed to generate oauth account password: %w", err)
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(randomPassword), bcrypt.DefaultCost)
	if err != nil {
		return models.User{}, fmt.Errorf("failed to hash oauth account password: %w", err)
	}

	for idx := 0; idx < 1000; idx++ {
		username := baseUsername
		if idx > 0 {
			username = fmt.Sprintf("%s%d", baseUsername, idx+1)
		}

		var total int64
		if err := s.db.WithContext(ctx).Model(&models.User{}).Where("username = ?", username).Count(&total).Error; err != nil {
			return models.User{}, fmt.Errorf("failed to verify oauth username uniqueness: %w", err)
		}
		if total > 0 {
			continue
		}

		user := models.User{
			Username:     username,
			PasswordHash: string(hash),
			Role:         normalizedRole,
			Status:       models.UserStatusActive,
		}
		if err := s.db.WithContext(ctx).Create(&user).Error; err != nil {
			return models.User{}, fmt.Errorf("failed to create oauth user: %w", err)
		}
		return user, nil
	}
	return models.User{}, fmt.Errorf("failed to allocate oauth username")
}

// Authenticate validates username and password and returns the user account.
func (s *AuthService) Authenticate(ctx context.Context, username, password string) (models.User, error) {
	username = strings.TrimSpace(strings.ToLower(username))
	var user models.User
	if err := s.db.WithContext(ctx).Where("username = ?", username).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.User{}, ErrInvalidCredentials
		}
		return models.User{}, fmt.Errorf("failed to query user: %w", err)
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return models.User{}, ErrInvalidCredentials
	}
	if !user.IsActive() {
		return models.User{}, ErrInvalidCredentials
	}
	return user, nil
}

// GetUserByID returns a user account by id.
func (s *AuthService) GetUserByID(ctx context.Context, userID uint) (models.User, error) {
	var user models.User
	if err := s.db.WithContext(ctx).First(&user, userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.User{}, ErrUserNotFound
		}
		return models.User{}, fmt.Errorf("failed to query user: %w", err)
	}
	return user, nil
}

// GetUserByUsername returns a user account by username.
func (s *AuthService) GetUserByUsername(ctx context.Context, username string) (models.User, error) {
	normalized := strings.TrimSpace(strings.ToLower(username))
	if normalized == "" {
		return models.User{}, ErrUserNotFound
	}

	var user models.User
	if err := s.db.WithContext(ctx).Where("username = ?", normalized).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.User{}, ErrUserNotFound
		}
		return models.User{}, fmt.Errorf("failed to query user by username: %w", err)
	}
	return user, nil
}

// EnsureDefaultAccount creates or updates a bootstrap account with fixed credentials.
func (s *AuthService) EnsureDefaultAccount(ctx context.Context, username, password string, role models.UserRole) (models.User, error) {
	username = strings.TrimSpace(strings.ToLower(username))
	if len(username) < 3 {
		return models.User{}, fmt.Errorf("default account username must be at least 3 characters")
	}
	if len(password) < 8 {
		return models.User{}, fmt.Errorf("default account password must be at least 8 characters")
	}

	normalizedRole := models.NormalizeUserRole(string(role))
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return models.User{}, fmt.Errorf("failed to hash default account password: %w", err)
	}

	var user models.User
	queryErr := s.db.WithContext(ctx).Where("username = ?", username).First(&user).Error
	if queryErr != nil && !errors.Is(queryErr, gorm.ErrRecordNotFound) {
		return models.User{}, fmt.Errorf("failed to query default account: %w", queryErr)
	}

	if errors.Is(queryErr, gorm.ErrRecordNotFound) {
		user = models.User{
			Username:     username,
			PasswordHash: string(hash),
			Role:         normalizedRole,
			Status:       models.UserStatusActive,
		}
		if err := s.db.WithContext(ctx).Create(&user).Error; err != nil {
			return models.User{}, fmt.Errorf("failed to create default account: %w", err)
		}
		return user, nil
	}

	updates := map[string]any{
		"password_hash": string(hash),
		"role":          normalizedRole,
		"status":        models.UserStatusActive,
	}
	if err := s.db.WithContext(ctx).Model(&user).Updates(updates).Error; err != nil {
		return models.User{}, fmt.Errorf("failed to update default account: %w", err)
	}

	user.PasswordHash = string(hash)
	user.Role = normalizedRole
	user.Status = models.UserStatusActive
	return user, nil
}

// ListUsers returns users ordered by creation time.
func (s *AuthService) ListUsers(ctx context.Context) ([]models.User, error) {
	var users []models.User
	if err := s.db.WithContext(ctx).Order("created_at ASC").Find(&users).Error; err != nil {
		return nil, fmt.Errorf("failed to list users: %w", err)
	}
	return users, nil
}

// SetUserRole updates role of target user.
func (s *AuthService) SetUserRole(ctx context.Context, userID uint, role models.UserRole) error {
	normalizedRole := models.NormalizeUserRole(string(role))

	var target models.User
	if err := s.db.WithContext(ctx).First(&target, userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrUserNotFound
		}
		return fmt.Errorf("failed to load target user: %w", err)
	}

	currentRole := target.EffectiveRole()
	if currentRole == normalizedRole {
		return nil
	}

	if currentRole == models.RoleSuperAdmin && normalizedRole != models.RoleSuperAdmin {
		var totalSuperAdmins int64
		if err := s.db.WithContext(ctx).
			Model(&models.User{}).
			Where("role = ?", models.RoleSuperAdmin).
			Count(&totalSuperAdmins).Error; err != nil {
			return fmt.Errorf("failed to count super admins: %w", err)
		}
		if totalSuperAdmins <= 1 {
			return ErrLastSuperAdmin
		}
	}

	if err := s.db.WithContext(ctx).Model(&target).Update("role", normalizedRole).Error; err != nil {
		return fmt.Errorf("failed to update user role: %w", err)
	}
	return nil
}

// SetUserStatus updates account status.
func (s *AuthService) SetUserStatus(ctx context.Context, userID uint, status models.UserStatus) error {
	normalized := normalizeUserStatus(status)
	var target models.User
	if err := s.db.WithContext(ctx).First(&target, userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrUserNotFound
		}
		return fmt.Errorf("failed to load target user: %w", err)
	}
	if target.EffectiveRole() == models.RoleSuperAdmin && normalized == models.UserStatusDisabled {
		var activeSuperAdmins int64
		if err := s.db.WithContext(ctx).
			Model(&models.User{}).
			Where("role = ? AND status <> ?", models.RoleSuperAdmin, models.UserStatusDisabled).
			Count(&activeSuperAdmins).Error; err != nil {
			return fmt.Errorf("failed to count active super admins: %w", err)
		}
		if activeSuperAdmins <= 1 {
			return ErrLastSuperAdmin
		}
	}

	if err := s.db.WithContext(ctx).
		Model(&models.User{}).
		Where("id = ?", userID).
		Update("status", normalized).Error; err != nil {
		return fmt.Errorf("failed to update user status: %w", err)
	}
	return nil
}

// ForceSignOutUser revokes existing user sessions issued before current timestamp.
func (s *AuthService) ForceSignOutUser(ctx context.Context, userID uint) error {
	now := time.Now().UTC()
	result := s.db.WithContext(ctx).
		Model(&models.User{}).
		Where("id = ?", userID).
		Update("force_logout_at", &now)
	if result.Error != nil {
		return fmt.Errorf("failed to update force logout timestamp: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return ErrUserNotFound
	}
	return nil
}

// AdminResetPassword resets password hash for an account.
func (s *AuthService) AdminResetPassword(ctx context.Context, userID uint, newPassword string) error {
	if len(strings.TrimSpace(newPassword)) < 8 {
		return fmt.Errorf("password must be at least 8 characters")
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}
	result := s.db.WithContext(ctx).
		Model(&models.User{}).
		Where("id = ?", userID).
		Updates(map[string]any{
			"password_hash": string(hash),
			"status":        models.UserStatusActive,
		})
	if result.Error != nil {
		return fmt.Errorf("failed to reset password: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return ErrUserNotFound
	}
	return nil
}
