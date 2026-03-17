package services

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"skillsindex/internal/models"
)

func (s *OpsService) RecordRelease(ctx context.Context, actorUserID uint, input RecordReleaseInput) (OpsReleaseRecord, error) {
	if actorUserID == 0 {
		return OpsReleaseRecord{}, fmt.Errorf("actor user id is required")
	}
	version := strings.TrimSpace(input.Version)
	environment := strings.TrimSpace(strings.ToLower(input.Environment))
	if version == "" || environment == "" {
		return OpsReleaseRecord{}, fmt.Errorf("version and environment are required")
	}
	releasedAt := input.ReleasedAt
	if releasedAt.IsZero() {
		releasedAt = time.Now().UTC()
	}
	releasedAt = releasedAt.UTC()

	record := OpsReleaseRecord{
		ReleasedAt:   releasedAt,
		ActorUserID:  actorUserID,
		Version:      version,
		Environment:  environment,
		ChangeTicket: strings.TrimSpace(input.ChangeTicket),
		Status:       normalizeReleaseStatus(input.Status),
		Note:         strings.TrimSpace(input.Note),
	}
	payload := map[string]any{
		"version":       record.Version,
		"environment":   record.Environment,
		"change_ticket": record.ChangeTicket,
		"status":        record.Status,
		"note":          record.Note,
		"released_at":   record.ReleasedAt.Format(time.RFC3339),
	}
	raw, err := json.Marshal(payload)
	if err != nil {
		return OpsReleaseRecord{}, fmt.Errorf("failed to marshal release payload: %w", err)
	}
	entry := models.AuditLog{
		ActorUserID: auditActorPointer(actorUserID),
		Action:      opsReleaseAction,
		TargetType:  opsTargetType,
		Summary:     fmt.Sprintf("Release %s to %s is %s", record.Version, record.Environment, record.Status),
		Details:     string(raw),
		CreatedAt:   record.ReleasedAt,
	}
	if err := s.db.WithContext(ctx).Create(&entry).Error; err != nil {
		return OpsReleaseRecord{}, fmt.Errorf("failed to record release: %w", err)
	}
	return record, nil
}

// ListReleases returns recent release records.
func (s *OpsService) ListReleases(ctx context.Context, limit int) ([]OpsReleaseRecord, error) {
	logs, err := s.listAuditLogsByAction(ctx, opsReleaseAction, limit)
	if err != nil {
		return nil, err
	}
	items := make([]OpsReleaseRecord, 0, len(logs))
	for _, item := range logs {
		record := OpsReleaseRecord{
			ReleasedAt:  item.CreatedAt.UTC(),
			ActorUserID: auditActorValue(item.ActorUserID),
			Note:        strings.TrimSpace(item.Summary),
		}
		var payload struct {
			Version      string `json:"version"`
			Environment  string `json:"environment"`
			ChangeTicket string `json:"change_ticket"`
			Status       string `json:"status"`
			Note         string `json:"note"`
			ReleasedAt   string `json:"released_at"`
		}
		if strings.TrimSpace(item.Details) != "" {
			if err := json.Unmarshal([]byte(item.Details), &payload); err == nil {
				record.Version = strings.TrimSpace(payload.Version)
				record.Environment = strings.TrimSpace(payload.Environment)
				record.ChangeTicket = strings.TrimSpace(payload.ChangeTicket)
				record.Status = normalizeReleaseStatus(payload.Status)
				if strings.TrimSpace(payload.Note) != "" {
					record.Note = strings.TrimSpace(payload.Note)
				}
				if parsed, err := time.Parse(time.RFC3339, payload.ReleasedAt); err == nil {
					record.ReleasedAt = parsed.UTC()
				}
			}
		}
		items = append(items, record)
	}
	return items, nil
}

