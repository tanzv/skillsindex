package services

import (
	"context"
	"errors"
	"fmt"
	"net/url"
	"strings"
	"unicode/utf8"

	"skillsindex/internal/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// UpdateProfile updates account profile fields for current user.
func (s *AuthService) UpdateProfile(ctx context.Context, userID uint, input UpdateUserProfileInput) (models.User, error) {
	var user models.User
	if err := s.db.WithContext(ctx).First(&user, userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.User{}, ErrUserNotFound
		}
		return models.User{}, fmt.Errorf("failed to load user: %w", err)
	}

	displayName := strings.TrimSpace(input.DisplayName)
	avatarURL := strings.TrimSpace(input.AvatarURL)
	bio := strings.TrimSpace(input.Bio)

	if displayName != "" {
		if utf8.RuneCountInString(displayName) > 64 {
			return models.User{}, fmt.Errorf("display name must be 64 characters or fewer")
		}
		if containsControlCharacters(displayName) {
			return models.User{}, fmt.Errorf("display name contains unsupported characters")
		}
	}
	if avatarURL != "" {
		parsed, err := url.ParseRequestURI(avatarURL)
		if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") {
			return models.User{}, fmt.Errorf("avatar url must be a valid http or https url")
		}
	}
	if utf8.RuneCountInString(bio) > 500 {
		return models.User{}, fmt.Errorf("bio must be 500 characters or fewer")
	}

	user.DisplayName = displayName
	user.AvatarURL = avatarURL
	user.Bio = bio

	if err := s.db.WithContext(ctx).Model(&user).Updates(map[string]any{
		"display_name": user.DisplayName,
		"avatar_url":   user.AvatarURL,
		"bio":          user.Bio,
	}).Error; err != nil {
		return models.User{}, fmt.Errorf("failed to update profile: %w", err)
	}

	return user, nil
}

// ChangePassword verifies current password and updates account password hash.
func (s *AuthService) ChangePassword(ctx context.Context, userID uint, currentPassword string, newPassword string) error {
	currentPassword = strings.TrimSpace(currentPassword)
	newPassword = strings.TrimSpace(newPassword)
	if len(newPassword) < 8 {
		return fmt.Errorf("password must be at least 8 characters")
	}
	if currentPassword == newPassword {
		return fmt.Errorf("new password must differ from current password")
	}

	var user models.User
	if err := s.db.WithContext(ctx).First(&user, userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrUserNotFound
		}
		return fmt.Errorf("failed to load user: %w", err)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(currentPassword)); err != nil {
		return ErrInvalidCurrentPassword
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	if err := s.db.WithContext(ctx).
		Model(&models.User{}).
		Where("id = ?", userID).
		Updates(map[string]any{
			"password_hash": string(hash),
			"status":        models.UserStatusActive,
		}).Error; err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}
	return nil
}
