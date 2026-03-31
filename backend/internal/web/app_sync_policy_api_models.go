package web

import (
	"strconv"
	"time"

	"skillsindex/internal/models"
)

type apiSyncPolicyItem struct {
	ID              uint       `json:"id"`
	PolicyID        string     `json:"policy_id"`
	PolicyName      string     `json:"policy_name"`
	TargetScope     string     `json:"target_scope"`
	SourceType      string     `json:"source_type"`
	CronExpr        string     `json:"cron_expr"`
	Interval        string     `json:"interval"`
	IntervalMinutes int        `json:"interval_minutes"`
	Timeout         string     `json:"timeout"`
	TimeoutMinutes  int        `json:"timeout_minutes"`
	BatchSize       int        `json:"batch_size"`
	Timezone        string     `json:"timezone"`
	Enabled         bool       `json:"enabled"`
	MaxRetry        int        `json:"max_retry"`
	RetryBackoff    string     `json:"retry_backoff"`
	CreatedByUserID *uint      `json:"created_by_user_id"`
	UpdatedByUserID *uint      `json:"updated_by_user_id"`
	DeletedAt       *time.Time `json:"deleted_at,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

func syncPolicyToAPIItem(item models.SyncPolicy) apiSyncPolicyItem {
	return apiSyncPolicyItem{
		ID:              item.ID,
		PolicyID:        strconv.FormatUint(uint64(item.ID), 10),
		PolicyName:      item.PolicyName,
		TargetScope:     item.TargetScope,
		SourceType:      string(item.SourceType),
		CronExpr:        item.CronExpr,
		Interval:        (time.Duration(item.IntervalMinutes) * time.Minute).String(),
		IntervalMinutes: item.IntervalMinutes,
		Timeout:         (time.Duration(item.TimeoutMinutes) * time.Minute).String(),
		TimeoutMinutes:  item.TimeoutMinutes,
		BatchSize:       item.BatchSize,
		Timezone:        item.Timezone,
		Enabled:         item.Enabled,
		MaxRetry:        item.MaxRetry,
		RetryBackoff:    item.RetryBackoff,
		CreatedByUserID: item.CreatedByUserID,
		UpdatedByUserID: item.UpdatedByUserID,
		DeletedAt:       item.DeletedAt,
		CreatedAt:       item.CreatedAt,
		UpdatedAt:       item.UpdatedAt,
	}
}

func syncPoliciesToAPIItems(items []models.SyncPolicy) []apiSyncPolicyItem {
	result := make([]apiSyncPolicyItem, 0, len(items))
	for _, item := range items {
		result = append(result, syncPolicyToAPIItem(item))
	}
	return result
}
