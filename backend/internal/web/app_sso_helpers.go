package web

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"skillsindex/internal/models"
)

func parseSSOConnectorConfig(connector models.IntegrationConnector) (ssoConnectorConfig, error) {
	cfg := ssoConnectorConfig{
		Protocol:             "oidc",
		Scope:                "openid profile email",
		ClaimExternalID:      "sub",
		ClaimUsername:        "preferred_username",
		ClaimEmail:           "email",
		ClaimEmailVerified:   "email_verified",
		ClaimGroups:          "groups",
		OffboardingMode:      ssoOffboardingDisableOnly,
		MappingMode:          ssoMappingExternalEmailUsername,
		DefaultOrgRole:       models.OrganizationRoleMember,
		DefaultOrgDomains:    []string{},
		DefaultOrgGroupRules: []ssoOrgGroupRule{},
		DefaultUserRole:      models.RoleMember,
	}

	payload := make(map[string]any)
	if raw := strings.TrimSpace(connector.ConfigJSON); raw != "" {
		if err := json.Unmarshal([]byte(raw), &payload); err != nil {
			return ssoConnectorConfig{}, fmt.Errorf("failed to parse sso provider config: %w", err)
		}
	}

	cfg.Protocol = defaultString(strings.ToLower(strings.TrimSpace(readStringKey(payload, "protocol"))), "oidc")
	cfg.Issuer = strings.TrimSpace(firstNonEmpty(readStringKey(payload, "issuer"), connector.BaseURL))
	cfg.AuthorizationURL = normalizeAuthProviderURL(firstNonEmpty(
		readStringKey(payload, "authorization_url"),
		readStringKey(payload, "auth_url"),
	))
	cfg.TokenURL = normalizeAuthProviderURL(readStringKey(payload, "token_url"))
	cfg.UserInfoURL = normalizeAuthProviderURL(readStringKey(payload, "userinfo_url"))
	cfg.ClientID = strings.TrimSpace(readStringKey(payload, "client_id"))
	cfg.ClientSecret = strings.TrimSpace(readStringKey(payload, "client_secret"))
	cfg.Scope = defaultString(strings.TrimSpace(readStringKey(payload, "scope")), "openid profile email")
	cfg.ClaimExternalID = defaultString(strings.TrimSpace(readStringKey(payload, "claim_external_id")), "sub")
	cfg.ClaimUsername = defaultString(strings.TrimSpace(readStringKey(payload, "claim_username")), "preferred_username")
	cfg.ClaimEmail = defaultString(strings.TrimSpace(readStringKey(payload, "claim_email")), "email")
	cfg.ClaimEmailVerified = normalizeSSOClaimEmailVerified(readStringKey(payload, "claim_email_verified"))
	cfg.ClaimGroups = normalizeSSOClaimGroups(readStringKey(payload, "claim_groups"))
	cfg.OffboardingMode = normalizeSSOOffboardingMode(readStringKey(payload, "offboarding_mode"))
	cfg.MappingMode = normalizeSSOMappingMode(readStringKey(payload, "mapping_mode"))
	cfg.DefaultOrgID = normalizeSSODefaultOrganizationID(readStringKey(payload, "default_org_id"))
	cfg.DefaultOrgRole = normalizeSSODefaultOrganizationRole(readStringKey(payload, "default_org_role"))
	cfg.DefaultOrgDomains = normalizeSSODefaultOrganizationEmailDomains(readStringKey(payload, "default_org_email_domains"))
	cfg.DefaultOrgGroupRules = normalizeSSODefaultOrganizationGroupRules(readStringKey(payload, "default_org_group_rules"))
	cfg.DefaultUserRole = normalizeSSODefaultUserRole(readStringKey(payload, "default_user_role"))

	if cfg.Protocol != "oidc" {
		return ssoConnectorConfig{}, fmt.Errorf("unsupported sso protocol")
	}
	if cfg.AuthorizationURL == "" || cfg.TokenURL == "" || cfg.ClientID == "" || cfg.ClientSecret == "" {
		return ssoConnectorConfig{}, fmt.Errorf("incomplete sso provider config")
	}
	return cfg, nil
}

