package web

import (
	"errors"
	"net/http"

	"skillsindex/internal/services"
)

func (a *App) handleAdminModerationCreate(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if !currentUser.CanViewAllSkills() {
		redirectAdminPath(w, r, "/admin/moderation", "", "Permission denied")
		return
	}
	if a.moderationSvc == nil {
		redirectAdminPath(w, r, "/admin/moderation", "", "Moderation service unavailable")
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectAdminModeration(w, r, "", "", "Invalid form payload")
		return
	}

	targetType, ok := parseModerationTargetTypeValue(r.FormValue("target_type"))
	if !ok {
		redirectAdminModeration(w, r, r.FormValue("status"), "", "Invalid target type")
		return
	}
	reporterUserID, err := parseOptionalUintFormValue(r.FormValue("reporter_user_id"))
	if err != nil {
		redirectAdminModeration(w, r, r.FormValue("status"), "", "Invalid reporter user id")
		return
	}
	skillID, err := parseOptionalUintFormValue(r.FormValue("skill_id"))
	if err != nil {
		redirectAdminModeration(w, r, r.FormValue("status"), "", "Invalid skill id")
		return
	}
	commentID, err := parseOptionalUintFormValue(r.FormValue("comment_id"))
	if err != nil {
		redirectAdminModeration(w, r, r.FormValue("status"), "", "Invalid comment id")
		return
	}

	created, createErr := a.moderationSvc.CreateCase(r.Context(), services.CreateModerationCaseInput{
		ReporterUserID: reporterUserID,
		TargetType:     targetType,
		SkillID:        skillID,
		CommentID:      commentID,
		ReasonCode:     r.FormValue("reason_code"),
		ReasonDetail:   r.FormValue("reason_detail"),
	})
	if createErr != nil {
		redirectAdminModeration(w, r, r.FormValue("status"), "", createErr.Error())
		return
	}

	a.recordAudit(r.Context(), currentUser, services.RecordAuditInput{
		Action:     "moderation_case_create_form",
		TargetType: "moderation_case",
		TargetID:   created.ID,
		Summary:    "Created moderation case from admin form",
		Details: auditDetailsJSON(map[string]string{
			"target_type": string(created.TargetType),
			"reason_code": created.ReasonCode,
		}),
	})

	redirectAdminModeration(w, r, r.FormValue("status"), "Moderation case created", "")
}

func (a *App) handleAdminModerationResolve(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if !currentUser.CanViewAllSkills() {
		redirectAdminPath(w, r, "/admin/moderation", "", "Permission denied")
		return
	}
	if a.moderationSvc == nil {
		redirectAdminPath(w, r, "/admin/moderation", "", "Moderation service unavailable")
		return
	}

	caseID, err := parseUintURLParam(r, "caseID")
	if err != nil {
		redirectAdminModeration(w, r, "", "", "Invalid case id")
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectAdminModeration(w, r, "", "", "Invalid form payload")
		return
	}

	updated, resolveErr := a.moderationSvc.ResolveCase(r.Context(), caseID, services.ResolveModerationCaseInput{
		ResolverUserID: currentUser.ID,
		Action:         parseModerationActionValue(r.FormValue("action")),
		ResolutionNote: r.FormValue("resolution_note"),
	})
	if resolveErr != nil {
		switch {
		case errors.Is(resolveErr, services.ErrModerationCaseNotFound):
			redirectAdminModeration(w, r, r.FormValue("status"), "", "Moderation case not found")
		case errors.Is(resolveErr, services.ErrModerationCaseClosed):
			redirectAdminModeration(w, r, r.FormValue("status"), "", "Moderation case already closed")
		default:
			redirectAdminModeration(w, r, r.FormValue("status"), "", resolveErr.Error())
		}
		return
	}

	a.recordAudit(r.Context(), currentUser, services.RecordAuditInput{
		Action:     "moderation_case_resolve_form",
		TargetType: "moderation_case",
		TargetID:   updated.ID,
		Summary:    "Resolved moderation case from admin form",
		Details: auditDetailsJSON(map[string]string{
			"status": string(updated.Status),
			"action": string(updated.Action),
		}),
	})

	redirectAdminModeration(w, r, r.FormValue("status"), "Moderation case resolved", "")
}

func (a *App) handleAdminModerationReject(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if !currentUser.CanViewAllSkills() {
		redirectAdminPath(w, r, "/admin/moderation", "", "Permission denied")
		return
	}
	if a.moderationSvc == nil {
		redirectAdminPath(w, r, "/admin/moderation", "", "Moderation service unavailable")
		return
	}

	caseID, err := parseUintURLParam(r, "caseID")
	if err != nil {
		redirectAdminModeration(w, r, "", "", "Invalid case id")
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectAdminModeration(w, r, "", "", "Invalid form payload")
		return
	}

	updated, rejectErr := a.moderationSvc.RejectCase(r.Context(), caseID, services.RejectModerationCaseInput{
		ResolverUserID: currentUser.ID,
		RejectionNote:  r.FormValue("rejection_note"),
	})
	if rejectErr != nil {
		switch {
		case errors.Is(rejectErr, services.ErrModerationCaseNotFound):
			redirectAdminModeration(w, r, r.FormValue("status"), "", "Moderation case not found")
		case errors.Is(rejectErr, services.ErrModerationCaseClosed):
			redirectAdminModeration(w, r, r.FormValue("status"), "", "Moderation case already closed")
		default:
			redirectAdminModeration(w, r, r.FormValue("status"), "", rejectErr.Error())
		}
		return
	}

	a.recordAudit(r.Context(), currentUser, services.RecordAuditInput{
		Action:     "moderation_case_reject_form",
		TargetType: "moderation_case",
		TargetID:   updated.ID,
		Summary:    "Rejected moderation case from admin form",
		Details: auditDetailsJSON(map[string]string{
			"status": string(updated.Status),
		}),
	})

	redirectAdminModeration(w, r, r.FormValue("status"), "Moderation case rejected", "")
}
