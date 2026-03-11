package web

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) handleAdminAccountCreate(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if !currentUser.CanManageUsers() {
		redirectAdminPath(w, r, "/admin/access", "", "Permission denied")
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectAdminPath(w, r, "/admin/accounts/new", "", "Invalid form payload")
		return
	}

	role, ok := parseRoleValue(defaultString(r.FormValue("role"), string(models.RoleMember)))
	if !ok {
		redirectAdminPath(w, r, "/admin/accounts/new", "", "Invalid role value")
		return
	}
	createdUser, err := a.authService.Register(r.Context(), r.FormValue("username"), r.FormValue("password"))
	if err != nil {
		redirectAdminPath(w, r, "/admin/accounts/new", "", err.Error())
		return
	}
	if role != models.RoleMember {
		if err := a.authService.SetUserRole(r.Context(), createdUser.ID, role); err != nil {
			redirectAdminPath(w, r, "/admin/accounts/new", "", "Failed to assign role")
			return
		}
		createdUser.Role = role
	}

	a.recordAudit(r.Context(), currentUser, services.RecordAuditInput{
		Action:     "user_create_by_admin",
		TargetType: "user",
		TargetID:   createdUser.ID,
		Summary:    "Created account from admin workspace",
		Details: auditDetailsJSON(map[string]string{
			"username": createdUser.Username,
			"role":     string(createdUser.EffectiveRole()),
		}),
	})
	redirectAdminPath(w, r, "/admin/accounts", "Account created", "")
}

func (a *App) handleAdminAccessRegistrationUpdate(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if !currentUser.CanManageUsers() {
		redirectAdminPath(w, r, "/admin/access", "", "Permission denied")
		return
	}
	if a.settingsService == nil {
		redirectAdminPath(w, r, "/admin/access", "", "Settings service unavailable")
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectAdminPath(w, r, "/admin/access", "", "Invalid form payload")
		return
	}

	allowRegistration := parseBoolFlag(r.FormValue("allow_registration"), false)
	marketplacePublicAccess, err := a.settingsService.GetBool(r.Context(), services.SettingMarketplacePublicAccess, true)
	if err != nil {
		redirectAdminPath(w, r, "/admin/access", "", "Failed to load marketplace access policy")
		return
	}
	if rawMarketplacePublicAccess := strings.TrimSpace(r.FormValue("marketplace_public_access")); rawMarketplacePublicAccess != "" {
		marketplacePublicAccess = parseBoolFlag(rawMarketplacePublicAccess, marketplacePublicAccess)
	}
	if err := a.settingsService.SetBool(r.Context(), services.SettingAllowRegistration, allowRegistration); err != nil {
		redirectAdminPath(w, r, "/admin/access", "", "Failed to update registration policy")
		return
	}
	if err := a.settingsService.SetBool(r.Context(), services.SettingMarketplacePublicAccess, marketplacePublicAccess); err != nil {
		redirectAdminPath(w, r, "/admin/access", "", "Failed to update marketplace access policy")
		return
	}
	a.recordAudit(r.Context(), currentUser, services.RecordAuditInput{
		Action:     "access_registration_policy_update",
		TargetType: "setting",
		TargetID:   0,
		Summary:    "Updated registration policy",
		Details: auditDetailsJSON(map[string]string{
			"allow_registration":        strconv.FormatBool(allowRegistration),
			"marketplace_public_access": strconv.FormatBool(marketplacePublicAccess),
		}),
	})

	if allowRegistration {
		redirectAdminPath(w, r, "/admin/access", "Registration is now enabled", "")
		return
	}
	redirectAdminPath(w, r, "/admin/access", "Registration is now disabled", "")
}

func (a *App) handleAdminAccessAuthProvidersUpdate(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if !currentUser.CanManageUsers() {
		redirectAdminPath(w, r, "/admin/access", "", "Permission denied")
		return
	}
	if a.settingsService == nil {
		redirectAdminPath(w, r, "/admin/access", "", "Settings service unavailable")
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectAdminPath(w, r, "/admin/access", "", "Invalid form payload")
		return
	}

	selectedProviders := normalizeAuthProviderList(r.Form["auth_providers"])
	serialized := strings.Join(selectedProviders, ",")
	if err := a.settingsService.Set(r.Context(), services.SettingAuthEnabledProviders, serialized); err != nil {
		redirectAdminPath(w, r, "/admin/access", "", "Failed to update auth providers")
		return
	}
	a.recordAudit(r.Context(), currentUser, services.RecordAuditInput{
		Action:     "access_auth_providers_update",
		TargetType: "setting",
		TargetID:   0,
		Summary:    "Updated visible auth providers",
		Details: auditDetailsJSON(map[string]string{
			"auth_enabled_providers": serialized,
		}),
	})

	redirectAdminPath(w, r, "/admin/access", "Auth provider visibility updated", "")
}

