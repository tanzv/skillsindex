package web

import (
	"context"
	"crypto/subtle"
	"net"
	"net/http"
	"strings"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
)

func (a *App) Router() http.Handler {
	r := chi.NewRouter()
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(a.allowCORS)
	r.Use(a.withCurrentUser)
	r.Use(a.requireAPIMode)
	r.Use(a.requireCSRF)

	r.Handle("/static/*", http.StripPrefix("/static/", http.FileServer(http.Dir("web/static"))))
	a.registerPublicWebRoutes(r)
	a.registerAuthenticationRoutes(r)
	a.registerPublicAPIRoutes(r)
	a.registerAuthenticatedRoutes(r)
	a.registerDashboardRoutes(r)

	return r
}

func (a *App) withCurrentUser(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if a.sessionService == nil {
			next.ServeHTTP(w, r)
			return
		}
		userID, issuedAt, sessionID, ok := a.sessionService.GetSessionWithID(r)
		if ok {
			if a.userSessionSvc != nil && strings.TrimSpace(sessionID) != "" {
				active, err := a.userSessionSvc.ValidateSession(r.Context(), userID, sessionID, time.Now().UTC())
				if err != nil || !active {
					a.sessionService.ClearSession(w)
					next.ServeHTTP(w, r)
					return
				}
				_ = a.userSessionSvc.TouchSession(r.Context(), sessionID, time.Now().UTC())
			}
			user, err := a.authService.GetUserByID(r.Context(), userID)
			if err == nil && user.IsActive() {
				if user.ForceLogoutAt != nil && !issuedAt.IsZero() && issuedAt.Before(user.ForceLogoutAt.UTC()) {
					a.sessionService.ClearSession(w)
					next.ServeHTTP(w, r)
					return
				}
				ctx := context.WithValue(r.Context(), currentUserKey, &user)
				r = r.WithContext(ctx)
			} else if err == nil && !user.IsActive() {
				a.sessionService.ClearSession(w)
			}
		}
		next.ServeHTTP(w, r)
	})
}

func (a *App) requireAPIMode(next http.Handler) http.Handler {
	if !a.apiOnly {
		return next
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if isAPIOnlyAllowedPath(r.URL.Path) {
			next.ServeHTTP(w, r)
			return
		}
		writeJSON(w, http.StatusNotFound, map[string]any{
			"error":   "api_only_mode",
			"message": "This server only exposes API endpoints",
		})
	})
}

