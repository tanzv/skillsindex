package web

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) handleAPIAdminAPIKeyRevoke(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.apiKeyService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	keyID, err := parseUintURLParam(r, "keyID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_key_id"})
		return
	}

	key, err := a.apiKeyService.GetByID(r.Context(), keyID)
	if err != nil {
		if errors.Is(err, services.ErrAPIKeyNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "api_key_not_found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": err.Error()})
		return
	}
	if !user.CanManageAPIKeys(key.UserID) {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if err := a.apiKeyService.Revoke(r.Context(), key.ID, key.UserID); err != nil {
		if errors.Is(err, services.ErrAPIKeyNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "api_key_not_found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "revoke_failed", "message": err.Error()})
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_admin_api_key_revoke",
		TargetType: "api_key",
		TargetID:   key.ID,
		Summary:    "Revoked API key through admin json api",
		Details: auditDetailsJSON(map[string]string{
			"name":   key.Name,
			"prefix": key.Prefix,
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (a *App) handleAPIAdminAPIKeyRotate(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.apiKeyService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	keyID, err := parseUintURLParam(r, "keyID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_key_id"})
		return
	}

	key, err := a.apiKeyService.GetByID(r.Context(), keyID)
	if err != nil {
		if errors.Is(err, services.ErrAPIKeyNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "api_key_not_found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": err.Error()})
		return
	}
	if !user.CanManageAPIKeys(key.UserID) {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}

	rotated, plaintext, rotateErr := a.apiKeyService.Rotate(r.Context(), key.ID, key.UserID)
	if rotateErr != nil {
		if errors.Is(rotateErr, services.ErrAPIKeyNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "api_key_not_found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "rotate_failed", "message": rotateErr.Error()})
		return
	}

	ownerUsername := ""
	if a.authService != nil {
		ownerUser, ownerErr := a.authService.GetUserByID(r.Context(), rotated.UserID)
		if ownerErr == nil {
			ownerUsername = ownerUser.Username
		}
	}
	rotated.User = models.User{ID: rotated.UserID, Username: ownerUsername}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_admin_api_key_rotate",
		TargetType: "api_key",
		TargetID:   rotated.ID,
		Summary:    "Rotated API key through admin json api",
		Details: auditDetailsJSON(map[string]string{
			"originalID": strconv.FormatUint(uint64(key.ID), 10),
			"newID":      strconv.FormatUint(uint64(rotated.ID), 10),
			"newPrefix":  rotated.Prefix,
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"item":          resultToAPIAdminAPIKeyItem(rotated),
		"plaintext_key": plaintext,
	})
}

func (a *App) handleAPIAdminRegistrationSetting(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.settingsService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	allowRegistration, err := a.settingsService.GetBool(r.Context(), services.SettingAllowRegistration, a.allowRegistration)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":                 true,
		"allow_registration": allowRegistration,
	})
}

func (a *App) handleAPIAdminRegistrationSettingUpdate(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.settingsService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	allowRegistration, err := readBoolField(r, "allow_registration")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}
	if err := a.settingsService.SetBool(r.Context(), services.SettingAllowRegistration, allowRegistration); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "update_failed", "message": err.Error()})
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_access_registration_policy_update",
		TargetType: "setting",
		TargetID:   0,
		Summary:    "Updated registration policy through admin api",
		Details: auditDetailsJSON(map[string]string{
			"allow_registration": strconv.FormatBool(allowRegistration),
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":                 true,
		"allow_registration": allowRegistration,
	})
}

func (a *App) handleAPIAdminAccounts(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}

	accounts, err := a.authService.ListUsers(r.Context())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "list_failed", "message": err.Error()})
		return
	}
	items := make([]apiAdminAccountItem, 0, len(accounts))
	for _, account := range accounts {
		items = append(items, apiAdminAccountItem{
			ID:            account.ID,
			Username:      account.Username,
			Role:          string(account.EffectiveRole()),
			Status:        userStatusValue(account),
			CreatedAt:     account.CreatedAt,
			UpdatedAt:     account.UpdatedAt,
			ForceLogoutAt: account.ForceLogoutAt,
		})
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items, "total": len(items)})
}

func (a *App) handleAPIAdminAccountStatus(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}

	targetUserID, err := parseUintURLParam(r, "userID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_user_id"})
		return
	}

	statusRaw, decodeErr := readStringField(r, "status")
	if decodeErr != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": decodeErr.Error()})
		return
	}
	status, ok := parseUserStatus(statusRaw)
	if !ok {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_status"})
		return
	}
	if targetUserID == user.ID && status == models.UserStatusDisabled {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "cannot_disable_current_account"})
		return
	}

	target, err := a.authService.GetUserByID(r.Context(), targetUserID)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "user_not_found"})
		return
	}

	if err := a.authService.SetUserStatus(r.Context(), targetUserID, status); err != nil {
		switch {
		case errors.Is(err, services.ErrLastSuperAdmin):
			writeJSON(w, http.StatusConflict, map[string]any{"error": "last_super_admin_guard"})
		default:
			writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "update_failed", "message": err.Error()})
		}
		return
	}
	if status == models.UserStatusDisabled {
		_ = a.authService.ForceSignOutUser(r.Context(), targetUserID)
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_user_update_status",
		TargetType: "user",
		TargetID:   targetUserID,
		Summary:    "Updated account status through admin api",
		Details: auditDetailsJSON(map[string]string{
			"username": target.Username,
			"status":   string(status),
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (a *App) handleAPIAdminAccountForceSignout(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}

	targetUserID, err := parseUintURLParam(r, "userID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_user_id"})
		return
	}
	target, err := a.authService.GetUserByID(r.Context(), targetUserID)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "user_not_found"})
		return
	}
	if err := a.authService.ForceSignOutUser(r.Context(), targetUserID); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "force_signout_failed", "message": err.Error()})
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_user_force_signout",
		TargetType: "user",
		TargetID:   targetUserID,
		Summary:    "Forced account sign-out through admin api",
		Details: auditDetailsJSON(map[string]string{
			"username": target.Username,
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (a *App) handleAPIAdminAccountPasswordReset(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}

	targetUserID, err := parseUintURLParam(r, "userID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_user_id"})
		return
	}
	password, decodeErr := readStringField(r, "new_password")
	if decodeErr != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": decodeErr.Error()})
		return
	}
	if len(strings.TrimSpace(password)) < 8 {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_password"})
		return
	}

	target, err := a.authService.GetUserByID(r.Context(), targetUserID)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "user_not_found"})
		return
	}
	if err := a.authService.AdminResetPassword(r.Context(), targetUserID, password); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "reset_failed", "message": err.Error()})
		return
	}
	_ = a.authService.ForceSignOutUser(r.Context(), targetUserID)

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_user_password_reset",
		TargetType: "user",
		TargetID:   targetUserID,
		Summary:    "Reset account password through admin api",
		Details: auditDetailsJSON(map[string]string{
			"username": target.Username,
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

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
