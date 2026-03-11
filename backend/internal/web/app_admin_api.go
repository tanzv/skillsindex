package web

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"github.com/go-chi/chi/v5"
)

type apiAdminSkillItem struct {
	apiSkillResponse
	OwnerID        uint       `json:"owner_id"`
	OwnerUsername  string     `json:"owner_username"`
	Visibility     string     `json:"visibility"`
	OrganizationID *uint      `json:"organization_id,omitempty"`
	CreatedAt      time.Time  `json:"created_at"`
	LastSyncedAt   *time.Time `json:"last_synced_at,omitempty"`
}

type apiAdminOverviewResponse struct {
	User struct {
		ID       uint   `json:"id"`
		Username string `json:"username"`
		Role     string `json:"role"`
	} `json:"user"`
	Counts struct {
		Total        int64 `json:"total"`
		Public       int64 `json:"public"`
		Private      int64 `json:"private"`
		Syncable     int64 `json:"syncable"`
		OrgCount     int   `json:"org_count"`
		AccountCount int   `json:"account_count,omitempty"`
	} `json:"counts"`
	Capabilities struct {
		CanManageUsers bool `json:"can_manage_users"`
		CanViewAll     bool `json:"can_view_all"`
	} `json:"capabilities"`
}

type apiAdminAccountItem struct {
	ID            uint       `json:"id"`
	Username      string     `json:"username"`
	Role          string     `json:"role"`
	Status        string     `json:"status"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
	ForceLogoutAt *time.Time `json:"force_logout_at,omitempty"`
}

type apiOrganizationItem struct {
	ID        uint      `json:"id"`
	Name      string    `json:"name"`
	Slug      string    `json:"slug"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type apiOrganizationMemberItem struct {
	OrganizationID uint      `json:"organization_id"`
	UserID         uint      `json:"user_id"`
	Username       string    `json:"username"`
	UserRole       string    `json:"user_role"`
	UserStatus     string    `json:"user_status"`
	Role           string    `json:"role"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type apiAdminAPIKeyItem struct {
	ID            uint       `json:"id"`
	UserID        uint       `json:"user_id"`
	CreatedBy     uint       `json:"created_by"`
	OwnerUsername string     `json:"owner_username"`
	Name          string     `json:"name"`
	Purpose       string     `json:"purpose"`
	Prefix        string     `json:"prefix"`
	Scopes        []string   `json:"scopes"`
	Status        string     `json:"status"`
	RevokedAt     *time.Time `json:"revoked_at,omitempty"`
	ExpiresAt     *time.Time `json:"expires_at,omitempty"`
	LastRotatedAt *time.Time `json:"last_rotated_at,omitempty"`
	LastUsedAt    *time.Time `json:"last_used_at,omitempty"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

type apiAPIKeyCreateInput struct {
	Name          string
	Purpose       string
	ExpiresInDays int
	Scopes        []string
	OwnerUserID   *uint
}

func resultToAPIAdminSkillItems(items []models.Skill) []apiAdminSkillItem {
	base := resultToAPIItems(items)
	result := make([]apiAdminSkillItem, 0, len(items))
	for idx, skill := range items {
		result = append(result, apiAdminSkillItem{
			apiSkillResponse: base[idx],
			OwnerID:          skill.OwnerID,
			OwnerUsername:    skill.Owner.Username,
			Visibility:       string(skill.Visibility),
			OrganizationID:   skill.OrganizationID,
			CreatedAt:        skill.CreatedAt,
			LastSyncedAt:     skill.LastSyncedAt,
		})
	}
	return result
}

func filterAdminAPISkills(
	items []models.Skill,
	query string,
	source string,
	visibility string,
	owner string,
) []models.Skill {
	q := strings.ToLower(strings.TrimSpace(query))
	sourceFilter := strings.ToLower(strings.TrimSpace(source))
	visibilityFilter := strings.ToLower(strings.TrimSpace(visibility))
	ownerFilter := strings.ToLower(strings.TrimSpace(owner))

	filtered := make([]models.Skill, 0, len(items))
	for _, item := range items {
		if q != "" {
			haystack := strings.ToLower(
				item.Name + " " + item.Description + " " + item.CategorySlug + " " + item.SubcategorySlug + " " + item.Owner.Username,
			)
			if !strings.Contains(haystack, q) {
				continue
			}
		}
		if sourceFilter != "" && sourceFilter != "all" && strings.ToLower(string(item.SourceType)) != sourceFilter {
			continue
		}
		if visibilityFilter != "" && visibilityFilter != "all" && strings.ToLower(string(item.Visibility)) != visibilityFilter {
			continue
		}
		if ownerFilter != "" && ownerFilter != "all" {
			if strings.ToLower(item.Owner.Username) != ownerFilter && strconv.FormatUint(uint64(item.OwnerID), 10) != ownerFilter {
				continue
			}
		}
		filtered = append(filtered, item)
	}
	return filtered
}

func resultToAPIAdminAPIKeyItems(items []models.APIKey) []apiAdminAPIKeyItem {
	result := make([]apiAdminAPIKeyItem, 0, len(items))
	for _, item := range items {
		result = append(result, resultToAPIAdminAPIKeyItem(item))
	}
	return result
}

func resultToAPIAdminAPIKeyItem(item models.APIKey) apiAdminAPIKeyItem {
	return apiAdminAPIKeyItem{
		ID:            item.ID,
		UserID:        item.UserID,
		CreatedBy:     item.CreatedBy,
		OwnerUsername: item.User.Username,
		Name:          item.Name,
		Purpose:       item.Purpose,
		Prefix:        item.Prefix,
		Scopes:        services.APIKeyScopes(item),
		Status:        apiAPIKeyStatus(item),
		RevokedAt:     item.RevokedAt,
		ExpiresAt:     item.ExpiresAt,
		LastRotatedAt: item.LastRotatedAt,
		LastUsedAt:    item.LastUsedAt,
		CreatedAt:     item.CreatedAt,
		UpdatedAt:     item.UpdatedAt,
	}
}

func apiAPIKeyStatus(item models.APIKey) string {
	now := time.Now().UTC()
	if item.RevokedAt != nil {
		return "revoked"
	}
	if item.ExpiresAt != nil && !item.ExpiresAt.After(now) {
		return "expired"
	}
	return "active"
}

func normalizeAPIAdminAPIKeyStatus(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "active":
		return "active"
	case "revoked":
		return "revoked"
	case "expired":
		return "expired"
	default:
		return "all"
	}
}

func filterAPIAdminAPIKeysByStatus(items []models.APIKey, status string) []models.APIKey {
	normalized := normalizeAPIAdminAPIKeyStatus(status)
	if normalized == "all" {
		return items
	}
	filtered := make([]models.APIKey, 0, len(items))
	for _, item := range items {
		if apiAPIKeyStatus(item) == normalized {
			filtered = append(filtered, item)
		}
	}
	return filtered
}

func readAPIKeyCreateInput(r *http.Request) (apiAPIKeyCreateInput, error) {
	input := apiAPIKeyCreateInput{}
	contentType := strings.ToLower(strings.TrimSpace(r.Header.Get("Content-Type")))
	if strings.Contains(contentType, "application/json") {
		var payload struct {
			Name          string          `json:"name"`
			Purpose       string          `json:"purpose"`
			ExpiresInDays *int            `json:"expires_in_days"`
			Scopes        json.RawMessage `json:"scopes"`
			OwnerUserID   *uint           `json:"owner_user_id"`
		}
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&payload); err != nil {
			return input, fmt.Errorf("invalid json payload: %w", err)
		}
		input.Name = strings.TrimSpace(payload.Name)
		input.Purpose = strings.TrimSpace(payload.Purpose)
		if payload.ExpiresInDays != nil {
			if *payload.ExpiresInDays < 0 {
				return input, fmt.Errorf("invalid expires_in_days")
			}
			input.ExpiresInDays = *payload.ExpiresInDays
		}
		if payload.OwnerUserID != nil {
			if *payload.OwnerUserID == 0 {
				return input, fmt.Errorf("invalid owner_user_id")
			}
			ownerUserID := *payload.OwnerUserID
			input.OwnerUserID = &ownerUserID
		}
		scopes, err := decodeAPIKeyScopes(payload.Scopes)
		if err != nil {
			return input, err
		}
		input.Scopes = scopes
		return input, nil
	}

	if err := r.ParseForm(); err != nil {
		return input, fmt.Errorf("invalid form payload: %w", err)
	}
	input.Name = strings.TrimSpace(r.FormValue("name"))
	input.Purpose = strings.TrimSpace(r.FormValue("purpose"))
	if raw := strings.TrimSpace(r.FormValue("expires_in_days")); raw != "" {
		value, err := strconv.Atoi(raw)
		if err != nil || value < 0 {
			return input, fmt.Errorf("invalid expires_in_days")
		}
		input.ExpiresInDays = value
	}
	if raw := strings.TrimSpace(r.FormValue("owner_user_id")); raw != "" {
		value, err := strconv.ParseUint(raw, 10, 64)
		if err != nil || value == 0 {
			return input, fmt.Errorf("invalid owner_user_id")
		}
		ownerUserID := uint(value)
		input.OwnerUserID = &ownerUserID
	}
	if scopes, ok := r.Form["scopes"]; ok {
		input.Scopes = append(input.Scopes, scopes...)
	}
	return input, nil
}

