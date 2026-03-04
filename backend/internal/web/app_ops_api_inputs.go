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

type apiOpsRecoveryDrillRunInput struct {
	RPOHours   float64 `json:"rpo_hours"`
	RTOHours   float64 `json:"rto_hours"`
	Note       string  `json:"note"`
	OccurredAt string  `json:"occurred_at"`
}

type apiOpsReleaseCreateInput struct {
	Version      string `json:"version"`
	Environment  string `json:"environment"`
	ChangeTicket string `json:"change_ticket"`
	Status       string `json:"status"`
	Note         string `json:"note"`
	ReleasedAt   string `json:"released_at"`
}

type apiOpsChangeApprovalCreateInput struct {
	TicketID   string `json:"ticket_id"`
	Reviewer   string `json:"reviewer"`
	Status     string `json:"status"`
	Note       string `json:"note"`
	OccurredAt string `json:"occurred_at"`
}

type apiOpsBackupPlanUpsertInput struct {
	PlanKey       string `json:"plan_key"`
	BackupType    string `json:"backup_type"`
	Schedule      string `json:"schedule"`
	RetentionDays int    `json:"retention_days"`
	Enabled       bool   `json:"enabled"`
	Note          string `json:"note"`
	OccurredAt    string `json:"occurred_at"`
}

type apiOpsBackupRunCreateInput struct {
	PlanKey         string  `json:"plan_key"`
	Status          string  `json:"status"`
	SizeMB          float64 `json:"size_mb"`
	DurationMinutes float64 `json:"duration_minutes"`
	Note            string  `json:"note"`
	OccurredAt      string  `json:"occurred_at"`
}

func readOpsRecoveryDrillRunInput(r *http.Request) (services.RecordRecoveryDrillInput, error) {
	contentType := strings.ToLower(strings.TrimSpace(r.Header.Get("Content-Type")))
	if strings.Contains(contentType, "application/json") {
		var payload apiOpsRecoveryDrillRunInput
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&payload); err != nil {
			return services.RecordRecoveryDrillInput{}, fmt.Errorf("invalid json payload: %w", err)
		}
		return normalizeOpsRecoveryDrillInput(payload)
	}

	if err := r.ParseForm(); err != nil {
		return services.RecordRecoveryDrillInput{}, fmt.Errorf("invalid form payload: %w", err)
	}
	payload := apiOpsRecoveryDrillRunInput{
		Note:       strings.TrimSpace(r.FormValue("note")),
		OccurredAt: strings.TrimSpace(r.FormValue("occurred_at")),
	}
	if raw := strings.TrimSpace(r.FormValue("rpo_hours")); raw != "" {
		value, err := strconv.ParseFloat(raw, 64)
		if err != nil {
			return services.RecordRecoveryDrillInput{}, fmt.Errorf("invalid rpo_hours")
		}
		payload.RPOHours = value
	}
	if raw := strings.TrimSpace(r.FormValue("rto_hours")); raw != "" {
		value, err := strconv.ParseFloat(raw, 64)
		if err != nil {
			return services.RecordRecoveryDrillInput{}, fmt.Errorf("invalid rto_hours")
		}
		payload.RTOHours = value
	}
	return normalizeOpsRecoveryDrillInput(payload)
}

func normalizeOpsRecoveryDrillInput(payload apiOpsRecoveryDrillRunInput) (services.RecordRecoveryDrillInput, error) {
	input := services.RecordRecoveryDrillInput{
		RPOHours: payload.RPOHours,
		RTOHours: payload.RTOHours,
		Note:     strings.TrimSpace(payload.Note),
	}
	if input.RPOHours <= 0 || input.RTOHours <= 0 {
		return services.RecordRecoveryDrillInput{}, fmt.Errorf("rpo_hours and rto_hours must be greater than zero")
	}

	occurredAtRaw := strings.TrimSpace(payload.OccurredAt)
	if occurredAtRaw == "" {
		input.OccurredAt = time.Now().UTC()
		return input, nil
	}
	if parsed, err := time.Parse(time.RFC3339, occurredAtRaw); err == nil {
		input.OccurredAt = parsed.UTC()
		return input, nil
	}
	if parsed, err := time.Parse("2006-01-02", occurredAtRaw); err == nil {
		input.OccurredAt = parsed.UTC()
		return input, nil
	}
	return services.RecordRecoveryDrillInput{}, fmt.Errorf("invalid occurred_at")
}

