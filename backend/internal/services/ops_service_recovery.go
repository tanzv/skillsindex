package services

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"skillsindex/internal/models"
)

// RecordRecoveryDrill records one backup and recovery drill result.
func (s *OpsService) RecordRecoveryDrill(ctx context.Context, actorUserID uint, input RecordRecoveryDrillInput) (OpsRecoveryDrillRecord, error) {
	if actorUserID == 0 {
		return OpsRecoveryDrillRecord{}, fmt.Errorf("actor user id is required")
	}
	if input.RPOHours <= 0 || input.RTOHours <= 0 {
		return OpsRecoveryDrillRecord{}, fmt.Errorf("rpo and rto must be greater than zero")
	}

	loggedAt := input.OccurredAt
	if loggedAt.IsZero() {
		loggedAt = time.Now().UTC()
	}
	loggedAt = loggedAt.UTC()

	record := OpsRecoveryDrillRecord{
		LoggedAt:    loggedAt,
		ActorUserID: actorUserID,
		RPOHours:    roundToTwo(input.RPOHours),
		RTOHours:    roundToTwo(input.RTOHours),
		Passed:      input.RPOHours <= targetRPOHours && input.RTOHours <= targetRTOHours,
		Note:        strings.TrimSpace(input.Note),
	}

	payload := map[string]any{
		"rpo_hours":   record.RPOHours,
		"rto_hours":   record.RTOHours,
		"passed":      record.Passed,
		"note":        record.Note,
		"occurred_at": record.LoggedAt.Format(time.RFC3339),
	}
	raw, err := json.Marshal(payload)
	if err != nil {
		return OpsRecoveryDrillRecord{}, fmt.Errorf("failed to marshal recovery drill payload: %w", err)
	}

	summary := fmt.Sprintf("Recovery drill failed (RPO %.2fh, RTO %.2fh)", record.RPOHours, record.RTOHours)
	if record.Passed {
		summary = fmt.Sprintf("Recovery drill passed (RPO %.2fh, RTO %.2fh)", record.RPOHours, record.RTOHours)
	}
	entry := models.AuditLog{
		ActorUserID: auditActorPointer(actorUserID),
		Action:      opsRecoveryDrillAction,
		TargetType:  opsTargetType,
		Summary:     summary,
		Details:     string(raw),
		CreatedAt:   record.LoggedAt,
	}
	if err := s.db.WithContext(ctx).Create(&entry).Error; err != nil {
		return OpsRecoveryDrillRecord{}, fmt.Errorf("failed to record recovery drill: %w", err)
	}
	return record, nil
}

// ListRecoveryDrills returns recent backup and recovery drill records.
func (s *OpsService) ListRecoveryDrills(ctx context.Context, limit int) ([]OpsRecoveryDrillRecord, error) {
	if limit <= 0 || limit > 200 {
		limit = 20
	}

	var logs []models.AuditLog
	if err := s.db.WithContext(ctx).
		Model(&models.AuditLog{}).
		Where("action = ?", opsRecoveryDrillAction).
		Order("created_at DESC").
		Order("id DESC").
		Limit(limit).
		Find(&logs).Error; err != nil {
		return nil, fmt.Errorf("failed to list recovery drills: %w", err)
	}

	records := make([]OpsRecoveryDrillRecord, 0, len(logs))
	for _, item := range logs {
		record := OpsRecoveryDrillRecord{
			LoggedAt:    item.CreatedAt.UTC(),
			ActorUserID: auditActorValue(item.ActorUserID),
			Note:        strings.TrimSpace(item.Summary),
		}
		var payload struct {
			RPOHours   float64 `json:"rpo_hours"`
			RTOHours   float64 `json:"rto_hours"`
			Passed     bool    `json:"passed"`
			Note       string  `json:"note"`
			OccurredAt string  `json:"occurred_at"`
		}
		if strings.TrimSpace(item.Details) != "" {
			if err := json.Unmarshal([]byte(item.Details), &payload); err == nil {
				record.RPOHours = roundToTwo(payload.RPOHours)
				record.RTOHours = roundToTwo(payload.RTOHours)
				record.Passed = payload.Passed
				if strings.TrimSpace(payload.Note) != "" {
					record.Note = strings.TrimSpace(payload.Note)
				}
				if parsed, err := time.Parse(time.RFC3339, payload.OccurredAt); err == nil {
					record.LoggedAt = parsed.UTC()
				}
			}
		}
		if record.RPOHours > 0 && record.RTOHours > 0 {
			record.Passed = record.RPOHours <= targetRPOHours && record.RTOHours <= targetRTOHours
		}
		records = append(records, record)
	}
	return records, nil
}
