package web

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

type syncPolicyWritePayload struct {
	PolicyName      *string `json:"policy_name"`
	TargetScope     *string `json:"target_scope"`
	SourceType      *string `json:"source_type"`
	CronExpr        *string `json:"cron_expr"`
	IntervalMinutes *int    `json:"interval_minutes"`
	TimeoutMinutes  *int    `json:"timeout_minutes"`
	BatchSize       *int    `json:"batch_size"`
	Timezone        *string `json:"timezone"`
	Enabled         *bool   `json:"enabled"`
	MaxRetry        *int    `json:"max_retry"`
	RetryBackoff    *string `json:"retry_backoff"`
}

func readSyncPolicyWritePayload(r *http.Request) (syncPolicyWritePayload, error) {
	var payload syncPolicyWritePayload
	contentType := strings.ToLower(strings.TrimSpace(r.Header.Get("Content-Type")))
	if strings.Contains(contentType, "application/json") {
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&payload); err != nil {
			return payload, fmt.Errorf("invalid json payload: %w", err)
		}
		return payload, nil
	}

	if err := r.ParseForm(); err != nil {
		return payload, fmt.Errorf("invalid form payload: %w", err)
	}
	if values, exists := r.Form["policy_name"]; exists {
		value := ""
		if len(values) > 0 {
			value = values[0]
		}
		payload.PolicyName = &value
	}
	if values, exists := r.Form["target_scope"]; exists {
		value := ""
		if len(values) > 0 {
			value = values[0]
		}
		payload.TargetScope = &value
	}
	if values, exists := r.Form["source_type"]; exists {
		value := ""
		if len(values) > 0 {
			value = values[0]
		}
		payload.SourceType = &value
	}
	if values, exists := r.Form["cron_expr"]; exists {
		value := ""
		if len(values) > 0 {
			value = values[0]
		}
		payload.CronExpr = &value
	}
	if values, exists := r.Form["interval_minutes"]; exists {
		value := ""
		if len(values) > 0 {
			value = strings.TrimSpace(values[0])
		}
		if value == "" {
			parsed := 0
			payload.IntervalMinutes = &parsed
		} else {
			parsed, err := strconv.Atoi(value)
			if err != nil {
				return payload, fmt.Errorf("invalid interval_minutes")
			}
			payload.IntervalMinutes = &parsed
		}
	}
	if values, exists := r.Form["timeout_minutes"]; exists {
		value := ""
		if len(values) > 0 {
			value = strings.TrimSpace(values[0])
		}
		if value == "" {
			parsed := 0
			payload.TimeoutMinutes = &parsed
		} else {
			parsed, err := strconv.Atoi(value)
			if err != nil {
				return payload, fmt.Errorf("invalid timeout_minutes")
			}
			payload.TimeoutMinutes = &parsed
		}
	}
	if values, exists := r.Form["batch_size"]; exists {
		value := ""
		if len(values) > 0 {
			value = strings.TrimSpace(values[0])
		}
		if value == "" {
			parsed := 0
			payload.BatchSize = &parsed
		} else {
			parsed, err := strconv.Atoi(value)
			if err != nil {
				return payload, fmt.Errorf("invalid batch_size")
			}
			payload.BatchSize = &parsed
		}
	}
	if values, exists := r.Form["timezone"]; exists {
		value := ""
		if len(values) > 0 {
			value = values[0]
		}
		payload.Timezone = &value
	}
	if values, exists := r.Form["enabled"]; exists {
		raw := ""
		if len(values) > 0 {
			raw = values[0]
		}
		parsed, matched := parseBoolSettingValue(raw)
		if !matched {
			return payload, fmt.Errorf("invalid enabled")
		}
		payload.Enabled = &parsed
	}
	if values, exists := r.Form["max_retry"]; exists {
		value := ""
		if len(values) > 0 {
			value = strings.TrimSpace(values[0])
		}
		if value == "" {
			parsed := 0
			payload.MaxRetry = &parsed
		} else {
			parsed, err := strconv.Atoi(value)
			if err != nil {
				return payload, fmt.Errorf("invalid max_retry")
			}
			payload.MaxRetry = &parsed
		}
	}
	if values, exists := r.Form["retry_backoff"]; exists {
		value := ""
		if len(values) > 0 {
			value = values[0]
		}
		payload.RetryBackoff = &value
	}
	return payload, nil
}

