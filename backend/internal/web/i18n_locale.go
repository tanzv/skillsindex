package web

import (
	"net/http"
	"net/url"
	"strings"
)

func normalizeLocale(raw string) string {
	if locale, ok := parseLocale(raw); ok {
		return locale
	}
	return "en"
}

func parseLocale(raw string) (string, bool) {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "en":
		return "en", true
	case "zh":
		return "zh", true
	default:
		return "", false
	}
}

func resolveLocale(w http.ResponseWriter, r *http.Request) string {
	if locale, ok := parseLocale(r.URL.Query().Get("lang")); ok {
		http.SetCookie(w, &http.Cookie{
			Name:     "skillsindex_locale",
			Value:    locale,
			Path:     "/",
			MaxAge:   60 * 60 * 24 * 365,
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
		})
		return locale
	}

	if cookie, err := r.Cookie("skillsindex_locale"); err == nil {
		if locale, ok := parseLocale(cookie.Value); ok {
			return locale
		}
	}

	accept := strings.ToLower(r.Header.Get("Accept-Language"))
	if strings.HasPrefix(accept, "zh") || strings.Contains(accept, ",zh") {
		return "zh"
	}
	return "en"
}

func buildLocaleSwitchURL(r *http.Request, locale string) string {
	normalized := normalizeLocale(locale)
	query := r.URL.Query()
	query.Set("lang", normalized)
	values := query.Encode()
	if values == "" {
		return r.URL.Path
	}
	return r.URL.Path + "?" + values
}

func setLocaleOnTarget(target string, currentQuery url.Values, locale string) string {
	if strings.TrimSpace(target) == "" {
		target = "/"
	}

	values := make(url.Values, len(currentQuery)+1)
	for key, item := range currentQuery {
		values[key] = append([]string(nil), item...)
	}
	if normalized, ok := parseLocale(locale); ok {
		values.Set("lang", normalized)
	}
	encoded := values.Encode()
	if encoded == "" {
		return target
	}
	return target + "?" + encoded
}
