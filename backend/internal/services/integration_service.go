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
	// ErrIntegrationConnectorNotFound indicates connector record is missing.
	ErrIntegrationConnectorNotFound = errors.New("integration connector not found")
)

// IntegrationService handles integration connector and webhook log management.
type IntegrationService struct {
	db *gorm.DB
}

// CreateConnectorInput stores parameters for creating an integration connector.
type CreateConnectorInput struct {
	Name        string
	Provider    string
	Description string
	BaseURL     string
	ConfigJSON  string
	Enabled     bool
	CreatedBy   uint
}

// ListConnectorsInput stores list filters for integration connectors.
type ListConnectorsInput struct {
	Provider        string
	IncludeDisabled bool
	Limit           int
}

// RecordWebhookDeliveryInput stores parameters for webhook delivery logging.
type RecordWebhookDeliveryInput struct {
	ConnectorID  uint
	EventType    string
	Endpoint     string
	StatusCode   int
	Outcome      string
	RequestID    string
	ErrorMessage string
	DeliveredAt  time.Time
}

// ListWebhookLogsInput stores filters for webhook delivery logs.
type ListWebhookLogsInput struct {
	ConnectorID *uint
	Limit       int
}

// NewIntegrationService creates a new integration service.
func NewIntegrationService(db *gorm.DB) *IntegrationService {
	return &IntegrationService{db: db}
}

// CreateConnector creates a new integration connector.
func (s *IntegrationService) CreateConnector(ctx context.Context, input CreateConnectorInput) (models.IntegrationConnector, error) {
	name := strings.TrimSpace(input.Name)
	provider := strings.ToLower(strings.TrimSpace(input.Provider))
	if name == "" {
		return models.IntegrationConnector{}, fmt.Errorf("connector name is required")
	}
	if provider == "" {
		return models.IntegrationConnector{}, fmt.Errorf("connector provider is required")
	}
	if input.CreatedBy == 0 {
		return models.IntegrationConnector{}, fmt.Errorf("connector creator is required")
	}

	item := models.IntegrationConnector{
		Name:        name,
		Provider:    provider,
		Description: strings.TrimSpace(input.Description),
		BaseURL:     strings.TrimSpace(input.BaseURL),
		ConfigJSON:  strings.TrimSpace(input.ConfigJSON),
		Enabled:     input.Enabled,
		CreatedBy:   input.CreatedBy,
	}
	if err := s.db.WithContext(ctx).Create(&item).Error; err != nil {
		return models.IntegrationConnector{}, fmt.Errorf("failed to create connector: %w", err)
	}
	return item, nil
}

// ListConnectors lists connectors with optional filters.
func (s *IntegrationService) ListConnectors(ctx context.Context, input ListConnectorsInput) ([]models.IntegrationConnector, error) {
	limit := input.Limit
	if limit <= 0 || limit > 300 {
		limit = 50
	}

	query := s.db.WithContext(ctx).Model(&models.IntegrationConnector{})
	if provider := strings.ToLower(strings.TrimSpace(input.Provider)); provider != "" {
		query = query.Where("provider = ?", provider)
	}
	if !input.IncludeDisabled {
		query = query.Where("enabled = ?", true)
	}

	var items []models.IntegrationConnector
	if err := query.
		Preload("Creator").
		Order("updated_at DESC").
		Limit(limit).
		Find(&items).Error; err != nil {
		return nil, fmt.Errorf("failed to list connectors: %w", err)
	}
	return items, nil
}

// GetConnectorByID returns one integration connector by id.
func (s *IntegrationService) GetConnectorByID(ctx context.Context, connectorID uint) (models.IntegrationConnector, error) {
	if connectorID == 0 {
		return models.IntegrationConnector{}, ErrIntegrationConnectorNotFound
	}

	var item models.IntegrationConnector
	err := s.db.WithContext(ctx).Preload("Creator").First(&item, connectorID).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return models.IntegrationConnector{}, ErrIntegrationConnectorNotFound
	}
	if err != nil {
		return models.IntegrationConnector{}, fmt.Errorf("failed to load connector by id: %w", err)
	}
	return item, nil
}

