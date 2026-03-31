package web

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
)

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

func parseIntSettingValue(raw any) (int, bool) {
	switch value := raw.(type) {
	case float64:
		if value != float64(int(value)) {
			return 0, false
		}
		return int(value), true
	case int:
		return value, true
	case int64:
		return int(value), true
	case string:
		clean := strings.TrimSpace(value)
		if clean == "" {
			return 0, false
		}
		parsed, err := strconv.Atoi(clean)
		if err != nil {
			return 0, false
		}
		return parsed, true
	default:
		return 0, false
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
