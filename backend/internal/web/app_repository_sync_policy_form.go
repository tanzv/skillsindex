package web

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"skillsindex/internal/services"
)

func readRepositorySyncPolicyUpdateInput(r *http.Request) (services.UpdateRepositorySyncPolicyInput, error) {
	input := services.UpdateRepositorySyncPolicyInput{}
	contentType := strings.ToLower(strings.TrimSpace(r.Header.Get("Content-Type")))
	if strings.Contains(contentType, "application/json") {
		var payload struct {
			Enabled   *bool  `json:"enabled"`
			Interval  string `json:"interval"`
			Timeout   string `json:"timeout"`
			BatchSize *int   `json:"batch_size"`
		}
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&payload); err != nil {
			return input, fmt.Errorf("invalid json payload: %w", err)
		}
		input.Enabled = payload.Enabled
		if strings.TrimSpace(payload.Interval) != "" {
			value, err := time.ParseDuration(strings.TrimSpace(payload.Interval))
			if err != nil || value <= 0 {
				return input, fmt.Errorf("invalid interval")
			}
			input.Interval = &value
		}
		if strings.TrimSpace(payload.Timeout) != "" {
			value, err := time.ParseDuration(strings.TrimSpace(payload.Timeout))
			if err != nil || value <= 0 {
				return input, fmt.Errorf("invalid timeout")
			}
			input.Timeout = &value
		}
		if payload.BatchSize != nil {
			if *payload.BatchSize <= 0 {
				return input, fmt.Errorf("invalid batch_size")
			}
			input.BatchSize = payload.BatchSize
		}
		return input, nil
	}

	if err := r.ParseForm(); err != nil {
		return input, fmt.Errorf("invalid form payload: %w", err)
	}
	if raw := strings.TrimSpace(r.FormValue("enabled")); raw != "" {
		value, matched := parseBoolSettingValue(raw)
		if !matched {
			return input, fmt.Errorf("invalid enabled")
		}
		input.Enabled = &value
	}
	if raw := strings.TrimSpace(r.FormValue("interval")); raw != "" {
		value, err := time.ParseDuration(raw)
		if err != nil || value <= 0 {
			return input, fmt.Errorf("invalid interval")
		}
		input.Interval = &value
	}
	if raw := strings.TrimSpace(r.FormValue("timeout")); raw != "" {
		value, err := time.ParseDuration(raw)
		if err != nil || value <= 0 {
			return input, fmt.Errorf("invalid timeout")
		}
		input.Timeout = &value
	}
	if raw := strings.TrimSpace(r.FormValue("batch_size")); raw != "" {
		value, err := strconv.Atoi(raw)
		if err != nil || value <= 0 {
			return input, fmt.Errorf("invalid batch_size")
		}
		input.BatchSize = &value
	}
	return input, nil
}
