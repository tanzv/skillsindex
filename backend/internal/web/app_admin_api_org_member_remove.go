package web

import "net/http"

func (a *App) handleAPIAdminOrganizationMemberRemove(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if a.organizationSvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Organization service is unavailable")
		return
	}

	organizationID, err := parseUintURLParam(r, "orgID")
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_organization_id", "Invalid organization id")
		return
	}
	targetUserID, err := parseUintURLParam(r, "userID")
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_user_id", "Invalid user id")
		return
	}

	if err := a.organizationSvc.RemoveMember(r.Context(), organizationID, *user, targetUserID); err != nil {
		writeOrganizationServiceError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}
