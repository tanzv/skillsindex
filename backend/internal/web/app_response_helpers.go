package web

import (
	"context"
	"encoding/json"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"

	"skillsindex/internal/catalog"
	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
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

func requestRedirectTargetFromRequest(r *http.Request) string {
	if r == nil || r.URL == nil {
		return "/"
	}
	target := strings.TrimSpace(r.URL.Path)
	if target == "" {
		target = "/"
	}
	if !strings.HasPrefix(target, "/") {
		target = "/" + target
	}
	if encoded := r.URL.Query().Encode(); encoded != "" {
		target += "?" + encoded
	}
	return target
}

func buildLoginRedirectPathFromRequest(r *http.Request) string {
	loginTarget := "/login"
	if r != nil && r.URL != nil {
		loginTarget = loginPath(resolveLoginPageFromPath(r.URL.Path))
	}
	params := make(url.Values)
	params.Set("redirect", requestRedirectTargetFromRequest(r))
	return loginTarget + "?" + params.Encode()
}

func normalizeLocalRedirectTarget(raw string) string {
	target := strings.TrimSpace(raw)
	if target == "" || !strings.HasPrefix(target, "/") || strings.HasPrefix(target, "//") {
		return ""
	}
	pathOnly := target
	if index := strings.IndexAny(pathOnly, "?#"); index >= 0 {
		pathOnly = pathOnly[:index]
	}
	switch strings.TrimSuffix(strings.TrimSpace(pathOnly), "/") {
	case "", "/login", "/light/login", "/mobile/login", "/mobile/light/login":
		return ""
	default:
		return target
	}
}

func auditDetailsJSON(pairs map[string]string) string {
	if len(pairs) == 0 {
		return ""
	}
	payload := make(map[string]string, len(pairs))
	for key, value := range pairs {
		trimmedKey := strings.TrimSpace(key)
		if trimmedKey == "" {
			continue
		}
		payload[trimmedKey] = strings.TrimSpace(value)
	}
	if len(payload) == 0 {
		return ""
	}
	raw, err := json.Marshal(payload)
	if err != nil {
		return ""
	}
	return string(raw)
}

func (a *App) recordAudit(ctx context.Context, actor *models.User, input services.RecordAuditInput) {
	if a.auditService == nil || actor == nil || actor.ID == 0 {
		return
	}
	input.ActorUserID = actor.ID
	_ = a.auditService.Record(ctx, input)
}

func (a *App) recordRequestAudit(r *http.Request, actor *models.User, input services.RecordAuditInput) {
	if a.auditService == nil || r == nil {
		return
	}
	if actor != nil && actor.ID != 0 {
		input.ActorUserID = actor.ID
	}
	if strings.TrimSpace(input.RequestID) == "" {
		input.RequestID = requestIDFromRequest(r)
	}
	if strings.TrimSpace(input.SourceIP) == "" {
		input.SourceIP = clientIPFromRequest(r)
	}
	_ = a.auditService.Record(r.Context(), input)
}

func requestIDFromRequest(r *http.Request) string {
	if r == nil {
		return ""
	}
	if requestID := strings.TrimSpace(r.Header.Get("X-Request-ID")); requestID != "" {
		return requestID
	}
	return strings.TrimSpace(chimiddleware.GetReqID(r.Context()))
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

func apiOnlyEnabledFromEnv() bool {
	value := strings.ToLower(strings.TrimSpace(os.Getenv("API_ONLY")))
	switch value {
	case "1", "true", "yes", "on":
		return true
	default:
		return false
	}
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
		writeJSON(w, status, map[string]any{
			"error":   "api_only_mode",
			"message": "HTML rendering is disabled in API-only mode",
		})
		return
	}
	if a.templates == nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{
			"error":   "template_renderer_not_configured",
			"message": "HTML template renderer is not configured",
		})
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
		data.CatalogCategories = catalog.Categories()
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
