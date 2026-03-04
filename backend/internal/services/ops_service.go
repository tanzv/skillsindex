package services

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"skillsindex/internal/models"

	"gorm.io/gorm"
)

// OpsService provides operations, observability, and compliance snapshots.
type OpsService struct {
	db *gorm.DB
}

// OpsMetrics describes operational baseline metrics.
type OpsMetrics struct {
	GeneratedAt           time.Time `json:"generated_at"`
	RequestQPS            float64   `json:"request_qps"`
	LatencyP50Ms          float64   `json:"latency_p50_ms"`
	LatencyP95Ms          float64   `json:"latency_p95_ms"`
	LatencyP99Ms          float64   `json:"latency_p99_ms"`
	ErrorRate4xx          float64   `json:"error_rate_4xx"`
	ErrorRate5xx          float64   `json:"error_rate_5xx"`
	SyncSuccessRate       float64   `json:"sync_success_rate"`
	AuditWriteFailureRate float64   `json:"audit_write_failure_rate"`
	TotalAuditLogs24h     int64     `json:"total_audit_logs_24h"`
	TotalSyncRuns24h      int64     `json:"total_sync_runs_24h"`
	FailedSyncRuns24h     int64     `json:"failed_sync_runs_24h"`
	RetentionDays         int       `json:"retention_days"`
}

// OpsAlertSeverity describes alert severity levels.
type OpsAlertSeverity string

const (
	// OpsAlertSeverityInfo indicates informational state.
	OpsAlertSeverityInfo OpsAlertSeverity = "info"
	// OpsAlertSeverityWarning indicates warning state.
	OpsAlertSeverityWarning OpsAlertSeverity = "warning"
	// OpsAlertSeverityCritical indicates critical state.
	OpsAlertSeverityCritical OpsAlertSeverity = "critical"
)

// OpsAlert describes one derived operational alert.
type OpsAlert struct {
	Code      string           `json:"code"`
	Severity  OpsAlertSeverity `json:"severity"`
	Message   string           `json:"message"`
	Triggered bool             `json:"triggered"`
}

// OpsReleaseGateCheck describes one release gate check item.
type OpsReleaseGateCheck struct {
	Code     string           `json:"code"`
	Severity OpsAlertSeverity `json:"severity"`
	Message  string           `json:"message"`
	Passed   bool             `json:"passed"`
}

// OpsReleaseGateSnapshot describes release readiness checks.
type OpsReleaseGateSnapshot struct {
	GeneratedAt time.Time             `json:"generated_at"`
	Passed      bool                  `json:"passed"`
	Checks      []OpsReleaseGateCheck `json:"checks"`
}

// RecordRecoveryDrillInput stores parameters for one recovery drill run.
type RecordRecoveryDrillInput struct {
	RPOHours   float64
	RTOHours   float64
	Note       string
	OccurredAt time.Time
}

// OpsRecoveryDrillRecord describes one logged recovery drill result.
type OpsRecoveryDrillRecord struct {
	LoggedAt    time.Time `json:"logged_at"`
	ActorUserID uint      `json:"actor_user_id"`
	RPOHours    float64   `json:"rpo_hours"`
	RTOHours    float64   `json:"rto_hours"`
	Passed      bool      `json:"passed"`
	Note        string    `json:"note"`
}

// RecordReleaseInput stores one release publishing record.
type RecordReleaseInput struct {
	Version      string
	Environment  string
	ChangeTicket string
	Status       string
	Note         string
	ReleasedAt   time.Time
}

// OpsReleaseRecord describes one release event.
type OpsReleaseRecord struct {
	ReleasedAt   time.Time `json:"released_at"`
	ActorUserID  uint      `json:"actor_user_id"`
	Version      string    `json:"version"`
	Environment  string    `json:"environment"`
	ChangeTicket string    `json:"change_ticket"`
	Status       string    `json:"status"`
	Note         string    `json:"note"`
}

// RecordChangeApprovalInput stores one change approval event.
type RecordChangeApprovalInput struct {
	TicketID   string
	Reviewer   string
	Status     string
	Note       string
	OccurredAt time.Time
}