// RecordChangeApproval stores one change approval record.
func (s *OpsService) RecordChangeApproval(ctx context.Context, actorUserID uint, input RecordChangeApprovalInput) (OpsChangeApprovalRecord, error) {
	if actorUserID == 0 {
		return OpsChangeApprovalRecord{}, fmt.Errorf("actor user id is required")
	}
	ticketID := strings.TrimSpace(input.TicketID)
	if ticketID == "" {
		return OpsChangeApprovalRecord{}, fmt.Errorf("ticket id is required")
	}
	occurredAt := input.OccurredAt
	if occurredAt.IsZero() {
		occurredAt = time.Now().UTC()
	}
	occurredAt = occurredAt.UTC()

	record := OpsChangeApprovalRecord{
		OccurredAt:  occurredAt,
		ActorUserID: actorUserID,
		TicketID:    ticketID,
		Reviewer:    strings.TrimSpace(input.Reviewer),
		Status:      normalizeChangeApprovalStatus(input.Status),
		Note:        strings.TrimSpace(input.Note),
	}
	payload := map[string]any{
		"ticket_id":   record.TicketID,
		"reviewer":    record.Reviewer,
		"status":      record.Status,
		"note":        record.Note,
		"occurred_at": record.OccurredAt.Format(time.RFC3339),
	}
	raw, err := json.Marshal(payload)
	if err != nil {
		return OpsChangeApprovalRecord{}, fmt.Errorf("failed to marshal change approval payload: %w", err)
	}
	entry := models.AuditLog{
		ActorUserID: auditActorPointer(actorUserID),
		Action:      opsChangeApprovalAction,
		TargetType:  opsTargetType,
		Summary:     fmt.Sprintf("Change ticket %s %s", record.TicketID, record.Status),
		Details:     string(raw),
		CreatedAt:   record.OccurredAt,
	}
	if err := s.db.WithContext(ctx).Create(&entry).Error; err != nil {
		return OpsChangeApprovalRecord{}, fmt.Errorf("failed to record change approval: %w", err)
	}
	return record, nil
}

// ListChangeApprovals returns recent change approval records.
func (s *OpsService) ListChangeApprovals(ctx context.Context, limit int) ([]OpsChangeApprovalRecord, error) {
	logs, err := s.listAuditLogsByAction(ctx, opsChangeApprovalAction, limit)
	if err != nil {
		return nil, err
	}
	items := make([]OpsChangeApprovalRecord, 0, len(logs))
	for _, item := range logs {
		record := OpsChangeApprovalRecord{
			OccurredAt:  item.CreatedAt.UTC(),
			ActorUserID: auditActorValue(item.ActorUserID),
			Note:        strings.TrimSpace(item.Summary),
		}
		var payload struct {
			TicketID   string `json:"ticket_id"`
			Reviewer   string `json:"reviewer"`
			Status     string `json:"status"`
			Note       string `json:"note"`
			OccurredAt string `json:"occurred_at"`
		}
		if strings.TrimSpace(item.Details) != "" {
			if err := json.Unmarshal([]byte(item.Details), &payload); err == nil {
				record.TicketID = strings.TrimSpace(payload.TicketID)
				record.Reviewer = strings.TrimSpace(payload.Reviewer)
				record.Status = normalizeChangeApprovalStatus(payload.Status)
				if strings.TrimSpace(payload.Note) != "" {
					record.Note = strings.TrimSpace(payload.Note)
				}
				if parsed, err := time.Parse(time.RFC3339, payload.OccurredAt); err == nil {
					record.OccurredAt = parsed.UTC()
				}
			}
		}
		items = append(items, record)
	}
	return items, nil
}