func readAPIKeyScopesInput(r *http.Request) ([]string, error) {
	contentType := strings.ToLower(strings.TrimSpace(r.Header.Get("Content-Type")))
	if strings.Contains(contentType, "application/json") {
		var payload struct {
			Scopes json.RawMessage `json:"scopes"`
		}
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&payload); err != nil {
			return nil, fmt.Errorf("invalid json payload: %w", err)
		}
		scopes, err := decodeAPIKeyScopes(payload.Scopes)
		if err != nil {
			return nil, err
		}
		return scopes, nil
	}

	if err := r.ParseForm(); err != nil {
		return nil, fmt.Errorf("invalid form payload: %w", err)
	}
	if scopes, ok := r.Form["scopes"]; ok {
		return scopes, nil
	}
	if single := strings.TrimSpace(r.FormValue("scopes")); single != "" {
		return []string{single}, nil
	}
	return []string{}, nil
}

func decodeAPIKeyScopes(raw json.RawMessage) ([]string, error) {
	clean := strings.TrimSpace(string(raw))
	if clean == "" || clean == "null" {
		return []string{}, nil
	}
	if strings.HasPrefix(clean, "[") {
		var scopes []string
		if err := json.Unmarshal(raw, &scopes); err != nil {
			return nil, fmt.Errorf("invalid scopes")
		}
		return scopes, nil
	}
	var single string
	if err := json.Unmarshal(raw, &single); err != nil {
		return nil, fmt.Errorf("invalid scopes")
	}
	if strings.TrimSpace(single) == "" {
		return []string{}, nil
	}
	return []string{single}, nil
}

