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

	items, err := a.apiExportSvc.ListCurrentExports(r.Context())
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "query_failed", "message": err.Error()})
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

	var input apiAdminExportCreateInput
	if err := decodeJSONOrForm(r, &input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}

	result, err := a.apiExportSvc.CreateCurrentExport(r.Context(), services.CreateAPIExportInput{
		ExportType:  input.ExportType,
		Format:      input.Format,
		Target:      input.Target,
		ActorUserID: user.ID,
	})
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "export_failed", "message": err.Error()})
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
