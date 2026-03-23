package web

import (
	"net/http"
	"strconv"

	"skillsindex/internal/services"
)

func (a *App) handleAdminRepositorySyncPolicyUpdate(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if !currentUser.CanViewAllSkills() {
		redirectAdminPath(w, r, "/admin/records/sync-jobs", "", "Permission denied")
		return
	}
	if a.syncPolicyService == nil {
		redirectAdminPath(w, r, "/admin/records/sync-jobs", "", "Repository sync policy service unavailable")
		return
	}

	input, err := readRepositorySyncPolicyUpdateInput(r)
	if err != nil {
		redirectAdminPath(w, r, "/admin/records/sync-jobs", "", "Invalid payload: "+err.Error())
		return
	}
	if input.Enabled == nil && input.Interval == nil && input.Timeout == nil && input.BatchSize == nil {
		redirectAdminPath(w, r, "/admin/records/sync-jobs", "", "No repository sync policy fields were provided")
		return
	}

	updated, err := a.syncPolicyService.Update(r.Context(), input)
	if err != nil {
		redirectAdminPath(w, r, "/admin/records/sync-jobs", "", "Failed to update repository sync policy: "+err.Error())
		return
	}
	if a.syncPolicyRecordSvc != nil {
		if _, err := a.syncPolicyRecordSvc.UpsertRepositoryMirror(r.Context(), updated, &currentUser.ID); err != nil {
			redirectAdminPath(w, r, "/admin/records/sync-jobs", "", "Failed to sync repository policy mirror: "+err.Error())
			return
		}
	}

	a.recordAudit(r.Context(), currentUser, services.RecordAuditInput{
		Action:     "repository_sync_policy_update",
		TargetType: "setting",
		TargetID:   0,
		Summary:    "Updated repository sync policy from admin records workspace",
		Details: auditDetailsJSON(map[string]string{
			"enabled":    strconv.FormatBool(updated.Enabled),
			"interval":   updated.Interval.String(),
			"timeout":    updated.Timeout.String(),
			"batch_size": strconv.Itoa(updated.BatchSize),
		}),
	})

	redirectAdminPath(w, r, "/admin/records/sync-jobs", "Repository sync policy updated", "")
}
