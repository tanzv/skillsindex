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

func (a *App) requireSyncPolicyRecordAdmin(w http.ResponseWriter, r *http.Request) (*models.User, bool) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return nil, false
	}
	if !user.CanViewAllSkills() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return nil, false
	}
	if a.syncPolicyRecordSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
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
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_source_type"})
		return
	}
	includeDeleted, _, err := parseOptionalBoolQuery(r, "include_deleted")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_include_deleted"})
		return
	}
	enabledOnly, _, err := parseOptionalBoolQuery(r, "enabled_only")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_enabled_only"})
		return
	}
	items, err := a.syncPolicyRecordSvc.List(r.Context(), services.ListSyncPoliciesInput{
		SourceType:     sourceType,
		IncludeDeleted: includeDeleted,
		EnabledOnly:    enabledOnly,
		Limit:          parsePositiveInt(r.URL.Query().Get("limit"), 120),
	})
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": err.Error()})
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
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "sync_policy_not_found"})
			return
		}
		if errors.Is(err, errSyncPolicyAliasAmbiguous) {
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": "ambiguous_policy_alias"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": err.Error()})
		return
	}

	item, err := a.syncPolicyRecordSvc.GetByID(r.Context(), policyID, true)
	if err != nil {
		if errors.Is(err, services.ErrSyncPolicyNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "sync_policy_not_found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": err.Error()})
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
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}

	created, err := a.syncPolicyRecordSvc.Create(r.Context(), input)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "create_failed", "message": err.Error()})
		return
	}
	if err := a.syncRepositoryMirrorSettings(r.Context(), created); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "mirror_sync_failed", "message": err.Error()})
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_sync_policy_create",
		TargetType: "sync_policy",
		TargetID:   created.ID,
		Summary:    "Created sync policy through admin api",
		Details: auditDetailsJSON(map[string]string{
			"policy_id":       strconv.FormatUint(uint64(created.ID), 10),
			"policy_name":     created.PolicyName,
			"source_type":     string(created.SourceType),
			"target_scope":    created.TargetScope,
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
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "sync_policy_not_found"})
			return
		}
		if errors.Is(err, errSyncPolicyAliasAmbiguous) {
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": "ambiguous_policy_alias"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": err.Error()})
		return
	}

	input, hasUpdates, err := readUpdateSyncPolicyInput(r, &user.ID)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}
	if !hasUpdates {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "empty_payload"})
		return
	}

	updated, err := a.syncPolicyRecordSvc.Update(r.Context(), policyID, input)
	if err != nil {
		if errors.Is(err, services.ErrSyncPolicyNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "sync_policy_not_found"})
			return
		}
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "update_failed", "message": err.Error()})
		return
	}
	if err := a.syncRepositoryMirrorSettings(r.Context(), updated); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "mirror_sync_failed", "message": err.Error()})
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_sync_policy_update",
		TargetType: "sync_policy",
		TargetID:   updated.ID,
		Summary:    "Updated sync policy through admin api",
		Details: auditDetailsJSON(map[string]string{
			"policy_id":       strconv.FormatUint(uint64(updated.ID), 10),
			"policy_name":     updated.PolicyName,
			"source_type":     string(updated.SourceType),
			"target_scope":    updated.TargetScope,
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
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "sync_policy_not_found"})
			return
		}
		if errors.Is(err, errSyncPolicyAliasAmbiguous) {
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": "ambiguous_policy_alias"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": err.Error()})
		return
	}

	enabled, hasExplicit, err := readOptionalBoolField(r, "enabled")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}
	if !hasExplicit {
		current, getErr := a.syncPolicyRecordSvc.GetByID(r.Context(), policyID, true)
		if getErr != nil {
			if errors.Is(getErr, services.ErrSyncPolicyNotFound) {
				writeJSON(w, http.StatusNotFound, map[string]any{"error": "sync_policy_not_found"})
				return
			}
			writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": getErr.Error()})
			return
		}
		enabled = !current.Enabled
	}

	updated, err := a.syncPolicyRecordSvc.Toggle(r.Context(), policyID, enabled, &user.ID)
	if err != nil {
		if errors.Is(err, services.ErrSyncPolicyNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "sync_policy_not_found"})
			return
		}
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "toggle_failed", "message": err.Error()})
		return
	}
	if err := a.syncRepositoryMirrorSettings(r.Context(), updated); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "mirror_sync_failed", "message": err.Error()})
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
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "sync_policy_not_found"})
			return
		}
		if errors.Is(err, errSyncPolicyAliasAmbiguous) {
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": "ambiguous_policy_alias"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": err.Error()})
		return
	}

	updated, err := a.syncPolicyRecordSvc.SoftDelete(r.Context(), policyID, &user.ID)
	if err != nil {
		if errors.Is(err, services.ErrSyncPolicyNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "sync_policy_not_found"})
			return
		}
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "delete_failed", "message": err.Error()})
		return
	}
	if err := a.syncRepositoryMirrorSettings(r.Context(), updated); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "mirror_sync_failed", "message": err.Error()})
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