func (a *App) handleAdminRoleAssign(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if !currentUser.CanManageUsers() {
		redirectAdminPath(w, r, "/admin/access", "", "Permission denied")
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectAdminPath(w, r, "/admin/roles/new", "", "Invalid form payload")
		return
	}

	userIDValue, err := strconv.ParseUint(strings.TrimSpace(r.FormValue("user_id")), 10, 64)
	if err != nil || userIDValue == 0 {
		redirectAdminPath(w, r, "/admin/roles/new", "", "Invalid user id")
		return
	}
	targetUser, err := a.authService.GetUserByID(r.Context(), uint(userIDValue))
	if err != nil {
		redirectAdminPath(w, r, "/admin/roles/new", "", "User not found")
		return
	}

	role, ok := parseRoleValue(r.FormValue("role"))
	if !ok {
		redirectAdminPath(w, r, "/admin/roles/new", "", "Invalid role value")
		return
	}

	if err := a.authService.SetUserRole(r.Context(), targetUser.ID, role); err != nil {
		switch {
		case errors.Is(err, services.ErrUserNotFound):
			redirectAdminPath(w, r, "/admin/roles/new", "", "User not found")
		case errors.Is(err, services.ErrLastSuperAdmin):
			redirectAdminPath(w, r, "/admin/roles/new", "", "Cannot demote the last super admin")
		default:
			redirectAdminPath(w, r, "/admin/roles/new", "", "Failed to update user role")
		}
		return
	}

	a.recordAudit(r.Context(), currentUser, services.RecordAuditInput{
		Action:     "user_update_role",
		TargetType: "user",
		TargetID:   targetUser.ID,
		Summary:    "Updated user role from role workspace",
		Details: auditDetailsJSON(map[string]string{
			"username":  targetUser.Username,
			"from_role": string(targetUser.EffectiveRole()),
			"to_role":   string(role),
		}),
	})
	redirectAdminPath(w, r, "/admin/roles", "User role updated", "")
}

func (a *App) handleAdminAccountStatusUpdate(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if !currentUser.CanManageUsers() {
		redirectAdminPath(w, r, "/admin/accounts", "", "Permission denied")
		return
	}

	targetUserID, ok := parseUserID(w, r)
	if !ok {
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectAdminPath(w, r, "/admin/accounts", "", "Invalid form payload")
		return
	}
	status, statusOK := parseUserStatus(r.FormValue("status"))
	if !statusOK {
		redirectAdminPath(w, r, "/admin/accounts", "", "Invalid account status")
		return
	}
	if targetUserID == currentUser.ID && status == models.UserStatusDisabled {
		redirectAdminPath(w, r, "/admin/accounts", "", "Cannot disable current signed-in account")
		return
	}
	targetUser, err := a.authService.GetUserByID(r.Context(), targetUserID)
	if err != nil {
		redirectAdminPath(w, r, "/admin/accounts", "", "User not found")
		return
	}
	if err := a.authService.SetUserStatus(r.Context(), targetUserID, status); err != nil {
		if errors.Is(err, services.ErrLastSuperAdmin) {
			redirectAdminPath(w, r, "/admin/accounts", "", "Cannot disable the last active super admin")
			return
		}
		redirectAdminPath(w, r, "/admin/accounts", "", "Failed to update account status")
		return
	}
	if status == models.UserStatusDisabled {
		_ = a.authService.ForceSignOutUser(r.Context(), targetUserID)
	}
	a.recordAudit(r.Context(), currentUser, services.RecordAuditInput{
		Action:     "user_update_status",
		TargetType: "user",
		TargetID:   targetUserID,
		Summary:    "Updated account status",
		Details: auditDetailsJSON(map[string]string{
			"username": targetUser.Username,
			"status":   string(status),
		}),
	})
	redirectAdminPath(w, r, "/admin/accounts", "Account status updated", "")
}

