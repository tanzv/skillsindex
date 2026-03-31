package services

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"time"

	"skillsindex/internal/models"

	"gorm.io/gorm"
)

var (
	// ErrAPIKeyNotFound means key id or hash cannot be found.
	ErrAPIKeyNotFound = errors.New("api key not found")
	// ErrAPIKeyScopesRequired indicates update request does not contain scopes.
	ErrAPIKeyScopesRequired = errors.New("api key scopes are required")
	// ErrAPIKeyScopeInvalid indicates one or more requested scopes are invalid.
	ErrAPIKeyScopeInvalid = errors.New("invalid scope")
)

const ()

// ListAPIKeysInput defines query filters for admin key listing.
type ListAPIKeysInput struct {
	OwnerUsername string
	Status        string
	Limit         int
}

// APIKeyService manages account API key lifecycle.
type APIKeyService struct {
	db *gorm.DB
}

// NewAPIKeyService creates a new api key service.
func NewAPIKeyService(db *gorm.DB) *APIKeyService {
	return &APIKeyService{db: db}
}

// Create issues one API key and returns stored metadata with the plaintext token.
func (s *APIKeyService) Create(ctx context.Context, input CreateAPIKeyInput) (models.APIKey, string, error) {
	if input.UserID == 0 {
		return models.APIKey{}, "", fmt.Errorf("user id is required")
	}

	name := strings.TrimSpace(input.Name)
	if name == "" {
		name = "Default Token"
	}
	purpose := strings.TrimSpace(input.Purpose)
	if len(purpose) > 255 {
		return models.APIKey{}, "", fmt.Errorf("purpose is too long")
	}
	createdBy := input.CreatedBy
	if createdBy == 0 {
		createdBy = input.UserID
	}

	token, err := generateAPIKeyToken()
	if err != nil {
		return models.APIKey{}, "", err
	}
	hash := hashAPIKey(token)
	prefix := token
	if len(prefix) > 16 {
		prefix = prefix[:16]
	}

	var expiresAt *time.Time
	if input.ExpiresInDays > 0 {
		expire := time.Now().UTC().Add(time.Duration(input.ExpiresInDays) * 24 * time.Hour)
		expiresAt = &expire
	}
	scopes, err := NormalizeAPIKeyScopes(input.Scopes)
	if err != nil {
		return models.APIKey{}, "", err
	}
	if len(scopes) == 0 {
		scopes = append([]string{}, defaultAPIKeyScopes...)
	}

	key := models.APIKey{
		UserID:    input.UserID,
		Name:      name,
		Purpose:   purpose,
		CreatedBy: createdBy,
		Prefix:    prefix,
		KeyHash:   hash,
		ExpiresAt: expiresAt,
		Scopes:    strings.Join(scopes, ","),
	}
	if err := s.db.WithContext(ctx).Create(&key).Error; err != nil {
		return models.APIKey{}, "", fmt.Errorf("failed to create api key: %w", err)
	}
	return key, token, nil
}

// ListByUser returns all API keys for one account.
func (s *APIKeyService) ListByUser(ctx context.Context, userID uint) ([]models.APIKey, error) {
	if userID == 0 {
		return []models.APIKey{}, nil
	}
	var keys []models.APIKey
	if err := s.db.WithContext(ctx).
		Preload("User").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&keys).Error; err != nil {
		return nil, fmt.Errorf("failed to list api keys: %w", err)
	}
	return keys, nil
}

// ListForAdmin returns cross-account API keys with status/owner filters.
func (s *APIKeyService) ListForAdmin(ctx context.Context, input ListAPIKeysInput) ([]models.APIKey, error) {
	query := s.db.WithContext(ctx).
		Model(&models.APIKey{}).
		Preload("User")

	if owner := strings.TrimSpace(input.OwnerUsername); owner != "" {
		like := "%" + strings.ToLower(owner) + "%"
		query = query.Joins("JOIN users ON users.id = api_keys.user_id").
			Where("LOWER(users.username) LIKE ?", like)
	}

	now := time.Now().UTC()
	switch normalizeAPIKeyStatus(input.Status) {
	case "active":
		query = query.Where("api_keys.revoked_at IS NULL AND (api_keys.expires_at IS NULL OR api_keys.expires_at > ?)", now)
	case "revoked":
		query = query.Where("api_keys.revoked_at IS NOT NULL")
	case "expired":
		query = query.Where("api_keys.revoked_at IS NULL AND api_keys.expires_at IS NOT NULL AND api_keys.expires_at <= ?", now)
	default:
		// all
	}

	limit := input.Limit
	if limit <= 0 {
		limit = 500
	}
	if limit > 1000 {
		limit = 1000
	}

	var keys []models.APIKey
	if err := query.Order("api_keys.created_at DESC").Limit(limit).Find(&keys).Error; err != nil {
		return nil, fmt.Errorf("failed to list admin api keys: %w", err)
	}
	return keys, nil
}

// GetByID returns one API key by id.
func (s *APIKeyService) GetByID(ctx context.Context, keyID uint) (models.APIKey, error) {
	var key models.APIKey
	err := s.db.WithContext(ctx).First(&key, keyID).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return models.APIKey{}, ErrAPIKeyNotFound
	}
	if err != nil {
		return models.APIKey{}, fmt.Errorf("failed to load api key: %w", err)
	}
	return key, nil
}

