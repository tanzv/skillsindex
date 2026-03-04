package web

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) registrationEnabled(ctx context.Context) bool {
	if a.settingsService == nil {
		return a.allowRegistration
	}
	enabled, err := a.settingsService.GetBool(ctx, services.SettingAllowRegistration, a.allowRegistration)
	if err != nil {
		return a.allowRegistration
	}
	return enabled
}

func (a *App) startUserSession(w http.ResponseWriter, r *http.Request, userID uint) error {
	if a.sessionService == nil {
		return fmt.Errorf("session service unavailable")
	}
	issued, err := a.sessionService.SetLoginWithMeta(w, userID)
	if err != nil {
		return err
	}
	if a.userSessionSvc != nil && strings.TrimSpace(issued.SessionID) != "" {
		_, _ = a.userSessionSvc.CreateSession(r.Context(), services.CreateUserSessionInput{
			UserID:     userID,
			SessionID:  issued.SessionID,
			UserAgent:  strings.TrimSpace(r.UserAgent()),
			IssuedIP:   clientIPFromRequest(r),
			ExpiresAt:  issued.ExpiresAt,
			LastSeenAt: issued.IssuedAt,
		})
	}
	return nil
}

func (a *App) buildAuthProviders(ctx context.Context, onlyEnabled bool) []AuthProviderOption {
	enabledSet := a.loadEnabledAuthProviderSet(ctx)
	connectorURLs := a.loadAuthProviderURLs(ctx)

	options := make([]AuthProviderOption, 0, len(authProviderOrder))
	for _, key := range authProviderOrder {
		labelKey, hasLabel := authProviderLabelKeys[key]
		if !hasLabel {
			continue
		}

		option := AuthProviderOption{
			Key:           key,
			LabelKey:      labelKey,
			ShortLabelKey: authProviderShortLabelKeys[key],
			IconPath:      authProviderIconPaths[key],
			Enabled:       enabledSet[key],
		}
		switch key {
		case "dingtalk":
			option.Available = a.dingTalkService != nil && a.dingTalkService.Enabled()
			if option.Available {
				option.URL = "/auth/dingtalk/start"
			}
		default:
			if authURL := connectorURLs[key]; authURL != "" {
				option.Available = true
				option.URL = authURL
			}
		}

		if onlyEnabled && !option.Enabled {
			continue
		}
		options = append(options, option)
	}

	return options
}

func (a *App) loadEnabledAuthProviderSet(ctx context.Context) map[string]bool {
	defaultValue := strings.Join(authProviderOrder, ",")
	raw := defaultValue
	if a.settingsService != nil {
		if value, err := a.settingsService.Ensure(ctx, services.SettingAuthEnabledProviders, defaultValue); err == nil {
			raw = value
		}
	}
	keys := normalizeAuthProviderList([]string{raw})
	enabled := make(map[string]bool, len(keys))
	for _, key := range keys {
		enabled[key] = true
	}
	return enabled
}

func (a *App) loadAuthProviderURLs(ctx context.Context) map[string]string {
	urls := make(map[string]string)
	if a.integrationSvc == nil {
		return urls
	}
	connectors, err := a.integrationSvc.ListConnectors(ctx, services.ListConnectorsInput{
		IncludeDisabled: false,
		Limit:           240,
	})
	if err != nil {
		return urls
	}
	for _, connector := range connectors {
		key := strings.ToLower(strings.TrimSpace(connector.Provider))
		if key == "" || key == "dingtalk" {
			continue
		}
		if _, supported := authProviderLabelKeys[key]; !supported {
			continue
		}
		if _, exists := urls[key]; exists {
			continue
		}
		if authURL := authURLFromConnector(connector); authURL != "" {
			urls[key] = authURL
		}
	}
	return urls
}

func normalizeAuthProviderList(values []string) []string {
	seen := make(map[string]struct{})
	for _, raw := range values {
		for _, segment := range strings.Split(raw, ",") {
			key := strings.ToLower(strings.TrimSpace(segment))
			if _, supported := authProviderLabelKeys[key]; !supported {
				continue
			}
			seen[key] = struct{}{}
		}
	}

	ordered := make([]string, 0, len(seen))
	for _, key := range authProviderOrder {
		if _, ok := seen[key]; ok {
			ordered = append(ordered, key)
		}
	}
	return ordered
}

func authURLFromConnector(connector models.IntegrationConnector) string {
	rawConfig := strings.TrimSpace(connector.ConfigJSON)
	if rawConfig != "" {
		payload := make(map[string]any)
		if err := json.Unmarshal([]byte(rawConfig), &payload); err == nil {
			candidateKeys := []string{"auth_url", "authorization_url", "oauth_url", "login_url", "start_url"}
			for _, key := range candidateKeys {
				if value, ok := payload[key].(string); ok {
					if normalized := normalizeAuthProviderURL(value); normalized != "" {
						return normalized
					}
				}
			}
		}
	}
	return normalizeAuthProviderURL(connector.BaseURL)
}

func normalizeAuthProviderURL(raw string) string {
	clean := strings.TrimSpace(raw)
	if clean == "" {
		return ""
	}
	if !strings.HasPrefix(clean, "http://") && !strings.HasPrefix(clean, "https://") {
		clean = "https://" + clean
	}
	parsed, err := url.Parse(clean)
	if err != nil {
		return ""
	}
	if strings.TrimSpace(parsed.Host) == "" {
		return ""
	}
	parsed.RawQuery = ""
	parsed.Fragment = ""
	return strings.TrimRight(parsed.String(), "/")
}
