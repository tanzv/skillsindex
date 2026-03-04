package web

import (
	"errors"
	"net/http"
	"strconv"
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

func (a *App) handleAPIAdminModerationList(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanViewAllSkills() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.moderationSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	status, _ := parseModerationStatusValue(r.URL.Query().Get("status"))
	items, err := a.moderationSvc.ListCases(r.Context(), services.ListModerationCasesInput{
		Status: status,
		Limit:  parsePositiveInt(r.URL.Query().Get("limit"), 80),
	})
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "list_failed", "message": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"items": items,
		"total": len(items),
	})
}

func (a *App) handleAPIAdminModerationCreate(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanViewAllSkills() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.moderationSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	type payload struct {
		ReporterUserID *uint  `json:"reporter_user_id"`
		TargetType     string `json:"target_type"`
		SkillID        *uint  `json:"skill_id"`
		CommentID      *uint  `json:"comment_id"`
		ReasonCode     string `json:"reason_code"`
		ReasonDetail   string `json:"reason_detail"`
	}
	var input payload
	if err := decodeJSONOrForm(r, &input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}
	targetType, ok := parseModerationTargetTypeValue(input.TargetType)
	if !ok {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_target_type"})
		return
	}

	created, createErr := a.moderationSvc.CreateCase(r.Context(), services.CreateModerationCaseInput{
		ReporterUserID: input.ReporterUserID,
		TargetType:     targetType,
		SkillID:        input.SkillID,
		CommentID:      input.CommentID,
		ReasonCode:     input.ReasonCode,
		ReasonDetail:   input.ReasonDetail,
	})
	if createErr != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "create_failed", "message": createErr.Error()})
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "moderation_case_create",
		TargetType: "moderation_case",
		TargetID:   created.ID,
		Summary:    "Created moderation case from admin api",
		Details: auditDetailsJSON(map[string]string{
			"target_type": string(created.TargetType),
			"reason_code": created.ReasonCode,
		}),
	})

	writeJSON(w, http.StatusCreated, created)
}

func (a *App) handleAPIAdminModerationResolve(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanViewAllSkills() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.moderationSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	caseID, err := parseUintURLParam(r, "caseID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_case_id"})
		return
	}
	type payload struct {
		Action         string `json:"action"`
		ResolutionNote string `json:"resolution_note"`
	}
	var input payload
	if err := decodeJSONOrForm(r, &input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}

	action := parseModerationActionValue(input.Action)
	updated, resolveErr := a.moderationSvc.ResolveCase(r.Context(), caseID, services.ResolveModerationCaseInput{
		ResolverUserID: user.ID,
		Action:         action,
		ResolutionNote: input.ResolutionNote,
	})
	if resolveErr != nil {
		writeModerationServiceError(w, resolveErr)
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "moderation_case_resolve",
		TargetType: "moderation_case",
		TargetID:   updated.ID,
		Summary:    "Resolved moderation case",
		Details: auditDetailsJSON(map[string]string{
			"action": string(updated.Action),
			"status": string(updated.Status),
		}),
	})

	writeJSON(w, http.StatusOK, updated)
}

func (a *App) handleAPIAdminModerationReject(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanViewAllSkills() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.moderationSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	caseID, err := parseUintURLParam(r, "caseID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_case_id"})
		return
	}
	rejectionNote, noteErr := readStringField(r, "rejection_note")
	if noteErr != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": noteErr.Error()})
		return
	}

	updated, rejectErr := a.moderationSvc.RejectCase(r.Context(), caseID, services.RejectModerationCaseInput{
		ResolverUserID: user.ID,
		RejectionNote:  rejectionNote,
	})
	if rejectErr != nil {
		writeModerationServiceError(w, rejectErr)
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "moderation_case_reject",
		TargetType: "moderation_case",
		TargetID:   updated.ID,
		Summary:    "Rejected moderation case",
		Details: auditDetailsJSON(map[string]string{
			"status": string(updated.Status),
		}),
	})

	writeJSON(w, http.StatusOK, updated)
}

func parseModerationTargetTypeValue(raw string) (models.ModerationTargetType, bool) {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case string(models.ModerationTargetSkill):
		return models.ModerationTargetSkill, true
	case string(models.ModerationTargetComment):
		return models.ModerationTargetComment, true
	default:
		return "", false
	}
}

func parseModerationStatusValue(raw string) (models.ModerationCaseStatus, bool) {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case string(models.ModerationStatusOpen):
		return models.ModerationStatusOpen, true
	case string(models.ModerationStatusResolved):
		return models.ModerationStatusResolved, true
	case string(models.ModerationStatusRejected):
		return models.ModerationStatusRejected, true
	default:
		return "", false
	}
}

func parseModerationActionValue(raw string) models.ModerationAction {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case string(models.ModerationActionFlagged):
		return models.ModerationActionFlagged
	case string(models.ModerationActionHidden):
		return models.ModerationActionHidden
	case string(models.ModerationActionDeleted):
		return models.ModerationActionDeleted
	default:
		return models.ModerationActionNone
	}
}

func writeModerationServiceError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, services.ErrModerationCaseNotFound):
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "moderation_case_not_found"})
	case errors.Is(err, services.ErrModerationCaseClosed):
		writeJSON(w, http.StatusConflict, map[string]any{"error": "moderation_case_closed"})
	default:
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "moderation_operation_failed", "message": err.Error()})
	}
}

func toUintString(value uint) string {
	return strings.TrimSpace(strconv.FormatUint(uint64(value), 10))
}