// UpsertBackupPlan records one backup plan revision.
func (s *OpsService) UpsertBackupPlan(ctx context.Context, actorUserID uint, input UpsertBackupPlanInput) (OpsBackupPlanRecord, error) {
	if actorUserID == 0 {
		return OpsBackupPlanRecord{}, fmt.Errorf("actor user id is required")
	}
	planKey := strings.TrimSpace(strings.ToLower(input.PlanKey))
	backupType := strings.TrimSpace(strings.ToLower(input.BackupType))
	schedule := strings.TrimSpace(input.Schedule)
	if planKey == "" || backupType == "" || schedule == "" || input.RetentionDays <= 0 {
		return OpsBackupPlanRecord{}, fmt.Errorf("plan_key, backup_type, schedule, and retention_days are required")
	}
	loggedAt := input.OccurredAt
	if loggedAt.IsZero() {
		loggedAt = time.Now().UTC()
	}
	loggedAt = loggedAt.UTC()

	record := OpsBackupPlanRecord{
		LoggedAt:      loggedAt,
		ActorUserID:   actorUserID,
		PlanKey:       planKey,
		BackupType:    backupType,
		Schedule:      schedule,
		RetentionDays: input.RetentionDays,
		Enabled:       input.Enabled,
		Note:          strings.TrimSpace(input.Note),
	}
	payload := map[string]any{
		"plan_key":       record.PlanKey,
		"backup_type":    record.BackupType,
		"schedule":       record.Schedule,
		"retention_days": record.RetentionDays,
		"enabled":        record.Enabled,
		"note":           record.Note,
		"logged_at":      record.LoggedAt.Format(time.RFC3339),
	}
	raw, err := json.Marshal(payload)
	if err != nil {
		return OpsBackupPlanRecord{}, fmt.Errorf("failed to marshal backup plan payload: %w", err)
	}
	state := "disabled"
	if record.Enabled {
		state = "enabled"
	}
	entry := models.AuditLog{
		ActorUserID: auditActorPointer(actorUserID),
		Action:      opsBackupPlanAction,
		TargetType:  opsTargetType,
		Summary:     fmt.Sprintf("Backup plan %s %s", record.PlanKey, state),
		Details:     string(raw),
		CreatedAt:   record.LoggedAt,
	}
	if err := s.db.WithContext(ctx).Create(&entry).Error; err != nil {
		return OpsBackupPlanRecord{}, fmt.Errorf("failed to record backup plan: %w", err)
	}
	return record, nil
}

// ListBackupPlans returns recent backup plan records.
func (s *OpsService) ListBackupPlans(ctx context.Context, limit int) ([]OpsBackupPlanRecord, error) {
	logs, err := s.listAuditLogsByAction(ctx, opsBackupPlanAction, limit)
	if err != nil {
		return nil, err
	}
	items := make([]OpsBackupPlanRecord, 0, len(logs))
	for _, item := range logs {
		record := OpsBackupPlanRecord{
			LoggedAt:    item.CreatedAt.UTC(),
			ActorUserID: auditActorValue(item.ActorUserID),
			Note:        strings.TrimSpace(item.Summary),
		}
		var payload struct {
			PlanKey       string `json:"plan_key"`
			BackupType    string `json:"backup_type"`
			Schedule      string `json:"schedule"`
			RetentionDays int    `json:"retention_days"`
			Enabled       bool   `json:"enabled"`
			Note          string `json:"note"`
			LoggedAt      string `json:"logged_at"`
		}
		if strings.TrimSpace(item.Details) != "" {
			if err := json.Unmarshal([]byte(item.Details), &payload); err == nil {
				record.PlanKey = strings.TrimSpace(payload.PlanKey)
				record.BackupType = strings.TrimSpace(payload.BackupType)
				record.Schedule = strings.TrimSpace(payload.Schedule)
				record.RetentionDays = payload.RetentionDays
				record.Enabled = payload.Enabled
				if strings.TrimSpace(payload.Note) != "" {
					record.Note = strings.TrimSpace(payload.Note)
				}
				if parsed, err := time.Parse(time.RFC3339, payload.LoggedAt); err == nil {
					record.LoggedAt = parsed.UTC()
				}
			}
		}
		items = append(items, record)
	}
	return items, nil
}