// OpsChangeApprovalRecord describes one change approval audit record.
type OpsChangeApprovalRecord struct {
	OccurredAt  time.Time `json:"occurred_at"`
	ActorUserID uint      `json:"actor_user_id"`
	TicketID    string    `json:"ticket_id"`
	Reviewer    string    `json:"reviewer"`
	Status      string    `json:"status"`
	Note        string    `json:"note"`
}

// UpsertBackupPlanInput stores one backup plan event.
type UpsertBackupPlanInput struct {
	PlanKey       string
	BackupType    string
	Schedule      string
	RetentionDays int
	Enabled       bool
	Note          string
	OccurredAt    time.Time
}

// OpsBackupPlanRecord describes one backup plan record.
type OpsBackupPlanRecord struct {
	LoggedAt      time.Time `json:"logged_at"`
	ActorUserID   uint      `json:"actor_user_id"`
	PlanKey       string    `json:"plan_key"`
	BackupType    string    `json:"backup_type"`
	Schedule      string    `json:"schedule"`
	RetentionDays int       `json:"retention_days"`
	Enabled       bool      `json:"enabled"`
	Note          string    `json:"note"`
}

// RecordBackupRunInput stores one backup run event.
type RecordBackupRunInput struct {
	PlanKey         string
	Status          string
	SizeMB          float64
	DurationMinutes float64
	Note            string
	OccurredAt      time.Time
}

// OpsBackupRunRecord describes one backup run record.
type OpsBackupRunRecord struct {
	LoggedAt        time.Time `json:"logged_at"`
	ActorUserID     uint      `json:"actor_user_id"`
	PlanKey         string    `json:"plan_key"`
	Status          string    `json:"status"`
	SizeMB          float64   `json:"size_mb"`
	DurationMinutes float64   `json:"duration_minutes"`
	Note            string    `json:"note"`
}

// AuditExportInput describes filters for exporting audit logs.
type AuditExportInput struct {
	From   time.Time
	To     time.Time
	Format string
}

const (
	opsRecoveryDrillAction  = "ops_recovery_drill"
	opsReleaseGateAction    = "ops_release_gate_run"
	opsReleaseAction        = "ops_release"
	opsChangeApprovalAction = "ops_change_approval"
	opsBackupPlanAction     = "ops_backup_plan"
	opsBackupRunAction      = "ops_backup_run"
	opsTargetType           = "ops"
	targetRPOHours          = 1.0
	targetRTOHours          = 4.0
)

// NewOpsService creates a new operations service.
func NewOpsService(db *gorm.DB) *OpsService {
	return &OpsService{db: db}
}

// BuildMetrics builds one operations metrics snapshot.
func (s *OpsService) BuildMetrics(ctx context.Context, now time.Time) (OpsMetrics, error) {
	if now.IsZero() {
		now = time.Now().UTC()
	}
	now = now.UTC()
	window24hFrom := now.Add(-24 * time.Hour)
	window5mFrom := now.Add(-5 * time.Minute)

	totalAuditLogs24h, err := s.countAuditLogsByTime(ctx, window24hFrom, now)
	if err != nil {
		return OpsMetrics{}, err
	}
	recentSignalCount, err := s.countSignalEventsByTime(ctx, window5mFrom, now)
	if err != nil {
		return OpsMetrics{}, err
	}
	requestQPS := float64(recentSignalCount) / 300.0

	syncRuns, err := s.listSyncRunsByTime(ctx, window24hFrom, now)
	if err != nil {
		return OpsMetrics{}, err
	}
	totalSyncRuns24h := int64(len(syncRuns))
	failedSyncRuns24h := int64(0)
	durations := make([]int, 0, len(syncRuns))
	for _, run := range syncRuns {
		durations = append(durations, maxInt(run.DurationMs, 0))
		if strings.EqualFold(strings.TrimSpace(run.Status), "failed") || strings.EqualFold(strings.TrimSpace(run.Status), "partial") {
			failedSyncRuns24h++
		}
	}

	syncSuccessRate := 100.0
	if totalSyncRuns24h > 0 {
		syncSuccessRate = (float64(totalSyncRuns24h-failedSyncRuns24h) / float64(totalSyncRuns24h)) * 100.0
	}

	auditFailures24h, err := s.countAuditWriteFailuresByTime(ctx, window24hFrom, now)
	if err != nil {
		return OpsMetrics{}, err
	}
	auditWriteFailureRate := 0.0
	if totalAuditLogs24h > 0 {
		auditWriteFailureRate = (float64(auditFailures24h) / float64(totalAuditLogs24h)) * 100.0
	}

	latencyP50 := percentileDurationMs(durations, 50)
	latencyP95 := percentileDurationMs(durations, 95)
	latencyP99 := percentileDurationMs(durations, 99)

	return OpsMetrics{
		GeneratedAt:           now,
		RequestQPS:            roundToTwo(requestQPS),
		LatencyP50Ms:          roundToTwo(latencyP50),
		LatencyP95Ms:          roundToTwo(latencyP95),
		LatencyP99Ms:          roundToTwo(latencyP99),
		ErrorRate4xx:          0,
		ErrorRate5xx:          0,
		SyncSuccessRate:       roundToTwo(syncSuccessRate),
		AuditWriteFailureRate: roundToTwo(auditWriteFailureRate),
		TotalAuditLogs24h:     totalAuditLogs24h,
		TotalSyncRuns24h:      totalSyncRuns24h,
		FailedSyncRuns24h:     failedSyncRuns24h,
		RetentionDays:         180,
	}, nil
}

