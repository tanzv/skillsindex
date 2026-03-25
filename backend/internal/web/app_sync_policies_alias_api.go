package web

import (
	"errors"
	"net/http"
	"strconv"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) requireRepositorySyncPolicyAdmin(w http.ResponseWriter, r *http.Request) (*models.User, bool) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return nil, false
	}
	if !user.CanViewAllSkills() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return nil, false
	}
	if a.syncPolicyService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Sync policy service unavailable")
		return nil, false
	}
	return user, true
}

func (a *App) requireSyncPolicyRecordAdmin(w http.ResponseWriter, r *http.Request) (*models.User, bool) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return nil, false
	}
	if !user.CanViewAllSkills() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return nil, false
	}
	if a.syncPolicyRecordSvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Sync policy record service unavailable")
		return nil, false
	}
	return user, true
}

func (a *App) handleAPIAdminSyncPolicies(w http.ResponseWriter, r *http.Request) {
	_, ok := a.requireSyncPolicyRecordAdmin(w, r)
	if !ok {
		return
	}

	sourceType, err := parseOptionalSyncPolicySourceTypeQuery(r, "source_type")
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_source_type", "Invalid sync policy source type")
		return
	}
	includeDeleted, _, err := parseOptionalBoolQuery(r, "include_deleted")
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_include_deleted", "Invalid include_deleted filter")
		return
	}
	enabledOnly, _, err := parseOptionalBoolQuery(r, "enabled_only")
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_enabled_only", "Invalid enabled_only filter")
		return
	}
	items, err := a.syncPolicyRecordSvc.List(r.Context(), services.ListSyncPoliciesInput{
		SourceType:     sourceType,
		IncludeDeleted: includeDeleted,
		EnabledOnly:    enabledOnly,
		Limit:          parsePositiveInt(r.URL.Query().Get("limit"), 120),
	})
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "query_failed", err, "Failed to query sync policies")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"items": syncPoliciesToAPIItems(items),
		"total": len(items),
	})
}

func (a *App) handleAPIAdminSyncPolicyDetail(w http.ResponseWriter, r *http.Request) {
	_, ok := a.requireSyncPolicyRecordAdmin(w, r)
	if !ok {
		return
	}

	policyID, err := a.resolveSyncPolicyRouteID(r)
	if err != nil {
		if errors.Is(err, services.ErrSyncPolicyNotFound) {
			writeAPIError(w, r, http.StatusNotFound, "sync_policy_not_found", "Sync policy not found")
			return
		}
		if errors.Is(err, errSyncPolicyAliasAmbiguous) {
			writeAPIError(w, r, http.StatusBadRequest, "ambiguous_policy_alias", "Sync policy alias is ambiguous")
			return
		}
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "query_failed", err, "Failed to resolve sync policy")
		return
	}

	item, err := a.syncPolicyRecordSvc.GetByID(r.Context(), policyID, true)
	if err != nil {
		if errors.Is(err, services.ErrSyncPolicyNotFound) {
			writeAPIError(w, r, http.StatusNotFound, "sync_policy_not_found", "Sync policy not found")
			return
		}
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "query_failed", err, "Failed to load sync policy")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"item": syncPolicyToAPIItem(item),
	})
}

func (a *App) handleAPIAdminSyncPoliciesCreate(w http.ResponseWriter, r *http.Request) {
	user, ok := a.requireSyncPolicyRecordAdmin(w, r)
	if !ok {
		return
	}

	input, err := readCreateSyncPolicyInput(r, &user.ID)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid payload")
		return
	}

	created, err := a.syncPolicyRecordSvc.Create(r.Context(), input)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "create_failed", err, "Failed to create sync policy")
		return
	}
	if err := a.syncRepositoryMirrorSettings(r.Context(), created); err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "mirror_sync_failed", err, "Failed to sync repository mirror settings")
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_sync_policy_create",
		TargetType: "sync_policy",
		TargetID:   created.ID,
		Summary:    "Created sync policy through admin api",
		Details: auditDetailsJSON(map[string]string{
			"policy_id":        strconv.FormatUint(uint64(created.ID), 10),
			"policy_name":      created.PolicyName,
			"source_type":      string(created.SourceType),
			"target_scope":     created.TargetScope,
			"interval_minutes": strconv.Itoa(created.IntervalMinutes),
		}),
	})

	writeJSON(w, http.StatusCreated, syncPolicyToAPIItem(created))
}

