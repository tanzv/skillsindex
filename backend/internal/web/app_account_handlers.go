package web

import (
	"errors"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"skillsindex/internal/services"

	"github.com/go-chi/chi/v5"
)

func (a *App) handleAccountRoot(w http.ResponseWriter, r *http.Request) {
	if currentUserFromContext(r.Context()) == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	http.Redirect(w, r, "/account/profile", http.StatusSeeOther)
}

func (a *App) handleAccountProfile(w http.ResponseWriter, r *http.Request) {
	a.renderAccountPage(w, r, "profile", "Account Profile")
}

func (a *App) handleAccountSecurity(w http.ResponseWriter, r *http.Request) {
	a.renderAccountPage(w, r, "security", "Account Security")
}

func (a *App) handleAccountAPICredentials(w http.ResponseWriter, r *http.Request) {
	a.renderAccountPage(w, r, "credentials", "API Credentials")
}

func (a *App) handleAccountSessions(w http.ResponseWriter, r *http.Request) {
	a.renderAccountPage(w, r, "sessions", "Session Management")
}

func (a *App) renderAccountPage(w http.ResponseWriter, r *http.Request, section string, title string) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	account, err := a.authService.GetUserByID(r.Context(), currentUser.ID)
	if err != nil {
		a.sessionService.ClearSession(w)
		http.Redirect(w, r, "/login?err="+url.QueryEscape("Account not found"), http.StatusSeeOther)
		return
	}

	view := ViewData{
		Page:           "account",
		Title:          title,
		CurrentUser:    &account,
		AccountSection: section,
		Message:        strings.TrimSpace(r.URL.Query().Get("msg")),
		Error:          strings.TrimSpace(r.URL.Query().Get("err")),
	}
	if section == "sessions" && a.sessionService != nil {
		_, issuedAt, sessionID, ok := a.sessionService.GetSessionWithID(r)
		view.AccountCurrentSessionID = sessionID
		if ok && !issuedAt.IsZero() {
			issued := issuedAt.UTC()
			expires := issued.Add(a.sessionService.SessionTTL())
			view.AccountSessionIssued = &issued
			view.AccountSessionExpires = &expires
		}
		if a.userSessionSvc != nil {
			sessions, listErr := a.userSessionSvc.ListActiveSessions(r.Context(), currentUser.ID, time.Now().UTC(), 120)
			if listErr == nil {
				view.AccountSessions = sessions
			}
		}
	}
	a.render(w, r, view)
}

func (a *App) handleAccountProfileUpdate(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectAccountPath(w, r, "/account/profile", "", "Invalid form payload")
		return
	}

	updated, err := a.authService.UpdateProfile(r.Context(), currentUser.ID, services.UpdateUserProfileInput{
		DisplayName: r.FormValue("display_name"),
		AvatarURL:   r.FormValue("avatar_url"),
		Bio:         r.FormValue("bio"),
	})
	if err != nil {
		redirectAccountPath(w, r, "/account/profile", "", err.Error())
		return
	}

	a.recordAudit(r.Context(), currentUser, services.RecordAuditInput{
		Action:     "account_profile_update",
		TargetType: "user",
		TargetID:   currentUser.ID,
		Summary:    "Updated account profile",
		Details: auditDetailsJSON(map[string]string{
			"display_name": updated.DisplayName,
		}),
	})

	redirectAccountPath(w, r, "/account/profile", "Account profile updated", "")
}

