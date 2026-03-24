package web

import (
	"net/http"
	"strconv"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"github.com/go-chi/chi/v5"
)

type apiAdminMockProfileItem struct {
	ID        uint   `json:"id"`
	Name      string `json:"name"`
	SpecID    uint   `json:"spec_id"`
	Mode      string `json:"mode"`
	IsDefault bool   `json:"is_default"`
}

type apiAdminMockOverrideItem struct {
	ID             uint   `json:"id"`
	ProfileID      uint   `json:"profile_id"`
	OperationID    string `json:"operation_id"`
	StatusCode     int    `json:"status_code"`
	ContentType    string `json:"content_type"`
	ExampleName    string `json:"example_name"`
	BodyPayload    string `json:"body_payload"`
	HeadersPayload string `json:"headers_payload"`
	LatencyMS      int    `json:"latency_ms"`
}

type apiAdminMockProfileUpsertInput struct {
	Name      string `json:"name"`
	Mode      string `json:"mode"`
	IsDefault bool   `json:"is_default"`
}

type apiAdminMockOverrideUpsertInput struct {
	StatusCode     int    `json:"status_code"`
	ContentType    string `json:"content_type"`
	ExampleName    string `json:"example_name"`
	BodyPayload    string `json:"body_payload"`
	HeadersPayload string `json:"headers_payload"`
	LatencyMS      int    `json:"latency_ms"`
}

type apiAdminMockResolveInput struct {
	ProfileName string `json:"profile_name"`
	Method      string `json:"method"`
	Path        string `json:"path"`
}

func (a *App) handleAPIAdminMockProfiles(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.apiMockSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}
	if !a.authorizePublishedOperation(w, r) {
		return
	}

	items, err := a.apiMockSvc.ListCurrentProfiles(r.Context())
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "query_failed", "message": err.Error()})
		return
	}

	responseItems := make([]apiAdminMockProfileItem, 0, len(items))
	for _, item := range items {
		responseItems = append(responseItems, resultToAPIAdminMockProfileItem(item))
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": responseItems})
}

func (a *App) handleAPIAdminMockProfilesUpsert(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.apiMockSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}
	if !a.authorizePublishedOperation(w, r) {
		return
	}

	var input apiAdminMockProfileUpsertInput
	if err := decodeJSONOrForm(r, &input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}

	item, err := a.apiMockSvc.UpsertCurrentProfile(r.Context(), services.UpsertCurrentAPIMockProfileInput{
		Name:        input.Name,
		Mode:        input.Mode,
		IsDefault:   input.IsDefault,
		ActorUserID: user.ID,
	})
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "update_failed", "message": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"item": resultToAPIAdminMockProfileItem(item)})
}

func (a *App) handleAPIAdminMockOverrides(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.apiMockSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}
	if !a.authorizePublishedOperation(w, r) {
		return
	}

	profileID, err := strconv.ParseUint(strings.TrimSpace(chi.URLParam(r, "profileID")), 10, 64)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_profile_id"})
		return
	}

	items, err := a.apiMockSvc.ListProfileOverrides(r.Context(), uint(profileID))
	if err != nil {
		status := http.StatusBadRequest
		if err == services.ErrAPIMockProfileNotFound {
			status = http.StatusNotFound
		}
		writeJSON(w, status, map[string]any{"error": "query_failed", "message": err.Error()})
		return
	}

	responseItems := make([]apiAdminMockOverrideItem, 0, len(items))
	for _, item := range items {
		responseItems = append(responseItems, resultToAPIAdminMockOverrideItem(item))
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": responseItems})
}

func (a *App) handleAPIAdminMockOverrideUpsert(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.apiMockSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}
	if !a.authorizePublishedOperation(w, r) {
		return
	}

	profileID, err := strconv.ParseUint(strings.TrimSpace(chi.URLParam(r, "profileID")), 10, 64)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_profile_id"})
		return
	}

	var input apiAdminMockOverrideUpsertInput
	if err := decodeJSONOrForm(r, &input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}

	item, err := a.apiMockSvc.UpsertProfileOverride(r.Context(), services.UpsertAPIMockOverrideInput{
		ProfileID:      uint(profileID),
		OperationID:    strings.TrimSpace(chi.URLParam(r, "operationID")),
		StatusCode:     input.StatusCode,
		ContentType:    input.ContentType,
		ExampleName:    input.ExampleName,
		BodyPayload:    input.BodyPayload,
		HeadersPayload: input.HeadersPayload,
		LatencyMS:      input.LatencyMS,
		ActorUserID:    user.ID,
	})
	if err != nil {
		status := http.StatusBadRequest
		if err == services.ErrAPIMockProfileNotFound || err == services.ErrAPIOperationNotFound {
			status = http.StatusNotFound
		}
		writeJSON(w, status, map[string]any{"error": "update_failed", "message": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"item": resultToAPIAdminMockOverrideItem(item)})
}

func (a *App) handleAPIAdminMockResolve(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.apiMockSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}
	if !a.authorizePublishedOperation(w, r) {
		return
	}

	var input apiAdminMockResolveInput
	if err := decodeJSONOrForm(r, &input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}

	item, err := a.apiMockSvc.ResolveCurrentMock(r.Context(), services.ResolveCurrentAPIMockInput{
		ProfileName: input.ProfileName,
		Method:      input.Method,
		Path:        input.Path,
	})
	if err != nil {
		status := http.StatusBadRequest
		switch err {
		case services.ErrAPIMockProfileNotFound, services.ErrAPIOperationNotFound:
			status = http.StatusNotFound
		case services.ErrAPIMockDisabled:
			status = http.StatusForbidden
		}
		writeJSON(w, status, map[string]any{"error": "mock_resolve_failed", "message": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"item": item})
}

func resultToAPIAdminMockProfileItem(item models.APIMockProfile) apiAdminMockProfileItem {
	return apiAdminMockProfileItem{
		ID:        item.ID,
		Name:      item.Name,
		SpecID:    item.SpecID,
		Mode:      item.Mode,
		IsDefault: item.IsDefault,
	}
}

func resultToAPIAdminMockOverrideItem(item models.APIMockOverride) apiAdminMockOverrideItem {
	return apiAdminMockOverrideItem{
		ID:             item.ID,
		ProfileID:      item.ProfileID,
		OperationID:    item.OperationID,
		StatusCode:     item.StatusCode,
		ContentType:    item.ContentType,
		ExampleName:    item.ExampleName,
		BodyPayload:    item.BodyPayload,
		HeadersPayload: item.HeadersPayload,
		LatencyMS:      item.LatencyMS,
	}
}
