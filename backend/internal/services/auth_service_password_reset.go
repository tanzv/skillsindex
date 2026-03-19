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

// RequestPasswordReset creates a one-time password reset token for an account.
// For unknown usernames it returns empty token with nil error to avoid account enumeration.
func (s *AuthService) RequestPasswordReset(ctx context.Context, username string, issuedIP string) (string, error) {
	username = strings.TrimSpace(strings.ToLower(username))
	issuedIP = sanitizeIssuedIP(issuedIP)
	if issuedIP == "" {
		issuedIP = "unknown"
	}

	limited, err := s.passwordResetRateLimited(ctx, nil, issuedIP)
	if err != nil {
		return "", err
	}
	if limited {
		return "", ErrPasswordResetRateLimited
	}

	if username == "" {
		return "", nil
	}

	var user models.User
	if err := s.db.WithContext(ctx).Where("username = ?", username).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", nil
		}
		return "", fmt.Errorf("failed to query user for password reset: %w", err)
	}

	limited, err = s.passwordResetRateLimited(ctx, &user.ID, issuedIP)
	if err != nil {
		return "", err
	}
	if limited {
		return "", ErrPasswordResetRateLimited
	}

	token, err := generatePasswordResetToken()
	if err != nil {
		return "", fmt.Errorf("failed to generate password reset token: %w", err)
	}

	now := time.Now().UTC()
	record := models.PasswordResetToken{
		UserID:    user.ID,
		TokenHash: hashPasswordResetToken(token),
		IssuedIP:  issuedIP,
		ExpiresAt: now.Add(passwordResetTokenTTL),
	}
	if err := s.db.WithContext(ctx).Create(&record).Error; err != nil {
		return "", fmt.Errorf("failed to create password reset token: %w", err)
	}
	return token, nil
}

// ConfirmPasswordReset validates reset token and updates account password.
func (s *AuthService) ConfirmPasswordReset(ctx context.Context, token string, newPassword string) (models.User, error) {
	token = strings.TrimSpace(token)
	if token == "" {
		return models.User{}, ErrPasswordResetTokenInvalid
	}
	newPassword = strings.TrimSpace(newPassword)
	if len(newPassword) < 8 {
		return models.User{}, fmt.Errorf("password must be at least 8 characters")
	}

	tokenHash := hashPasswordResetToken(token)
	now := time.Now().UTC()

	var resultUser models.User
	if err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var resetToken models.PasswordResetToken
		if err := tx.Where("token_hash = ?", tokenHash).First(&resetToken).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ErrPasswordResetTokenInvalid
			}
			return fmt.Errorf("failed to load password reset token: %w", err)
		}
		if resetToken.UsedAt != nil {
			return ErrPasswordResetTokenUsed
		}
		if now.After(resetToken.ExpiresAt.UTC()) {
			return ErrPasswordResetTokenExpired
		}

		var user models.User
		if err := tx.First(&user, resetToken.UserID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ErrUserNotFound
			}
			return fmt.Errorf("failed to load user for password reset: %w", err)
		}

		hash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
		if err != nil {
			return fmt.Errorf("failed to hash password: %w", err)
		}
		if err := tx.Model(&models.User{}).
			Where("id = ?", user.ID).
			Updates(map[string]any{
				"password_hash":   string(hash),
				"status":          models.UserStatusActive,
				"force_logout_at": &now,
				"updated_at":      now,
			}).Error; err != nil {
			return fmt.Errorf("failed to update password by reset token: %w", err)
		}
		if err := tx.Model(&models.PasswordResetToken{}).
			Where("id = ?", resetToken.ID).
			Updates(map[string]any{
				"used_at": now,
			}).Error; err != nil {
			return fmt.Errorf("failed to mark password reset token as used: %w", err)
		}

		user.PasswordHash = string(hash)
		user.Status = models.UserStatusActive
		user.ForceLogoutAt = &now
		resultUser = user
		return nil
	}); err != nil {
		return models.User{}, err
	}

	return resultUser, nil
}
