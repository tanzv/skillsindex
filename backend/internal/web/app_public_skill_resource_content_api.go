package web

import (
	"errors"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

const defaultPublicSkillResourceFileMaxBytes = 256 * 1024

type apiPublicSkillResourceContentResponse struct {
	SkillID     uint      `json:"skill_id"`
	Path        string    `json:"path"`
	DisplayName string    `json:"display_name"`
	Language    string    `json:"language"`
	SizeBytes   int       `json:"size_bytes"`
	SizeLabel   string    `json:"size_label"`
	Content     string    `json:"content"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func toAPIPublicSkillResourceFiles(items []services.SourceFileSnapshot) []apiPublicSkillResourceFile {
	files := make([]apiPublicSkillResourceFile, 0, len(items))
	for _, item := range items {
		files = append(files, apiPublicSkillResourceFile{
			Name:        item.Name,
			DisplayName: item.Name,
			SizeBytes:   int(item.SizeBytes),
			SizeLabel:   item.SizeLabel,
			Language:    item.Language,
		})
	}
	return files
}

func buildPublicSkillResourceContentResponse(
	skill models.Skill,
	fileContent services.SourceFileContent,
) apiPublicSkillResourceContentResponse {
	return apiPublicSkillResourceContentResponse{
		SkillID:     skill.ID,
		Path:        fileContent.Name,
		DisplayName: fileContent.Name,
		Language:    fileContent.Language,
		SizeBytes:   int(fileContent.SizeBytes),
		SizeLabel:   fileContent.SizeLabel,
		Content:     fileContent.Content,
		UpdatedAt:   skill.UpdatedAt,
	}
}

func matchesFallbackResourceFile(requestedPath string, fallbackPath string) bool {
	normalizedRequestedPath := filepath.ToSlash(strings.TrimSpace(requestedPath))
	normalizedFallbackPath := filepath.ToSlash(strings.TrimSpace(fallbackPath))
	if normalizedRequestedPath == "" {
		return true
	}
	return normalizedRequestedPath == normalizedFallbackPath
}

func buildFallbackPublicSkillResourceContent(
	skill models.Skill,
	requestedPath string,
) (apiPublicSkillResourceContentResponse, error) {
	fallbackFile := buildFallbackPublicSkillResourceFiles(skill)[0]
	if !matchesFallbackResourceFile(requestedPath, fallbackFile.Name) {
		return apiPublicSkillResourceContentResponse{}, services.ErrSourceFileNotFound
	}
	return apiPublicSkillResourceContentResponse{
		SkillID:     skill.ID,
		Path:        fallbackFile.Name,
		DisplayName: fallbackFile.DisplayName,
		Language:    fallbackFile.Language,
		SizeBytes:   fallbackFile.SizeBytes,
		SizeLabel:   fallbackFile.SizeLabel,
		Content:     skill.Content,
		UpdatedAt:   skill.UpdatedAt,
	}, nil
}

func (a *App) resolvePublicSkillResourceFiles(r *http.Request, skill models.Skill) []apiPublicSkillResourceFile {
	switch skill.SourceType {
	case models.SourceTypeRepository:
		if a.repositoryService == nil {
			return buildFallbackPublicSkillResourceFiles(skill)
		}
		files, err := a.repositoryService.ListFiles(r.Context(), services.RepoSource{
			URL:    strings.TrimSpace(skill.SourceURL),
			Branch: strings.TrimSpace(skill.SourceBranch),
			Path:   strings.TrimSpace(skill.SourcePath),
		}, 64)
		if err != nil || len(files) == 0 {
			return buildFallbackPublicSkillResourceFiles(skill)
		}
		return toAPIPublicSkillResourceFiles(files)
	case models.SourceTypeUpload:
		if a.uploadService == nil {
			return buildFallbackPublicSkillResourceFiles(skill)
		}
		files, err := a.uploadService.ListFiles(strings.TrimSpace(skill.SourcePath), 64)
		if err != nil || len(files) == 0 {
			return buildFallbackPublicSkillResourceFiles(skill)
		}
		return toAPIPublicSkillResourceFiles(files)
	default:
		return buildFallbackPublicSkillResourceFiles(skill)
	}
}

func (a *App) resolvePublicSkillResourceContent(
	r *http.Request,
	skill models.Skill,
	requestedPath string,
) (apiPublicSkillResourceContentResponse, error) {
	switch skill.SourceType {
	case models.SourceTypeRepository:
		if a.repositoryService == nil {
			return buildFallbackPublicSkillResourceContent(skill, requestedPath)
		}
		content, err := a.repositoryService.ReadFile(r.Context(), services.RepoSource{
			URL:    strings.TrimSpace(skill.SourceURL),
			Branch: strings.TrimSpace(skill.SourceBranch),
			Path:   strings.TrimSpace(skill.SourcePath),
		}, requestedPath, defaultPublicSkillResourceFileMaxBytes)
		if err == nil {
			return buildPublicSkillResourceContentResponse(skill, content), nil
		}
		if errors.Is(err, services.ErrSourceFilePathInvalid) ||
			errors.Is(err, services.ErrSourceFileNotFound) ||
			errors.Is(err, services.ErrSourceFileTooLarge) ||
			errors.Is(err, services.ErrSourceFileUnsupported) {
			return apiPublicSkillResourceContentResponse{}, err
		}
		return buildFallbackPublicSkillResourceContent(skill, requestedPath)
	case models.SourceTypeUpload:
		if a.uploadService == nil {
			return buildFallbackPublicSkillResourceContent(skill, requestedPath)
		}
		content, err := a.uploadService.ReadFile(strings.TrimSpace(skill.SourcePath), requestedPath, defaultPublicSkillResourceFileMaxBytes)
		if err == nil {
			return buildPublicSkillResourceContentResponse(skill, content), nil
		}
		if errors.Is(err, services.ErrSourceFilePathInvalid) ||
			errors.Is(err, services.ErrSourceFileNotFound) ||
			errors.Is(err, services.ErrSourceFileTooLarge) ||
			errors.Is(err, services.ErrSourceFileUnsupported) {
			return apiPublicSkillResourceContentResponse{}, err
		}
		return buildFallbackPublicSkillResourceContent(skill, requestedPath)
	default:
		return buildFallbackPublicSkillResourceContent(skill, requestedPath)
	}
}

func writePublicSkillResourceContentError(w http.ResponseWriter, r *http.Request, err error) {
	statusCode := http.StatusInternalServerError
	errorCode := "resource_content_unavailable"
	message := "Failed to load resource content"

	switch {
	case errors.Is(err, services.ErrSourceFilePathInvalid):
		statusCode = http.StatusBadRequest
		errorCode = "invalid_resource_path"
		message = "Resource path is invalid"
	case errors.Is(err, services.ErrSourceFileNotFound):
		statusCode = http.StatusNotFound
		errorCode = "resource_file_not_found"
		message = "Resource file not found"
	case errors.Is(err, services.ErrSourceFileTooLarge):
		statusCode = http.StatusRequestEntityTooLarge
		errorCode = "resource_file_too_large"
		message = "Resource file is too large to preview"
	case errors.Is(err, services.ErrSourceFileUnsupported):
		statusCode = http.StatusUnsupportedMediaType
		errorCode = "resource_file_unsupported"
		message = "Resource file is not previewable"
	}

	writeAPIError(w, r, statusCode, errorCode, message)
}

func (a *App) handleAPIPublicSkillResourceContent(w http.ResponseWriter, r *http.Request) {
	if !a.ensureMarketplaceAccess(w, r) {
		return
	}
	if a.skillService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Skill service unavailable")
		return
	}

	skillID, ok := parseSkillIDParam(r)
	if !ok {
		writeAPIError(w, r, http.StatusNotFound, "skill_not_found", "Skill not found")
		return
	}

	viewer := resolveCurrentViewer(r, a.authService)
	viewerID := uint(0)
	if viewer != nil {
		viewerID = viewer.ID
	}

	skill, err := a.skillService.GetMarketplaceVisibleSkillByID(r.Context(), skillID, viewerID)
	if err != nil {
		writeMarketplaceSkillLookupError(w, err, "resource")
		return
	}

	content, err := a.resolvePublicSkillResourceContent(r, skill, r.URL.Query().Get("path"))
	if err != nil {
		writePublicSkillResourceContentError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, content)
}
