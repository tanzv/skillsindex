package web

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

const dingTalkStateCookieName = "skillsindex_dingtalk_state"

func (a *App) handleDingTalkStart(w http.ResponseWriter, r *http.Request) {
	if a.dingTalkService == nil || !a.dingTalkService.Enabled() {
		http.Redirect(w, r, "/login?err="+url.QueryEscape("DingTalk login is not configured"), http.StatusSeeOther)
		return
	}

	state, err := generateOAuthState()
	if err != nil {
		http.Redirect(w, r, "/login?err="+url.QueryEscape("Failed to generate OAuth state"), http.StatusSeeOther)
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     dingTalkStateCookieName,
		Value:    state,
		Path:     "/",
		MaxAge:   300,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   a.cookieSecure,
	})

	authURL, err := a.dingTalkService.BuildAuthURL(state)
	if err != nil {
		http.Redirect(w, r, "/login?err="+url.QueryEscape("Failed to build DingTalk auth URL"), http.StatusSeeOther)
		return
	}
	http.Redirect(w, r, authURL, http.StatusTemporaryRedirect)
}

func (a *App) handleDingTalkCallback(w http.ResponseWriter, r *http.Request) {
	if a.dingTalkService == nil || !a.dingTalkService.Enabled() || a.oauthGrantService == nil {
		http.Redirect(w, r, "/login?err="+url.QueryEscape("DingTalk login is not configured"), http.StatusSeeOther)
		return
	}

	state := strings.TrimSpace(r.URL.Query().Get("state"))
	if !validateDingTalkState(r, state) {
		http.Redirect(w, r, "/login?err="+url.QueryEscape("Invalid OAuth state"), http.StatusSeeOther)
		return
	}
	clearDingTalkStateCookie(w, a.cookieSecure)

	code := firstNonEmpty(strings.TrimSpace(r.URL.Query().Get("code")), strings.TrimSpace(r.URL.Query().Get("authCode")))
	if code == "" {
		http.Redirect(w, r, "/login?err="+url.QueryEscape("Missing OAuth code"), http.StatusSeeOther)
		return
	}

	token, err := a.dingTalkService.ExchangeCode(r.Context(), code)
	if err != nil {
		http.Redirect(w, r, "/login?err="+url.QueryEscape("Failed to exchange DingTalk OAuth code"), http.StatusSeeOther)
		return
	}
	profile, err := a.dingTalkService.GetCurrentUser(r.Context(), token.AccessToken)
	if err != nil {
		http.Redirect(w, r, "/login?err="+url.QueryEscape("Failed to fetch DingTalk profile"), http.StatusSeeOther)
		return
	}

	externalID := firstNonEmpty(profile.UnionID, profile.OpenID)
	if externalID == "" {
		http.Redirect(w, r, "/login?err="+url.QueryEscape("DingTalk profile missing stable identity"), http.StatusSeeOther)
		return
	}

	var user *models.User
	if current := currentUserFromContext(r.Context()); current != nil {
		user = current
	} else {
		found, findErr := a.oauthGrantService.FindUserByExternalID(r.Context(), models.OAuthProviderDingTalk, externalID)
		if findErr == nil {
			user = &found
		} else if errors.Is(findErr, services.ErrOAuthGrantNotFound) {
			preferred := buildOAuthUsername(profile.DisplayName, externalID)
			created, createErr := a.authService.CreateOAuthUser(r.Context(), preferred, models.RoleMember)
			if createErr != nil {
				http.Redirect(w, r, "/login?err="+url.QueryEscape("Failed to create local account for DingTalk user"), http.StatusSeeOther)
				return
			}
			user = &created
		} else {
			http.Redirect(w, r, "/login?err="+url.QueryEscape("Failed to resolve DingTalk account mapping"), http.StatusSeeOther)
			return
		}
	}

	now := time.Now().UTC()
	grantExpiresAt := now.Add(1 * time.Hour)
	if token.ExpiresInSeconds > 0 {
		grantExpiresAt = now.Add(time.Duration(token.ExpiresInSeconds) * time.Second)
	}
	refreshExpiresAt := now.Add(24 * time.Hour)
	if token.RefreshExpiresInSecs > 0 {
		refreshExpiresAt = now.Add(time.Duration(token.RefreshExpiresInSecs) * time.Second)
	}

	_, err = a.oauthGrantService.UpsertGrant(r.Context(), services.UpsertOAuthGrantInput{
		UserID:           user.ID,
		Provider:         models.OAuthProviderDingTalk,
		ExternalUserID:   externalID,
		AccessToken:      token.AccessToken,
		RefreshToken:     token.RefreshToken,
		Scope:            token.Scope,
		ExpiresAt:        grantExpiresAt,
		RefreshExpiresAt: refreshExpiresAt,
	})
	if err != nil {
		if errors.Is(err, services.ErrOAuthExternalIdentityBound) {
			http.Redirect(w, r, "/login?err="+url.QueryEscape("DingTalk account is already bound to another user"), http.StatusSeeOther)
			return
		}
		http.Redirect(w, r, "/login?err="+url.QueryEscape("Failed to persist DingTalk authorization"), http.StatusSeeOther)
		return
	}

	if err := a.startUserSession(w, r, user.ID); err != nil {
		http.Redirect(w, r, "/login?err="+url.QueryEscape("Failed to start local session"), http.StatusSeeOther)
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "auth_dingtalk_authorize",
		TargetType: "user",
		TargetID:   user.ID,
		Summary:    "Authorized DingTalk personal API token",
		Details: auditDetailsJSON(map[string]string{
			"external_user_id": externalID,
			"scope":            token.Scope,
		}),
	})

	http.Redirect(w, r, "/admin?msg="+url.QueryEscape("DingTalk authorization completed"), http.StatusSeeOther)
}

