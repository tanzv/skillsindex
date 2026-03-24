package services

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"skillsindex/internal/models"

	"gorm.io/gorm"
)

// APIOperationPolicySnapshot returns one published operation with its stored and effective runtime policy.
type APIOperationPolicySnapshot struct {
	Spec      models.APISpec               `json:"spec"`
	Operation models.APIOperation          `json:"operation"`
	Policy    *models.APIOperationPolicy   `json:"policy,omitempty"`
	Resolved  ResolvedAPIOperationPolicy   `json:"resolved"`
}

// UpsertCurrentAPIOperationPolicyInput defines one runtime policy update for the current published spec.
type UpsertCurrentAPIOperationPolicyInput struct {
	OperationID    string
	AuthMode       string
	RequiredRoles  []string
	RequiredScopes []string
	Enabled        bool
	MockEnabled    bool
	ExportEnabled  bool
	ActorUserID    uint
}

// APIPolicyService manages runtime policy overrides for published API operations.
type APIPolicyService struct {
	db              *gorm.DB
	runtimeReloader apiRuntimeReloader
}

// NewAPIPolicyService constructs an API policy service.
func NewAPIPolicyService(db *gorm.DB) *APIPolicyService {
	return &APIPolicyService{db: db}
}

// SetRuntimeReloader wires a runtime registry reloader for publish-time and policy refresh coordination.
func (s *APIPolicyService) SetRuntimeReloader(reloader apiRuntimeReloader) {
	if s == nil {
		return
	}
	s.runtimeReloader = reloader
}

// ListCurrentOperations returns extracted operations and resolved runtime policies for the current published spec.
func (s *APIPolicyService) ListCurrentOperations(ctx context.Context) ([]APIOperationPolicySnapshot, error) {
	spec, err := getCurrentPublishedSpecRecord(ctx, s.db)
	if err != nil {
		return nil, err
	}

	var operations []models.APIOperation
	if err := s.db.WithContext(ctx).
		Where("spec_id = ?", spec.ID).
		Order("path ASC, method ASC, operation_id ASC").
		Find(&operations).Error; err != nil {
		return nil, fmt.Errorf("failed to list api operations: %w", err)
	}

	policiesByOperationID, err := s.loadPoliciesByOperationID(ctx, spec.ID)
	if err != nil {
		return nil, err
	}

	items := make([]APIOperationPolicySnapshot, 0, len(operations))
	for _, operation := range operations {
		policy := policiesByOperationID[operation.OperationID]
		items = append(items, APIOperationPolicySnapshot{
			Spec:      spec,
			Operation: operation,
			Policy:    policy,
			Resolved:  resolveAPIOperationPolicy(operation, policy),
		})
	}
	return items, nil
}

// GetCurrentOperationPolicy returns one published operation with its stored and effective runtime policy.
func (s *APIPolicyService) GetCurrentOperationPolicy(ctx context.Context, operationID string) (APIOperationPolicySnapshot, error) {
	spec, operation, err := s.loadCurrentOperation(ctx, operationID)
	if err != nil {
		return APIOperationPolicySnapshot{}, err
	}

	policy, err := s.findOperationPolicy(ctx, spec.ID, operation.OperationID)
	if err != nil {
		return APIOperationPolicySnapshot{}, err
	}

	return APIOperationPolicySnapshot{
		Spec:      spec,
		Operation: operation,
		Policy:    policy,
		Resolved:  resolveAPIOperationPolicy(operation, policy),
	}, nil
}

