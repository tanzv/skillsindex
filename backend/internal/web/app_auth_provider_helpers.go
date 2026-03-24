package web

import (
	"context"
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
	if a.sessionStarter != nil {
		return a.sessionStarter(w, r, userID)
	}
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
	runtimeState := a.loadAuthProviderRuntimeState(ctx)

	options := make([]AuthProviderOption, 0, len(authProviderOrder))
	for _, key := range authProviderOrder {
		definition, ok := authProviderDefinitionFor(key)
		if !ok {
			continue
		}

		option := AuthProviderOption{
			Key:           key,
			LabelKey:      definition.LabelKey,
			ShortLabelKey: definition.ShortLabelKey,
			IconPath:      definition.IconPath,
			Enabled:       enabledSet[key],
		}
		if state, exists := runtimeState[key]; exists {
			option.Available = state.Available
			option.URL = state.StartPath
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

type authProviderRuntimeState struct {
	Available bool
	StartPath string
}

func (a *App) loadAuthProviderRuntimeState(ctx context.Context) map[string]authProviderRuntimeState {
	state := make(map[string]authProviderRuntimeState)
	if a.integrationSvc == nil {
		if a.dingTalkService != nil && a.dingTalkService.Enabled() {
			state["dingtalk"] = authProviderRuntimeState{
				Available: true,
				StartPath: "/auth/dingtalk/start",
			}
		}
		return state
	}
	connectors, err := a.integrationSvc.ListConnectors(ctx, services.ListConnectorsInput{
		IncludeDisabled: false,
		Limit:           240,
	})
	if err != nil {
		return state
	}
	for _, connector := range connectors {
		key := strings.ToLower(strings.TrimSpace(connector.Provider))
		if key == "" {
			continue
		}
		if _, supported := authProviderDefinitionFor(key); !supported {
			continue
		}
		if _, exists := state[key]; exists {
			continue
		}
		if !connectorSupportsManagedAuth(connector) {
			continue
		}
		state[key] = authProviderRuntimeState{
			Available: true,
			StartPath: "/auth/sso/start/" + key,
		}
	}
	if _, exists := state["dingtalk"]; !exists && a.dingTalkService != nil && a.dingTalkService.Enabled() {
		state["dingtalk"] = authProviderRuntimeState{
			Available: true,
			StartPath: "/auth/dingtalk/start",
		}
	}
	return state
}

func connectorSupportsManagedAuth(connector models.IntegrationConnector) bool {
	if _, supported := authProviderDefinitionFor(strings.ToLower(strings.TrimSpace(connector.Provider))); !supported {
		return false
	}
	_, err := parseSSOConnectorConfig(connector)
	return err == nil
}

func normalizeAuthProviderList(values []string) []string {
	seen := make(map[string]struct{})
	for _, raw := range values {
		for _, segment := range strings.Split(raw, ",") {
			key := strings.ToLower(strings.TrimSpace(segment))
			if _, supported := authProviderDefinitionFor(key); !supported {
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

func (a *App) setEnabledAuthProvider(ctx context.Context, provider string, enabled bool) ([]string, error) {
	if a.settingsService == nil {
		return nil, fmt.Errorf("settings service unavailable")
	}

	normalizedProvider := strings.ToLower(strings.TrimSpace(provider))
	if _, supported := authProviderDefinitionFor(normalizedProvider); !supported {
		return nil, fmt.Errorf("unsupported auth provider")
	}

	raw, err := a.settingsService.Get(ctx, services.SettingAuthEnabledProviders, "")
	if err != nil {
		return nil, err
	}

	current := normalizeAuthProviderList([]string{raw})
	next := make([]string, 0, len(current)+1)
	seen := map[string]struct{}{}
	if enabled {
		current = append(current, normalizedProvider)
	}
	for _, key := range current {
		if key == normalizedProvider && !enabled {
			continue
		}
		if _, exists := seen[key]; exists {
			continue
		}
		seen[key] = struct{}{}
		next = append(next, key)
	}
	next = normalizeAuthProviderList(next)
	if err := a.settingsService.Set(ctx, services.SettingAuthEnabledProviders, strings.Join(next, ",")); err != nil {
		return nil, err
	}
	return next, nil
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
