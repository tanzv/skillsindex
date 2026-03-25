package web

import (
	"errors"
	"net/http"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

type apiAdminSpecItem struct {
	ID              uint                 `json:"id"`
	Name            string               `json:"name"`
	Slug            string               `json:"slug"`
	SourceType      string               `json:"source_type"`
	Status          models.APISpecStatus `json:"status"`
	SemanticVersion string               `json:"semantic_version"`
	IsCurrent       bool                 `json:"is_current"`
	SourcePath      string               `json:"source_path"`
	BundlePath      string               `json:"bundle_path"`
}

func (a *App) handleAPIAdminCurrentSpec(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if !user.CanManageUsers() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}
	if a.apiSpecRegistrySvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "API spec registry service is unavailable")
		return
	}
	if !a.authorizePublishedOperation(w, r) {
		return
	}

	spec, err := a.apiSpecRegistrySvc.CurrentPublished(r.Context())
	if err != nil {
		if errors.Is(err, services.ErrAPISpecNotFound) {
			writeAPIError(w, r, http.StatusNotFound, "api_spec_not_found", "API spec not found")
			return
		}
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "query_failed", err, "Failed to load current API spec")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"item": resultToAPIAdminSpecItem(spec)})
}

func (a *App) handleAPIAdminImportSpec(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if !user.CanManageUsers() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}
	if a.apiSpecRegistrySvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "API spec registry service is unavailable")
		return
	}
	if !a.authorizePublishedOperation(w, r) {
		return
	}

	var input apiAdminImportSpecInput
	if err := decodeJSONOrForm(r, &input); err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid request payload")
		return
	}

	result, err := a.apiSpecRegistrySvc.ImportDraft(r.Context(), services.ImportAPISpecDraftInput{
		Name:        strings.TrimSpace(input.Name),
		Slug:        strings.TrimSpace(input.Slug),
		SourcePath:  strings.TrimSpace(input.SourcePath),
		ActorUserID: user.ID,
	})
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "import_failed", err, "Failed to import API spec")
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"item":        resultToAPIAdminSpecItem(result.Spec),
		"bundle_path": result.BundlePath,
	})
}

func (a *App) handleAPIAdminValidateSpec(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if !user.CanManageUsers() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}
	if a.apiSpecRegistrySvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "API spec registry service is unavailable")
		return
	}
	if !a.authorizePublishedOperation(w, r) {
		return
	}

	specID, err := parseUintURLParam(r, "specID")
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_spec_id", "Invalid API spec id")
		return
	}

	spec, err := a.apiSpecRegistrySvc.ValidateDraft(r.Context(), specID)
	if err != nil {
		if errors.Is(err, services.ErrAPISpecNotFound) {
			writeAPIError(w, r, http.StatusNotFound, "api_spec_not_found", "API spec not found")
			return
		}
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "validate_failed", err, "Failed to validate API spec")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"item": resultToAPIAdminSpecItem(spec)})
}

func (a *App) handleAPIAdminPublishSpec(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if !user.CanManageUsers() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}
	if a.apiPublishSvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "API publish service is unavailable")
		return
	}
	if !a.authorizePublishedOperation(w, r) {
		return
	}

	specID, err := parseUintURLParam(r, "specID")
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_spec_id", "Invalid API spec id")
		return
	}

	spec, err := a.apiPublishSvc.Publish(r.Context(), services.PublishAPISpecInput{
		SpecID:      specID,
		ActorUserID: user.ID,
	})
	if err != nil {
		if errors.Is(err, services.ErrAPISpecNotFound) {
			writeAPIError(w, r, http.StatusNotFound, "api_spec_not_found", "API spec not found")
			return
		}
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "publish_failed", err, "Failed to publish API spec")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"item": resultToAPIAdminSpecItem(spec)})
}

func (a *App) handleAPIAdminExportSpecJSON(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if !user.CanManageUsers() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}
	if a.apiExportSvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "API export service is unavailable")
		return
	}
	if !a.authorizePublishedOperation(w, r) {
		return
	}

	result, err := a.apiExportSvc.CreateCurrentExport(r.Context(), services.CreateAPIExportInput{
		ExportType:  "raw-published",
		Format:      "json",
		Target:      "admin-download",
		ActorUserID: user.ID,
	})
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "export_failed", err, "Failed to export API spec")
		return
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(result.ArtifactRaw)
}

func (a *App) handleAPIAdminExportSpecYAML(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if !user.CanManageUsers() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}
	if a.apiExportSvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "API export service is unavailable")
		return
	}
	if !a.authorizePublishedOperation(w, r) {
		return
	}

	result, err := a.apiExportSvc.CreateCurrentExport(r.Context(), services.CreateAPIExportInput{
		ExportType:  "raw-published",
		Format:      "yaml",
		Target:      "admin-download",
		ActorUserID: user.ID,
	})
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "export_failed", err, "Failed to export API spec")
		return
	}

	w.Header().Set("Content-Type", "application/yaml; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(result.ArtifactRaw)
}

func resultToAPIAdminSpecItem(spec models.APISpec) apiAdminSpecItem {
	return apiAdminSpecItem{
		ID:              spec.ID,
		Name:            spec.Name,
		Slug:            spec.Slug,
		SourceType:      spec.SourceType,
		Status:          spec.Status,
		SemanticVersion: spec.SemanticVersion,
		IsCurrent:       spec.IsCurrent,
		SourcePath:      spec.SourcePath,
		BundlePath:      spec.BundlePath,
	}
}
