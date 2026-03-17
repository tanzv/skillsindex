package services

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"sort"
	"strings"
	"time"

	"skillsindex/internal/models"
)

func (s *OpsService) ExportAudit(ctx context.Context, input AuditExportInput) ([]byte, string, string, error) {
	from := input.From.UTC()
	to := input.To.UTC()
	if from.IsZero() {
		from = time.Now().UTC().Add(-24 * time.Hour)
	}
	if to.IsZero() {
		to = time.Now().UTC()
	}
	if to.Before(from) {
		return nil, "", "", fmt.Errorf("invalid audit export time range")
	}

	format := strings.ToLower(strings.TrimSpace(input.Format))
	if format == "" {
		format = "json"
	}
	if format != "json" && format != "csv" {
		return nil, "", "", fmt.Errorf("unsupported audit export format")
	}

	var logs []models.AuditLog
	if err := s.db.WithContext(ctx).
		Where("created_at >= ? AND created_at <= ?", from, to).
		Order("created_at ASC").
		Order("id ASC").
		Limit(50000).
		Find(&logs).Error; err != nil {
		return nil, "", "", fmt.Errorf("failed to export audit logs: %w", err)
	}

	if format == "csv" {
		return exportAuditCSV(logs), "text/csv; charset=utf-8", "audit-export.csv", nil
	}
	return exportAuditJSON(logs), "application/json; charset=utf-8", "audit-export.json", nil
}

func chooseGateSeverity(passed bool) OpsAlertSeverity {
	if passed {
		return OpsAlertSeverityInfo
	}
	return OpsAlertSeverityWarning
}

func normalizeReleaseStatus(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "planned":
		return "planned"
	case "released":
		return "released"
	case "rolled-back", "rolled_back", "rollback":
		return "rolled-back"
	case "failed":
		return "failed"
	default:
		return "released"
	}
}

func normalizeChangeApprovalStatus(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "approved":
		return "approved"
	case "rejected":
		return "rejected"
	case "pending":
		return "pending"
	default:
		return "pending"
	}
}

func normalizeBackupRunStatus(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "succeeded":
		return "succeeded"
	case "failed":
		return "failed"
	case "running":
		return "running"
	default:
		return "succeeded"
	}
}

func (s *OpsService) listAuditLogsByAction(ctx context.Context, action string, limit int) ([]models.AuditLog, error) {
	if limit <= 0 || limit > 200 {
		limit = 20
	}
	var logs []models.AuditLog
	if err := s.db.WithContext(ctx).
		Model(&models.AuditLog{}).
		Where("action = ?", strings.TrimSpace(action)).
		Order("created_at DESC").
		Order("id DESC").
		Limit(limit).
		Find(&logs).Error; err != nil {
		return nil, fmt.Errorf("failed to list audit logs by action: %w", err)
	}
	return logs, nil
}

func (s *OpsService) countAuditLogsByTime(ctx context.Context, from time.Time, to time.Time) (int64, error) {
	var total int64
	if err := s.db.WithContext(ctx).
		Model(&models.AuditLog{}).
		Where("created_at >= ? AND created_at <= ?", from, to).
		Count(&total).Error; err != nil {
		return 0, fmt.Errorf("failed to count audit logs: %w", err)
	}
	return total, nil
}

func (s *OpsService) countAuditWriteFailuresByTime(ctx context.Context, from time.Time, to time.Time) (int64, error) {
	var total int64
	if err := s.db.WithContext(ctx).
		Model(&models.AuditLog{}).
		Where("created_at >= ? AND created_at <= ?", from, to).
		Where("action = ?", "audit_write_failed").
		Count(&total).Error; err != nil {
		return 0, fmt.Errorf("failed to count audit write failures: %w", err)
	}
	return total, nil
}