// GetConnectorByProvider returns one connector by provider key.
func (s *IntegrationService) GetConnectorByProvider(ctx context.Context, provider string, includeDisabled bool) (models.IntegrationConnector, error) {
	normalizedProvider := strings.ToLower(strings.TrimSpace(provider))
	if normalizedProvider == "" {
		return models.IntegrationConnector{}, ErrIntegrationConnectorNotFound
	}

	query := s.db.WithContext(ctx).Model(&models.IntegrationConnector{}).Where("provider = ?", normalizedProvider)
	if !includeDisabled {
		query = query.Where("enabled = ?", true)
	}

	var item models.IntegrationConnector
	err := query.Preload("Creator").Order("updated_at DESC").Order("id DESC").First(&item).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return models.IntegrationConnector{}, ErrIntegrationConnectorNotFound
	}
	if err != nil {
		return models.IntegrationConnector{}, fmt.Errorf("failed to load connector by provider: %w", err)
	}
	return item, nil
}

// SetConnectorEnabled updates enabled flag for one connector.
func (s *IntegrationService) SetConnectorEnabled(ctx context.Context, connectorID uint, enabled bool) (models.IntegrationConnector, error) {
	item, err := s.GetConnectorByID(ctx, connectorID)
	if err != nil {
		return models.IntegrationConnector{}, err
	}
	if item.Enabled == enabled {
		return item, nil
	}
	if err := s.db.WithContext(ctx).
		Model(&models.IntegrationConnector{}).
		Where("id = ?", connectorID).
		Update("enabled", enabled).Error; err != nil {
		return models.IntegrationConnector{}, fmt.Errorf("failed to update connector enabled status: %w", err)
	}
	item.Enabled = enabled
	return item, nil
}

// RecordWebhookDelivery stores one webhook delivery result.
func (s *IntegrationService) RecordWebhookDelivery(ctx context.Context, input RecordWebhookDeliveryInput) error {
	if input.ConnectorID == 0 {
		return fmt.Errorf("connector id is required")
	}
	eventType := strings.TrimSpace(input.EventType)
	if eventType == "" {
		return fmt.Errorf("event type is required")
	}
	endpoint := strings.TrimSpace(input.Endpoint)
	if endpoint == "" {
		return fmt.Errorf("endpoint is required")
	}
	outcome := strings.ToLower(strings.TrimSpace(input.Outcome))
	if outcome == "" {
		outcome = "unknown"
	}
	deliveredAt := input.DeliveredAt.UTC()
	if deliveredAt.IsZero() {
		deliveredAt = time.Now().UTC()
	}

	logEntry := models.WebhookDeliveryLog{
		ConnectorID:  input.ConnectorID,
		EventType:    eventType,
		Endpoint:     endpoint,
		StatusCode:   input.StatusCode,
		Outcome:      outcome,
		RequestID:    strings.TrimSpace(input.RequestID),
		ErrorMessage: strings.TrimSpace(input.ErrorMessage),
		DeliveredAt:  deliveredAt,
	}
	if err := s.db.WithContext(ctx).Create(&logEntry).Error; err != nil {
		return fmt.Errorf("failed to create webhook log: %w", err)
	}
	return nil
}

// ListWebhookLogs lists webhook delivery logs with optional connector filter.
func (s *IntegrationService) ListWebhookLogs(ctx context.Context, input ListWebhookLogsInput) ([]models.WebhookDeliveryLog, error) {
	limit := input.Limit
	if limit <= 0 || limit > 300 {
		limit = 100
	}

	query := s.db.WithContext(ctx).Model(&models.WebhookDeliveryLog{})
	if input.ConnectorID != nil && *input.ConnectorID != 0 {
		query = query.Where("connector_id = ?", *input.ConnectorID)
	}

	var logs []models.WebhookDeliveryLog
	if err := query.
		Preload("Connector").
		Order("delivered_at DESC").
		Order("id DESC").
		Limit(limit).
		Find(&logs).Error; err != nil {
		return nil, fmt.Errorf("failed to list webhook logs: %w", err)
	}
	return logs, nil
}
