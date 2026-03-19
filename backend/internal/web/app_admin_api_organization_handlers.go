package web

import (
	"net/http"

	"skillsindex/internal/services"
)

func (a *App) handleAPIAdminOrganizations(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.organizationSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	organizations, err := a.organizationSvc.ListOrganizations(r.Context(), *user)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "list_failed", "message": err.Error()})
		return
	}

	items := make([]apiOrganizationItem, 0, len(organizations))
	for _, org := range organizations {
		items = append(items, apiOrganizationItem{
			ID:        org.ID,
			Name:      org.Name,
			Slug:      org.Slug,
			CreatedAt: org.CreatedAt,
			UpdatedAt: org.UpdatedAt,
		})
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items, "total": len(items)})
}

func (a *App) handleAPIAdminOrganizationCreate(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.organizationSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	name, err := readStringField(r, "name")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}
	organization, err := a.organizationSvc.CreateOrganization(r.Context(), name, user.ID)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "create_failed", "message": err.Error()})
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "organization_create",
		TargetType: "organization",
		TargetID:   organization.ID,
		Summary:    "Created organization through admin api",
		Details: auditDetailsJSON(map[string]string{
			"name": organization.Name,
			"slug": organization.Slug,
		}),
	})

	writeJSON(w, http.StatusCreated, map[string]any{
		"id":         organization.ID,
		"name":       organization.Name,
		"slug":       organization.Slug,
		"created_at": organization.CreatedAt,
		"updated_at": organization.UpdatedAt,
	})
}

func (a *App) handleAPIAdminOrganizationMembers(w http.ResponseWriter, r *http.Request) {
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

	members, err := a.organizationSvc.ListMembers(r.Context(), organizationID, *user)
	if err != nil {
		writeOrganizationServiceError(w, err)
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

	type payload struct {
		UserID uint   `json:"user_id"`
		Role   string `json:"role"`
	}
	var input payload
	if decodeErr := decodeJSONOrForm(r, &input); decodeErr != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": decodeErr.Error()})
		return
	}
	role, ok := parseOrganizationRoleValue(input.Role)
	if !ok {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_role"})
		return
	}
	if input.UserID == 0 {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_user_id"})
		return
	}

	if err := a.organizationSvc.AddOrUpdateMember(r.Context(), organizationID, *user, input.UserID, role); err != nil {
		writeOrganizationServiceError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (a *App) handleAPIAdminOrganizationMemberRoleUpdate(w http.ResponseWriter, r *http.Request) {
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

	roleRaw, decodeErr := readStringField(r, "role")
	if decodeErr != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": decodeErr.Error()})
		return
	}
	role, ok := parseOrganizationRoleValue(roleRaw)
	if !ok {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_role"})
		return
	}

	if err := a.organizationSvc.AddOrUpdateMember(r.Context(), organizationID, *user, targetUserID, role); err != nil {
		writeOrganizationServiceError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}
