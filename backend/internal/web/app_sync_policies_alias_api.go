package web

import (
	"net/http"
	"strconv"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"github.com/go-chi/chi/v5"
)

const (
	repositorySyncPolicyAliasID   = "repository"
	repositorySyncPolicyAliasName = "Repository Sync Default Policy"
)

func resolveRepositorySyncPolicyAliasID(raw string) (string, bool) {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case repositorySyncPolicyAliasID, "default", "repository-default", "1":
		return repositorySyncPolicyAliasID, true
	default:
		return "", false
	}
}

func (a *App) requireRepositorySyncPolicyAdmin(w http.ResponseWriter, r *http.Request) (*models.User, bool) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return nil, false
	}
	if !user.CanViewAllSkills() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return nil, false
	}
	if a.syncPolicyService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return nil, false
	}
	return user, true
}

func repositorySyncPolicyAliasItem(policyID string, policy services.RepositorySyncPolicy) map[string]any {
	return map[string]any{
		"policy_id":   policyID,
		"policy_name": repositorySyncPolicyAliasName,
		"source_type": "repository",
		"enabled":     policy.Enabled,
		"interval":    policy.Interval.String(),
		"timeout":     policy.Timeout.String(),
		"batch_size":  policy.BatchSize,
	}
}

func (a *App) handleAPIAdminSyncPolicies(w http.ResponseWriter, r *http.Request) {
	_, ok := a.requireRepositorySyncPolicyAdmin(w, r)
	if !ok {
		return
	}

	policy, err := a.syncPolicyService.Get(r.Context())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": err.Error()})
		return
	}

	item := repositorySyncPolicyAliasItem(repositorySyncPolicyAliasID, policy)
	writeJSON(w, http.StatusOK, map[string]any{
		"items": []map[string]any{item},
		"total": 1,
	})
}

func (a *App) handleAPIAdminSyncPoliciesCreate(w http.ResponseWriter, r *http.Request) {
	user, ok := a.requireRepositorySyncPolicyAdmin(w, r)
	if !ok {
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
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "create_failed", "message": err.Error()})
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_sync_policy_alias_create",
		TargetType: "setting",
		TargetID:   0,
		Summary:    "Created or initialized sync policy by alias endpoint",
		Details: auditDetailsJSON(map[string]string{
			"policy_id":  repositorySyncPolicyAliasID,
			"enabled":    strconv.FormatBool(updated.Enabled),
			"interval":   updated.Interval.String(),
			"timeout":    updated.Timeout.String(),
			"batch_size": strconv.Itoa(updated.BatchSize),
		}),
	})

	writeJSON(w, http.StatusCreated, repositorySyncPolicyAliasItem(repositorySyncPolicyAliasID, updated))
}

func (a *App) handleAPIAdminSyncPoliciesUpdate(w http.ResponseWriter, r *http.Request) {
	user, ok := a.requireRepositorySyncPolicyAdmin(w, r)
	if !ok {
		return
	}

	policyID, matched := resolveRepositorySyncPolicyAliasID(chi.URLParam(r, "policyID"))
	if !matched {
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "sync_policy_not_found"})
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

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_sync_policy_alias_update",
		TargetType: "setting",
		TargetID:   0,
		Summary:    "Updated sync policy by alias endpoint",
		Details: auditDetailsJSON(map[string]string{
			"policy_id":  policyID,
			"enabled":    strconv.FormatBool(updated.Enabled),
			"interval":   updated.Interval.String(),
			"timeout":    updated.Timeout.String(),
			"batch_size": strconv.Itoa(updated.BatchSize),
		}),
	})

	writeJSON(w, http.StatusOK, repositorySyncPolicyAliasItem(policyID, updated))
}

func (a *App) handleAPIAdminSyncPoliciesToggle(w http.ResponseWriter, r *http.Request) {
	user, ok := a.requireRepositorySyncPolicyAdmin(w, r)
	if !ok {
		return
	}

	policyID, matched := resolveRepositorySyncPolicyAliasID(chi.URLParam(r, "policyID"))
	if !matched {
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "sync_policy_not_found"})
		return
	}

	enabled, hasExplicit, err := readOptionalBoolField(r, "enabled")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}
	if !hasExplicit {
		current, getErr := a.syncPolicyService.Get(r.Context())
		if getErr != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": getErr.Error()})
			return
		}
		enabled = !current.Enabled
	}

	updated, err := a.syncPolicyService.Update(r.Context(), services.UpdateRepositorySyncPolicyInput{
		Enabled: &enabled,
	})
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "toggle_failed", "message": err.Error()})
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_sync_policy_alias_toggle",
		TargetType: "setting",
		TargetID:   0,
		Summary:    "Toggled sync policy by alias endpoint",
		Details: auditDetailsJSON(map[string]string{
			"policy_id": policyID,
			"enabled":   strconv.FormatBool(updated.Enabled),
		}),
	})

	writeJSON(w, http.StatusOK, repositorySyncPolicyAliasItem(policyID, updated))
}

func (a *App) handleAPIAdminSyncPoliciesDelete(w http.ResponseWriter, r *http.Request) {
	user, ok := a.requireRepositorySyncPolicyAdmin(w, r)
	if !ok {
		return
	}

	policyID, matched := resolveRepositorySyncPolicyAliasID(chi.URLParam(r, "policyID"))
	if !matched {
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "sync_policy_not_found"})
		return
	}

	enabled := false
	updated, err := a.syncPolicyService.Update(r.Context(), services.UpdateRepositorySyncPolicyInput{
		Enabled: &enabled,
	})
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "delete_failed", "message": err.Error()})
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_sync_policy_alias_delete",
		TargetType: "setting",
		TargetID:   0,
		Summary:    "Disabled sync policy by alias delete endpoint",
		Details: auditDetailsJSON(map[string]string{
			"policy_id": policyID,
			"enabled":   strconv.FormatBool(updated.Enabled),
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":     true,
		"policy": repositorySyncPolicyAliasItem(policyID, updated),
	})
}