// BuildAlerts generates baseline operational alerts from metrics.
func (s *OpsService) BuildAlerts(ctx context.Context, now time.Time) ([]OpsAlert, error) {
	metrics, err := s.BuildMetrics(ctx, now)
	if err != nil {
		return nil, err
	}

	alerts := []OpsAlert{
		{
			Code:      "OPS-SYNC-SUCCESS-RATE",
			Severity:  OpsAlertSeverityInfo,
			Message:   "Sync success rate is healthy",
			Triggered: false,
		},
		{
			Code:      "OPS-LATENCY-P95",
			Severity:  OpsAlertSeverityInfo,
			Message:   "P95 latency baseline is stable",
			Triggered: false,
		},
		{
			Code:      "OPS-AUDIT-INGESTION",
			Severity:  OpsAlertSeverityInfo,
			Message:   "Audit ingestion stream is active",
			Triggered: false,
		},
	}

	if metrics.TotalSyncRuns24h >= 10 && metrics.SyncSuccessRate < 95 {
		alerts[0].Triggered = true
		alerts[0].Severity = OpsAlertSeverityWarning
		alerts[0].Message = fmt.Sprintf("Sync success rate dropped to %.2f%%", metrics.SyncSuccessRate)
	}
	if metrics.TotalSyncRuns24h >= 10 && metrics.SyncSuccessRate < 80 {
		alerts[0].Triggered = true
		alerts[0].Severity = OpsAlertSeverityCritical
		alerts[0].Message = fmt.Sprintf("Sync success rate is critical: %.2f%%", metrics.SyncSuccessRate)
	}
	if metrics.LatencyP95Ms > 300000 {
		alerts[1].Triggered = true
		alerts[1].Severity = OpsAlertSeverityWarning
		alerts[1].Message = fmt.Sprintf("P95 latency exceeded baseline: %.2fms", metrics.LatencyP95Ms)
	}
	if metrics.TotalAuditLogs24h == 0 {
		alerts[2].Triggered = true
		alerts[2].Severity = OpsAlertSeverityWarning
		alerts[2].Message = "No audit records in the last 24 hours"
	}

	return alerts, nil
}

