package web

import (
	"net/http"
	"strings"
)

func resolveAPILocale(r *http.Request) string {
	if r == nil {
		return "en"
	}

	if locale, ok := parseLocale(r.URL.Query().Get("lang")); ok {
		return locale
	}
	if cookie, err := r.Cookie("skillsindex_locale"); err == nil {
		if locale, ok := parseLocale(cookie.Value); ok {
			return locale
		}
	}

	if locale, ok := parseLocaleFromAcceptLanguage(r.Header.Get("Accept-Language")); ok {
		return locale
	}
	return "en"
}

func parseLocaleFromAcceptLanguage(raw string) (string, bool) {
	value := strings.ToLower(strings.TrimSpace(raw))
	if value == "" {
		return "", false
	}

	for _, part := range strings.Split(value, ",") {
		segment := strings.TrimSpace(strings.SplitN(part, ";", 2)[0])
		switch {
		case strings.HasPrefix(segment, "zh"):
			return "zh", true
		case strings.HasPrefix(segment, "en"):
			return "en", true
		}
	}
	return "", false
}

func (a *App) apiMessage(r *http.Request, key string, fallback string) string {
	trimmedKey := strings.TrimSpace(key)
	trimmedFallback := strings.TrimSpace(fallback)
	if trimmedKey == "" {
		return trimmedFallback
	}

	if a != nil {
		translated := strings.TrimSpace(a.translations.translate(resolveAPILocale(r), trimmedKey))
		if translated != "" && translated != trimmedKey {
			return translated
		}
	}

	if trimmedFallback != "" {
		return trimmedFallback
	}
	return trimmedKey
}
