package web

import (
	"errors"
	"net/http"
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
