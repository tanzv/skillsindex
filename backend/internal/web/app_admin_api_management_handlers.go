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
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.apiSpecRegistrySvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}
	if !a.authorizePublishedOperation(w, r) {
		return
	}

	spec, err := a.apiSpecRegistrySvc.CurrentPublished(r.Context())
	if err != nil {
		if errors.Is(err, services.ErrAPISpecNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "api_spec_not_found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"item": resultToAPIAdminSpecItem(spec)})
}

func (a *App) handleAPIAdminImportSpec(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.apiSpecRegistrySvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}
	if !a.authorizePublishedOperation(w, r) {
		return
	}

	var input apiAdminImportSpecInput
	if err := decodeJSONOrForm(r, &input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}

	result, err := a.apiSpecRegistrySvc.ImportDraft(r.Context(), services.ImportAPISpecDraftInput{
		Name:        strings.TrimSpace(input.Name),
		Slug:        strings.TrimSpace(input.Slug),
		SourcePath:  strings.TrimSpace(input.SourcePath),
		ActorUserID: user.ID,
	})
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "import_failed", "message": err.Error()})
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
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.apiSpecRegistrySvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}
	if !a.authorizePublishedOperation(w, r) {
		return
	}

	specID, err := parseUintURLParam(r, "specID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_spec_id"})
		return
	}

	spec, err := a.apiSpecRegistrySvc.ValidateDraft(r.Context(), specID)
	if err != nil {
		if errors.Is(err, services.ErrAPISpecNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "api_spec_not_found"})
			return
		}
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "validate_failed", "message": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"item": resultToAPIAdminSpecItem(spec)})
}

func (a *App) handleAPIAdminPublishSpec(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.apiPublishSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}
	if !a.authorizePublishedOperation(w, r) {
		return
	}

	specID, err := parseUintURLParam(r, "specID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_spec_id"})
		return
	}

	spec, err := a.apiPublishSvc.Publish(r.Context(), services.PublishAPISpecInput{
		SpecID:      specID,
		ActorUserID: user.ID,
	})
	if err != nil {
		if errors.Is(err, services.ErrAPISpecNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "api_spec_not_found"})
			return
		}
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "publish_failed", "message": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"item": resultToAPIAdminSpecItem(spec)})
}

func (a *App) handleAPIAdminExportSpecJSON(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.apiExportSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
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
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "export_failed", "message": err.Error()})
		return
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(result.ArtifactRaw)
}

func (a *App) handleAPIAdminExportSpecYAML(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.apiExportSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
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
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "export_failed", "message": err.Error()})
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