func (a *App) handleAdminAccountForceSignout(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if !currentUser.CanManageUsers() {
		redirectAdminPath(w, r, "/admin/accounts", "", "Permission denied")
		return
	}
	targetUserID, ok := parseUserID(w, r)
	if !ok {
		return
	}
	targetUser, err := a.authService.GetUserByID(r.Context(), targetUserID)
	if err != nil {
		redirectAdminPath(w, r, "/admin/accounts", "", "User not found")
		return
	}
	if err := a.authService.ForceSignOutUser(r.Context(), targetUserID); err != nil {
		redirectAdminPath(w, r, "/admin/accounts", "", "Failed to force sign-out")
		return
	}
	a.recordAudit(r.Context(), currentUser, services.RecordAuditInput{
		Action:     "user_force_signout",
		TargetType: "user",
		TargetID:   targetUserID,
		Summary:    "Forced sign-out for account",
		Details: auditDetailsJSON(map[string]string{
			"username": targetUser.Username,
		}),
	})
	redirectAdminPath(w, r, "/admin/accounts", "Account sessions revoked", "")
}

func (a *App) handleAdminAccountPasswordReset(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if !currentUser.CanManageUsers() {
		redirectAdminPath(w, r, "/admin/accounts", "", "Permission denied")
		return
	}
	targetUserID, ok := parseUserID(w, r)
	if !ok {
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectAdminPath(w, r, "/admin/accounts", "", "Invalid form payload")
		return
	}
	newPassword := strings.TrimSpace(r.FormValue("new_password"))
	if len(newPassword) < 8 {
		redirectAdminPath(w, r, "/admin/accounts", "", "Password must be at least 8 characters")
		return
	}

	targetUser, err := a.authService.GetUserByID(r.Context(), targetUserID)
	if err != nil {
		redirectAdminPath(w, r, "/admin/accounts", "", "User not found")
		return
	}
	if err := a.authService.AdminResetPassword(r.Context(), targetUserID, newPassword); err != nil {
		redirectAdminPath(w, r, "/admin/accounts", "", "Failed to reset password")
		return
	}
	_ = a.authService.ForceSignOutUser(r.Context(), targetUserID)
	a.recordAudit(r.Context(), currentUser, services.RecordAuditInput{
		Action:     "user_password_reset",
		TargetType: "user",
		TargetID:   targetUserID,
		Summary:    "Reset account password",
		Details: auditDetailsJSON(map[string]string{
			"username": targetUser.Username,
		}),
	})
	redirectAdminPath(w, r, "/admin/accounts", "Password reset successfully", "")
}

func (a *App) handleAdminUserRoleUpdate(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if !currentUser.CanManageUsers() {
		redirectDashboard(w, r, "", "Permission denied")
		return
	}

	userID, ok := parseUserID(w, r)
	if !ok {
		return
	}
	targetUser, err := a.authService.GetUserByID(r.Context(), userID)
	if err != nil {
		redirectDashboard(w, r, "", "User not found")
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectDashboard(w, r, "", "Invalid form payload")
		return
	}
	role, ok := parseRoleValue(r.FormValue("role"))
	if !ok {
		redirectDashboard(w, r, "", "Invalid role value")
		return
	}

	if err := a.authService.SetUserRole(r.Context(), userID, role); err != nil {
		switch {
		case errors.Is(err, services.ErrUserNotFound):
			redirectDashboard(w, r, "", "User not found")
		case errors.Is(err, services.ErrLastSuperAdmin):
			redirectDashboard(w, r, "", "Cannot demote the last super admin")
		default:
			redirectDashboard(w, r, "", "Failed to update user role")
		}
		return
	}
	a.recordAudit(r.Context(), currentUser, services.RecordAuditInput{
		Action:     "user_update_role",
		TargetType: "user",
		TargetID:   targetUser.ID,
		Summary:    "Updated user role",
		Details: auditDetailsJSON(map[string]string{
			"username":  targetUser.Username,
			"from_role": string(targetUser.EffectiveRole()),
			"to_role":   string(role),
		}),
	})
	redirectDashboard(w, r, "User role updated", "")
}
