package web

import "strings"

func claimBool(payload map[string]any, keys ...string) (bool, bool) {
	if len(payload) == 0 {
		return false, false
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
		case bool:
			return value, true
		case string:
			normalizedValue := strings.ToLower(strings.TrimSpace(value))
			switch normalizedValue {
			case "true", "1", "yes", "y", "on":
				return true, true
			case "false", "0", "no", "n", "off":
				return false, true
			}
		case float64:
			if value == 1 {
				return true, true
			}
			if value == 0 {
				return false, true
			}
		case float32:
			if value == 1 {
				return true, true
			}
			if value == 0 {
				return false, true
			}
		case int:
			if value == 1 {
				return true, true
			}
			if value == 0 {
				return false, true
			}
		case int64:
			if value == 1 {
				return true, true
			}
			if value == 0 {
				return false, true
			}
		case uint:
			if value == 1 {
				return true, true
			}
			if value == 0 {
				return false, true
			}
		case uint64:
			if value == 1 {
				return true, true
			}
			if value == 0 {
				return false, true
			}
		}
	}
	return false, false
}
