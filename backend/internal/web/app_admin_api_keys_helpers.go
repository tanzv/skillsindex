package web

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

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