// Revoke marks one key as revoked for the owner account.
func (s *APIKeyService) Revoke(ctx context.Context, keyID uint, ownerUserID uint) error {
	if keyID == 0 || ownerUserID == 0 {
		return ErrAPIKeyNotFound
	}
	now := time.Now().UTC()
	result := s.db.WithContext(ctx).
		Model(&models.APIKey{}).
		Where("id = ? AND user_id = ? AND revoked_at IS NULL", keyID, ownerUserID).
		Update("revoked_at", &now)
	if result.Error != nil {
		return fmt.Errorf("failed to revoke api key: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return ErrAPIKeyNotFound
	}
	return nil
}

// Rotate issues a replacement token and revokes the old key.
func (s *APIKeyService) Rotate(ctx context.Context, keyID uint, ownerUserID uint) (models.APIKey, string, error) {
	if keyID == 0 || ownerUserID == 0 {
		return models.APIKey{}, "", ErrAPIKeyNotFound
	}

	var replacement models.APIKey
	plaintext := ""

	if err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var current models.APIKey
		if err := tx.Where("id = ? AND user_id = ?", keyID, ownerUserID).First(&current).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ErrAPIKeyNotFound
			}
			return fmt.Errorf("failed to load api key for rotation: %w", err)
		}

		token, err := generateAPIKeyToken()
		if err != nil {
			return err
		}
		hash := hashAPIKey(token)
		prefix := token
		if len(prefix) > 16 {
			prefix = prefix[:16]
		}

		var expiresAt *time.Time
		if current.ExpiresAt != nil {
			value := current.ExpiresAt.UTC()
			expiresAt = &value
		}

		now := time.Now().UTC()
		replacement = models.APIKey{
			UserID:        current.UserID,
			Name:          current.Name,
			Purpose:       current.Purpose,
			CreatedBy:     current.CreatedBy,
			Prefix:        prefix,
			KeyHash:       hash,
			Scopes:        current.Scopes,
			ExpiresAt:     expiresAt,
			LastRotatedAt: &now,
		}
		if err := tx.Create(&replacement).Error; err != nil {
			return fmt.Errorf("failed to create rotated api key: %w", err)
		}

		if err := tx.
			Model(&models.APIKey{}).
			Where("id = ? AND user_id = ? AND revoked_at IS NULL", current.ID, current.UserID).
			Update("revoked_at", &now).Error; err != nil {
			return fmt.Errorf("failed to revoke original api key during rotation: %w", err)
		}
		plaintext = token
		return nil
	}); err != nil {
		return models.APIKey{}, "", err
	}

	return replacement, plaintext, nil
}

// UpdateScopes updates one key scope set for the owner account.
func (s *APIKeyService) UpdateScopes(ctx context.Context, keyID uint, ownerUserID uint, scopes []string) (models.APIKey, error) {
	if keyID == 0 || ownerUserID == 0 {
		return models.APIKey{}, ErrAPIKeyNotFound
	}

	normalized, err := NormalizeAPIKeyScopes(scopes)
	if err != nil {
		return models.APIKey{}, err
	}
	if len(normalized) == 0 {
		return models.APIKey{}, ErrAPIKeyScopesRequired
	}

	var updated models.APIKey
	if err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("id = ? AND user_id = ?", keyID, ownerUserID).First(&updated).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ErrAPIKeyNotFound
			}
			return fmt.Errorf("failed to load api key for scope update: %w", err)
		}

		if err := tx.Model(&models.APIKey{}).
			Where("id = ? AND user_id = ?", keyID, ownerUserID).
			Updates(map[string]any{
				"scopes": strings.Join(normalized, ","),
			}).Error; err != nil {
			return fmt.Errorf("failed to update api key scopes: %w", err)
		}

		updated.Scopes = strings.Join(normalized, ",")
		return nil
	}); err != nil {
		return models.APIKey{}, err
	}

	return updated, nil
}

// Validate checks whether one raw API key is active and returns metadata.
func (s *APIKeyService) Validate(ctx context.Context, rawKey string) (models.APIKey, bool, error) {
	clean := strings.TrimSpace(rawKey)
	if clean == "" {
		return models.APIKey{}, false, nil
	}
	hash := hashAPIKey(clean)
	now := time.Now().UTC()

	var key models.APIKey
	err := s.db.WithContext(ctx).
		Where("key_hash = ? AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at > ?)", hash, now).
		First(&key).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return models.APIKey{}, false, nil
	}
	if err != nil {
		return models.APIKey{}, false, fmt.Errorf("failed to validate api key: %w", err)
	}

	_ = s.db.WithContext(ctx).
		Model(&models.APIKey{}).
		Where("id = ?", key.ID).
		Update("last_used_at", &now).Error

	return key, true, nil
}

func generateAPIKeyToken() (string, error) {
	buf := make([]byte, 24)
	if _, err := rand.Read(buf); err != nil {
		return "", fmt.Errorf("failed to generate api key: %w", err)
	}
	return "sk_live_" + hex.EncodeToString(buf), nil
}

func hashAPIKey(raw string) string {
	sum := sha256.Sum256([]byte(strings.TrimSpace(raw)))
	return hex.EncodeToString(sum[:])
}
