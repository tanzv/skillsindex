package web

import "net/http"

func (a *App) handleAPIAdminOrganizationMemberRemove(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.organizationSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	organizationID, err := parseUintURLParam(r, "orgID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_organization_id"})
		return
	}
	targetUserID, err := parseUintURLParam(r, "userID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_user_id"})
		return
	}

	if err := a.organizationSvc.RemoveMember(r.Context(), organizationID, *user, targetUserID); err != nil {
		writeOrganizationServiceError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}