func (a *App) handleAccountPasswordUpdate(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectAccountPath(w, r, "/account/security", "", "Invalid form payload")
		return
	}

	currentPassword := strings.TrimSpace(r.FormValue("current_password"))
	newPassword := strings.TrimSpace(r.FormValue("new_password"))
	revokeOtherSessions := parseBoolFlag(r.FormValue("revoke_other_sessions"), false)

	if err := a.authService.ChangePassword(r.Context(), currentUser.ID, currentPassword, newPassword); err != nil {
		if errors.Is(err, services.ErrInvalidCurrentPassword) {
			redirectAccountPath(w, r, "/account/security", "", "Current password is incorrect")
			return
		}
		redirectAccountPath(w, r, "/account/security", "", err.Error())
		return
	}

	if revokeOtherSessions {
		if a.userSessionSvc != nil {
			_, _ = a.userSessionSvc.RevokeOtherSessions(r.Context(), currentUser.ID, "")
		}
		if err := a.authService.ForceSignOutUser(r.Context(), currentUser.ID); err != nil {
			redirectAccountPath(w, r, "/account/security", "", "Failed to revoke other sessions")
			return
		}
	}
	if a.sessionService == nil {
		redirectAccountPath(w, r, "/account/security", "", "Session service unavailable")
		return
	}
	if err := a.startUserSession(w, r, currentUser.ID); err != nil {
		redirectAccountPath(w, r, "/account/security", "", "Password updated but failed to refresh session")
		return
	}

	a.recordAudit(r.Context(), currentUser, services.RecordAuditInput{
		Action:     "account_password_change",
		TargetType: "user",
		TargetID:   currentUser.ID,
		Summary:    "Changed account password",
		Details: auditDetailsJSON(map[string]string{
			"revoke_other_sessions": strconv.FormatBool(revokeOtherSessions),
		}),
	})

	redirectAccountPath(w, r, "/account/security", "Password updated", "")
}

func (a *App) handleAccountSessionRevoke(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if a.sessionService == nil || a.userSessionSvc == nil {
		redirectAccountPath(w, r, "/account/sessions", "", "Session service unavailable")
		return
	}

	targetSessionID := strings.TrimSpace(chi.URLParam(r, "sessionID"))
	if targetSessionID == "" {
		redirectAccountPath(w, r, "/account/sessions", "", "Invalid session id")
		return
	}
	_, _, currentSessionID, _ := a.sessionService.GetSessionWithID(r)
	if currentSessionID != "" && targetSessionID == currentSessionID {
		redirectAccountPath(w, r, "/account/sessions", "", "Cannot revoke current session directly")
		return
	}

	if err := a.userSessionSvc.RevokeSession(r.Context(), currentUser.ID, targetSessionID); err != nil {
		if errors.Is(err, services.ErrUserSessionNotFound) {
			redirectAccountPath(w, r, "/account/sessions", "", "Session not found")
			return
		}
		redirectAccountPath(w, r, "/account/sessions", "", "Failed to revoke session")
		return
	}

	a.recordAudit(r.Context(), currentUser, services.RecordAuditInput{
		Action:     "account_session_revoke",
		TargetType: "user",
		TargetID:   currentUser.ID,
		Summary:    "Revoked one active session",
		Details: auditDetailsJSON(map[string]string{
			"session_id": targetSessionID,
		}),
	})

	redirectAccountPath(w, r, "/account/sessions", "Session revoked", "")
}

func (a *App) handleAccountSessionsRevokeOthers(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	revokedCount := int64(0)
	if a.userSessionSvc != nil {
		revokedCount, _ = a.userSessionSvc.RevokeOtherSessions(r.Context(), currentUser.ID, "")
	}
	if err := a.authService.ForceSignOutUser(r.Context(), currentUser.ID); err != nil {
		redirectAccountPath(w, r, "/account/sessions", "", "Failed to revoke other sessions")
		return
	}
	if a.sessionService == nil {
		redirectAccountPath(w, r, "/account/sessions", "", "Session service unavailable")
		return
	}
	if err := a.startUserSession(w, r, currentUser.ID); err != nil {
		redirectAccountPath(w, r, "/account/sessions", "", "Sessions revoked but failed to refresh session")
		return
	}

	a.recordAudit(r.Context(), currentUser, services.RecordAuditInput{
		Action:     "account_session_revoke_others",
		TargetType: "user",
		TargetID:   currentUser.ID,
		Summary:    "Revoked other active sessions",
		Details: auditDetailsJSON(map[string]string{
			"revoked_count": strconv.FormatInt(revokedCount, 10),
		}),
	})

	redirectAccountPath(w, r, "/account/sessions", "Other sessions revoked", "")
}
