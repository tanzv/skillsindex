package web

import (
	"encoding/json"
	"errors"
	"fmt"
	"mime/multipart"
	"net/http"
	"strings"

	"skillsindex/internal/models"
)

type adminIngestionOperationError struct {
	status  int
	message string
}

func (e *adminIngestionOperationError) Error() string {
	return e.message
}

type adminIngestionMutationResult struct {
	item    models.Skill
	status  string
	message string
}

type adminManualIngestionInput struct {
	Name           string
	Description    string
	Content        string
	Tags           string
	Visibility     string
	InstallCommand string
	Category       string
	Subcategory    string
	StarCount      int
	QualityScore   float64
}

type adminRepositoryIngestionInput struct {
	RepoURL        string
	RepoBranch     string
	RepoPath       string
	Tags           string
	Visibility     string
	InstallCommand string
	Category       string
	Subcategory    string
	QualityScore   float64
}

type adminUploadIngestionInput struct {
	Tags           string
	Visibility     string
	InstallCommand string
	Category       string
	Subcategory    string
	QualityScore   float64
}

type adminSkillMPIngestionInput struct {
	SkillMPURL     string
	SkillMPID      string
	SkillMPToken   string
	Tags           string
	Visibility     string
	InstallCommand string
	Category       string
	Subcategory    string
	QualityScore   float64
}

func newAdminIngestionOperationError(status int, message string) error {
	return &adminIngestionOperationError{
		status:  status,
		message: strings.TrimSpace(message),
	}
}

func adminIngestionOperationStatus(err error) int {
	var target *adminIngestionOperationError
	if errors.As(err, &target) && target.status >= http.StatusBadRequest {
		return target.status
	}
	return http.StatusInternalServerError
}

func adminIngestionOperationMessage(err error, fallback string) string {
	if err == nil {
		return strings.TrimSpace(fallback)
	}
	var target *adminIngestionOperationError
	if errors.As(err, &target) && strings.TrimSpace(target.message) != "" {
		return strings.TrimSpace(target.message)
	}
	if strings.TrimSpace(err.Error()) != "" {
		return strings.TrimSpace(err.Error())
	}
	return strings.TrimSpace(fallback)
}

func requestHasJSONContentType(r *http.Request) bool {
	contentType := strings.ToLower(strings.TrimSpace(r.Header.Get("Content-Type")))
	return strings.Contains(contentType, "application/json")
}

func readAdminManualIngestionInput(r *http.Request) (adminManualIngestionInput, error) {
	input := adminManualIngestionInput{QualityScore: 8.0}

	if requestHasJSONContentType(r) {
		var payload struct {
			Name           string   `json:"name"`
			Description    string   `json:"description"`
			Content        string   `json:"content"`
			Tags           string   `json:"tags"`
			Visibility     string   `json:"visibility"`
			InstallCommand string   `json:"install_command"`
			Category       string   `json:"category"`
			Subcategory    string   `json:"subcategory"`
			StarCount      *int     `json:"star_count"`
			QualityScore   *float64 `json:"quality_score"`
		}
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&payload); err != nil {
			return input, fmt.Errorf("invalid json payload: %w", err)
		}
		input.Name = strings.TrimSpace(payload.Name)
		input.Description = strings.TrimSpace(payload.Description)
		input.Content = strings.TrimSpace(payload.Content)
		input.Tags = strings.TrimSpace(payload.Tags)
		input.Visibility = strings.TrimSpace(payload.Visibility)
		input.InstallCommand = strings.TrimSpace(payload.InstallCommand)
		input.Category = strings.TrimSpace(payload.Category)
		input.Subcategory = strings.TrimSpace(payload.Subcategory)
		if payload.StarCount != nil && *payload.StarCount > 0 {
			input.StarCount = *payload.StarCount
		}
		if payload.QualityScore != nil {
			input.QualityScore = *payload.QualityScore
		}
		return input, nil
	}

	if err := r.ParseForm(); err != nil {
		return input, fmt.Errorf("invalid form payload: %w", err)
	}
	input.Name = strings.TrimSpace(r.FormValue("name"))
	input.Description = strings.TrimSpace(r.FormValue("description"))
	input.Content = strings.TrimSpace(r.FormValue("content"))
	input.Tags = strings.TrimSpace(r.FormValue("tags"))
	input.Visibility = strings.TrimSpace(r.FormValue("visibility"))
	input.InstallCommand = strings.TrimSpace(r.FormValue("install_command"))
	input.Category = strings.TrimSpace(r.FormValue("category"))
	input.Subcategory = strings.TrimSpace(r.FormValue("subcategory"))
	input.StarCount = parsePositiveInt(r.FormValue("star_count"), 0)
	input.QualityScore = parseFloatDefault(r.FormValue("quality_score"), 8.0)
	return input, nil
}