func readOpsReleaseCreateInput(r *http.Request) (services.RecordReleaseInput, error) {
	contentType := strings.ToLower(strings.TrimSpace(r.Header.Get("Content-Type")))
	payload := apiOpsReleaseCreateInput{}
	if strings.Contains(contentType, "application/json") {
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&payload); err != nil {
			return services.RecordReleaseInput{}, fmt.Errorf("invalid json payload: %w", err)
		}
	} else {
		if err := r.ParseForm(); err != nil {
			return services.RecordReleaseInput{}, fmt.Errorf("invalid form payload: %w", err)
		}
		payload.Version = strings.TrimSpace(r.FormValue("version"))
		payload.Environment = strings.TrimSpace(r.FormValue("environment"))
		payload.ChangeTicket = strings.TrimSpace(r.FormValue("change_ticket"))
		payload.Status = strings.TrimSpace(r.FormValue("status"))
		payload.Note = strings.TrimSpace(r.FormValue("note"))
		payload.ReleasedAt = strings.TrimSpace(r.FormValue("released_at"))
	}
	input := services.RecordReleaseInput{
		Version:      strings.TrimSpace(payload.Version),
		Environment:  strings.TrimSpace(payload.Environment),
		ChangeTicket: strings.TrimSpace(payload.ChangeTicket),
		Status:       strings.TrimSpace(payload.Status),
		Note:         strings.TrimSpace(payload.Note),
		ReleasedAt:   parseOpsTimeQuery(payload.ReleasedAt, time.Now().UTC()),
	}
	if input.Version == "" || input.Environment == "" {
		return services.RecordReleaseInput{}, fmt.Errorf("version and environment are required")
	}
	return input, nil
}

func readOpsChangeApprovalCreateInput(r *http.Request) (services.RecordChangeApprovalInput, error) {
	contentType := strings.ToLower(strings.TrimSpace(r.Header.Get("Content-Type")))
	payload := apiOpsChangeApprovalCreateInput{}
	if strings.Contains(contentType, "application/json") {
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&payload); err != nil {
			return services.RecordChangeApprovalInput{}, fmt.Errorf("invalid json payload: %w", err)
		}
	} else {
		if err := r.ParseForm(); err != nil {
			return services.RecordChangeApprovalInput{}, fmt.Errorf("invalid form payload: %w", err)
		}
		payload.TicketID = strings.TrimSpace(r.FormValue("ticket_id"))
		payload.Reviewer = strings.TrimSpace(r.FormValue("reviewer"))
		payload.Status = strings.TrimSpace(r.FormValue("status"))
		payload.Note = strings.TrimSpace(r.FormValue("note"))
		payload.OccurredAt = strings.TrimSpace(r.FormValue("occurred_at"))
	}
	input := services.RecordChangeApprovalInput{
		TicketID:   strings.TrimSpace(payload.TicketID),
		Reviewer:   strings.TrimSpace(payload.Reviewer),
		Status:     strings.TrimSpace(payload.Status),
		Note:       strings.TrimSpace(payload.Note),
		OccurredAt: parseOpsTimeQuery(payload.OccurredAt, time.Now().UTC()),
	}
	if input.TicketID == "" {
		return services.RecordChangeApprovalInput{}, fmt.Errorf("ticket_id is required")
	}
	return input, nil
}

