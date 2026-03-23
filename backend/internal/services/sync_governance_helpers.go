package services

import (
	"context"
	"fmt"
	"strconv"
	"strings"
)

type auditRecordInput struct {
	ActorUserID uint
	Action      string
	TargetType  string
	TargetID    uint
	Summary     string
	Details     string
}

func (s *SyncGovernanceService) recordAudit(ctx context.Context, input auditRecordInput) {
	if s == nil || s.audits == nil {
		return
	}
	action := strings.TrimSpace(input.Action)
	if action == "" {
		return
	}
	targetType := strings.TrimSpace(input.TargetType)
	if targetType == "" {
		targetType = "sync_run"
	}
	_ = s.audits.Record(ctx, RecordAuditInput{
		ActorUserID: input.ActorUserID,
		Action:      action,
		TargetType:  targetType,
		TargetID:    input.TargetID,
		Result:      syncGovernanceAuditResult(action),
		Summary:     strings.TrimSpace(input.Summary),
		Details:     strings.TrimSpace(input.Details),
	})
}

func syncGovernanceAuditResult(action string) string {
	clean := strings.ToLower(strings.TrimSpace(action))
	if strings.Contains(clean, "fail") || strings.Contains(clean, "cancel") {
		return "failure"
	}
	return "success"
}

func normalizeSyncGovernanceMaxAttempts(value int) int {
	if value <= 0 {
		return defaultSyncGovernanceMaxAttempts
	}
	return value
}

func chooseNonEmpty(values ...string) string {
	for _, value := range values {
		trimmed := strings.TrimSpace(value)
		if trimmed != "" {
			return trimmed
		}
	}
	return ""
}

func buildSyncGovernanceDetails(pairs map[string]string) string {
	if len(pairs) == 0 {
		return ""
	}
	clean := make(map[string]string, len(pairs))
	for key, value := range pairs {
		trimmedKey := strings.TrimSpace(key)
		if trimmedKey == "" {
			continue
		}
		clean[trimmedKey] = strings.TrimSpace(value)
	}
	if len(clean) == 0 {
		return ""
	}
	parts := make([]string, 0, len(clean))
	for key, value := range clean {
		parts = append(parts, key+"="+value)
	}
	return strings.Join(parts, ";")
}

func buildSyncGovernanceSummary(scope string, synced int, failed int) string {
	return fmt.Sprintf("scope=%s synced=%s failed=%s", normalizeSyncRunScope(scope), strconv.Itoa(maxInt(synced, 0)), strconv.Itoa(maxInt(failed, 0)))
}
