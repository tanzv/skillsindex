package web

import (
	"errors"
	"net/http"
	"strings"

	"skillsindex/internal/services"

	"github.com/go-chi/chi/v5"
)

type apiAdminOperationItem struct {
	OperationID string                              `json:"operation_id"`
	Method      string                              `json:"method"`
	Path        string                              `json:"path"`
	TagGroup    string                              `json:"tag_group"`
	Summary     string                              `json:"summary"`
	Deprecated  bool                                `json:"deprecated"`
	Visibility  string                              `json:"visibility"`
	Policy      *apiAdminOperationPolicyItem        `json:"policy,omitempty"`
	Resolved    services.ResolvedAPIOperationPolicy `json:"resolved"`
}

type apiAdminOperationPolicyItem struct {
	AuthMode       string   `json:"auth_mode"`
	RequiredRoles  []string `json:"required_roles"`
	RequiredScopes []string `json:"required_scopes"`
	Enabled        bool     `json:"enabled"`
	MockEnabled    bool     `json:"mock_enabled"`
	ExportEnabled  bool     `json:"export_enabled"`
}

type apiAdminOperationPolicyUpsertInput struct {
	AuthMode       string   `json:"auth_mode"`
	RequiredRoles  []string `json:"required_roles"`
	RequiredScopes []string `json:"required_scopes"`
	Enabled        bool     `json:"enabled"`
	MockEnabled    bool     `json:"mock_enabled"`
	ExportEnabled  bool     `json:"export_enabled"`
}

func (a *App) handleAPIAdminCurrentOperations(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if !user.CanManageUsers() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}
	if a.apiPolicySvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "API policy service is unavailable")
		return
	}
	if !a.authorizePublishedOperation(w, r) {
		return
	}

	items, err := a.apiPolicySvc.ListCurrentOperations(r.Context())
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "query_failed", err, "Failed to load API operations")
		return
	}

	responseItems := make([]apiAdminOperationItem, 0, len(items))
	for _, item := range items {
		responseItems = append(responseItems, resultToAPIAdminOperationItem(item))
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": responseItems})
}

func (a *App) handleAPIAdminCurrentOperationPolicy(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if !user.CanManageUsers() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}
	if a.apiPolicySvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "API policy service is unavailable")
		return
	}
	if !a.authorizePublishedOperation(w, r) {
		return
	}

	operationID := strings.TrimSpace(chi.URLParam(r, "operationID"))
	item, err := a.apiPolicySvc.GetCurrentOperationPolicy(r.Context(), operationID)
	if err != nil {
		status := http.StatusBadRequest
		code := "query_failed"
		message := "Failed to load API operation policy"
		if errors.Is(err, services.ErrAPIOperationNotFound) {
			status = http.StatusNotFound
			code = "api_operation_not_found"
			message = "API operation not found"
		}
		writeAPIErrorFromError(w, r, status, code, err, message)
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"item": resultToAPIAdminOperationItem(item)})
}

func (a *App) handleAPIAdminCurrentOperationPolicyUpsert(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if !user.CanManageUsers() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}
	if a.apiPolicySvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "API policy service is unavailable")
		return
	}
	if !a.authorizePublishedOperation(w, r) {
		return
	}

	var input apiAdminOperationPolicyUpsertInput
	if err := decodeJSONOrForm(r, &input); err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid request payload")
		return
	}

	operationID := strings.TrimSpace(chi.URLParam(r, "operationID"))
	item, err := a.apiPolicySvc.UpsertCurrentOperationPolicy(r.Context(), services.UpsertCurrentAPIOperationPolicyInput{
		OperationID:    operationID,
		AuthMode:       input.AuthMode,
		RequiredRoles:  input.RequiredRoles,
		RequiredScopes: input.RequiredScopes,
		Enabled:        input.Enabled,
		MockEnabled:    input.MockEnabled,
		ExportEnabled:  input.ExportEnabled,
		ActorUserID:    user.ID,
	})
	if err != nil {
		status := http.StatusBadRequest
		code := "update_failed"
		message := "Failed to update API operation policy"
		if errors.Is(err, services.ErrAPIOperationNotFound) {
			status = http.StatusNotFound
			code = "api_operation_not_found"
			message = "API operation not found"
		}
		writeAPIErrorFromError(w, r, status, code, err, message)
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"item": resultToAPIAdminOperationItem(item)})
}

func resultToAPIAdminOperationItem(item services.APIOperationPolicySnapshot) apiAdminOperationItem {
	result := apiAdminOperationItem{
		OperationID: item.Operation.OperationID,
		Method:      item.Operation.Method,
		Path:        item.Operation.Path,
		TagGroup:    item.Operation.TagGroup,
		Summary:     item.Operation.Summary,
		Deprecated:  item.Operation.Deprecated,
		Visibility:  item.Operation.Visibility,
		Resolved:    item.Resolved,
	}
	if item.Policy != nil {
		result.Policy = &apiAdminOperationPolicyItem{
			AuthMode:       string(item.Policy.AuthMode),
			RequiredRoles:  item.Policy.RequiredRoles,
			RequiredScopes: item.Policy.RequiredScopes,
			Enabled:        item.Policy.Enabled,
			MockEnabled:    item.Policy.MockEnabled,
			ExportEnabled:  item.Policy.ExportEnabled,
		}
	}
	return result
}