func readAdminRepositoryIngestionInput(r *http.Request) (adminRepositoryIngestionInput, error) {
	input := adminRepositoryIngestionInput{QualityScore: 8.6}

	if requestHasJSONContentType(r) {
		var payload struct {
			RepoURL        string   `json:"repo_url"`
			RepoBranch     string   `json:"repo_branch"`
			RepoPath       string   `json:"repo_path"`
			Tags           string   `json:"tags"`
			Visibility     string   `json:"visibility"`
			InstallCommand string   `json:"install_command"`
			Category       string   `json:"category"`
			Subcategory    string   `json:"subcategory"`
			QualityScore   *float64 `json:"quality_score"`
		}
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&payload); err != nil {
			return input, fmt.Errorf("invalid json payload: %w", err)
		}
		input.RepoURL = strings.TrimSpace(payload.RepoURL)
		input.RepoBranch = strings.TrimSpace(payload.RepoBranch)
		input.RepoPath = strings.TrimSpace(payload.RepoPath)
		input.Tags = strings.TrimSpace(payload.Tags)
		input.Visibility = strings.TrimSpace(payload.Visibility)
		input.InstallCommand = strings.TrimSpace(payload.InstallCommand)
		input.Category = strings.TrimSpace(payload.Category)
		input.Subcategory = strings.TrimSpace(payload.Subcategory)
		if payload.QualityScore != nil {
			input.QualityScore = *payload.QualityScore
		}
		return input, nil
	}

	if err := r.ParseForm(); err != nil {
		return input, fmt.Errorf("invalid form payload: %w", err)
	}
	input.RepoURL = strings.TrimSpace(r.FormValue("repo_url"))
	input.RepoBranch = strings.TrimSpace(r.FormValue("repo_branch"))
	input.RepoPath = strings.TrimSpace(r.FormValue("repo_path"))
	input.Tags = strings.TrimSpace(r.FormValue("tags"))
	input.Visibility = strings.TrimSpace(r.FormValue("visibility"))
	input.InstallCommand = strings.TrimSpace(r.FormValue("install_command"))
	input.Category = strings.TrimSpace(r.FormValue("category"))
	input.Subcategory = strings.TrimSpace(r.FormValue("subcategory"))
	input.QualityScore = parseFloatDefault(r.FormValue("quality_score"), 8.6)
	return input, nil
}

func readAdminSkillMPIngestionInput(r *http.Request) (adminSkillMPIngestionInput, error) {
	input := adminSkillMPIngestionInput{QualityScore: 8.8}

	if requestHasJSONContentType(r) {
		var payload struct {
			SkillMPURL     string   `json:"skillmp_url"`
			SkillMPID      string   `json:"skillmp_id"`
			SkillMPToken   string   `json:"skillmp_token"`
			Tags           string   `json:"tags"`
			Visibility     string   `json:"visibility"`
			InstallCommand string   `json:"install_command"`
			Category       string   `json:"category"`
			Subcategory    string   `json:"subcategory"`
			QualityScore   *float64 `json:"quality_score"`
		}
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&payload); err != nil {
			return input, fmt.Errorf("invalid json payload: %w", err)
		}
		input.SkillMPURL = strings.TrimSpace(payload.SkillMPURL)
		input.SkillMPID = strings.TrimSpace(payload.SkillMPID)
		input.SkillMPToken = strings.TrimSpace(payload.SkillMPToken)
		input.Tags = strings.TrimSpace(payload.Tags)
		input.Visibility = strings.TrimSpace(payload.Visibility)
		input.InstallCommand = strings.TrimSpace(payload.InstallCommand)
		input.Category = strings.TrimSpace(payload.Category)
		input.Subcategory = strings.TrimSpace(payload.Subcategory)
		if payload.QualityScore != nil {
			input.QualityScore = *payload.QualityScore
		}
		return input, nil
	}

	if err := r.ParseForm(); err != nil {
		return input, fmt.Errorf("invalid form payload: %w", err)
	}
	input.SkillMPURL = strings.TrimSpace(r.FormValue("skillmp_url"))
	input.SkillMPID = strings.TrimSpace(r.FormValue("skillmp_id"))
	input.SkillMPToken = strings.TrimSpace(r.FormValue("skillmp_token"))
	input.Tags = strings.TrimSpace(r.FormValue("tags"))
	input.Visibility = strings.TrimSpace(r.FormValue("visibility"))
	input.InstallCommand = strings.TrimSpace(r.FormValue("install_command"))
	input.Category = strings.TrimSpace(r.FormValue("category"))
	input.Subcategory = strings.TrimSpace(r.FormValue("subcategory"))
	input.QualityScore = parseFloatDefault(r.FormValue("quality_score"), 8.8)
	return input, nil
}

func readAdminUploadIngestionInput(r *http.Request) (adminUploadIngestionInput, multipart.File, *multipart.FileHeader, error) {
	input := adminUploadIngestionInput{QualityScore: 8.0}

	if err := r.ParseMultipartForm(32 << 20); err != nil {
		return input, nil, nil, fmt.Errorf("failed to parse upload form")
	}
	archive, header, err := r.FormFile("archive")
	if err != nil {
		return input, nil, nil, fmt.Errorf("missing archive file")
	}

	input.Tags = strings.TrimSpace(r.FormValue("tags"))
	input.Visibility = strings.TrimSpace(r.FormValue("visibility"))
	input.InstallCommand = strings.TrimSpace(r.FormValue("install_command"))
	input.Category = strings.TrimSpace(r.FormValue("category"))
	input.Subcategory = strings.TrimSpace(r.FormValue("subcategory"))
	input.QualityScore = parseFloatDefault(r.FormValue("quality_score"), 8.0)
	return input, archive, header, nil
}

func isAdminIngestionValidationError(message string) bool {
	normalized := strings.ToLower(strings.TrimSpace(message))
	if normalized == "" {
		return false
	}
	for _, marker := range []string{"required", "invalid", "empty"} {
		if strings.Contains(normalized, marker) {
			return true
		}
	}
	return false
}

func classifyAdminSkillCreateError(err error, fallback string) error {
	if err == nil {
		return nil
	}
	message := strings.TrimSpace(err.Error())
	if isAdminIngestionValidationError(message) {
		return newAdminIngestionOperationError(http.StatusBadRequest, message)
	}
	return newAdminIngestionOperationError(http.StatusInternalServerError, fallback)
}
