package services

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"skillsindex/internal/models"

	"gorm.io/gorm"
)

var (
	// ErrAPIMockProfileNotFound indicates the requested mock profile does not exist.
	ErrAPIMockProfileNotFound = errors.New("api mock profile not found")
	// ErrAPIMockDisabled indicates mock generation is disabled for the requested operation.
	ErrAPIMockDisabled = errors.New("api mock is disabled for the requested operation")
)

// UpsertCurrentAPIMockProfileInput defines one current-spec-scoped mock profile upsert request.
type UpsertCurrentAPIMockProfileInput struct {
	Name        string
	Mode        string
	IsDefault   bool
	ActorUserID uint
}

// UpsertAPIMockOverrideInput defines one mock override upsert request.
type UpsertAPIMockOverrideInput struct {
	ProfileID      uint
	OperationID    string
	StatusCode     int
	ContentType    string
	ExampleName    string
	BodyPayload    string
	HeadersPayload string
	LatencyMS      int
	ActorUserID    uint
}

// ResolveCurrentAPIMockInput defines one published mock resolution request.
type ResolveCurrentAPIMockInput struct {
	ProfileName string
	Method      string
	Path        string
}

// APIMockResolution contains the generated mock response contract.
type APIMockResolution struct {
	ProfileID   uint              `json:"profile_id"`
	ProfileName string            `json:"profile_name"`
	OperationID string            `json:"operation_id"`
	StatusCode  int               `json:"status_code"`
	ContentType string            `json:"content_type"`
	Headers     map[string]string `json:"headers"`
	Body        any               `json:"body"`
	LatencyMS   int               `json:"latency_ms"`
}

// APIMockService manages published mock profiles, overrides, and mock response resolution.
type APIMockService struct {
	db         *gorm.DB
	runtimeSvc *APIContractRuntimeService
}

// NewAPIMockService constructs a mock management service.
func NewAPIMockService(db *gorm.DB, runtimeSvc *APIContractRuntimeService) *APIMockService {
	return &APIMockService{
		db:         db,
		runtimeSvc: runtimeSvc,
	}
}

// ListCurrentProfiles returns all mock profiles for the current published spec.
func (s *APIMockService) ListCurrentProfiles(ctx context.Context) ([]models.APIMockProfile, error) {
	spec, err := getCurrentPublishedSpecRecord(ctx, s.db)
	if err != nil {
		return nil, err
	}

	var items []models.APIMockProfile
	if err := s.db.WithContext(ctx).
		Where("spec_id = ?", spec.ID).
		Order("is_default DESC, name ASC, id ASC").
		Find(&items).Error; err != nil {
		return nil, fmt.Errorf("failed to list api mock profiles: %w", err)
	}
	return items, nil
}

// UpsertCurrentProfile creates or updates one current-spec mock profile.
func (s *APIMockService) UpsertCurrentProfile(ctx context.Context, input UpsertCurrentAPIMockProfileInput) (models.APIMockProfile, error) {
	if s == nil || s.db == nil {
		return models.APIMockProfile{}, fmt.Errorf("api mock service is not configured")
	}

	spec, err := getCurrentPublishedSpecRecord(ctx, s.db)
	if err != nil {
		return models.APIMockProfile{}, err
	}

	name := strings.TrimSpace(input.Name)
	if name == "" {
		return models.APIMockProfile{}, fmt.Errorf("mock profile name is required")
	}
	mode := strings.TrimSpace(input.Mode)
	if mode == "" {
		mode = "inline"
	}
	if input.ActorUserID == 0 {
		return models.APIMockProfile{}, fmt.Errorf("actor user id is required")
	}

	var profile models.APIMockProfile
	err = s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		findErr := tx.Where("spec_id = ? AND name = ?", spec.ID, name).First(&profile).Error
		if findErr != nil && !errors.Is(findErr, gorm.ErrRecordNotFound) {
			return fmt.Errorf("failed to load api mock profile: %w", findErr)
		}
		if errors.Is(findErr, gorm.ErrRecordNotFound) {
			profile = models.APIMockProfile{
				Name:      name,
				SpecID:    spec.ID,
				CreatedBy: input.ActorUserID,
			}
		}

		profile.Mode = mode
		profile.IsDefault = input.IsDefault
		profile.UpdatedBy = input.ActorUserID

		if input.IsDefault {
			if err := tx.Model(&models.APIMockProfile{}).
				Where("spec_id = ?", spec.ID).
				Update("is_default", false).Error; err != nil {
				return fmt.Errorf("failed to clear existing default mock profiles: %w", err)
			}
		}

		if profile.ID == 0 {
			if err := tx.Select("*").Create(&profile).Error; err != nil {
				return fmt.Errorf("failed to create api mock profile: %w", err)
			}
			return nil
		}
		if err := tx.Select("*").Save(&profile).Error; err != nil {
			return fmt.Errorf("failed to update api mock profile: %w", err)
		}
		return nil
	})
	if err != nil {
		return models.APIMockProfile{}, err
	}

	return profile, nil
}

