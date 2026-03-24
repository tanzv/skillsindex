package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"skillsindex/internal/models"

	"gorm.io/gorm"
)

func (s *APIMockService) loadCurrentProfileByID(ctx context.Context, profileID uint) (models.APIMockProfile, error) {
	if profileID == 0 {
		return models.APIMockProfile{}, ErrAPIMockProfileNotFound
	}
	spec, err := getCurrentPublishedSpecRecord(ctx, s.db)
	if err != nil {
		return models.APIMockProfile{}, err
	}

	var profile models.APIMockProfile
	queryErr := s.db.WithContext(ctx).
		Where("spec_id = ? AND id = ?", spec.ID, profileID).
		First(&profile).Error
	if errors.Is(queryErr, gorm.ErrRecordNotFound) {
		return models.APIMockProfile{}, ErrAPIMockProfileNotFound
	}
	if queryErr != nil {
		return models.APIMockProfile{}, fmt.Errorf("failed to load api mock profile: %w", queryErr)
	}
	return profile, nil
}

func (s *APIMockService) loadCurrentProfileByName(ctx context.Context, profileName string) (models.APIMockProfile, error) {
	spec, err := getCurrentPublishedSpecRecord(ctx, s.db)
	if err != nil {
		return models.APIMockProfile{}, err
	}

	cleanName := strings.TrimSpace(profileName)
	var profile models.APIMockProfile
	query := s.db.WithContext(ctx).Where("spec_id = ?", spec.ID)
	if cleanName == "" {
		query = query.Where("is_default = ?", true).Order("id ASC")
	} else {
		query = query.Where("name = ?", cleanName)
	}
	queryErr := query.First(&profile).Error
	if errors.Is(queryErr, gorm.ErrRecordNotFound) {
		return models.APIMockProfile{}, ErrAPIMockProfileNotFound
	}
	if queryErr != nil {
		return models.APIMockProfile{}, fmt.Errorf("failed to load api mock profile: %w", queryErr)
	}
	return profile, nil
}

func (s *APIMockService) loadCurrentOperationBySpec(ctx context.Context, specID uint, operationID string) (models.APISpec, models.APIOperation, error) {
	spec, err := getCurrentPublishedSpecRecord(ctx, s.db)
	if err != nil {
		return models.APISpec{}, models.APIOperation{}, err
	}
	if spec.ID != specID {
		return models.APISpec{}, models.APIOperation{}, ErrAPIOperationNotFound
	}

	var operation models.APIOperation
	queryErr := s.db.WithContext(ctx).
		Where("spec_id = ? AND operation_id = ?", specID, strings.TrimSpace(operationID)).
		First(&operation).Error
	if errors.Is(queryErr, gorm.ErrRecordNotFound) {
		return models.APISpec{}, models.APIOperation{}, ErrAPIOperationNotFound
	}
	if queryErr != nil {
		return models.APISpec{}, models.APIOperation{}, fmt.Errorf("failed to load api operation: %w", queryErr)
	}
	return spec, operation, nil
}

func (s *APIMockService) findProfileOverride(ctx context.Context, profileID uint, operationID string) (*models.APIMockOverride, error) {
	var override models.APIMockOverride
	err := s.db.WithContext(ctx).
		Where("profile_id = ? AND operation_id = ?", profileID, operationID).
		First(&override).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to load api mock override: %w", err)
	}
	return &override, nil
}

func parseMockHeadersPayload(raw string) (map[string]string, error) {
	clean := strings.TrimSpace(raw)
	if clean == "" {
		return map[string]string{}, nil
	}

	var decoded map[string]any
	if err := json.Unmarshal([]byte(clean), &decoded); err != nil {
		return nil, fmt.Errorf("invalid mock headers payload: %w", err)
	}

	headers := make(map[string]string, len(decoded))
	for key, value := range decoded {
		headers[strings.ToLower(strings.TrimSpace(key))] = fmt.Sprintf("%v", value)
	}
	return headers, nil
}

func parseMockBodyPayload(raw string) (any, error) {
	clean := strings.TrimSpace(raw)
	if clean == "" {
		return map[string]any{}, nil
	}

	var decoded any
	if err := json.Unmarshal([]byte(clean), &decoded); err == nil {
		return decoded, nil
	}
	return clean, nil
}