func buildSSOAuthURL(cfg ssoConnectorConfig, redirectURI string, state string, nonce string) (string, error) {
	parsed, err := url.Parse(cfg.AuthorizationURL)
	if err != nil {
		return "", err
	}
	values := parsed.Query()
	values.Set("response_type", "code")
	values.Set("client_id", cfg.ClientID)
	values.Set("redirect_uri", redirectURI)
	values.Set("scope", defaultString(strings.TrimSpace(cfg.Scope), "openid profile email"))
	values.Set("state", state)
	values.Set("nonce", nonce)
	parsed.RawQuery = values.Encode()
	return parsed.String(), nil
}

func exchangeSSOCode(ctx context.Context, cfg ssoConnectorConfig, code string, redirectURI string) (ssoTokenResponse, error) {
	form := url.Values{}
	form.Set("grant_type", "authorization_code")
	form.Set("code", code)
	form.Set("redirect_uri", redirectURI)
	form.Set("client_id", cfg.ClientID)
	form.Set("client_secret", cfg.ClientSecret)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, cfg.TokenURL, strings.NewReader(form.Encode()))
	if err != nil {
		return ssoTokenResponse{}, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return ssoTokenResponse{}, err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return ssoTokenResponse{}, fmt.Errorf("token endpoint status=%d", resp.StatusCode)
	}

	var token ssoTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&token); err != nil {
		return ssoTokenResponse{}, err
	}
	if strings.TrimSpace(token.AccessToken) == "" && strings.TrimSpace(token.IDToken) == "" {
		return ssoTokenResponse{}, fmt.Errorf("token response missing access token")
	}
	return token, nil
}

func fetchSSOUserInfo(ctx context.Context, cfg ssoConnectorConfig, accessToken string) (map[string]any, error) {
	if strings.TrimSpace(cfg.UserInfoURL) == "" || strings.TrimSpace(accessToken) == "" {
		return map[string]any{}, nil
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, cfg.UserInfoURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+strings.TrimSpace(accessToken))

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("userinfo endpoint status=%d", resp.StatusCode)
	}

	payload := make(map[string]any)
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return nil, err
	}
	return payload, nil
}

func claimString(payload map[string]any, keys ...string) string {
	if len(payload) == 0 {
		return ""
	}
	for _, key := range keys {
		normalized := strings.TrimSpace(key)
		if normalized == "" {
			continue
		}
		raw, exists := payload[normalized]
		if !exists {
			continue
		}
		switch value := raw.(type) {
		case string:
			clean := strings.TrimSpace(value)
			if clean != "" {
				return clean
			}
		case fmt.Stringer:
			clean := strings.TrimSpace(value.String())
			if clean != "" {
				return clean
			}
		}
	}
	return ""
}

func claimStringSlice(payload map[string]any, keys ...string) []string {
	if len(payload) == 0 {
		return []string{}
	}
	for _, key := range keys {
		normalized := strings.TrimSpace(key)
		if normalized == "" {
			continue
		}
		raw, exists := payload[normalized]
		if !exists {
			continue
		}
		values := normalizeSSOClaimStringSliceValue(raw)
		if len(values) > 0 {
			return values
		}
	}
	return []string{}
}

func normalizeSSOClaimStringSliceValue(raw any) []string {
	seen := map[string]struct{}{}
	items := []string{}
	appendValue := func(value string) {
		clean := strings.TrimSpace(value)
		if clean == "" {
			return
		}
		if _, exists := seen[clean]; exists {
			return
		}
		seen[clean] = struct{}{}
		items = append(items, clean)
	}

	switch value := raw.(type) {
	case string:
		for _, item := range parseSSOExternalIDList(value) {
			appendValue(item)
		}
	case []string:
		for _, item := range value {
			appendValue(item)
		}
	case []any:
		for _, item := range value {
			switch casted := item.(type) {
			case string:
				appendValue(casted)
			case fmt.Stringer:
				appendValue(casted.String())
			}
		}
	}
	return items
}