// ListProfileOverrides returns overrides for one current-spec mock profile.
func (s *APIMockService) ListProfileOverrides(ctx context.Context, profileID uint) ([]models.APIMockOverride, error) {
	profile, err := s.loadCurrentProfileByID(ctx, profileID)
	if err != nil {
		return nil, err
	}

	var items []models.APIMockOverride
	if err := s.db.WithContext(ctx).
		Where("profile_id = ?", profile.ID).
		Order("operation_id ASC").
		Find(&items).Error; err != nil {
		return nil, fmt.Errorf("failed to list api mock overrides: %w", err)
	}
	return items, nil
}

// UpsertProfileOverride creates or updates one mock override for a current-spec mock profile.
func (s *APIMockService) UpsertProfileOverride(ctx context.Context, input UpsertAPIMockOverrideInput) (models.APIMockOverride, error) {
	if s == nil || s.db == nil {
		return models.APIMockOverride{}, fmt.Errorf("api mock service is not configured")
	}
	if input.ActorUserID == 0 {
		return models.APIMockOverride{}, fmt.Errorf("actor user id is required")
	}

	profile, err := s.loadCurrentProfileByID(ctx, input.ProfileID)
	if err != nil {
		return models.APIMockOverride{}, err
	}

	operationID := strings.TrimSpace(input.OperationID)
	if operationID == "" {
		return models.APIMockOverride{}, ErrAPIOperationNotFound
	}
	if _, _, err := s.loadCurrentOperationBySpec(ctx, profile.SpecID, operationID); err != nil {
		return models.APIMockOverride{}, err
	}

	statusCode := input.StatusCode
	if statusCode <= 0 {
		statusCode = 200
	}
	contentType := strings.TrimSpace(input.ContentType)
	if contentType == "" {
		contentType = "application/json"
	}
	if input.LatencyMS < 0 {
		return models.APIMockOverride{}, fmt.Errorf("mock latency must be >= 0")
	}

	var override models.APIMockOverride
	err = s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		findErr := tx.Where("profile_id = ? AND operation_id = ?", profile.ID, operationID).First(&override).Error
		if findErr != nil && !errors.Is(findErr, gorm.ErrRecordNotFound) {
			return fmt.Errorf("failed to load api mock override: %w", findErr)
		}
		if errors.Is(findErr, gorm.ErrRecordNotFound) {
			override = models.APIMockOverride{
				ProfileID:   profile.ID,
				OperationID: operationID,
				CreatedBy:   input.ActorUserID,
			}
		}

		override.StatusCode = statusCode
		override.ContentType = contentType
		override.ExampleName = strings.TrimSpace(input.ExampleName)
		override.BodyPayload = strings.TrimSpace(input.BodyPayload)
		override.HeadersPayload = strings.TrimSpace(input.HeadersPayload)
		override.LatencyMS = input.LatencyMS
		override.UpdatedBy = input.ActorUserID

		if override.ID == 0 {
			if err := tx.Select("*").Create(&override).Error; err != nil {
				return fmt.Errorf("failed to create api mock override: %w", err)
			}
			return nil
		}
		if err := tx.Select("*").Save(&override).Error; err != nil {
			return fmt.Errorf("failed to update api mock override: %w", err)
		}
		return nil
	})
	if err != nil {
		return models.APIMockOverride{}, err
	}

	return override, nil
}

// ResolveCurrentMock returns one mock response for the current published spec, profile, and request target.
func (s *APIMockService) ResolveCurrentMock(ctx context.Context, input ResolveCurrentAPIMockInput) (APIMockResolution, error) {
	if s == nil || s.db == nil {
		return APIMockResolution{}, fmt.Errorf("api mock service is not configured")
	}
	if s.runtimeSvc == nil {
		return APIMockResolution{}, fmt.Errorf("api contract runtime service is not configured")
	}

	profile, err := s.loadCurrentProfileByName(ctx, input.ProfileName)
	if err != nil {
		return APIMockResolution{}, err
	}

	match, ok := s.runtimeSvc.MatchRequest(input.Method, input.Path)
	if !ok {
		return APIMockResolution{}, ErrAPIOperationNotFound
	}
	if !match.Policy.MockEnabled {
		return APIMockResolution{}, ErrAPIMockDisabled
	}

	override, err := s.findProfileOverride(ctx, profile.ID, match.Operation.OperationID)
	if err != nil {
		return APIMockResolution{}, err
	}

	body := any(map[string]any{})
	headers := map[string]string{}
	statusCode := 200
	contentType := "application/json"
	latencyMS := 0
	if override != nil {
		statusCode = override.StatusCode
		contentType = override.ContentType
		latencyMS = override.LatencyMS

		headers, err = parseMockHeadersPayload(override.HeadersPayload)
		if err != nil {
			return APIMockResolution{}, err
		}
		body, err = parseMockBodyPayload(override.BodyPayload)
		if err != nil {
			return APIMockResolution{}, err
		}
	}

	return APIMockResolution{
		ProfileID:   profile.ID,
		ProfileName: profile.Name,
		OperationID: match.Operation.OperationID,
		StatusCode:  statusCode,
		ContentType: contentType,
		Headers:     headers,
		Body:        body,
		LatencyMS:   latencyMS,
	}, nil
}