// UpsertCurrentOperationPolicy creates or updates one runtime policy for the current published spec.
func (s *APIPolicyService) UpsertCurrentOperationPolicy(ctx context.Context, input UpsertCurrentAPIOperationPolicyInput) (APIOperationPolicySnapshot, error) {
	if s == nil || s.db == nil {
		return APIOperationPolicySnapshot{}, fmt.Errorf("api policy service is not configured")
	}

	operationID := strings.TrimSpace(input.OperationID)
	if operationID == "" {
		return APIOperationPolicySnapshot{}, ErrAPIOperationNotFound
	}
	if input.ActorUserID == 0 {
		return APIOperationPolicySnapshot{}, fmt.Errorf("actor user id is required")
	}

	authMode, err := normalizeAPIOperationAuthMode(input.AuthMode)
	if err != nil {
		return APIOperationPolicySnapshot{}, err
	}
	requiredRoles, err := validateRequiredRoles(input.RequiredRoles)
	if err != nil {
		return APIOperationPolicySnapshot{}, err
	}
	requiredScopes := normalizePolicyStringList(input.RequiredScopes)

	spec, operation, err := s.loadCurrentOperation(ctx, operationID)
	if err != nil {
		return APIOperationPolicySnapshot{}, err
	}

	var stored models.APIOperationPolicy
	err = s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		findErr := tx.Where("spec_id = ? AND operation_id = ?", spec.ID, operation.OperationID).First(&stored).Error
		if findErr != nil && !errors.Is(findErr, gorm.ErrRecordNotFound) {
			return fmt.Errorf("failed to load api operation policy: %w", findErr)
		}

		if errors.Is(findErr, gorm.ErrRecordNotFound) {
			stored = models.APIOperationPolicy{
				SpecID:      spec.ID,
				OperationID: operation.OperationID,
				CreatedBy:   input.ActorUserID,
			}
		}

		stored.AuthMode = authMode
		stored.RequiredRoles = requiredRoles
		stored.RequiredScopes = requiredScopes
		stored.Enabled = input.Enabled
		stored.MockEnabled = input.MockEnabled
		stored.ExportEnabled = input.ExportEnabled
		stored.UpdatedBy = input.ActorUserID

		if stored.ID == 0 {
			if err := tx.Create(&stored).Error; err != nil {
				return fmt.Errorf("failed to create api operation policy: %w", err)
			}
			return nil
		}
		if err := tx.Save(&stored).Error; err != nil {
			return fmt.Errorf("failed to update api operation policy: %w", err)
		}
		return nil
	})
	if err != nil {
		return APIOperationPolicySnapshot{}, err
	}

	if s.runtimeReloader != nil {
		if reloadErr := s.runtimeReloader.Reload(ctx); reloadErr != nil && !errors.Is(reloadErr, ErrAPISpecNotFound) {
			return APIOperationPolicySnapshot{}, fmt.Errorf("failed to reload api contract runtime: %w", reloadErr)
		}
	}

	return APIOperationPolicySnapshot{
		Spec:      spec,
		Operation: operation,
		Policy:    &stored,
		Resolved:  resolveAPIOperationPolicy(operation, &stored),
	}, nil
}

func (s *APIPolicyService) loadCurrentOperation(ctx context.Context, operationID string) (models.APISpec, models.APIOperation, error) {
	spec, err := getCurrentPublishedSpecRecord(ctx, s.db)
	if err != nil {
		return models.APISpec{}, models.APIOperation{}, err
	}

	var operation models.APIOperation
	queryErr := s.db.WithContext(ctx).
		Where("spec_id = ? AND operation_id = ?", spec.ID, strings.TrimSpace(operationID)).
		First(&operation).Error
	if errors.Is(queryErr, gorm.ErrRecordNotFound) {
		return models.APISpec{}, models.APIOperation{}, ErrAPIOperationNotFound
	}
	if queryErr != nil {
		return models.APISpec{}, models.APIOperation{}, fmt.Errorf("failed to load api operation: %w", queryErr)
	}
	return spec, operation, nil
}

func (s *APIPolicyService) loadPoliciesByOperationID(ctx context.Context, specID uint) (map[string]*models.APIOperationPolicy, error) {
	var policies []models.APIOperationPolicy
	if err := s.db.WithContext(ctx).Where("spec_id = ?", specID).Find(&policies).Error; err != nil {
		return nil, fmt.Errorf("failed to list api operation policies: %w", err)
	}

	policiesByOperationID := make(map[string]*models.APIOperationPolicy, len(policies))
	for index := range policies {
		policy := policies[index]
		policiesByOperationID[policy.OperationID] = &policy
	}
	return policiesByOperationID, nil
}

func (s *APIPolicyService) findOperationPolicy(ctx context.Context, specID uint, operationID string) (*models.APIOperationPolicy, error) {
	var policy models.APIOperationPolicy
	err := s.db.WithContext(ctx).
		Where("spec_id = ? AND operation_id = ?", specID, operationID).
		First(&policy).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to load api operation policy: %w", err)
	}
	return &policy, nil
}

