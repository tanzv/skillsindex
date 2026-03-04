package web

import (
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"skillsindex/internal/services"

	"github.com/go-chi/chi/v5"
)

type apiAccountProfileUpdateRequest struct {
	DisplayName string `json:"display_name"`
	AvatarURL   string `json:"avatar_url"`
	Bio         string `json:"bio"`
}

type apiAccountPasswordUpdateRequest struct {
	CurrentPassword     string `json:"current_password"`
	NewPassword         string `json:"new_password"`
	RevokeOtherSessions any    `json:"revoke_other_sessions"`
}

func (a *App) handleAPIAccountProfile(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.authService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	account, err := a.authService.GetUserByID(r.Context(), currentUser.ID)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "user_not_found"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"user": buildAPIAuthUserResponse(account),
		"profile": map[string]any{
			"display_name": account.DisplayName,
			"avatar_url":   account.AvatarURL,
			"bio":          account.Bio,
		},
	})
}

func (a *App) handleAPIAccountProfileUpdate(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.authService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	var input apiAccountProfileUpdateRequest
	if err := decodeJSONOrForm(r, &input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}

	updated, err := a.authService.UpdateProfile(r.Context(), currentUser.ID, services.UpdateUserProfileInput{
		DisplayName: input.DisplayName,
		AvatarURL:   input.AvatarURL,
		Bio:         input.Bio,
	})
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "profile_update_failed", "message": err.Error()})
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

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":   true,
		"user": buildAPIAuthUserResponse(updated),
		"profile": map[string]any{
			"display_name": updated.DisplayName,
			"avatar_url":   updated.AvatarURL,
			"bio":          updated.Bio,
		},
	})
}

func (a *App) handleAPIAccountPasswordUpdate(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.authService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	var input apiAccountPasswordUpdateRequest
	if err := decodeJSONOrForm(r, &input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}

	revokeOtherSessions := false
	if input.RevokeOtherSessions != nil {
		parsed, matched := parseBoolSettingValue(input.RevokeOtherSessions)
		if !matched {
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_revoke_other_sessions"})
			return
		}
		revokeOtherSessions = parsed
	}

	currentPassword := strings.TrimSpace(input.CurrentPassword)
	newPassword := strings.TrimSpace(input.NewPassword)
	if err := a.authService.ChangePassword(r.Context(), currentUser.ID, currentPassword, newPassword); err != nil {
		if errors.Is(err, services.ErrInvalidCurrentPassword) {
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_current_password"})
			return
		}
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "password_update_failed", "message": err.Error()})
		return
	}

	revokedCount := int64(0)
	currentSessionID := ""
	if a.sessionService != nil {
		_, _, currentSessionID, _ = a.sessionService.GetSessionWithID(r)
	}
	if revokeOtherSessions {
		if a.userSessionSvc != nil {
			revokedCount, _ = a.userSessionSvc.RevokeOtherSessions(r.Context(), currentUser.ID, currentSessionID)
		}
		if err := a.authService.ForceSignOutUser(r.Context(), currentUser.ID); err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "session_revoke_failed", "message": err.Error()})
			return
		}
	}
	if a.sessionService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable", "message": "Session service unavailable"})
		return
	}
	if err := a.startUserSession(w, r, currentUser.ID); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "session_refresh_failed", "message": err.Error()})
		return
	}

	a.recordAudit(r.Context(), currentUser, services.RecordAuditInput{
		Action:     "account_password_change",
		TargetType: "user",
		TargetID:   currentUser.ID,
		Summary:    "Changed account password",
		Details: auditDetailsJSON(map[string]string{
			"revoke_other_sessions": strconv.FormatBool(revokeOtherSessions),
			"revoked_count":         strconv.FormatInt(revokedCount, 10),
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":                    true,
		"revoke_other_sessions": revokeOtherSessions,
		"revoked_count":         revokedCount,
	})
}

func (a *App) handleAPIAccountSessions(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.sessionService == nil || a.userSessionSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	_, issuedAt, currentSessionID, ok := a.sessionService.GetSessionWithID(r)
	var accountSessionIssued *time.Time
	var accountSessionExpires *time.Time
	if ok && !issuedAt.IsZero() {
		issued := issuedAt.UTC()
		expires := issued.Add(a.sessionService.SessionTTL())
		accountSessionIssued = &issued
		accountSessionExpires = &expires
	}

	sessions, err := a.userSessionSvc.ListActiveSessions(r.Context(), currentUser.ID, time.Now().UTC(), 120)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "session_list_failed", "message": err.Error()})
		return
	}

	items := make([]map[string]any, 0, len(sessions))
	for _, item := range sessions {
		items = append(items, map[string]any{
			"session_id": item.SessionID,
			"user_agent": item.UserAgent,
			"issued_ip":  item.IssuedIP,
			"last_seen":  item.LastSeenAt,
			"expires_at": item.ExpiresAt,
			"is_current": strings.TrimSpace(item.SessionID) != "" && item.SessionID == currentSessionID,
		})
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"current_session_id": currentSessionID,
		"session_issued_at":  accountSessionIssued,
		"session_expires_at": accountSessionExpires,
		"items":              items,
		"total":              len(items),
	})
}

func (a *App) handleAPIAccountSessionRevoke(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.sessionService == nil || a.userSessionSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	targetSessionID := strings.TrimSpace(chi.URLParam(r, "sessionID"))
	if targetSessionID == "" {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_session_id"})
		return
	}
	_, _, currentSessionID, _ := a.sessionService.GetSessionWithID(r)
	if currentSessionID != "" && targetSessionID == currentSessionID {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "cannot_revoke_current_session"})
		return
	}

	if err := a.userSessionSvc.RevokeSession(r.Context(), currentUser.ID, targetSessionID); err != nil {
		if errors.Is(err, services.ErrUserSessionNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "session_not_found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "session_revoke_failed", "message": err.Error()})
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

	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (a *App) handleAPIAccountSessionsRevokeOthers(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.sessionService == nil || a.authService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	currentSessionID := ""
	_, _, currentSessionID, _ = a.sessionService.GetSessionWithID(r)
	revokedCount := int64(0)
	if a.userSessionSvc != nil {
		revokedCount, _ = a.userSessionSvc.RevokeOtherSessions(r.Context(), currentUser.ID, currentSessionID)
	}
	if err := a.authService.ForceSignOutUser(r.Context(), currentUser.ID); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "session_revoke_failed", "message": err.Error()})
		return
	}
	if err := a.startUserSession(w, r, currentUser.ID); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "session_refresh_failed", "message": err.Error()})
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

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":            true,
		"revoked_count": revokedCount,
	})
}
