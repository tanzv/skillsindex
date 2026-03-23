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
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanAccessDashboard() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.moderationSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	skillID, err := parseUintURLParam(r, "skillID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_skill_id"})
		return
	}

	type payload struct {
		ReasonCode   string `json:"reason_code"`
		ReasonDetail string `json:"reason_detail"`
	}
	var input payload
	if decodeErr := decodeJSONOrForm(r, &input); decodeErr != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": decodeErr.Error()})
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
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "create_failed", "message": createErr.Error()})
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
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanAccessDashboard() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.moderationSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	skillID, err := parseUintURLParam(r, "skillID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_skill_id"})
		return
	}
	commentID, err := parseUintURLParam(r, "commentID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_comment_id"})
		return
	}

	type payload struct {
		ReasonCode   string `json:"reason_code"`
		ReasonDetail string `json:"reason_detail"`
	}
	var input payload
	if decodeErr := decodeJSONOrForm(r, &input); decodeErr != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": decodeErr.Error()})
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
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "create_failed", "message": createErr.Error()})
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
