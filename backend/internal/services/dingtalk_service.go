package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

// DingTalkConfig stores DingTalk OAuth integration parameters.
type DingTalkConfig struct {
	ClientID     string
	ClientSecret string
	RedirectURL  string
	Scope        string
	AuthBaseURL  string
	APIBaseURL   string
	HTTPTimeout  time.Duration
	Prompt       string
}

// DingTalkToken stores token payload returned by DingTalk OAuth.
type DingTalkToken struct {
	AccessToken          string
	RefreshToken         string
	TokenType            string
	Scope                string
	ExpiresInSeconds     int64
	RefreshExpiresInSecs int64
}

// DingTalkUser stores current DingTalk user profile.
type DingTalkUser struct {
	OpenID      string
	UnionID     string
	DisplayName string
	AvatarURL   string
}

// DingTalkService handles OAuth and profile fetch.
type DingTalkService struct {
	config DingTalkConfig
	client *http.Client
}

// NewDingTalkService creates DingTalk service instance.
func NewDingTalkService(cfg DingTalkConfig) *DingTalkService {
	timeout := cfg.HTTPTimeout
	if timeout <= 0 {
		timeout = 10 * time.Second
	}
	cfg.AuthBaseURL = defaultString(strings.TrimSpace(cfg.AuthBaseURL), "https://login.dingtalk.com/oauth2/auth")
	cfg.APIBaseURL = strings.TrimRight(defaultString(strings.TrimSpace(cfg.APIBaseURL), "https://api.dingtalk.com"), "/")
	cfg.Scope = defaultString(strings.TrimSpace(cfg.Scope), "openid")
	cfg.Prompt = defaultString(strings.TrimSpace(cfg.Prompt), "consent")

	return &DingTalkService{
		config: cfg,
		client: &http.Client{Timeout: timeout},
	}
}

// Enabled reports whether OAuth config is complete.
func (s *DingTalkService) Enabled() bool {
	return strings.TrimSpace(s.config.ClientID) != "" &&
		strings.TrimSpace(s.config.ClientSecret) != "" &&
		strings.TrimSpace(s.config.RedirectURL) != ""
}

// BuildAuthURL generates browser redirect URL for DingTalk OAuth.
func (s *DingTalkService) BuildAuthURL(state string) (string, error) {
	if !s.Enabled() {
		return "", fmt.Errorf("dingtalk oauth is not configured")
	}

	base, err := url.Parse(s.config.AuthBaseURL)
	if err != nil {
		return "", fmt.Errorf("invalid dingtalk auth base url: %w", err)
	}
	query := base.Query()
	query.Set("client_id", s.config.ClientID)
	query.Set("redirect_uri", s.config.RedirectURL)
	query.Set("response_type", "code")
	query.Set("scope", s.config.Scope)
	query.Set("state", state)
	query.Set("prompt", s.config.Prompt)
	base.RawQuery = query.Encode()
	return base.String(), nil
}

// ExchangeCode exchanges authorization code for access token.
func (s *DingTalkService) ExchangeCode(ctx context.Context, code string) (DingTalkToken, error) {
	code = strings.TrimSpace(code)
	if code == "" {
		return DingTalkToken{}, fmt.Errorf("authorization code is required")
	}
	if !s.Enabled() {
		return DingTalkToken{}, fmt.Errorf("dingtalk oauth is not configured")
	}

	payload := map[string]any{
		"clientId":     s.config.ClientID,
		"clientSecret": s.config.ClientSecret,
		"code":         code,
		"grantType":    "authorization_code",
	}
	var raw map[string]any
	if err := s.postJSON(ctx, "/v1.0/oauth2/userAccessToken", payload, nil, &raw); err != nil {
		return DingTalkToken{}, err
	}
	return parseDingTalkToken(raw)
}

// GetCurrentUser fetches current user profile by user access token.
func (s *DingTalkService) GetCurrentUser(ctx context.Context, accessToken string) (DingTalkUser, error) {
	accessToken = strings.TrimSpace(accessToken)
	if accessToken == "" {
		return DingTalkUser{}, fmt.Errorf("access token is required")
	}

	headers := map[string]string{
		"x-acs-dingtalk-access-token": accessToken,
	}
	var raw map[string]any
	if err := s.getJSON(ctx, "/v1.0/contact/users/me", headers, &raw); err != nil {
		return DingTalkUser{}, err
	}

	return DingTalkUser{
		OpenID:      firstNonEmpty(mapGetString(raw, "openId"), mapGetString(raw, "open_id")),
		UnionID:     firstNonEmpty(mapGetString(raw, "unionId"), mapGetString(raw, "union_id")),
		DisplayName: firstNonEmpty(mapGetString(raw, "nick"), mapGetString(raw, "name")),
		AvatarURL:   firstNonEmpty(mapGetString(raw, "avatarUrl"), mapGetString(raw, "avatar_url")),
	}, nil
}

