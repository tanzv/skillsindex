package web

import (
	"net/http"
	"strings"

	"skillsindex/internal/models"
)

type apiAdminIngestionMutationResponse struct {
	OK      bool              `json:"ok"`
	Status  string            `json:"status"`
	Message string            `json:"message"`
	Item    apiAdminSkillItem `json:"item"`
}

func writeAdminIngestionOperationError(w http.ResponseWriter, r *http.Request, err error, defaultCode string) {
	status := adminIngestionOperationStatus(err)
	code := strings.TrimSpace(defaultCode)
	switch status {
	case http.StatusBadRequest:
		code = "invalid_request"
	case http.StatusUnauthorized:
		code = "unauthorized"
	case http.StatusConflict:
		code = "job_conflict"
	case http.StatusServiceUnavailable:
		code = "service_unavailable"
	}
	if code == "" {
		code = "ingestion_failed"
	}
	writeAPIError(w, r, status, code, adminIngestionOperationMessage(err, "Request failed"))
}

func buildAPIAdminIngestionMutationResponse(result adminIngestionMutationResult) apiAdminIngestionMutationResponse {
	item := apiAdminSkillItem{}
	items := resultToAPIAdminSkillItems([]models.Skill{result.item})
	if len(items) > 0 {
		item = items[0]
	}
	return apiAdminIngestionMutationResponse{
		OK:      true,
		Status:  defaultString(strings.TrimSpace(result.status), "created"),
		Message: strings.TrimSpace(result.message),
		Item:    item,
	}
}

func (a *App) handleAPIAdminIngestionManual(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}

	input, err := readAdminManualIngestionInput(r)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid request payload")
		return
	}

	result, err := a.submitManualIngestion(r.Context(), user, input)
	if err != nil {
		writeAdminIngestionOperationError(w, r, err, "manual_ingestion_failed")
		return
	}

	writeJSON(w, http.StatusCreated, buildAPIAdminIngestionMutationResponse(result))
}

func (a *App) handleAPIAdminIngestionRepository(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}

	input, err := readAdminRepositoryIngestionInput(r)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid request payload")
		return
	}

	result, err := a.submitRepositoryIngestion(r.Context(), user, input)
	if err != nil {
		writeAdminIngestionOperationError(w, r, err, "repository_ingestion_failed")
		return
	}

	writeJSON(w, http.StatusCreated, buildAPIAdminIngestionMutationResponse(result))
}

func (a *App) handleAPIAdminIngestionUpload(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}

	input, archive, header, err := readAdminUploadIngestionInput(r)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid request payload")
		return
	}
	defer archive.Close()

	result, err := a.submitUploadIngestion(r.Context(), user, input, archive, header)
	if err != nil {
		writeAdminIngestionOperationError(w, r, err, "upload_ingestion_failed")
		return
	}

	writeJSON(w, http.StatusCreated, buildAPIAdminIngestionMutationResponse(result))
}

func (a *App) handleAPIAdminIngestionSkillMP(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}

	input, err := readAdminSkillMPIngestionInput(r)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid request payload")
		return
	}

	result, err := a.submitSkillMPIngestion(r.Context(), user, input)
	if err != nil {
		writeAdminIngestionOperationError(w, r, err, "skillmp_ingestion_failed")
		return
	}

	writeJSON(w, http.StatusCreated, buildAPIAdminIngestionMutationResponse(result))
}
