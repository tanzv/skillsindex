package web

import (
	"net/http"
	"strings"

	"skillsindex/internal/models"
)

type apiAuthLoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type apiAuthUserResponse struct {
	ID          uint   `json:"id"`
	Username    string `json:"username"`
	DisplayName string `json:"display_name"`
	Role        string `json:"role"`
	Status      string `json:"status"`
}

func (a *App) handleAPIAuthCSRF(w http.ResponseWriter, r *http.Request) {
	token := ensureCSRFToken(w, r, a.cookieSecure)
	if strings.TrimSpace(token) == "" {
		writeJSON(w, http.StatusInternalServerError, map[string]any{
			"error":   "csrf_token_failed",
			"message": "Failed to issue CSRF token",
		})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"csrf_token": token,
	})
}

func (a *App) handleAPIAuthLogin(w http.ResponseWriter, r *http.Request) {
	if a.authService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{
			"error":   "service_unavailable",
			"message": "Authentication service unavailable",
		})
		return
	}

	var payload apiAuthLoginRequest
	if err := decodeJSONOrForm(r, &payload); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{
			"error":   "invalid_payload",
			"message": err.Error(),
		})
		return
	}

	username := strings.TrimSpace(payload.Username)
	password := strings.TrimSpace(payload.Password)
	if username == "" || password == "" {
		writeJSON(w, http.StatusBadRequest, map[string]any{
			"error":   "invalid_payload",
			"message": "username and password are required",
		})
		return
	}

	user, err := a.authService.Authenticate(r.Context(), username, password)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{
			"error":   "unauthorized",
			"message": "Invalid username or password",
		})
		return
	}
	if err := a.startUserSession(w, r, user.ID); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{
			"error":   "session_start_failed",
			"message": "Failed to start session",
		})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":   true,
		"user": buildAPIAuthUserResponse(user),
	})
}

func (a *App) handleAPIAuthMe(w http.ResponseWriter, r *http.Request) {
	current := currentUserFromContext(r.Context())
	if current == nil {
		writeJSON(w, http.StatusOK, map[string]any{
			"user": nil,
		})
		return
	}

	user := *current
	if a.authService != nil {
		loaded, err := a.authService.GetUserByID(r.Context(), current.ID)
		if err != nil {
			writeJSON(w, http.StatusNotFound, map[string]any{
				"error":   "user_not_found",
				"message": "User not found",
			})
			return
		}
		user = loaded
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"user": buildAPIAuthUserResponse(user),
	})
}

func (a *App) handleAPIAuthLogout(w http.ResponseWriter, r *http.Request) {
	if a.sessionService != nil && a.userSessionSvc != nil {
		userID, _, sessionID, ok := a.sessionService.GetSessionWithID(r)
		if ok && strings.TrimSpace(sessionID) != "" {
			_ = a.userSessionSvc.RevokeSession(r.Context(), userID, sessionID)
		}
	}
	if a.sessionService != nil {
		a.sessionService.ClearSession(w)
	}
	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func buildAPIAuthUserResponse(user models.User) apiAuthUserResponse {
	return apiAuthUserResponse{
		ID:          user.ID,
		Username:    user.Username,
		DisplayName: user.DisplayName,
		Role:        string(user.EffectiveRole()),
		Status:      userStatusValue(user),
	}
}
