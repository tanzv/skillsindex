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