// RecordBackupRun stores one backup run record.
func (s *OpsService) RecordBackupRun(ctx context.Context, actorUserID uint, input RecordBackupRunInput) (OpsBackupRunRecord, error) {
	if actorUserID == 0 {
		return OpsBackupRunRecord{}, fmt.Errorf("actor user id is required")
	}
	planKey := strings.TrimSpace(strings.ToLower(input.PlanKey))
	if planKey == "" {
		return OpsBackupRunRecord{}, fmt.Errorf("plan key is required")
	}
	loggedAt := input.OccurredAt
	if loggedAt.IsZero() {
		loggedAt = time.Now().UTC()
	}
	loggedAt = loggedAt.UTC()
	if input.SizeMB < 0 || input.DurationMinutes < 0 {
		return OpsBackupRunRecord{}, fmt.Errorf("size_mb and duration_minutes must be non-negative")
	}

	record := OpsBackupRunRecord{
		LoggedAt:        loggedAt,
		ActorUserID:     actorUserID,
		PlanKey:         planKey,
		Status:          normalizeBackupRunStatus(input.Status),
		SizeMB:          roundToTwo(input.SizeMB),
		DurationMinutes: roundToTwo(input.DurationMinutes),
		Note:            strings.TrimSpace(input.Note),
	}
	payload := map[string]any{
		"plan_key":         record.PlanKey,
		"status":           record.Status,
		"size_mb":          record.SizeMB,
		"duration_minutes": record.DurationMinutes,
		"note":             record.Note,
		"logged_at":        record.LoggedAt.Format(time.RFC3339),
	}
	raw, err := json.Marshal(payload)
	if err != nil {
		return OpsBackupRunRecord{}, fmt.Errorf("failed to marshal backup run payload: %w", err)
	}
	entry := models.AuditLog{
		ActorUserID: auditActorPointer(actorUserID),
		Action:      opsBackupRunAction,
		TargetType:  opsTargetType,
		Summary:     fmt.Sprintf("Backup run %s %s", record.PlanKey, record.Status),
		Details:     string(raw),
		CreatedAt:   record.LoggedAt,
	}
	if err := s.db.WithContext(ctx).Create(&entry).Error; err != nil {
		return OpsBackupRunRecord{}, fmt.Errorf("failed to record backup run: %w", err)
	}
	return record, nil
}

// ListBackupRuns returns recent backup run records.
func (s *OpsService) ListBackupRuns(ctx context.Context, limit int) ([]OpsBackupRunRecord, error) {
	logs, err := s.listAuditLogsByAction(ctx, opsBackupRunAction, limit)
	if err != nil {
		return nil, err
	}
	items := make([]OpsBackupRunRecord, 0, len(logs))
	for _, item := range logs {
		record := OpsBackupRunRecord{
			LoggedAt:    item.CreatedAt.UTC(),
			ActorUserID: auditActorValue(item.ActorUserID),
			Note:        strings.TrimSpace(item.Summary),
		}
		var payload struct {
			PlanKey         string  `json:"plan_key"`
			Status          string  `json:"status"`
			SizeMB          float64 `json:"size_mb"`
			DurationMinutes float64 `json:"duration_minutes"`
			Note            string  `json:"note"`
			LoggedAt        string  `json:"logged_at"`
		}
		if strings.TrimSpace(item.Details) != "" {
			if err := json.Unmarshal([]byte(item.Details), &payload); err == nil {
				record.PlanKey = strings.TrimSpace(payload.PlanKey)
				record.Status = normalizeBackupRunStatus(payload.Status)
				record.SizeMB = roundToTwo(payload.SizeMB)
				record.DurationMinutes = roundToTwo(payload.DurationMinutes)
				if strings.TrimSpace(payload.Note) != "" {
					record.Note = strings.TrimSpace(payload.Note)
				}
				if parsed, err := time.Parse(time.RFC3339, payload.LoggedAt); err == nil {
					record.LoggedAt = parsed.UTC()
				}
			}
		}
		items = append(items, record)
	}
	return items, nil
}

// ExportAudit exports audit logs in JSON or CSV format.
