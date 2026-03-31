package web

import (
	"encoding/json"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
)

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func redirectDashboard(w http.ResponseWriter, r *http.Request, msg string, errText string) {
	redirectDashboardWithFilters(w, r, msg, errText, "", "")
}

func redirectAccountPath(w http.ResponseWriter, r *http.Request, path string, msg string, errText string) {
	target := strings.TrimSpace(path)
	if !strings.HasPrefix(target, "/account") {
		target = "/account/profile"
	}

	params := make(url.Values)
	if strings.TrimSpace(msg) != "" {
		params.Set("msg", strings.TrimSpace(msg))
	}
	if strings.TrimSpace(errText) != "" {
		params.Set("err", strings.TrimSpace(errText))
	}
	if encoded := params.Encode(); encoded != "" {
		target += "?" + encoded
	}
	http.Redirect(w, r, target, http.StatusSeeOther)
}

func redirectPasswordResetPath(w http.ResponseWriter, r *http.Request, path string, msg string, errText string) {
	target := strings.TrimSpace(path)
	if !strings.HasSuffix(target, "/account/password-reset/request") && !strings.HasSuffix(target, "/account/password-reset/confirm") {
		target = passwordResetRequestPath(resolvePasswordResetRequestPageFromPath(r.URL.Path))
	}

	params := make(url.Values)
	if strings.TrimSpace(msg) != "" {
		params.Set("msg", strings.TrimSpace(msg))
	}
	if strings.TrimSpace(errText) != "" {
		params.Set("err", strings.TrimSpace(errText))
	}
	if encoded := params.Encode(); encoded != "" {
		target += "?" + encoded
	}
	http.Redirect(w, r, target, http.StatusSeeOther)
}

func redirectAdminPath(w http.ResponseWriter, r *http.Request, path string, msg string, errText string) {
	target := strings.TrimSpace(path)
	if !strings.HasPrefix(target, "/admin") {
		target = "/admin"
	}

	params := make(url.Values)
	if strings.TrimSpace(msg) != "" {
		params.Set("msg", strings.TrimSpace(msg))
	}
	if strings.TrimSpace(errText) != "" {
		params.Set("err", strings.TrimSpace(errText))
	}
	if encoded := params.Encode(); encoded != "" {
		target += "?" + encoded
	}
	http.Redirect(w, r, target, http.StatusSeeOther)
}

func redirectAdminModeration(w http.ResponseWriter, r *http.Request, status string, msg string, errText string) {
	target := "/admin/moderation"
	params := make(url.Values)
	filter := normalizeModerationListStatus(status)
	if filter != "all" {
		params.Set("status", filter)
	}
	if strings.TrimSpace(msg) != "" {
		params.Set("msg", strings.TrimSpace(msg))
	}
	if strings.TrimSpace(errText) != "" {
		params.Set("err", strings.TrimSpace(errText))
	}
	if encoded := params.Encode(); encoded != "" {
		target += "?" + encoded
	}
	http.Redirect(w, r, target, http.StatusSeeOther)
}

func redirectDashboardWithNewKey(
	w http.ResponseWriter,
	r *http.Request,
	msg string,
	plaintextKey string,
	apiKeyOwner string,
	apiKeyStatus string,
) {
	_ = plaintextKey
	redirectDashboardWithFilters(w, r, msg, "", apiKeyOwner, apiKeyStatus)
}

func redirectDashboardWithFilters(
	w http.ResponseWriter,
	r *http.Request,
	msg string,
	errText string,
	apiKeyOwner string,
	apiKeyStatus string,
) {
	params := make(url.Values)
	if strings.TrimSpace(msg) != "" {
		params.Set("msg", strings.TrimSpace(msg))
	}
	if strings.TrimSpace(errText) != "" {
		params.Set("err", strings.TrimSpace(errText))
	}
	if strings.TrimSpace(apiKeyOwner) != "" {
		params.Set("api_key_owner", strings.TrimSpace(apiKeyOwner))
	}
	status := strings.ToLower(strings.TrimSpace(apiKeyStatus))
	if status != "" && status != "all" {
		params.Set("api_key_status", status)
	}
	section := normalizeAdminSection(firstNonEmpty(chi.URLParam(r, "section"), r.URL.Query().Get("section")))
	target := "/admin"
	if section != "overview" {
		target += "/" + section
	}
	subsection := strings.ToLower(strings.TrimSpace(firstNonEmpty(chi.URLParam(r, "subsection"), r.URL.Query().Get("subsection"))))
	if section == "records" {
		switch subsection {
		case "imports", "sync-jobs", "exports":
			target += "/" + subsection
		}
	}
	if encoded := params.Encode(); encoded != "" {
		target += "?" + encoded
	}
	http.Redirect(w, r, target, http.StatusSeeOther)
}

func redirectSkillDetail(w http.ResponseWriter, r *http.Request, skillID uint, msg string, errText string) {
	params := make(url.Values)
	if strings.TrimSpace(msg) != "" {
		params.Set("msg", strings.TrimSpace(msg))
	}
	if strings.TrimSpace(errText) != "" {
		params.Set("err", strings.TrimSpace(errText))
	}
	target := "/skills/" + strconv.FormatUint(uint64(skillID), 10)
	if encoded := params.Encode(); encoded != "" {
		target += "?" + encoded
	}
	http.Redirect(w, r, target, http.StatusSeeOther)
}

