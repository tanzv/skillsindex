package web

import (
	"net/http"
	"strconv"

	"skillsindex/internal/services"
)

func (a *App) handleAPIAdminRepositorySyncPolicy(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if !user.CanViewAllSkills() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}
	if a.syncPolicyService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Repository sync policy service is unavailable")
		return
	}

	policy, err := a.syncPolicyService.Get(r.Context())
	if err != nil {
		writeAPIError(w, r, http.StatusInternalServerError, "query_failed", "Failed to load repository sync policy")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"enabled":    policy.Enabled,
		"interval":   policy.Interval.String(),
		"timeout":    policy.Timeout.String(),
		"batch_size": policy.BatchSize,
	})
}

func (a *App) handleAPIAdminRepositorySyncPolicyUpdate(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if !user.CanViewAllSkills() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}
	if a.syncPolicyService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Repository sync policy service is unavailable")
		return
	}

	input, err := readRepositorySyncPolicyUpdateInput(r)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid repository sync policy payload")
		return
	}
	if input.Enabled == nil && input.Interval == nil && input.Timeout == nil && input.BatchSize == nil {
		writeAPIError(w, r, http.StatusBadRequest, "empty_payload", "At least one repository sync policy field is required")
		return
	}

	updated, err := a.syncPolicyService.Update(r.Context(), input)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "update_failed", err, "Failed to update repository sync policy")
		return
	}
	if a.syncPolicyRecordSvc != nil {
		if _, err := a.syncPolicyRecordSvc.UpsertRepositoryMirror(r.Context(), updated, &user.ID); err != nil {
			writeAPIError(w, r, http.StatusInternalServerError, "mirror_sync_failed", "Failed to synchronize repository sync policy mirror")
			return
		}
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_repo_sync_policy_update",
		TargetType: "setting",
		TargetID:   0,
		Summary:    "Updated repository sync policy through admin api",
		Details: auditDetailsJSON(map[string]string{
			"enabled":    strconv.FormatBool(updated.Enabled),
			"interval":   updated.Interval.String(),
			"timeout":    updated.Timeout.String(),
			"batch_size": strconv.Itoa(updated.BatchSize),
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"enabled":    updated.Enabled,
		"interval":   updated.Interval.String(),
		"timeout":    updated.Timeout.String(),
		"batch_size": updated.BatchSize,
	})
}