func (s *OpsService) listSyncRunsByTime(ctx context.Context, from time.Time, to time.Time) ([]models.SyncJobRun, error) {
	var runs []models.SyncJobRun
	if err := s.db.WithContext(ctx).
		Model(&models.SyncJobRun{}).
		Where("started_at >= ? AND started_at <= ?", from, to).
		Order("started_at DESC").
		Order("id DESC").
		Limit(5000).
		Find(&runs).Error; err != nil {
		return nil, fmt.Errorf("failed to list sync runs by time: %w", err)
	}
	return runs, nil
}

func (s *OpsService) countSignalEventsByTime(ctx context.Context, from time.Time, to time.Time) (int64, error) {
	var auditCount int64
	if err := s.db.WithContext(ctx).
		Model(&models.AuditLog{}).
		Where("created_at >= ? AND created_at <= ?", from, to).
		Count(&auditCount).Error; err != nil {
		return 0, fmt.Errorf("failed to count recent audit events: %w", err)
	}
	var syncCount int64
	if err := s.db.WithContext(ctx).
		Model(&models.SyncJobRun{}).
		Where("started_at >= ? AND started_at <= ?", from, to).
		Count(&syncCount).Error; err != nil {
		return 0, fmt.Errorf("failed to count recent sync runs: %w", err)
	}
	var asyncCount int64
	if err := s.db.WithContext(ctx).
		Model(&models.AsyncJob{}).
		Where("created_at >= ? AND created_at <= ?", from, to).
		Count(&asyncCount).Error; err != nil {
		return 0, fmt.Errorf("failed to count recent async jobs: %w", err)
	}
	return auditCount + syncCount + asyncCount, nil
}

func percentileDurationMs(values []int, percentile int) float64 {
	if len(values) == 0 {
		return 0
	}
	if percentile <= 0 {
		percentile = 1
	}
	if percentile > 100 {
		percentile = 100
	}
	sorted := append([]int(nil), values...)
	sort.Ints(sorted)
	index := int(float64(percentile)/100*float64(len(sorted)-1) + 0.5)
	if index < 0 {
		index = 0
	}
	if index >= len(sorted) {
		index = len(sorted) - 1
	}
	return float64(sorted[index])
}

func roundToTwo(value float64) float64 {
	return float64(int(value*100+0.5)) / 100
}

func exportAuditJSON(logs []models.AuditLog) []byte {
	payload := make([]map[string]any, 0, len(logs))
	for _, log := range logs {
		payload = append(payload, map[string]any{
			"id":            log.ID,
			"created_at":    log.CreatedAt.UTC().Format(time.RFC3339),
			"actor_user_id": log.ActorUserID,
			"action":        log.Action,
			"target_type":   log.TargetType,
			"target_id":     log.TargetID,
			"request_id":    log.RequestID,
			"result":        log.Result,
			"reason":        log.Reason,
			"source_ip":     log.SourceIP,
			"summary":       log.Summary,
			"details":       log.Details,
		})
	}
	raw, err := json.MarshalIndent(payload, "", "  ")
	if err != nil {
		return []byte("[]")
	}
	return raw
}

func exportAuditCSV(logs []models.AuditLog) []byte {
	var b strings.Builder
	writer := csv.NewWriter(&b)
	_ = writer.Write([]string{
		"id",
		"created_at",
		"actor_user_id",
		"action",
		"target_type",
		"target_id",
		"request_id",
		"result",
		"reason",
		"source_ip",
		"summary",
		"details",
	})
	for _, log := range logs {
		_ = writer.Write([]string{
			fmt.Sprintf("%d", log.ID),
			log.CreatedAt.UTC().Format(time.RFC3339),
			formatOptionalAuditActor(log.ActorUserID),
			log.Action,
			log.TargetType,
			fmt.Sprintf("%d", log.TargetID),
			log.RequestID,
			log.Result,
			log.Reason,
			log.SourceIP,
			log.Summary,
			log.Details,
		})
	}
	writer.Flush()
	return []byte(b.String())
}

func formatOptionalAuditActor(actorUserID *uint) string {
	if actorUserID == nil {
		return ""
	}
	return fmt.Sprintf("%d", *actorUserID)
}
