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

type apiAuthProviderItem struct {
	Key       string `json:"key"`
	StartPath string `json:"start_path"`
}

func authProviderStartPath(providerKey string) (string, bool) {
	switch strings.ToLower(strings.TrimSpace(providerKey)) {
	case "dingtalk":
		return "/auth/dingtalk/start", true
	case "github", "google", "wecom", "microsoft":
		return "/auth/sso/start/" + strings.ToLower(strings.TrimSpace(providerKey)), true
	default:
		return "", false
	}
}

func (a *App) handleAPIAuthProviders(w http.ResponseWriter, r *http.Request) {
	configured := a.buildAuthProviders(r.Context(), true)
	items := make([]apiAuthProviderItem, 0, len(configured))
	keys := make([]string, 0, len(configured))

	for _, option := range configured {
		if !option.Available {
			continue
		}
		startPath, ok := authProviderStartPath(option.Key)
		if !ok {
			continue
		}
		keys = append(keys, option.Key)
		items = append(items, apiAuthProviderItem{
			Key:       option.Key,
			StartPath: startPath,
		})
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":             true,
		"auth_providers": keys,
		"items":          items,
	})
}

func (a *App) handleAPIAuthCSRF(w http.ResponseWriter, r *http.Request) {
	token := ensureCSRFToken(w, r, a.cookieSecure)
	if strings.TrimSpace(token) == "" {
		writeJSON(w, http.StatusInternalServerError, map[string]any{
			"error":   "csrf_token_failed",
			"message": a.apiMessage(r, "api.auth.csrf_issue_failed", "Failed to issue CSRF token"),
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
			"message": a.apiMessage(r, "api.auth.service_unavailable", "Authentication service unavailable"),
		})
		return
	}

	var payload apiAuthLoginRequest
	if err := decodeJSONOrForm(r, &payload); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{
			"error":   "invalid_payload",
			"message": a.apiMessage(r, "api.auth.invalid_payload", "Invalid request payload"),
		})
		return
	}

	username := strings.TrimSpace(payload.Username)
	password := strings.TrimSpace(payload.Password)
	if username == "" || password == "" {
		writeJSON(w, http.StatusBadRequest, map[string]any{
			"error":   "invalid_payload",
			"message": a.apiMessage(r, "api.auth.username_password_required", "Username and password are required"),
		})
		return
	}

	issuedIP := clientIPFromRequest(r)
	if a.loginThrottleState().limited(username, issuedIP) {
		writeJSON(w, http.StatusTooManyRequests, map[string]any{
			"error":   "too_many_requests",
			"message": a.apiMessage(r, "api.auth.too_many_requests", "Too many failed sign-in attempts. Try again later."),
		})
		return
	}

	user, err := a.authService.Authenticate(r.Context(), username, password)
	if err != nil {
		a.loginThrottleState().recordFailure(username, issuedIP)
		writeJSON(w, http.StatusUnauthorized, map[string]any{
			"error":   "unauthorized",
			"message": a.apiMessage(r, "api.auth.invalid_credentials", "Invalid username or password"),
		})
		return
	}
	a.loginThrottleState().recordSuccess(username, issuedIP)
	if err := a.startUserSession(w, r, user.ID); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{
			"error":   "session_start_failed",
			"message": a.apiMessage(r, "api.auth.session_start_failed", "Failed to start session"),
		})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":   true,
		"user": buildAPIAuthUserResponse(user),
	})
}

func (a *App) handleAPIAuthMe(w http.ResponseWriter, r *http.Request) {
	marketplacePublicAccess, err := a.marketplacePublicAccessEnabled(r.Context())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{
			"error":   "settings_query_failed",
			"message": a.apiMessage(r, "api.auth.settings_query_failed", "Failed to load access settings"),
		})
		return
	}

	current := currentUserFromContext(r.Context())
	if current == nil {
		writeJSON(w, http.StatusOK, map[string]any{
			"user":                     nil,
			"marketplace_public_access": marketplacePublicAccess,
		})
		return
	}

	user := *current
	if a.authService != nil {
		loaded, err := a.authService.GetUserByID(r.Context(), current.ID)
		if err != nil {
			writeJSON(w, http.StatusNotFound, map[string]any{
				"error":   "user_not_found",
				"message": a.apiMessage(r, "api.auth.user_not_found", "User not found"),
			})
			return
		}
		user = loaded
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"user":                     buildAPIAuthUserResponse(user),
		"marketplace_public_access": marketplacePublicAccess,
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