func (a *App) allowCORS(next http.Handler) http.Handler {
	if len(a.corsOrigins) == 0 {
		return next
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !isCORSRoutePath(r.URL.Path) {
			next.ServeHTTP(w, r)
			return
		}

		origin := strings.TrimSpace(r.Header.Get("Origin"))
		if origin == "" {
			next.ServeHTTP(w, r)
			return
		}

		if _, ok := a.corsOrigins[origin]; !ok {
			if r.Method == http.MethodOptions {
				writeJSON(w, http.StatusForbidden, map[string]any{
					"error":   "cors_origin_denied",
					"message": "Request origin is not allowed",
				})
				return
			}
			next.ServeHTTP(w, r)
			return
		}

		allowHeaders := "Content-Type, Authorization, X-CSRF-Token"
		allowMethods := "GET, POST, PUT, PATCH, DELETE, OPTIONS"

		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Headers", allowHeaders)
		w.Header().Set("Access-Control-Allow-Methods", allowMethods)
		appendHeaderValue(w.Header(), "Vary", "Origin")
		appendHeaderValue(w.Header(), "Vary", "Access-Control-Request-Method")
		appendHeaderValue(w.Header(), "Vary", "Access-Control-Request-Headers")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func isCORSRoutePath(path string) bool {
	clean := strings.TrimSpace(strings.ToLower(path))
	switch {
	case strings.HasPrefix(clean, "/api/"):
		return true
	case strings.HasPrefix(clean, "/openapi."):
		return true
	case strings.HasPrefix(clean, "/docs/openapi."):
		return true
	default:
		return false
	}
}

func appendHeaderValue(header http.Header, key string, value string) {
	values := header.Values(key)
	for _, item := range values {
		if strings.EqualFold(strings.TrimSpace(item), strings.TrimSpace(value)) {
			return
		}
	}
	header.Add(key, value)
}

func (a *App) requireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if currentUserFromContext(r.Context()) == nil {
			if requestWantsJSON(r) {
				writeJSON(w, http.StatusUnauthorized, map[string]any{
					"error":   "unauthorized",
					"message": "Authentication required",
				})
				return
			}
			http.Redirect(w, r, "/login", http.StatusSeeOther)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (a *App) requireDashboardAccess(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user := currentUserFromContext(r.Context())
		if user == nil {
			if requestWantsJSON(r) {
				writeJSON(w, http.StatusUnauthorized, map[string]any{
					"error":   "unauthorized",
					"message": "Authentication required",
				})
				return
			}
			http.Redirect(w, r, "/login", http.StatusSeeOther)
			return
		}
		if !user.CanAccessDashboard() {
			if requestWantsJSON(r) {
				writeJSON(w, http.StatusForbidden, map[string]any{
					"error":   "permission_denied",
					"message": "Current account role does not have dashboard access",
				})
				return
			}
			a.renderWithStatus(w, r, http.StatusForbidden, ViewData{
				Page:  "home",
				Title: "Skill Marketplace",
				Error: "Current account role does not have dashboard access",
			})
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (a *App) requireCSRF(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet, http.MethodHead, http.MethodOptions, http.MethodTrace:
			next.ServeHTTP(w, r)
			return
		}

		cookie, err := r.Cookie(csrfCookieName)
		if err != nil {
			a.writeCSRFValidationError(w, r)
			return
		}
		expected := strings.TrimSpace(cookie.Value)
		if expected == "" {
			a.writeCSRFValidationError(w, r)
			return
		}

		provided := strings.TrimSpace(r.Header.Get("X-CSRF-Token"))
		if provided == "" {
			if err := r.ParseForm(); err != nil {
				a.writeCSRFValidationError(w, r)
				return
			}
			provided = strings.TrimSpace(r.FormValue(csrfTokenFormField))
		}
		if provided == "" || subtle.ConstantTimeCompare([]byte(provided), []byte(expected)) != 1 {
			a.writeCSRFValidationError(w, r)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (a *App) writeCSRFValidationError(w http.ResponseWriter, r *http.Request) {
	if requestWantsJSON(r) {
		writeAPIError(w, r, http.StatusForbidden, "csrf_validation_failed", "CSRF validation failed")
		return
	}
	http.Error(w, "csrf validation failed", http.StatusForbidden)
}

func (a *App) requireAPIKey(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		apiKey := strings.TrimSpace(r.URL.Query().Get("api_key"))
		if apiKey == "" {
			auth := strings.TrimSpace(r.Header.Get("Authorization"))
			if strings.HasPrefix(strings.ToLower(auth), "bearer ") {
				apiKey = strings.TrimSpace(auth[7:])
			}
		}
		requiredScope := requiredAPIKeyScope(r.URL.Path)
		if _, ok := a.apiKeys[apiKey]; ok {
			if requiredScope != "" {
				writeJSON(w, http.StatusForbidden, map[string]any{
					"error":   "api_key_scope_denied",
					"message": "API key does not grant required scope",
				})
				return
			}
			next.ServeHTTP(w, r)
			return
		}
		if a.apiKeyService != nil {
			if key, valid, err := a.apiKeyService.Validate(r.Context(), apiKey); err == nil && valid {
				if requiredScope != "" && !services.APIKeyHasScope(key, requiredScope) {
					writeJSON(w, http.StatusForbidden, map[string]any{
						"error":   "api_key_scope_denied",
						"message": "API key does not grant required scope",
					})
					return
				}
				next.ServeHTTP(w, r)
				return
			}
		}
		writeJSON(w, http.StatusUnauthorized, map[string]any{
			"error":   "api_key_invalid",
			"message": "Missing or invalid API key",
		})
	})
}

func requiredAPIKeyScope(path string) string {
	switch strings.ToLower(strings.TrimSpace(path)) {
	case "/api/v1/skills/search":
		return services.APIKeyScopeSkillsSearchRead
	case "/api/v1/skills/ai-search":
		return services.APIKeyScopeSkillsAISearchRead
	default:
		return ""
	}
}

func currentUserFromContext(ctx context.Context) *models.User {
	value := ctx.Value(currentUserKey)
	if value == nil {
		return nil
	}
	user, ok := value.(*models.User)
	if !ok {
		return nil
	}
	return user
}

func clientIPFromRequest(r *http.Request) string {
	if r == nil {
		return ""
	}
	forwardedFor := strings.TrimSpace(r.Header.Get("X-Forwarded-For"))
	if forwardedFor != "" {
		first := strings.Split(forwardedFor, ",")[0]
		return sanitizeIssuedIP(first)
	}
	realIP := strings.TrimSpace(r.Header.Get("X-Real-IP"))
	if realIP != "" {
		return sanitizeIssuedIP(realIP)
	}
	host, _, err := net.SplitHostPort(strings.TrimSpace(r.RemoteAddr))
	if err == nil {
		return sanitizeIssuedIP(host)
	}
	return sanitizeIssuedIP(r.RemoteAddr)
}

func sanitizeIssuedIP(raw string) string {
	candidate := strings.TrimSpace(raw)
	if candidate == "" {
		return ""
	}
	if parsed := net.ParseIP(candidate); parsed != nil {
		return parsed.String()
	}
	host, _, err := net.SplitHostPort(candidate)
	if err != nil {
		return candidate
	}
	host = strings.TrimSpace(host)
	if parsed := net.ParseIP(host); parsed != nil {
		return parsed.String()
	}
	return host
}
