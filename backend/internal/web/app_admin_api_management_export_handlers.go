package web

import (
	"net/http"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

type apiAdminExportRecordItem struct {
	ID           uint   `json:"id"`
	SpecID       uint   `json:"spec_id"`
	ExportType   string `json:"export_type"`
	Target       string `json:"target"`
	Format       string `json:"format"`
	ArtifactPath string `json:"artifact_path"`
	Checksum     string `json:"checksum"`
}

type apiAdminExportCreateInput struct {
	ExportType string `json:"export_type"`
	Format     string `json:"format"`
	Target     string `json:"target"`
}

func (a *App) handleAPIAdminExports(w http.ResponseWriter, r *http.Request) {
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

	items, err := a.apiExportSvc.ListCurrentExports(r.Context())
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "query_failed", err, "Failed to load API exports")
		return
	}

	responseItems := make([]apiAdminExportRecordItem, 0, len(items))
	for _, item := range items {
		responseItems = append(responseItems, resultToAPIAdminExportRecordItem(item))
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": responseItems})
}

func (a *App) handleAPIAdminExportsCreate(w http.ResponseWriter, r *http.Request) {
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

	var input apiAdminExportCreateInput
	if err := decodeJSONOrForm(r, &input); err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid request payload")
		return
	}

	result, err := a.apiExportSvc.CreateCurrentExport(r.Context(), services.CreateAPIExportInput{
		ExportType:  input.ExportType,
		Format:      input.Format,
		Target:      input.Target,
		ActorUserID: user.ID,
	})
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "export_failed", err, "Failed to create API export")
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"item":         resultToAPIAdminExportRecordItem(result.Record),
		"artifact_raw": string(result.ArtifactRaw),
	})
}

func resultToAPIAdminExportRecordItem(item models.APIExportRecord) apiAdminExportRecordItem {
	return apiAdminExportRecordItem{
		ID:           item.ID,
		SpecID:       item.SpecID,
		ExportType:   item.ExportType,
		Target:       item.Target,
		Format:       item.Format,
		ArtifactPath: item.ArtifactPath,
		Checksum:     item.Checksum,
	}
}