func readCreateSyncPolicyInput(r *http.Request, actorUserID *uint) (services.CreateSyncPolicyInput, error) {
	payload, err := readSyncPolicyWritePayload(r)
	if err != nil {
		return services.CreateSyncPolicyInput{}, err
	}

	input := services.CreateSyncPolicyInput{
		CreatedByUserID: actorUserID,
	}
	if payload.PolicyName != nil {
		input.PolicyName = strings.TrimSpace(*payload.PolicyName)
	}
	if payload.TargetScope != nil {
		input.TargetScope = strings.TrimSpace(*payload.TargetScope)
	}
	if payload.SourceType != nil {
		input.SourceType = models.SyncPolicySourceType(strings.ToLower(strings.TrimSpace(*payload.SourceType)))
	}
	if payload.CronExpr != nil {
		input.CronExpr = strings.TrimSpace(*payload.CronExpr)
	}
	if payload.IntervalMinutes != nil {
		input.IntervalMinutes = *payload.IntervalMinutes
	}
	if payload.TimeoutMinutes != nil {
		input.TimeoutMinutes = *payload.TimeoutMinutes
	}
	if payload.BatchSize != nil {
		input.BatchSize = *payload.BatchSize
	}
	if payload.Timezone != nil {
		input.Timezone = strings.TrimSpace(*payload.Timezone)
	}
	if payload.Enabled != nil {
		input.Enabled = *payload.Enabled
	}
	if payload.MaxRetry != nil {
		input.MaxRetry = *payload.MaxRetry
	}
	if payload.RetryBackoff != nil {
		input.RetryBackoff = strings.TrimSpace(*payload.RetryBackoff)
	}
	return input, nil
}

func readUpdateSyncPolicyInput(r *http.Request, actorUserID *uint) (services.UpdateSyncPolicyInput, bool, error) {
	payload, err := readSyncPolicyWritePayload(r)
	if err != nil {
		return services.UpdateSyncPolicyInput{}, false, err
	}

	input := services.UpdateSyncPolicyInput{
		UpdatedByUserID: actorUserID,
	}
	hasUpdates := false
	if payload.PolicyName != nil {
		value := strings.TrimSpace(*payload.PolicyName)
		input.PolicyName = &value
		hasUpdates = true
	}
	if payload.TargetScope != nil {
		value := strings.TrimSpace(*payload.TargetScope)
		input.TargetScope = &value
		hasUpdates = true
	}
	if payload.SourceType != nil {
		value := models.SyncPolicySourceType(strings.ToLower(strings.TrimSpace(*payload.SourceType)))
		input.SourceType = &value
		hasUpdates = true
	}
	if payload.CronExpr != nil {
		value := strings.TrimSpace(*payload.CronExpr)
		input.CronExpr = &value
		hasUpdates = true
	}
	if payload.IntervalMinutes != nil {
		value := *payload.IntervalMinutes
		input.IntervalMinutes = &value
		hasUpdates = true
	}
	if payload.TimeoutMinutes != nil {
		value := *payload.TimeoutMinutes
		input.TimeoutMinutes = &value
		hasUpdates = true
	}
	if payload.BatchSize != nil {
		value := *payload.BatchSize
		input.BatchSize = &value
		hasUpdates = true
	}
	if payload.Timezone != nil {
		value := strings.TrimSpace(*payload.Timezone)
		input.Timezone = &value
		hasUpdates = true
	}
	if payload.Enabled != nil {
		value := *payload.Enabled
		input.Enabled = &value
		hasUpdates = true
	}
	if payload.MaxRetry != nil {
		value := *payload.MaxRetry
		input.MaxRetry = &value
		hasUpdates = true
	}
	if payload.RetryBackoff != nil {
		value := strings.TrimSpace(*payload.RetryBackoff)
		input.RetryBackoff = &value
		hasUpdates = true
	}
	return input, hasUpdates, nil
}