func (a *App) handleDingTalkRevoke(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if a.oauthGrantService == nil {
		redirectDashboard(w, r, "", "OAuth grant service is unavailable")
		return
	}

	if err := a.oauthGrantService.RevokeGrant(r.Context(), user.ID, models.OAuthProviderDingTalk); err != nil {
		redirectDashboard(w, r, "", "Failed to revoke DingTalk authorization")
		return
	}
	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "auth_dingtalk_revoke",
		TargetType: "user",
		TargetID:   user.ID,
		Summary:    "Revoked DingTalk personal API token",
	})
	redirectDashboard(w, r, "DingTalk authorization revoked", "")
}

func (a *App) handleDingTalkMe(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized", "message": "Login required"})
		return
	}
	if a.oauthGrantService == nil || a.dingTalkService == nil || !a.dingTalkService.Enabled() {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable", "message": "DingTalk integration is not configured"})
		return
	}

	grant, err := a.oauthGrantService.GetGrantByUserProvider(r.Context(), user.ID, models.OAuthProviderDingTalk)
	if err != nil {
		if errors.Is(err, services.ErrOAuthGrantNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "grant_not_found", "message": "DingTalk personal authorization not found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "grant_query_failed", "message": "Failed to query authorization grant"})
		return
	}
	if !a.oauthGrantService.IsGrantActive(grant, time.Now().UTC()) {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "grant_expired", "message": "DingTalk personal authorization has expired; please re-authorize"})
		return
	}

	profile, err := a.dingTalkService.GetCurrentUser(r.Context(), grant.AccessToken)
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]any{"error": "dingtalk_api_failed", "message": "Failed to query DingTalk personal profile"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"user_id":            user.ID,
		"provider":           models.OAuthProviderDingTalk,
		"grant_expires_at":   grant.ExpiresAt.UTC().Format(time.RFC3339),
		"profile_display":    profile.DisplayName,
		"profile_open_id":    profile.OpenID,
		"profile_union_id":   profile.UnionID,
		"profile_avatar_url": profile.AvatarURL,
	})
}

func generateOAuthState() (string, error) {
	buf := make([]byte, 18)
	if _, err := rand.Read(buf); err != nil {
		return "", fmt.Errorf("failed to generate random oauth state: %w", err)
	}
	return base64.RawURLEncoding.EncodeToString(buf), nil
}

func generateCSRFToken() (string, error) {
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err != nil {
		return "", fmt.Errorf("failed to generate csrf token: %w", err)
	}
	return base64.RawURLEncoding.EncodeToString(buf), nil
}

func validateDingTalkState(r *http.Request, inputState string) bool {
	state := strings.TrimSpace(inputState)
	if state == "" {
		return false
	}
	cookie, err := r.Cookie(dingTalkStateCookieName)
	if err != nil {
		return false
	}
	return strings.TrimSpace(cookie.Value) == state
}

func clearDingTalkStateCookie(w http.ResponseWriter, secure bool) {
	http.SetCookie(w, &http.Cookie{
		Name:     dingTalkStateCookieName,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   secure,
	})
}

func buildOAuthUsername(displayName string, externalID string) string {
	cleanName := sanitizeUsername(displayName)
	if len(cleanName) >= 3 {
		return cleanName
	}
	fallback := sanitizeUsername(externalID)
	if len(fallback) >= 3 {
		return "dd_" + fallback
	}
	return "dd_user"
}

func sanitizeUsername(raw string) string {
	raw = strings.ToLower(strings.TrimSpace(raw))
	var b strings.Builder
	for _, r := range raw {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '_' || r == '-' {
			b.WriteRune(r)
		}
	}
	return b.String()
}