func readOpsBackupPlanUpsertInput(r *http.Request) (services.UpsertBackupPlanInput, error) {
	contentType := strings.ToLower(strings.TrimSpace(r.Header.Get("Content-Type")))
	payload := apiOpsBackupPlanUpsertInput{}
	if strings.Contains(contentType, "application/json") {
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&payload); err != nil {
			return services.UpsertBackupPlanInput{}, fmt.Errorf("invalid json payload: %w", err)
		}
	} else {
		if err := r.ParseForm(); err != nil {
			return services.UpsertBackupPlanInput{}, fmt.Errorf("invalid form payload: %w", err)
		}
		payload.PlanKey = strings.TrimSpace(r.FormValue("plan_key"))
		payload.BackupType = strings.TrimSpace(r.FormValue("backup_type"))
		payload.Schedule = strings.TrimSpace(r.FormValue("schedule"))
		payload.Note = strings.TrimSpace(r.FormValue("note"))
		payload.OccurredAt = strings.TrimSpace(r.FormValue("occurred_at"))
		if raw := strings.TrimSpace(r.FormValue("retention_days")); raw != "" {
			value, err := strconv.Atoi(raw)
			if err != nil {
				return services.UpsertBackupPlanInput{}, fmt.Errorf("invalid retention_days")
			}
			payload.RetentionDays = value
		}
		rawEnabled := strings.TrimSpace(r.FormValue("enabled"))
		if rawEnabled != "" {
			parsed, matched := parseBoolSettingValue(rawEnabled)
			if !matched {
				return services.UpsertBackupPlanInput{}, fmt.Errorf("invalid enabled")
			}
			payload.Enabled = parsed
		}
	}
	input := services.UpsertBackupPlanInput{
		PlanKey:       strings.TrimSpace(payload.PlanKey),
		BackupType:    strings.TrimSpace(payload.BackupType),
		Schedule:      strings.TrimSpace(payload.Schedule),
		RetentionDays: payload.RetentionDays,
		Enabled:       payload.Enabled,
		Note:          strings.TrimSpace(payload.Note),
		OccurredAt:    parseOpsTimeQuery(payload.OccurredAt, time.Now().UTC()),
	}
	if input.PlanKey == "" || input.BackupType == "" || input.Schedule == "" || input.RetentionDays <= 0 {
		return services.UpsertBackupPlanInput{}, fmt.Errorf("plan_key, backup_type, schedule, retention_days are required")
	}
	return input, nil
}

func readOpsBackupRunCreateInput(r *http.Request) (services.RecordBackupRunInput, error) {
	contentType := strings.ToLower(strings.TrimSpace(r.Header.Get("Content-Type")))
	payload := apiOpsBackupRunCreateInput{}
	if strings.Contains(contentType, "application/json") {
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&payload); err != nil {
			return services.RecordBackupRunInput{}, fmt.Errorf("invalid json payload: %w", err)
		}
	} else {
		if err := r.ParseForm(); err != nil {
			return services.RecordBackupRunInput{}, fmt.Errorf("invalid form payload: %w", err)
		}
		payload.PlanKey = strings.TrimSpace(r.FormValue("plan_key"))
		payload.Status = strings.TrimSpace(r.FormValue("status"))
		payload.Note = strings.TrimSpace(r.FormValue("note"))
		payload.OccurredAt = strings.TrimSpace(r.FormValue("occurred_at"))
		if raw := strings.TrimSpace(r.FormValue("size_mb")); raw != "" {
			value, err := strconv.ParseFloat(raw, 64)
			if err != nil {
				return services.RecordBackupRunInput{}, fmt.Errorf("invalid size_mb")
			}
			payload.SizeMB = value
		}
		if raw := strings.TrimSpace(r.FormValue("duration_minutes")); raw != "" {
			value, err := strconv.ParseFloat(raw, 64)
			if err != nil {
				return services.RecordBackupRunInput{}, fmt.Errorf("invalid duration_minutes")
			}
			payload.DurationMinutes = value
		}
	}
	input := services.RecordBackupRunInput{
		PlanKey:         strings.TrimSpace(payload.PlanKey),
		Status:          strings.TrimSpace(payload.Status),
		SizeMB:          payload.SizeMB,
		DurationMinutes: payload.DurationMinutes,
		Note:            strings.TrimSpace(payload.Note),
		OccurredAt:      parseOpsTimeQuery(payload.OccurredAt, time.Now().UTC()),
	}
	if input.PlanKey == "" {
		return services.RecordBackupRunInput{}, fmt.Errorf("plan_key is required")
	}
	return input, nil
}

func parseOpsTimeQuery(raw string, fallback time.Time) time.Time {
	value := strings.TrimSpace(raw)
	if value == "" {
		return fallback.UTC()
	}
	if parsed, err := time.Parse(time.RFC3339, value); err == nil {
		return parsed.UTC()
	}
	if parsed, err := time.Parse("2006-01-02", value); err == nil {
		return parsed.UTC()
	}
	return fallback.UTC()
}
