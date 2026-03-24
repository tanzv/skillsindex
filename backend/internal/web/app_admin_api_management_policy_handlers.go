package web

import (
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
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.apiPolicySvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}
	if !a.authorizePublishedOperation(w, r) {
		return
	}

	items, err := a.apiPolicySvc.ListCurrentOperations(r.Context())
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "query_failed", "message": err.Error()})
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
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.apiPolicySvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}
	if !a.authorizePublishedOperation(w, r) {
		return
	}

	operationID := strings.TrimSpace(chi.URLParam(r, "operationID"))
	item, err := a.apiPolicySvc.GetCurrentOperationPolicy(r.Context(), operationID)
	if err != nil {
		status := http.StatusBadRequest
		if err == services.ErrAPIOperationNotFound {
			status = http.StatusNotFound
		}
		writeJSON(w, status, map[string]any{"error": "query_failed", "message": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"item": resultToAPIAdminOperationItem(item)})
}

func (a *App) handleAPIAdminCurrentOperationPolicyUpsert(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.apiPolicySvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}
	if !a.authorizePublishedOperation(w, r) {
		return
	}

	var input apiAdminOperationPolicyUpsertInput
	if err := decodeJSONOrForm(r, &input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
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
		if err == services.ErrAPIOperationNotFound {
			status = http.StatusNotFound
		}
		writeJSON(w, status, map[string]any{"error": "update_failed", "message": err.Error()})
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