func (s *DingTalkService) postJSON(
	ctx context.Context,
	path string,
	payload any,
	headers map[string]string,
	target any,
) error {
	endpoint := strings.TrimRight(s.config.APIBaseURL, "/") + path
	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal dingtalk request payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("failed to create dingtalk request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	for key, value := range headers {
		if strings.TrimSpace(key) == "" {
			continue
		}
		req.Header.Set(key, value)
	}

	resp, err := s.client.Do(req)
	if err != nil {
		return fmt.Errorf("dingtalk request failed: %w", err)
	}
	defer resp.Body.Close()

	return decodeDingTalkResponse(resp, target)
}

func (s *DingTalkService) getJSON(
	ctx context.Context,
	path string,
	headers map[string]string,
	target any,
) error {
	endpoint := strings.TrimRight(s.config.APIBaseURL, "/") + path
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return fmt.Errorf("failed to create dingtalk request: %w", err)
	}
	for key, value := range headers {
		if strings.TrimSpace(key) == "" {
			continue
		}
		req.Header.Set(key, value)
	}

	resp, err := s.client.Do(req)
	if err != nil {
		return fmt.Errorf("dingtalk request failed: %w", err)
	}
	defer resp.Body.Close()

	return decodeDingTalkResponse(resp, target)
}

func decodeDingTalkResponse(resp *http.Response, target any) error {
	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read dingtalk response body: %w", err)
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("dingtalk api returned status %d: %s", resp.StatusCode, strings.TrimSpace(string(raw)))
	}

	if err := json.Unmarshal(raw, target); err != nil {
		return fmt.Errorf("failed to decode dingtalk response: %w", err)
	}
	return nil
}

func parseDingTalkToken(raw map[string]any) (DingTalkToken, error) {
	accessToken := firstNonEmpty(mapGetString(raw, "accessToken"), mapGetString(raw, "access_token"))
	if accessToken == "" {
		return DingTalkToken{}, fmt.Errorf("missing access token in dingtalk response")
	}
	return DingTalkToken{
		AccessToken:          accessToken,
		RefreshToken:         firstNonEmpty(mapGetString(raw, "refreshToken"), mapGetString(raw, "refresh_token")),
		TokenType:            firstNonEmpty(mapGetString(raw, "tokenType"), mapGetString(raw, "token_type")),
		Scope:                mapGetString(raw, "scope"),
		ExpiresInSeconds:     mapGetInt64(raw, "expireIn", "expiresIn", "expires_in"),
		RefreshExpiresInSecs: mapGetInt64(raw, "refreshTokenExpireIn", "refresh_token_expires_in"),
	}, nil
}

func mapGetString(raw map[string]any, key string) string {
	value, ok := raw[key]
	if !ok || value == nil {
		return ""
	}
	switch typed := value.(type) {
	case string:
		return strings.TrimSpace(typed)
	case fmt.Stringer:
		return strings.TrimSpace(typed.String())
	default:
		return strings.TrimSpace(fmt.Sprintf("%v", typed))
	}
}

func mapGetInt64(raw map[string]any, keys ...string) int64 {
	for _, key := range keys {
		value, ok := raw[key]
		if !ok || value == nil {
			continue
		}
		switch typed := value.(type) {
		case float64:
			return int64(typed)
		case float32:
			return int64(typed)
		case int:
			return int64(typed)
		case int64:
			return typed
		case int32:
			return int64(typed)
		case string:
			parsed, err := strconv.ParseInt(strings.TrimSpace(typed), 10, 64)
			if err == nil {
				return parsed
			}
		}
	}
	return 0
}

func defaultString(value string, fallback string) string {
	if strings.TrimSpace(value) == "" {
		return fallback
	}
	return value
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		clean := strings.TrimSpace(value)
		if clean != "" {
			return clean
		}
	}
	return ""
}
