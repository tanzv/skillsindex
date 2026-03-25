package web

import (
	"errors"
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
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if !user.CanManageUsers() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}
	if a.apiMockSvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "API mock service is unavailable")
		return
	}
	if !a.authorizePublishedOperation(w, r) {
		return
	}

	items, err := a.apiMockSvc.ListCurrentProfiles(r.Context())
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "query_failed", err, "Failed to load API mock profiles")
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
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if !user.CanManageUsers() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}
	if a.apiMockSvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "API mock service is unavailable")
		return
	}
	if !a.authorizePublishedOperation(w, r) {
		return
	}

	var input apiAdminMockProfileUpsertInput
	if err := decodeJSONOrForm(r, &input); err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid request payload")
		return
	}

	item, err := a.apiMockSvc.UpsertCurrentProfile(r.Context(), services.UpsertCurrentAPIMockProfileInput{
		Name:        input.Name,
		Mode:        input.Mode,
		IsDefault:   input.IsDefault,
		ActorUserID: user.ID,
	})
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "update_failed", err, "Failed to update API mock profile")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"item": resultToAPIAdminMockProfileItem(item)})
}

func (a *App) handleAPIAdminMockOverrides(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if !user.CanManageUsers() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}
	if a.apiMockSvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "API mock service is unavailable")
		return
	}
	if !a.authorizePublishedOperation(w, r) {
		return
	}

	profileID, err := strconv.ParseUint(strings.TrimSpace(chi.URLParam(r, "profileID")), 10, 64)
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_profile_id", "Invalid API mock profile id")
		return
	}

	items, err := a.apiMockSvc.ListProfileOverrides(r.Context(), uint(profileID))
	if err != nil {
		status := http.StatusBadRequest
		code := "query_failed"
		message := "Failed to load API mock overrides"
		if errors.Is(err, services.ErrAPIMockProfileNotFound) {
			status = http.StatusNotFound
			code = "mock_profile_not_found"
			message = "API mock profile not found"
		}
		writeAPIErrorFromError(w, r, status, code, err, message)
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
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if !user.CanManageUsers() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}
	if a.apiMockSvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "API mock service is unavailable")
		return
	}
	if !a.authorizePublishedOperation(w, r) {
		return
	}

	profileID, err := strconv.ParseUint(strings.TrimSpace(chi.URLParam(r, "profileID")), 10, 64)
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_profile_id", "Invalid API mock profile id")
		return
	}

	var input apiAdminMockOverrideUpsertInput
	if err := decodeJSONOrForm(r, &input); err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid request payload")
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
		code := "update_failed"
		message := "Failed to update API mock override"
		if errors.Is(err, services.ErrAPIMockProfileNotFound) {
			status = http.StatusNotFound
			code = "mock_profile_not_found"
			message = "API mock profile not found"
		} else if errors.Is(err, services.ErrAPIOperationNotFound) {
			status = http.StatusNotFound
			code = "api_operation_not_found"
			message = "API operation not found"
		}
		writeAPIErrorFromError(w, r, status, code, err, message)
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"item": resultToAPIAdminMockOverrideItem(item)})
}

func (a *App) handleAPIAdminMockResolve(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if !user.CanManageUsers() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}
	if a.apiMockSvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "API mock service is unavailable")
		return
	}
	if !a.authorizePublishedOperation(w, r) {
		return
	}

	var input apiAdminMockResolveInput
	if err := decodeJSONOrForm(r, &input); err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid request payload")
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
		writeAPIErrorFromError(w, r, status, "mock_resolve_failed", err, "Failed to resolve API mock")
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
