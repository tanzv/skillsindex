package web

import (
	"context"
	"errors"
	"net/http"
	"net/url"
	"strings"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"github.com/go-chi/chi/v5"
)

type ssoConnectorConfig struct {
	Protocol             string
	Issuer               string
	AuthorizationURL     string
	TokenURL             string
	UserInfoURL          string
	ClientID             string
	ClientSecret         string
	Scope                string
	ClaimExternalID      string
	ClaimUsername        string
	ClaimEmail           string
	ClaimEmailVerified   string
	ClaimGroups          string
	OffboardingMode      string
	MappingMode          string
	DefaultOrgID         uint
	DefaultOrgRole       models.OrganizationRole
	DefaultOrgDomains    []string
	DefaultOrgGroupRules []ssoOrgGroupRule
	DefaultUserRole      models.UserRole
}

type ssoTokenResponse struct {
	AccessToken  string `json:"access_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
	RefreshToken string `json:"refresh_token"`
	Scope        string `json:"scope"`
	IDToken      string `json:"id_token"`
}

type ssoStatePayload struct {
	Provider string
	State    string
	Nonce    string
}

func (a *App) handleSSOStart(w http.ResponseWriter, r *http.Request) {
	if a.integrationSvc == nil {
		redirectSSOLoginError(w, r, "Enterprise SSO is not configured")
		return
	}

	provider := normalizeSSOProvider(chi.URLParam(r, "provider"))
	if provider == "" {
		redirectSSOLoginError(w, r, "Invalid SSO provider")
		return
	}
	_, cfg, err := a.resolveSSOProviderConfig(r.Context(), provider, false)
	if err != nil {
		redirectSSOLoginError(w, r, "SSO provider is unavailable")
		return
	}

	state, err := generateOAuthState()
	if err != nil {
		redirectSSOLoginError(w, r, "Failed to generate SSO state")
		return
	}
	nonce, err := generateOAuthState()
	if err != nil {
		redirectSSOLoginError(w, r, "Failed to generate SSO nonce")
		return
	}
	setSSOStateCookie(w, ssoStatePayload{
		Provider: provider,
		State:    state,
		Nonce:    nonce,
	}, a.cookieSecure)

	redirectURI := resolveServerURL(r) + "/auth/sso/callback/" + provider
	authURL, err := buildSSOAuthURL(cfg, redirectURI, state, nonce)
	if err != nil {
		redirectSSOLoginError(w, r, "Failed to build SSO authorization URL")
		return
	}
	http.Redirect(w, r, authURL, http.StatusTemporaryRedirect)
}

func (a *App) handleSSOCallback(w http.ResponseWriter, r *http.Request) {
	if a.integrationSvc == nil || a.oauthGrantService == nil || a.authService == nil {
		redirectSSOLoginError(w, r, "Enterprise SSO is not configured")
		return
	}

	provider := normalizeSSOProvider(chi.URLParam(r, "provider"))
	if provider == "" {
		redirectSSOLoginError(w, r, "Invalid SSO provider")
		return
	}
	state := strings.TrimSpace(r.URL.Query().Get("state"))
	statePayload, ok := readSSOStateCookiePayload(r)
	if !ok || statePayload.Provider != provider || statePayload.State != state {
		redirectSSOLoginError(w, r, "Invalid SSO state")
		return
	}
	clearSSOStateCookie(w, a.cookieSecure)

	code := strings.TrimSpace(r.URL.Query().Get("code"))
	if code == "" {
		redirectSSOLoginError(w, r, "Missing SSO authorization code")
		return
	}

	_, cfg, err := a.resolveSSOProviderConfig(r.Context(), provider, false)
	if err != nil {
		redirectSSOLoginError(w, r, "SSO provider is unavailable")
		return
	}
	redirectURI := resolveServerURL(r) + "/auth/sso/callback/" + provider
	token, err := exchangeSSOCode(r.Context(), cfg, code, redirectURI)
	if err != nil {
		redirectSSOLoginError(w, r, "Failed to exchange SSO code")
		return
	}

	idTokenClaims, err := verifySSOIDToken(r.Context(), cfg, token.IDToken, statePayload.Nonce)
	if err != nil {
		redirectSSOLoginError(w, r, "Invalid SSO identity token")
		return
	}
	userClaims, err := fetchSSOUserInfo(r.Context(), cfg, token.AccessToken)
	if err != nil && len(idTokenClaims) == 0 {
		redirectSSOLoginError(w, r, "Failed to fetch SSO profile")
		return
	}
	if len(userClaims) == 0 {
		userClaims = idTokenClaims
	}

	externalID := firstNonEmpty(
		claimString(userClaims, cfg.ClaimExternalID, "sub"),
		claimString(idTokenClaims, cfg.ClaimExternalID, "sub"),
	)
	if externalID == "" {
		redirectSSOLoginError(w, r, "SSO profile missing external identity")
		return
	}

	usernameClaim := firstNonEmpty(
		claimString(userClaims, cfg.ClaimUsername, "preferred_username", "username"),
		claimString(idTokenClaims, cfg.ClaimUsername, "preferred_username", "username"),
	)
	emailClaim := firstNonEmpty(
		claimString(userClaims, cfg.ClaimEmail, "email"),
		claimString(idTokenClaims, cfg.ClaimEmail, "email"),
	)
	emailVerified := false
	if verified, ok := claimBool(userClaims, cfg.ClaimEmailVerified, "email_verified"); ok {
		emailVerified = verified
	} else if verified, ok := claimBool(idTokenClaims, cfg.ClaimEmailVerified, "email_verified"); ok {
		emailVerified = verified
	}
	trustedEmailClaim := ""
	if emailVerified {
		trustedEmailClaim = emailClaim
	}
	groupClaims := firstNonEmptyStringSlice(
		claimStringSlice(userClaims, cfg.ClaimGroups, "groups"),
		claimStringSlice(idTokenClaims, cfg.ClaimGroups, "groups"),
	)

	user, err := a.resolveSSOLoginUser(
		r.Context(),
		provider,
		cfg.MappingMode,
		cfg.DefaultUserRole,
		externalID,
		trustedEmailClaim,
		usernameClaim,
	)
	if err != nil {
		redirectSSOLoginError(w, r, "Failed to resolve SSO account mapping")
		return
	}
	if err := a.applySSODefaultOrganizationMembership(r.Context(), user, cfg, provider, trustedEmailClaim, groupClaims); err != nil {
		redirectSSOLoginError(w, r, "Failed to apply SSO organization mapping")
		return
	}

	now := time.Now().UTC()
	expiresAt := now.Add(1 * time.Hour)
	if token.ExpiresIn > 0 {
		expiresAt = now.Add(time.Duration(token.ExpiresIn) * time.Second)
	}
	refreshExpiresAt := now.Add(24 * time.Hour)

	_, err = a.oauthGrantService.UpsertGrant(r.Context(), services.UpsertOAuthGrantInput{
		UserID:           user.ID,
		Provider:         ssoOAuthProvider(provider),
		ExternalUserID:   externalID,
		AccessToken:      strings.TrimSpace(token.AccessToken),
		RefreshToken:     strings.TrimSpace(token.RefreshToken),
		Scope:            strings.TrimSpace(token.Scope),
		ExpiresAt:        expiresAt,
		RefreshExpiresAt: refreshExpiresAt,
	})
	if err != nil {
		if errors.Is(err, services.ErrOAuthExternalIdentityBound) {
			redirectSSOLoginError(w, r, "External SSO account already bound")
			return
		}
		redirectSSOLoginError(w, r, "Failed to persist SSO account mapping")
		return
	}

	if err := a.startUserSession(w, r, user.ID); err != nil {
		redirectSSOLoginError(w, r, "Failed to start local session")
		return
	}

	a.recordAudit(r.Context(), &user, services.RecordAuditInput{
		Action:     "auth_sso_login",
		TargetType: "user",
		TargetID:   user.ID,
		Summary:    "Completed enterprise SSO login",
		Details: auditDetailsJSON(map[string]string{
			"sso_provider": provider,
			"external_id":  externalID,
		}),
	})
	http.Redirect(w, r, "/admin?msg="+url.QueryEscape("Enterprise SSO login completed"), http.StatusSeeOther)
}

func (a *App) resolveSSOProviderConfig(
	ctx context.Context,
	provider string,
	includeDisabled bool,
) (models.IntegrationConnector, ssoConnectorConfig, error) {
	connector, err := a.integrationSvc.GetConnectorByProvider(ctx, provider, includeDisabled)
	if err != nil {
		return models.IntegrationConnector{}, ssoConnectorConfig{}, err
	}
	cfg, err := parseSSOConnectorConfig(connector)
	if err != nil {
		return models.IntegrationConnector{}, ssoConnectorConfig{}, err
	}
	return connector, cfg, nil
}

func (a *App) resolveSSOLoginUser(
	ctx context.Context,
	provider string,
	mappingMode string,
	defaultUserRole models.UserRole,
	externalID string,
	emailClaim string,
	usernameClaim string,
) (models.User, error) {
	if current := currentUserFromContext(ctx); current != nil {
		return *current, nil
	}

	linked, err := a.oauthGrantService.FindUserByExternalID(ctx, ssoOAuthProvider(provider), externalID)
	if err == nil {
		return linked, nil
	}
	if !errors.Is(err, services.ErrOAuthGrantNotFound) {
		return models.User{}, err
	}

	candidates := []string{}
	switch normalizeSSOMappingMode(mappingMode) {
	case ssoMappingExternalEmail:
		candidates = append(candidates, emailClaim)
	case ssoMappingExternalEmailUsername:
		candidates = append(candidates, emailClaim, usernameClaim)
	}
	for _, candidate := range candidates {
		normalized := strings.TrimSpace(strings.ToLower(candidate))
		if normalized == "" {
			continue
		}
		user, userErr := a.authService.GetUserByUsername(ctx, normalized)
		if userErr == nil {
			return user, nil
		}
		if !errors.Is(userErr, services.ErrUserNotFound) {
			return models.User{}, userErr
		}
	}

	preferred := firstNonEmpty(usernameClaim, emailClaim, externalID)
	return a.authService.CreateOAuthUser(ctx, preferred, normalizeSSODefaultUserRole(string(defaultUserRole)))
}