func firstNonEmptyStringSlice(candidates ...[]string) []string {
	for _, candidate := range candidates {
		if len(candidate) > 0 {
			return candidate
		}
	}
	return []string{}
}

func readStringKey(payload map[string]any, key string) string {
	return claimString(payload, key)
}

func parseSSOExternalIDList(raw string) []string {
	normalized := strings.ReplaceAll(raw, "\n", ",")
	normalized = strings.ReplaceAll(normalized, "\r", ",")
	segments := strings.Split(normalized, ",")
	seen := make(map[string]struct{})
	items := make([]string, 0, len(segments))
	for _, segment := range segments {
		value := strings.TrimSpace(segment)
		if value == "" {
			continue
		}
		if _, exists := seen[value]; exists {
			continue
		}
		seen[value] = struct{}{}
		items = append(items, value)
	}
	return items
}

func normalizeSSOProvider(raw string) string {
	input := strings.ToLower(strings.TrimSpace(raw))
	var b strings.Builder
	for _, r := range input {
		isLetter := r >= 'a' && r <= 'z'
		isNumber := r >= '0' && r <= '9'
		if isLetter || isNumber || r == '-' || r == '_' || r == '.' {
			b.WriteRune(r)
		}
	}
	return strings.Trim(b.String(), "-_.")
}

func ssoOAuthProvider(provider string) models.OAuthProvider {
	return models.OAuthProvider("sso:" + normalizeSSOProvider(provider))
}

func setSSOStateCookie(w http.ResponseWriter, payload ssoStatePayload, secure bool) {
	raw := strings.Join([]string{
		strings.TrimSpace(payload.Provider),
		strings.TrimSpace(payload.State),
		strings.TrimSpace(payload.Nonce),
	}, "|")
	token := base64.RawURLEncoding.EncodeToString([]byte(raw))
	http.SetCookie(w, &http.Cookie{
		Name:     ssoStateCookieName,
		Value:    token,
		Path:     "/",
		MaxAge:   300,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   secure,
	})
}

func validateSSOStateCookie(r *http.Request, provider string, state string) bool {
	payload, ok := readSSOStateCookiePayload(r)
	if !ok {
		return false
	}
	return payload.Provider == normalizeSSOProvider(provider) &&
		payload.State == strings.TrimSpace(state)
}

func readSSOStateCookiePayload(r *http.Request) (ssoStatePayload, bool) {
	cookie, err := r.Cookie(ssoStateCookieName)
	if err != nil {
		return ssoStatePayload{}, false
	}
	decoded, err := base64.RawURLEncoding.DecodeString(strings.TrimSpace(cookie.Value))
	if err != nil {
		return ssoStatePayload{}, false
	}
	parts := strings.Split(string(decoded), "|")
	if len(parts) != 3 {
		return ssoStatePayload{}, false
	}
	payload := ssoStatePayload{
		Provider: normalizeSSOProvider(parts[0]),
		State:    strings.TrimSpace(parts[1]),
		Nonce:    strings.TrimSpace(parts[2]),
	}
	if payload.Provider == "" || payload.State == "" || payload.Nonce == "" {
		return ssoStatePayload{}, false
	}
	return payload, true
}

func clearSSOStateCookie(w http.ResponseWriter, secure bool) {
	http.SetCookie(w, &http.Cookie{
		Name:     ssoStateCookieName,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   secure,
	})
}

func redirectSSOLoginError(w http.ResponseWriter, r *http.Request, message string) {
	http.Redirect(w, r, "/login?err="+url.QueryEscape(message), http.StatusSeeOther)
}
