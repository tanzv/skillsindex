package web

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"skillsindex/internal/services"
)

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
