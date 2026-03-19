package web

import (
	"context"
	"encoding/json"
	"net/http"
	"net/url"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	chimiddleware "github.com/go-chi/chi/v5/middleware"
)

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
