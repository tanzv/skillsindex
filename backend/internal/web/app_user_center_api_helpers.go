package web

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

type apiUserCenterSyncInput struct {
	Provider             string                  `json:"provider"`
	Mode                 string                  `json:"mode"`
	ForceSignOutDisabled *bool                   `json:"force_sign_out_disabled"`
	Users                []apiUserCenterSyncUser `json:"users"`
}

type apiUserCenterSyncUser struct {
	ExternalUserID string   `json:"external_user_id"`
	Username       string   `json:"username"`
	DisplayName    string   `json:"display_name"`
	AvatarURL      string   `json:"avatar_url"`
	Role           string   `json:"role"`
	Status         string   `json:"status"`
	Permissions    []string `json:"permissions"`
}

type apiUserCenterPermissionUpdateInput struct {
	Permissions []string `json:"permissions"`
}

type apiUserCenterBindingItem struct {
	Provider       string    `json:"provider"`
	ExternalUserID string    `json:"external_user_id"`
	ExpiresAt      time.Time `json:"expires_at"`
}

type apiUserCenterAccountItem struct {
	ID            uint                       `json:"id"`
	Username      string                     `json:"username"`
	DisplayName   string                     `json:"display_name"`
	AvatarURL     string                     `json:"avatar_url"`
	Role          string                     `json:"role"`
	Status        string                     `json:"status"`
	Permissions   []string                   `json:"permissions"`
	BindingSource string                     `json:"permission_source"`
	Bindings      []apiUserCenterBindingItem `json:"bindings"`
	CreatedAt     time.Time                  `json:"created_at"`
	UpdatedAt     time.Time                  `json:"updated_at"`
}

func (a *App) requireUserCenterPermission(w http.ResponseWriter, r *http.Request, permission string) (*models.User, bool) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return nil, false
	}
	allowed, err := a.hasUserCenterPermission(r.Context(), *user, permission)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "permission_query_failed", "message": err.Error()})
		return nil, false
	}
	if !allowed {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return nil, false
	}
	return user, true
}

func (a *App) resolveUserCenterSyncTarget(
	ctx context.Context,
	provider models.OAuthProvider,
	externalUserID string,
	preferredUsername string,
	role models.UserRole,
) (models.User, bool, error) {
	mappedUser, err := a.oauthGrantService.FindUserByExternalID(ctx, provider, externalUserID)
	if err == nil {
		return mappedUser, false, nil
	}
	if err != nil && !errors.Is(err, services.ErrOAuthGrantNotFound) {
		return models.User{}, false, err
	}

	userByUsername, queryErr := a.authService.GetUserByUsername(ctx, preferredUsername)
	if queryErr == nil {
		return userByUsername, false, nil
	}
	if queryErr != nil && !errors.Is(queryErr, services.ErrUserNotFound) {
		return models.User{}, false, queryErr
	}

	created, createErr := a.authService.CreateOAuthUser(ctx, preferredUsername, role)
	if createErr != nil {
		return models.User{}, false, createErr
	}
	return created, true, nil
}

func readAPIUserCenterSyncInput(r *http.Request) (apiUserCenterSyncInput, error) {
	input := apiUserCenterSyncInput{}
	contentType := strings.ToLower(strings.TrimSpace(r.Header.Get("Content-Type")))
	if strings.Contains(contentType, "application/json") {
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&input); err != nil {
			return input, fmt.Errorf("invalid json payload: %w", err)
		}
		return input, nil
	}
	if err := r.ParseForm(); err != nil {
		return input, fmt.Errorf("invalid form payload: %w", err)
	}
	input.Provider = strings.TrimSpace(r.FormValue("provider"))
	input.Mode = strings.TrimSpace(r.FormValue("mode"))
	if raw := strings.TrimSpace(r.FormValue("force_sign_out_disabled")); raw != "" {
		value := parseBoolFlag(raw, false)
		input.ForceSignOutDisabled = &value
	}
	usersRaw := strings.TrimSpace(r.FormValue("users"))
	if usersRaw != "" {
		if err := json.Unmarshal([]byte(usersRaw), &input.Users); err != nil {
			return input, fmt.Errorf("invalid users payload")
		}
	}
	return input, nil
}

