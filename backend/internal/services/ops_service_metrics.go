package services

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"skillsindex/internal/models"
)

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
		ActorUserID: auditActorPointer(actorUserID),
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
