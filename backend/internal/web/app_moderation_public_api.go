package web

import (
	"net/http"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) handleAPISkillReport(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if !user.CanAccessDashboard() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}
	if a.moderationSvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Moderation service is unavailable")
		return
	}

	skillID, err := parseUintURLParam(r, "skillID")
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_skill_id", "Invalid skill id")
		return
	}

	type payload struct {
		ReasonCode   string `json:"reason_code"`
		ReasonDetail string `json:"reason_detail"`
	}
	var input payload
	if decodeErr := decodeJSONOrForm(r, &input); decodeErr != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", decodeErr, "Invalid request payload")
		return
	}

	reporterID := user.ID
	created, createErr := a.moderationSvc.CreateCase(r.Context(), services.CreateModerationCaseInput{
		ReporterUserID: &reporterID,
		TargetType:     models.ModerationTargetSkill,
		SkillID:        &skillID,
		ReasonCode:     input.ReasonCode,
		ReasonDetail:   input.ReasonDetail,
	})
	if createErr != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "create_failed", createErr, "Failed to create moderation report")
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "moderation_report_skill",
		TargetType: "moderation_case",
		TargetID:   created.ID,
		Summary:    "Reported skill for moderation",
		Details: auditDetailsJSON(map[string]string{
			"skill_id":    toUintString(skillID),
			"reason_code": strings.TrimSpace(input.ReasonCode),
			"target_type": string(created.TargetType),
			"case_status": string(created.Status),
		}),
	})

	writeJSON(w, http.StatusCreated, map[string]any{
		"id":      created.ID,
		"status":  created.Status,
		"message": "report accepted",
	})
}

func (a *App) handleAPICommentReport(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if !user.CanAccessDashboard() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}
	if a.moderationSvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Moderation service is unavailable")
		return
	}

	skillID, err := parseUintURLParam(r, "skillID")
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_skill_id", "Invalid skill id")
		return
	}
	commentID, err := parseUintURLParam(r, "commentID")
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_comment_id", "Invalid comment id")
		return
	}

	type payload struct {
		ReasonCode   string `json:"reason_code"`
		ReasonDetail string `json:"reason_detail"`
	}
	var input payload
	if decodeErr := decodeJSONOrForm(r, &input); decodeErr != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", decodeErr, "Invalid request payload")
		return
	}

	reporterID := user.ID
	created, createErr := a.moderationSvc.CreateCase(r.Context(), services.CreateModerationCaseInput{
		ReporterUserID: &reporterID,
		TargetType:     models.ModerationTargetComment,
		SkillID:        &skillID,
		CommentID:      &commentID,
		ReasonCode:     input.ReasonCode,
		ReasonDetail:   input.ReasonDetail,
	})
	if createErr != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "create_failed", createErr, "Failed to create moderation report")
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "moderation_report_comment",
		TargetType: "moderation_case",
		TargetID:   created.ID,
		Summary:    "Reported comment for moderation",
		Details: auditDetailsJSON(map[string]string{
			"skill_id":    toUintString(skillID),
			"comment_id":  toUintString(commentID),
			"reason_code": strings.TrimSpace(input.ReasonCode),
			"target_type": string(created.TargetType),
			"case_status": string(created.Status),
		}),
	})

	writeJSON(w, http.StatusCreated, map[string]any{
		"id":      created.ID,
		"status":  created.Status,
		"message": "report accepted",
	})
}
