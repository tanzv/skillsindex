package web

import (
	"context"
	"sort"
	"strings"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

type apiSyncRunVersionSummary struct {
	VersionID     uint      `json:"version_id"`
	VersionNumber int       `json:"version_number"`
	Trigger       string    `json:"trigger"`
	CapturedAt    time.Time `json:"captured_at"`
}

type apiSyncRunAuditSummary struct {
	Total            int        `json:"total"`
	JobAuditCount    int        `json:"job_audit_count"`
	SkillAuditCount  int        `json:"skill_audit_count"`
	LatestAction     string     `json:"latest_action,omitempty"`
	LatestTargetType string     `json:"latest_target_type,omitempty"`
	LatestTargetID   uint       `json:"latest_target_id,omitempty"`
	LatestCreatedAt  *time.Time `json:"latest_created_at,omitempty"`
}

type apiSyncRunItem struct {
	ID             uint                      `json:"id"`
	PolicyID       *uint                     `json:"policy_id,omitempty"`
	JobID          *uint                     `json:"job_id,omitempty"`
	Trigger        string                    `json:"trigger"`
	TriggerType    string                    `json:"trigger_type"`
	Scope          string                    `json:"scope"`
	Status         string                    `json:"status"`
	TargetSkillID  *uint                     `json:"target_skill_id,omitempty"`
	OwnerUserID    *uint                     `json:"owner_user_id,omitempty"`
	ActorUserID    *uint                     `json:"actor_user_id,omitempty"`
	Candidates     int                       `json:"candidates"`
	Synced         int                       `json:"synced"`
	Failed         int                       `json:"failed"`
	Attempt        int                       `json:"attempt"`
	ErrorCode      string                    `json:"error_code,omitempty"`
	ErrorMessage   string                    `json:"error_message,omitempty"`
	ErrorSummary   string                    `json:"error_summary,omitempty"`
	SourceRevision string                    `json:"source_revision,omitempty"`
	StartedAt      time.Time                 `json:"started_at"`
	FinishedAt     time.Time                 `json:"finished_at"`
	DurationMs     int                       `json:"duration_ms"`
	Version        *apiSyncRunVersionSummary `json:"version,omitempty"`
	Audit          *apiSyncRunAuditSummary   `json:"audit,omitempty"`
}

func resultToAPISyncRunItems(items []models.SyncJobRun) []apiSyncRunItem {
	result := make([]apiSyncRunItem, 0, len(items))
	for _, item := range items {
		result = append(result, resultToAPISyncRunItem(item))
	}
	return result
}

func resultToAPISyncRunItem(item models.SyncJobRun) apiSyncRunItem {
	return apiSyncRunItem{
		ID:             item.ID,
		PolicyID:       item.PolicyID,
		JobID:          item.JobID,
		Trigger:        item.Trigger,
		TriggerType:    item.TriggerType,
		Scope:          item.Scope,
		Status:         item.Status,
		TargetSkillID:  item.TargetSkillID,
		OwnerUserID:    item.OwnerUserID,
		ActorUserID:    item.ActorUserID,
		Candidates:     item.Candidates,
		Synced:         item.Synced,
		Failed:         item.Failed,
		Attempt:        item.Attempt,
		ErrorCode:      item.ErrorCode,
		ErrorMessage:   item.ErrorMessage,
		ErrorSummary:   item.ErrorSummary,
		SourceRevision: item.SourceRevision,
		StartedAt:      item.StartedAt,
		FinishedAt:     item.FinishedAt,
		DurationMs:     item.DurationMs,
	}
}

func (a *App) buildSyncRunDetailAPIItem(ctx context.Context, item models.SyncJobRun) apiSyncRunItem {
	result := resultToAPISyncRunItem(item)
	result.Version = a.loadSyncRunVersionSummary(ctx, item.ID)
	result.Audit = a.loadSyncRunAuditSummary(ctx, item)
	return result
}

const syncRunAuditWindowGrace = time.Minute

func (a *App) loadSyncRunVersionSummary(ctx context.Context, runID uint) *apiSyncRunVersionSummary {
	if a == nil || a.skillVersionSvc == nil || runID == 0 {
		return nil
	}
	version, err := a.skillVersionSvc.GetLatestByRunID(ctx, runID)
	if err != nil {
		return nil
	}
	return &apiSyncRunVersionSummary{
		VersionID:     version.ID,
		VersionNumber: version.VersionNumber,
		Trigger:       version.Trigger,
		CapturedAt:    version.CapturedAt,
	}
}

func (a *App) loadSyncRunAuditSummary(ctx context.Context, item models.SyncJobRun) *apiSyncRunAuditSummary {
	if a == nil || a.auditService == nil {
		return nil
	}

	createdAfter, createdBefore := syncRunAuditWindow(item)
	jobLogs := a.listAuditLogsByTarget(ctx, "async_job", item.JobID, createdAfter, createdBefore)
	skillLogs := a.listAuditLogsByTarget(ctx, "skill", item.TargetSkillID, createdAfter, createdBefore)
	total := len(jobLogs) + len(skillLogs)
	if total == 0 {
		return nil
	}

	combined := append([]models.AuditLog{}, jobLogs...)
	combined = append(combined, skillLogs...)
	sort.SliceStable(combined, func(i, j int) bool {
		if combined[i].CreatedAt.Equal(combined[j].CreatedAt) {
			return combined[i].ID > combined[j].ID
		}
		return combined[i].CreatedAt.After(combined[j].CreatedAt)
	})

	summary := &apiSyncRunAuditSummary{
		Total:            total,
		JobAuditCount:    len(jobLogs),
		SkillAuditCount:  len(skillLogs),
		LatestAction:     strings.TrimSpace(combined[0].Action),
		LatestTargetType: strings.TrimSpace(combined[0].TargetType),
		LatestTargetID:   combined[0].TargetID,
	}
	if !combined[0].CreatedAt.IsZero() {
		createdAt := combined[0].CreatedAt.UTC()
		summary.LatestCreatedAt = &createdAt
	}
	return summary
}

func syncRunAuditWindow(item models.SyncJobRun) (*time.Time, *time.Time) {
	if item.StartedAt.IsZero() {
		return nil, nil
	}

	start := item.StartedAt.UTC()
	end := start.Add(syncRunAuditWindowGrace)
	if !item.FinishedAt.IsZero() && item.FinishedAt.After(start) {
		end = item.FinishedAt.UTC().Add(syncRunAuditWindowGrace)
	}
	return &start, &end
}

func (a *App) listAuditLogsByTarget(
	ctx context.Context,
	targetType string,
	targetID *uint,
	createdAfter *time.Time,
	createdBefore *time.Time,
) []models.AuditLog {
	if a == nil || a.auditService == nil || targetID == nil || *targetID == 0 {
		return nil
	}
	logs, err := a.auditService.ListByTarget(ctx, services.ListAuditByTargetInput{
		TargetType:    targetType,
		TargetID:      *targetID,
		CreatedAfter:  createdAfter,
		CreatedBefore: createdBefore,
		Limit:         10,
	})
	if err != nil {
		return nil
	}
	return logs
}
