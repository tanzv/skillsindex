package web

import "net/http"

func (a *App) handleAPIAdminOrganizationMembers(w http.ResponseWriter, r *http.Request) {
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

	members, err := a.organizationSvc.ListMembers(r.Context(), organizationID, *user)
	if err != nil {
		writeOrganizationServiceError(w, r, err)
		return
	}
	items := make([]apiOrganizationMemberItem, 0, len(members))
	for _, member := range members {
		items = append(items, apiOrganizationMemberItem{
			OrganizationID: member.OrganizationID,
			UserID:         member.UserID,
			Username:       member.User.Username,
			UserRole:       string(member.User.EffectiveRole()),
			UserStatus:     userStatusValue(member.User),
			Role:           string(member.Role),
			CreatedAt:      member.CreatedAt,
			UpdatedAt:      member.UpdatedAt,
		})
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items, "total": len(items)})
}

func (a *App) handleAPIAdminOrganizationMemberUpsert(w http.ResponseWriter, r *http.Request) {
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

	type payload struct {
		UserID uint   `json:"user_id"`
		Role   string `json:"role"`
	}
	var input payload
	if decodeErr := decodeJSONOrForm(r, &input); decodeErr != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", decodeErr, "Invalid request payload")
		return
	}
	role, ok := parseOrganizationRoleValue(input.Role)
	if !ok {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_role", "Invalid organization role")
		return
	}
	if input.UserID == 0 {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_user_id", "Invalid user id")
		return
	}

	if err := a.organizationSvc.AddOrUpdateMember(r.Context(), organizationID, *user, input.UserID, role); err != nil {
		writeOrganizationServiceError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (a *App) handleAPIAdminOrganizationMemberRoleUpdate(w http.ResponseWriter, r *http.Request) {
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

	roleRaw, decodeErr := readStringField(r, "role")
	if decodeErr != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", decodeErr, "Invalid request payload")
		return
	}
	role, ok := parseOrganizationRoleValue(roleRaw)
	if !ok {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_role", "Invalid organization role")
		return
	}

	if err := a.organizationSvc.AddOrUpdateMember(r.Context(), organizationID, *user, targetUserID, role); err != nil {
		writeOrganizationServiceError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}