func (a *App) firstAPIKey() string {
	for key := range a.apiKeys {
		if len(key) <= 10 {
			return key
		}
		return key[:6] + "..." + key[len(key)-4:]
	}
	return "create-via-admin-apikeys"
}

func isAPIOnlyAllowedPath(path string) bool {
	clean := strings.TrimSpace(path)
	if clean == "" {
		return false
	}
	if strings.HasPrefix(clean, "/api/") {
		return true
	}
	switch clean {
	case "/openapi.json", "/openapi.yaml", "/docs/openapi.json", "/docs/openapi.yaml":
		return true
	default:
		return false
	}
}

func requestWantsJSON(r *http.Request) bool {
	if r == nil {
		return false
	}
	if strings.HasPrefix(strings.ToLower(strings.TrimSpace(r.URL.Path)), "/api/") {
		return true
	}
	accept := strings.ToLower(strings.TrimSpace(r.Header.Get("Accept")))
	if strings.Contains(accept, "application/json") {
		return true
	}
	contentType := strings.ToLower(strings.TrimSpace(r.Header.Get("Content-Type")))
	return strings.Contains(contentType, "application/json")
}

func (a *App) render(w http.ResponseWriter, r *http.Request, data ViewData) {
	a.renderWithStatus(w, r, http.StatusOK, data)
}

func (a *App) renderWithStatus(w http.ResponseWriter, r *http.Request, status int, data ViewData) {
	if a.apiOnly {
		writeAPIError(w, r, status, "api_only_mode", "HTML rendering is disabled in API-only mode")
		return
	}
	if a.templates == nil {
		writeAPIError(w, r, http.StatusInternalServerError, "template_renderer_not_configured", "HTML template renderer is not configured")
		return
	}
	if data.CurrentUser == nil {
		data.CurrentUser = currentUserFromContext(r.Context())
	}
	if !data.DingTalkEnabled {
		data.DingTalkEnabled = a.dingTalkService != nil && a.dingTalkService.Enabled()
	}
	if strings.TrimSpace(data.Locale) == "" {
		data.Locale = resolveLocale(w, r)
	}
	data.LocaleSwitchEN = buildLocaleSwitchURL(r, "en")
	data.LocaleSwitchZH = buildLocaleSwitchURL(r, "zh")
	data.AllowRegistration = a.registrationEnabled(r.Context())
	if (isLoginPage(data.Page) || isRegisterPage(data.Page)) && len(data.AuthProviders) == 0 {
		data.AuthProviders = a.buildAuthProviders(r.Context(), true)
	}
	if isAdminPage(data.Page) && data.AdminSection == "access" && len(data.AdminAuthProviders) == 0 {
		data.AdminAuthProviders = a.buildAuthProviders(r.Context(), false)
	}
	if isLoginPage(data.Page) || isRegisterPage(data.Page) {
		data.AuthProviderCount = len(data.AuthProviders)
		for _, provider := range data.AuthProviders {
			if provider.Available {
				data.AuthProviderActive++
			}
		}
	}
	if len(data.CatalogCategories) == 0 {
		data.CatalogCategories = a.marketplaceCatalogCategories(r.Context())
	}
	if strings.TrimSpace(data.CSRFToken) == "" {
		data.CSRFToken = ensureCSRFToken(w, r, a.cookieSecure)
	}
	if strings.TrimSpace(data.AdminNewAPIKey) == "" && isAdminPage(data.Page) {
		if flashKey := consumeAPIKeyFlashCookie(w, r, a.cookieSecure); strings.TrimSpace(flashKey) != "" {
			data.AdminNewAPIKey = flashKey
		}
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(status)
	if err := a.templates.ExecuteTemplate(w, "layout", data); err != nil {
		http.Error(w, "template render failed", http.StatusInternalServerError)
	}
}

func ensureCSRFToken(w http.ResponseWriter, r *http.Request, secure bool) string {
	if cookie, err := r.Cookie(csrfCookieName); err == nil {
		token := strings.TrimSpace(cookie.Value)
		if token != "" {
			return token
		}
	}

	token, err := generateCSRFToken()
	if err != nil {
		return ""
	}
	http.SetCookie(w, &http.Cookie{
		Name:     csrfCookieName,
		Value:    token,
		Path:     "/",
		MaxAge:   60 * 60 * 24,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   secure,
	})
	return token
}

func setAPIKeyFlashCookie(w http.ResponseWriter, plaintextKey string, secure bool) {
	key := strings.TrimSpace(plaintextKey)
	if key == "" {
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     apiKeyFlashCookieName,
		Value:    key,
		Path:     "/admin",
		MaxAge:   180,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   secure,
	})
}

func consumeAPIKeyFlashCookie(w http.ResponseWriter, r *http.Request, secure bool) string {
	cookie, err := r.Cookie(apiKeyFlashCookieName)
	if err != nil {
		return ""
	}
	clearAPIKeyFlashCookie(w, secure)
	return strings.TrimSpace(cookie.Value)
}

func clearAPIKeyFlashCookie(w http.ResponseWriter, secure bool) {
	http.SetCookie(w, &http.Cookie{
		Name:     apiKeyFlashCookieName,
		Value:    "",
		Path:     "/admin",
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   secure,
	})
}
