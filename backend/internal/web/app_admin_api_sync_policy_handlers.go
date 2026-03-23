package web

import (
	"net/http"
	"strconv"

	"skillsindex/internal/services"
)

func (a *App) handleAPIAdminRepositorySyncPolicy(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanViewAllSkills() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.syncPolicyService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	policy, err := a.syncPolicyService.Get(r.Context())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": err.Error()})
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
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanViewAllSkills() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.syncPolicyService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	input, err := readRepositorySyncPolicyUpdateInput(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}
	if input.Enabled == nil && input.Interval == nil && input.Timeout == nil && input.BatchSize == nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "empty_payload"})
		return
	}

	updated, err := a.syncPolicyService.Update(r.Context(), input)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "update_failed", "message": err.Error()})
		return
	}
	if a.syncPolicyRecordSvc != nil {
		if _, err := a.syncPolicyRecordSvc.UpsertRepositoryMirror(r.Context(), updated, &user.ID); err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "mirror_sync_failed", "message": err.Error()})
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