func readAPIUserCenterPermissionUpdateInput(r *http.Request) (apiUserCenterPermissionUpdateInput, error) {
	input := apiUserCenterPermissionUpdateInput{}
	contentType := strings.ToLower(strings.TrimSpace(r.Header.Get("Content-Type")))
	if strings.Contains(contentType, "application/json") {
		var payload struct {
			Permissions json.RawMessage `json:"permissions"`
		}
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&payload); err != nil {
			return input, fmt.Errorf("invalid json payload: %w", err)
		}
		permissions, err := decodeUserCenterPermissionValues(payload.Permissions)
		if err != nil {
			return input, err
		}
		input.Permissions = permissions
		return input, nil
	}
	if err := r.ParseForm(); err != nil {
		return input, fmt.Errorf("invalid form payload: %w", err)
	}
	if values, exists := r.Form["permissions"]; exists {
		for _, value := range values {
			for _, item := range strings.Split(value, ",") {
				clean := strings.TrimSpace(item)
				if clean == "" {
					continue
				}
				input.Permissions = append(input.Permissions, clean)
			}
		}
	}
	return input, nil
}

func decodeUserCenterPermissionValues(raw json.RawMessage) ([]string, error) {
	clean := strings.TrimSpace(string(raw))
	if clean == "" || clean == "null" {
		return []string{}, nil
	}
	if strings.HasPrefix(clean, "[") {
		var items []string
		if err := json.Unmarshal(raw, &items); err != nil {
			return nil, fmt.Errorf("invalid permissions")
		}
		return items, nil
	}
	var single string
	if err := json.Unmarshal(raw, &single); err != nil {
		return nil, fmt.Errorf("invalid permissions")
	}
	if strings.TrimSpace(single) == "" {
		return []string{}, nil
	}
	values := []string{}
	for _, item := range strings.Split(single, ",") {
		cleanItem := strings.TrimSpace(item)
		if cleanItem == "" {
			continue
		}
		values = append(values, cleanItem)
	}
	return values, nil
}

func normalizeUserCenterSyncProvider(raw string) (string, models.OAuthProvider, bool) {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "feishu", "lark":
		return "feishu", models.OAuthProviderFeishuSync, true
	case "dingtalk", "dingtalk_sync", "ding_talk":
		return "dingtalk", models.OAuthProviderDingTalkSync, true
	default:
		return "", "", false
	}
}

func normalizeUserCenterSyncMode(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "full":
		return "full"
	default:
		return "incremental"
	}
}

func buildUserCenterSyncUsername(provider string, displayName string, externalUserID string) string {
	candidate := sanitizeUsername(displayName)
	if len(candidate) >= 3 {
		return candidate
	}
	external := sanitizeUsername(externalUserID)
	if len(external) >= 3 {
		prefix := "user"
		if provider == "feishu" {
			prefix = "fs"
		}
		if provider == "dingtalk" {
			prefix = "dd"
		}
		return prefix + "_" + external
	}
	if provider == "feishu" {
		return "fs_user"
	}
	if provider == "dingtalk" {
		return "dd_user"
	}
	return "sync_user"
}

func buildUserCenterSyncGrantToken(provider string, externalUserID string) string {
	cleanProvider := strings.ToLower(strings.TrimSpace(provider))
	cleanExternalID := strings.TrimSpace(externalUserID)
	if cleanProvider == "" {
		cleanProvider = "provider"
	}
	if cleanExternalID == "" {
		cleanExternalID = strconv.FormatInt(time.Now().UTC().UnixNano(), 10)
	}
	return fmt.Sprintf("user-center-sync:%s:%s", cleanProvider, cleanExternalID)
}

func userCenterProviderLabel(provider models.OAuthProvider) string {
	switch strings.ToLower(strings.TrimSpace(string(provider))) {
	case string(models.OAuthProviderFeishuSync):
		return "feishu"
	case string(models.OAuthProviderDingTalkSync):
		return "dingtalk"
	default:
		return ""
	}
}
