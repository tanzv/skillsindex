package web

import (
	"net/http"

	"skillsindex/internal/services"
)

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