func decodeJSONOrForm(r *http.Request, target any) error {
	contentType := strings.ToLower(strings.TrimSpace(r.Header.Get("Content-Type")))
	if strings.Contains(contentType, "application/json") {
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(target); err != nil {
			return fmt.Errorf("invalid json payload: %w", err)
		}
		return nil
	}
	if err := r.ParseForm(); err != nil {
		return fmt.Errorf("invalid form payload: %w", err)
	}
	values := make(map[string]any, len(r.Form))
	for key, items := range r.Form {
		if len(items) == 0 {
			continue
		}
		value := strings.TrimSpace(items[0])
		if value == "" {
			continue
		}
		if parsed, parseErr := strconv.ParseInt(value, 10, 64); parseErr == nil {
			values[key] = parsed
			continue
		}
		values[key] = value
	}
	raw, err := json.Marshal(values)
	if err != nil {
		return fmt.Errorf("failed to encode form payload: %w", err)
	}
	if err := json.Unmarshal(raw, target); err != nil {
		return fmt.Errorf("failed to decode form payload: %w", err)
	}
	return nil
}

func readStringField(r *http.Request, key string) (string, error) {
	contentType := strings.ToLower(strings.TrimSpace(r.Header.Get("Content-Type")))
	if strings.Contains(contentType, "application/json") {
		var payload map[string]any
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&payload); err != nil {
			return "", fmt.Errorf("invalid json payload: %w", err)
		}
		value, _ := payload[key].(string)
		return strings.TrimSpace(value), nil
	}
	if err := r.ParseForm(); err != nil {
		return "", fmt.Errorf("invalid form payload: %w", err)
	}
	return strings.TrimSpace(r.FormValue(key)), nil
}

func readBoolField(r *http.Request, key string) (bool, error) {
	contentType := strings.ToLower(strings.TrimSpace(r.Header.Get("Content-Type")))
	if strings.Contains(contentType, "application/json") {
		var payload map[string]any
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&payload); err != nil {
			return false, fmt.Errorf("invalid json payload: %w", err)
		}
		value, ok := payload[key]
		if !ok {
			return false, fmt.Errorf("missing %s", key)
		}
		parsed, matched := parseBoolSettingValue(value)
		if !matched {
			return false, fmt.Errorf("invalid bool value for %s", key)
		}
		return parsed, nil
	}
	if err := r.ParseForm(); err != nil {
		return false, fmt.Errorf("invalid form payload: %w", err)
	}
	raw := strings.TrimSpace(r.FormValue(key))
	if raw == "" {
		return false, fmt.Errorf("missing %s", key)
	}
	parsed, matched := parseBoolSettingValue(raw)
	if !matched {
		return false, fmt.Errorf("invalid bool value for %s", key)
	}
	return parsed, nil
}

