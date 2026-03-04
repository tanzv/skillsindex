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
	// ErrIncidentNotFound indicates incident record does not exist.
	ErrIncidentNotFound = errors.New("incident not found")
)

// IncidentService handles incident lifecycle management.
type IncidentService struct {
	db *gorm.DB
}

// CreateIncidentInput stores fields for creating a new incident.
type CreateIncidentInput struct {
	Title       string
	Summary     string
	Severity    models.IncidentSeverity
	Source      string
	Impact      string
	OwnerUserID *uint
	CreatedBy   uint
}

// ListIncidentsInput stores optional filters for incident listing.
type ListIncidentsInput struct {
	Status string
	Limit  int
}

// UpdateIncidentResponseInput stores response console updates.
type UpdateIncidentResponseInput struct {
	IncidentID    uint
	Status        models.IncidentStatus
	ResponseNotes string
	Impact        string
	OwnerUserID   *uint
}

// UpdateIncidentPostmortemInput stores postmortem update payload.
type UpdateIncidentPostmortemInput struct {
	IncidentID uint
	Postmortem string
	Status     models.IncidentStatus
}

// NewIncidentService creates a new incident service.
func NewIncidentService(db *gorm.DB) *IncidentService {
	return &IncidentService{db: db}
}

// CreateIncident creates an incident record.
func (s *IncidentService) CreateIncident(ctx context.Context, input CreateIncidentInput) (models.Incident, error) {
	title := strings.TrimSpace(input.Title)
	if title == "" {
		return models.Incident{}, fmt.Errorf("incident title is required")
	}
	if input.CreatedBy == 0 {
		return models.Incident{}, fmt.Errorf("incident creator is required")
	}

	severity := normalizeIncidentSeverity(input.Severity)
	item := models.Incident{
		Title:       title,
		Summary:     strings.TrimSpace(input.Summary),
		Severity:    severity,
		Status:      models.IncidentStatusOpen,
		Source:      strings.TrimSpace(input.Source),
		Impact:      strings.TrimSpace(input.Impact),
		OwnerUserID: input.OwnerUserID,
		DetectedAt:  time.Now().UTC(),
		CreatedBy:   input.CreatedBy,
	}
	if err := s.db.WithContext(ctx).Create(&item).Error; err != nil {
		return models.Incident{}, fmt.Errorf("failed to create incident: %w", err)
	}
	return item, nil
}

// ListIncidents returns incidents in descending update order.
func (s *IncidentService) ListIncidents(ctx context.Context, input ListIncidentsInput) ([]models.Incident, error) {
	limit := input.Limit
	if limit <= 0 || limit > 300 {
		limit = 80
	}

	query := s.db.WithContext(ctx).Model(&models.Incident{})
	status := normalizeIncidentStatus(models.IncidentStatus(strings.TrimSpace(input.Status)))
	if status != "" {
		query = query.Where("status = ?", status)
	}

	var items []models.Incident
	if err := query.
		Preload("OwnerUser").
		Preload("Creator").
		Order("updated_at DESC").
		Order("id DESC").
		Limit(limit).
		Find(&items).Error; err != nil {
		return nil, fmt.Errorf("failed to list incidents: %w", err)
	}
	return items, nil
}

// GetIncidentByID returns one incident.
func (s *IncidentService) GetIncidentByID(ctx context.Context, incidentID uint) (models.Incident, error) {
	var item models.Incident
	if err := s.db.WithContext(ctx).
		Preload("OwnerUser").
		Preload("Creator").
		First(&item, incidentID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.Incident{}, ErrIncidentNotFound
		}
		return models.Incident{}, fmt.Errorf("failed to load incident: %w", err)
	}
	return item, nil
}

// UpdateResponse updates incident response status and notes.
func (s *IncidentService) UpdateResponse(ctx context.Context, input UpdateIncidentResponseInput) (models.Incident, error) {
	if input.IncidentID == 0 {
		return models.Incident{}, fmt.Errorf("incident id is required")
	}

	var item models.Incident
	if err := s.db.WithContext(ctx).First(&item, input.IncidentID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.Incident{}, ErrIncidentNotFound
		}
		return models.Incident{}, fmt.Errorf("failed to load incident: %w", err)
	}

	if status := normalizeIncidentStatus(input.Status); status != "" {
		item.Status = status
		if status == models.IncidentStatusResolved {
			now := time.Now().UTC()
			item.ResolvedAt = &now
		}
	}
	if strings.TrimSpace(input.ResponseNotes) != "" {
		item.ResponseNotes = strings.TrimSpace(input.ResponseNotes)
	}
	if strings.TrimSpace(input.Impact) != "" {
		item.Impact = strings.TrimSpace(input.Impact)
	}
	if input.OwnerUserID != nil {
		if *input.OwnerUserID == 0 {
			item.OwnerUserID = nil
		} else {
			item.OwnerUserID = input.OwnerUserID
		}
	}

	if err := s.db.WithContext(ctx).Save(&item).Error; err != nil {
		return models.Incident{}, fmt.Errorf("failed to update incident response: %w", err)
	}
	return s.GetIncidentByID(ctx, item.ID)
}

// UpdatePostmortem updates incident postmortem and lifecycle status.
func (s *IncidentService) UpdatePostmortem(ctx context.Context, input UpdateIncidentPostmortemInput) (models.Incident, error) {
	if input.IncidentID == 0 {
		return models.Incident{}, fmt.Errorf("incident id is required")
	}

	var item models.Incident
	if err := s.db.WithContext(ctx).First(&item, input.IncidentID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.Incident{}, ErrIncidentNotFound
		}
		return models.Incident{}, fmt.Errorf("failed to load incident: %w", err)
	}

	item.Postmortem = strings.TrimSpace(input.Postmortem)
	if status := normalizeIncidentStatus(input.Status); status != "" {
		item.Status = status
	}
	if item.Status == models.IncidentStatusResolved {
		now := time.Now().UTC()
		item.ResolvedAt = &now
	}

	if err := s.db.WithContext(ctx).Save(&item).Error; err != nil {
		return models.Incident{}, fmt.Errorf("failed to update incident postmortem: %w", err)
	}
	return s.GetIncidentByID(ctx, item.ID)
}

func normalizeIncidentSeverity(value models.IncidentSeverity) models.IncidentSeverity {
	switch strings.ToLower(strings.TrimSpace(string(value))) {
	case string(models.IncidentSeverityLow):
		return models.IncidentSeverityLow
	case string(models.IncidentSeverityHigh):
		return models.IncidentSeverityHigh
	case string(models.IncidentSeverityCritical):
		return models.IncidentSeverityCritical
	default:
		return models.IncidentSeverityMedium
	}
}

func normalizeIncidentStatus(value models.IncidentStatus) models.IncidentStatus {
	switch strings.ToLower(strings.TrimSpace(string(value))) {
	case string(models.IncidentStatusOpen):
		return models.IncidentStatusOpen
	case string(models.IncidentStatusMitigated):
		return models.IncidentStatusMitigated
	case string(models.IncidentStatusResolved):
		return models.IncidentStatusResolved
	default:
		return ""
	}
}