// BuildReleaseGates evaluates release readiness gates from operational signals.
func (s *OpsService) BuildReleaseGates(ctx context.Context, now time.Time) (OpsReleaseGateSnapshot, error) {
	if now.IsZero() {
		now = time.Now().UTC()
	}
	now = now.UTC()

	metrics, err := s.BuildMetrics(ctx, now)
	if err != nil {
		return OpsReleaseGateSnapshot{}, err
	}
	alerts, err := s.BuildAlerts(ctx, now)
	if err != nil {
		return OpsReleaseGateSnapshot{}, err
	}
	drills, err := s.ListRecoveryDrills(ctx, 1)
	if err != nil {
		return OpsReleaseGateSnapshot{}, err
	}

	checks := make([]OpsReleaseGateCheck, 0, 4)

	syncGatePassed := metrics.TotalSyncRuns24h < 10 || metrics.SyncSuccessRate >= 95
	syncGateMessage := fmt.Sprintf("Sync success %.2f%% over %d runs in 24h", metrics.SyncSuccessRate, metrics.TotalSyncRuns24h)
	checks = append(checks, OpsReleaseGateCheck{
		Code:     "OPS-GATE-SYNC-SUCCESS",
		Severity: chooseGateSeverity(syncGatePassed),
		Message:  syncGateMessage,
		Passed:   syncGatePassed,
	})

	hasCritical := false
	for _, item := range alerts {
		if item.Triggered && item.Severity == OpsAlertSeverityCritical {
			hasCritical = true
			break
		}
	}
	checks = append(checks, OpsReleaseGateCheck{
		Code:     "OPS-GATE-NO-CRITICAL-ALERTS",
		Severity: chooseGateSeverity(!hasCritical),
		Message:  "No critical operational alert is currently triggered",
		Passed:   !hasCritical,
	})

	recoveryPassed := false
	recoveryMessage := "No recovery drill record available"
	if len(drills) > 0 {
		latest := drills[0]
		age := now.Sub(latest.LoggedAt)
		recoveryPassed = latest.Passed && age <= 31*24*time.Hour
		recoveryMessage = fmt.Sprintf("Latest drill at %s with RPO %.2fh and RTO %.2fh", latest.LoggedAt.UTC().Format(time.RFC3339), latest.RPOHours, latest.RTOHours)
		if age > 31*24*time.Hour {
			recoveryMessage = fmt.Sprintf("Latest drill is stale (%d days old)", int(age.Hours()/24))
		}
	}
	checks = append(checks, OpsReleaseGateCheck{
		Code:     "OPS-GATE-RECOVERY-DRILL",
		Severity: chooseGateSeverity(recoveryPassed),
		Message:  recoveryMessage,
		Passed:   recoveryPassed,
	})

	auditExportPassed := metrics.RetentionDays >= 180
	checks = append(checks, OpsReleaseGateCheck{
		Code:     "OPS-GATE-AUDIT-RETENTION",
		Severity: chooseGateSeverity(auditExportPassed),
		Message:  fmt.Sprintf("Audit retention baseline %d days", metrics.RetentionDays),
		Passed:   auditExportPassed,
	})

	allPassed := true
	for _, check := range checks {
		if !check.Passed {
			allPassed = false
			break
		}
	}

	return OpsReleaseGateSnapshot{
		GeneratedAt: now,
		Passed:      allPassed,
		Checks:      checks,
	}, nil
}

// RecordReleaseGateRun records one gate execution result in audit logs.
func (s *OpsService) RecordReleaseGateRun(ctx context.Context, actorUserID uint, snapshot OpsReleaseGateSnapshot) error {
	if actorUserID == 0 {
		return fmt.Errorf("actor user id is required")
	}
	eventTime := snapshot.GeneratedAt
	if eventTime.IsZero() {
		eventTime = time.Now().UTC()
	}
	eventTime = eventTime.UTC()

	raw, err := json.Marshal(snapshot)
	if err != nil {
		return fmt.Errorf("failed to marshal release gate snapshot: %w", err)
	}

	summary := "release gate run failed"
	if snapshot.Passed {
		summary = "release gate run passed"
	}
	entry := models.AuditLog{
		ActorUserID: actorUserID,
		Action:      opsReleaseGateAction,
		TargetType:  opsTargetType,
		Summary:     summary,
		Details:     string(raw),
		CreatedAt:   eventTime,
	}
	if err := s.db.WithContext(ctx).Create(&entry).Error; err != nil {
		return fmt.Errorf("failed to record release gate run: %w", err)
	}
	return nil
}

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
		ActorUserID: actorUserID,
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
			ActorUserID: item.ActorUserID,
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

// RecordRelease stores one release event.