func readRepositorySyncPolicyUpdateInput(r *http.Request) (services.UpdateRepositorySyncPolicyInput, error) {
	input := services.UpdateRepositorySyncPolicyInput{}
	contentType := strings.ToLower(strings.TrimSpace(r.Header.Get("Content-Type")))
	if strings.Contains(contentType, "application/json") {
		var payload struct {
			Enabled   *bool  `json:"enabled"`
			Interval  string `json:"interval"`
			Timeout   string `json:"timeout"`
			BatchSize *int   `json:"batch_size"`
		}
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&payload); err != nil {
			return input, fmt.Errorf("invalid json payload: %w", err)
		}
		input.Enabled = payload.Enabled
		if strings.TrimSpace(payload.Interval) != "" {
			value, err := time.ParseDuration(strings.TrimSpace(payload.Interval))
			if err != nil || value <= 0 {
				return input, fmt.Errorf("invalid interval")
			}
			input.Interval = &value
		}
		if strings.TrimSpace(payload.Timeout) != "" {
			value, err := time.ParseDuration(strings.TrimSpace(payload.Timeout))
			if err != nil || value <= 0 {
				return input, fmt.Errorf("invalid timeout")
			}
			input.Timeout = &value
		}
		if payload.BatchSize != nil {
			if *payload.BatchSize <= 0 {
				return input, fmt.Errorf("invalid batch_size")
			}
			input.BatchSize = payload.BatchSize
		}
		return input, nil
	}

	if err := r.ParseForm(); err != nil {
		return input, fmt.Errorf("invalid form payload: %w", err)
	}
	if raw := strings.TrimSpace(r.FormValue("enabled")); raw != "" {
		value, matched := parseBoolSettingValue(raw)
		if !matched {
			return input, fmt.Errorf("invalid enabled")
		}
		input.Enabled = &value
	}
	if raw := strings.TrimSpace(r.FormValue("interval")); raw != "" {
		value, err := time.ParseDuration(raw)
		if err != nil || value <= 0 {
			return input, fmt.Errorf("invalid interval")
		}
		input.Interval = &value
	}
	if raw := strings.TrimSpace(r.FormValue("timeout")); raw != "" {
		value, err := time.ParseDuration(raw)
		if err != nil || value <= 0 {
			return input, fmt.Errorf("invalid timeout")
		}
		input.Timeout = &value
	}
	if raw := strings.TrimSpace(r.FormValue("batch_size")); raw != "" {
		value, err := strconv.Atoi(raw)
		if err != nil || value <= 0 {
			return input, fmt.Errorf("invalid batch_size")
		}
		input.BatchSize = &value
	}
	return input, nil
}

func parseBoolSettingValue(raw any) (bool, bool) {
	switch value := raw.(type) {
	case bool:
		return value, true
	case string:
		clean := strings.TrimSpace(value)
		if clean == "" {
			return false, false
		}
		switch strings.ToLower(clean) {
		case "1", "true", "yes", "on", "enabled":
			return true, true
		case "0", "false", "no", "off", "disabled":
			return false, true
		default:
			return false, false
		}
	case float64:
		if value == 1 {
			return true, true
		}
		if value == 0 {
			return false, true
		}
		return false, false
	case int:
		if value == 1 {
			return true, true
		}
		if value == 0 {
			return false, true
		}
		return false, false
	case int64:
		if value == 1 {
			return true, true
		}
		if value == 0 {
			return false, true
		}
		return false, false
	default:
		return false, false
	}
}

func parseOrganizationRoleValue(raw string) (models.OrganizationRole, bool) {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case string(models.OrganizationRoleOwner):
		return models.OrganizationRoleOwner, true
	case string(models.OrganizationRoleAdmin):
		return models.OrganizationRoleAdmin, true
	case string(models.OrganizationRoleMember):
		return models.OrganizationRoleMember, true
	case string(models.OrganizationRoleViewer):
		return models.OrganizationRoleViewer, true
	default:
		return "", false
	}
}

func parseUintURLParam(r *http.Request, key string) (uint, error) {
	raw := strings.TrimSpace(chi.URLParam(r, key))
	value, err := strconv.ParseUint(raw, 10, 64)
	if err != nil || value == 0 {
		return 0, fmt.Errorf("invalid %s", key)
	}
	return uint(value), nil
}

func writeOrganizationServiceError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, services.ErrOrganizationPermissionDenied):
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
	case errors.Is(err, services.ErrOrganizationNotFound):
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "organization_not_found"})
	case errors.Is(err, services.ErrOrganizationMembershipNotFound):
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "membership_not_found"})
	case errors.Is(err, services.ErrOrganizationLastOwner):
		writeJSON(w, http.StatusConflict, map[string]any{"error": "last_owner_guard"})
	default:
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "organization_operation_failed", "message": err.Error()})
	}
}

func userStatusValue(user models.User) string {
	status := strings.TrimSpace(strings.ToLower(string(user.Status)))
	if status == "" {
		return string(models.UserStatusActive)
	}
	return status
}