func (a *App) handleAPIAdminSyncPoliciesUpdate(w http.ResponseWriter, r *http.Request) {
	user, ok := a.requireSyncPolicyRecordAdmin(w, r)
	if !ok {
		return
	}

	policyID, err := a.resolveSyncPolicyRouteID(r)
	if err != nil {
		if errors.Is(err, services.ErrSyncPolicyNotFound) {
			writeAPIError(w, r, http.StatusNotFound, "sync_policy_not_found", "Sync policy not found")
			return
		}
		if errors.Is(err, errSyncPolicyAliasAmbiguous) {
			writeAPIError(w, r, http.StatusBadRequest, "ambiguous_policy_alias", "Sync policy alias is ambiguous")
			return
		}
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "query_failed", err, "Failed to resolve sync policy")
		return
	}

	input, hasUpdates, err := readUpdateSyncPolicyInput(r, &user.ID)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid payload")
		return
	}
	if !hasUpdates {
		writeAPIError(w, r, http.StatusBadRequest, "empty_payload", "At least one field must be updated")
		return
	}

	updated, err := a.syncPolicyRecordSvc.Update(r.Context(), policyID, input)
	if err != nil {
		if errors.Is(err, services.ErrSyncPolicyNotFound) {
			writeAPIError(w, r, http.StatusNotFound, "sync_policy_not_found", "Sync policy not found")
			return
		}
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "update_failed", err, "Failed to update sync policy")
		return
	}
	if err := a.syncRepositoryMirrorSettings(r.Context(), updated); err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "mirror_sync_failed", err, "Failed to sync repository mirror settings")
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_sync_policy_update",
		TargetType: "sync_policy",
		TargetID:   updated.ID,
		Summary:    "Updated sync policy through admin api",
		Details: auditDetailsJSON(map[string]string{
			"policy_id":        strconv.FormatUint(uint64(updated.ID), 10),
			"policy_name":      updated.PolicyName,
			"source_type":      string(updated.SourceType),
			"target_scope":     updated.TargetScope,
			"interval_minutes": strconv.Itoa(updated.IntervalMinutes),
		}),
	})

	writeJSON(w, http.StatusOK, syncPolicyToAPIItem(updated))
}

func (a *App) handleAPIAdminSyncPoliciesToggle(w http.ResponseWriter, r *http.Request) {
	user, ok := a.requireSyncPolicyRecordAdmin(w, r)
	if !ok {
		return
	}

	policyID, err := a.resolveSyncPolicyRouteID(r)
	if err != nil {
		if errors.Is(err, services.ErrSyncPolicyNotFound) {
			writeAPIError(w, r, http.StatusNotFound, "sync_policy_not_found", "Sync policy not found")
			return
		}
		if errors.Is(err, errSyncPolicyAliasAmbiguous) {
			writeAPIError(w, r, http.StatusBadRequest, "ambiguous_policy_alias", "Sync policy alias is ambiguous")
			return
		}
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "query_failed", err, "Failed to resolve sync policy")
		return
	}

	enabled, hasExplicit, err := readOptionalBoolField(r, "enabled")
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid payload")
		return
	}
	if !hasExplicit {
		current, getErr := a.syncPolicyRecordSvc.GetByID(r.Context(), policyID, true)
		if getErr != nil {
			if errors.Is(getErr, services.ErrSyncPolicyNotFound) {
				writeAPIError(w, r, http.StatusNotFound, "sync_policy_not_found", "Sync policy not found")
				return
			}
			writeAPIErrorFromError(w, r, http.StatusInternalServerError, "query_failed", getErr, "Failed to load sync policy")
			return
		}
		enabled = !current.Enabled
	}

	updated, err := a.syncPolicyRecordSvc.Toggle(r.Context(), policyID, enabled, &user.ID)
	if err != nil {
		if errors.Is(err, services.ErrSyncPolicyNotFound) {
			writeAPIError(w, r, http.StatusNotFound, "sync_policy_not_found", "Sync policy not found")
			return
		}
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "toggle_failed", err, "Failed to toggle sync policy")
		return
	}
	if err := a.syncRepositoryMirrorSettings(r.Context(), updated); err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "mirror_sync_failed", err, "Failed to sync repository mirror settings")
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_sync_policy_toggle",
		TargetType: "sync_policy",
		TargetID:   updated.ID,
		Summary:    "Toggled sync policy through admin api",
		Details: auditDetailsJSON(map[string]string{
			"policy_id": strconv.FormatUint(uint64(updated.ID), 10),
			"enabled":   strconv.FormatBool(updated.Enabled),
		}),
	})

	writeJSON(w, http.StatusOK, syncPolicyToAPIItem(updated))
}

func (a *App) handleAPIAdminSyncPoliciesDelete(w http.ResponseWriter, r *http.Request) {
	user, ok := a.requireSyncPolicyRecordAdmin(w, r)
	if !ok {
		return
	}

	policyID, err := a.resolveSyncPolicyRouteID(r)
	if err != nil {
		if errors.Is(err, services.ErrSyncPolicyNotFound) {
			writeAPIError(w, r, http.StatusNotFound, "sync_policy_not_found", "Sync policy not found")
			return
		}
		if errors.Is(err, errSyncPolicyAliasAmbiguous) {
			writeAPIError(w, r, http.StatusBadRequest, "ambiguous_policy_alias", "Sync policy alias is ambiguous")
			return
		}
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "query_failed", err, "Failed to resolve sync policy")
		return
	}

	updated, err := a.syncPolicyRecordSvc.SoftDelete(r.Context(), policyID, &user.ID)
	if err != nil {
		if errors.Is(err, services.ErrSyncPolicyNotFound) {
			writeAPIError(w, r, http.StatusNotFound, "sync_policy_not_found", "Sync policy not found")
			return
		}
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "delete_failed", err, "Failed to delete sync policy")
		return
	}
	if err := a.syncRepositoryMirrorSettings(r.Context(), updated); err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "mirror_sync_failed", err, "Failed to sync repository mirror settings")
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_sync_policy_delete",
		TargetType: "sync_policy",
		TargetID:   updated.ID,
		Summary:    "Soft deleted sync policy through admin api",
		Details: auditDetailsJSON(map[string]string{
			"policy_id": strconv.FormatUint(uint64(updated.ID), 10),
			"enabled":   strconv.FormatBool(updated.Enabled),
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":     true,
		"policy": syncPolicyToAPIItem(updated),
	})
}
