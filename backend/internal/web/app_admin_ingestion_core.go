package web

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
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
		return input, nil, nil, fmt.Errorf("Failed to parse upload form")
	}
	archive, header, err := r.FormFile("archive")
	if err != nil {
		return input, nil, nil, fmt.Errorf("Missing archive file")
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

func (a *App) createManualSkillFromIngestion(
	ctx context.Context,
	user *models.User,
	input adminManualIngestionInput,
) (adminIngestionMutationResult, error) {
	if user == nil {
		return adminIngestionMutationResult{}, newAdminIngestionOperationError(http.StatusUnauthorized, "Unauthorized")
	}
	if a.skillService == nil {
		return adminIngestionMutationResult{}, newAdminIngestionOperationError(http.StatusServiceUnavailable, "Skill service unavailable")
	}

	category, subcategory := resolveCategorySelection(input.Category, input.Subcategory, "development", "backend")
	createdSkill, err := a.skillService.CreateSkill(ctx, services.CreateSkillInput{
		OwnerID:         user.ID,
		Name:            input.Name,
		Description:     input.Description,
		Content:         input.Content,
		Tags:            services.ParseTagInput(input.Tags),
		CategorySlug:    category,
		SubcategorySlug: subcategory,
		Visibility:      parseVisibility(input.Visibility),
		SourceType:      models.SourceTypeManual,
		InstallCommand:  input.InstallCommand,
		StarCount:       input.StarCount,
		QualityScore:    input.QualityScore,
	})
	if err != nil {
		return adminIngestionMutationResult{}, classifyAdminSkillCreateError(err, "Failed to create manual skill")
	}

	a.recordAudit(ctx, user, services.RecordAuditInput{
		Action:     "skill_create_manual",
		TargetType: "skill",
		TargetID:   createdSkill.ID,
		Summary:    "Created manual skill",
		Details: auditDetailsJSON(map[string]string{
			"name":       createdSkill.Name,
			"visibility": string(createdSkill.Visibility),
			"source":     string(createdSkill.SourceType),
		}),
	})

	return adminIngestionMutationResult{
		item:    createdSkill,
		status:  "created",
		message: "Manual skill created",
	}, nil
}

func (a *App) createRepositorySkillFromIngestion(
	ctx context.Context,
	user *models.User,
	input adminRepositoryIngestionInput,
) (adminIngestionMutationResult, error) {
	if user == nil {
		return adminIngestionMutationResult{}, newAdminIngestionOperationError(http.StatusUnauthorized, "Unauthorized")
	}
	if a.skillService == nil || a.repositoryService == nil {
		return adminIngestionMutationResult{}, newAdminIngestionOperationError(http.StatusServiceUnavailable, "Repository ingestion service unavailable")
	}

	source := services.RepoSource{
		URL:    input.RepoURL,
		Branch: input.RepoBranch,
		Path:   input.RepoPath,
	}
	meta, err := a.repositoryService.CloneAndExtract(ctx, source)
	if err != nil {
		return adminIngestionMutationResult{}, newAdminIngestionOperationError(http.StatusBadRequest, "Repository sync failed: "+err.Error())
	}

	category, subcategory := resolveCategorySelection(input.Category, input.Subcategory, "devops", "git-workflows")
	now := time.Now().UTC()
	tags := append(meta.Tags, services.ParseTagInput(input.Tags)...)
	createdSkill, err := a.skillService.CreateSkill(ctx, services.CreateSkillInput{
		OwnerID:         user.ID,
		Name:            meta.Name,
		Description:     meta.Description,
		Content:         meta.Content,
		Tags:            tags,
		CategorySlug:    category,
		SubcategorySlug: subcategory,
		Visibility:      parseVisibility(input.Visibility),
		SourceType:      models.SourceTypeRepository,
		SourceURL:       source.URL,
		SourceBranch:    source.Branch,
		SourcePath:      source.Path,
		RepoURL:         source.URL,
		InstallCommand:  defaultString(input.InstallCommand, "codex skill install github:"+trimGitURL(source.URL)),
		QualityScore:    input.QualityScore,
		LastSyncedAt:    &now,
	})
	if err != nil {
		return adminIngestionMutationResult{}, classifyAdminSkillCreateError(err, "Failed to store repository skill")
	}

	a.recordAudit(ctx, user, services.RecordAuditInput{
		Action:     "skill_create_repository",
		TargetType: "skill",
		TargetID:   createdSkill.ID,
		Summary:    "Created skill from repository",
		Details: auditDetailsJSON(map[string]string{
			"name":        createdSkill.Name,
			"repo_url":    source.URL,
			"repo_branch": source.Branch,
			"repo_path":   source.Path,
		}),
	})

	return adminIngestionMutationResult{
		item:    createdSkill,
		status:  "created",
		message: "Repository skill synced",
	}, nil
}

func (a *App) storeUploadedArchive(userID uint, archive multipart.File, filename string) (string, error) {
	storageRoot := strings.TrimSpace(a.storagePath)
	if storageRoot == "" {
		storageRoot = os.TempDir()
	}

	uploadDir := filepath.Join(storageRoot, "uploads", strconv.FormatUint(uint64(userID), 10))
	if err := os.MkdirAll(uploadDir, 0o755); err != nil {
		return "", newAdminIngestionOperationError(http.StatusInternalServerError, "Failed to prepare upload storage")
	}

	archivePath := filepath.Join(uploadDir, fmt.Sprintf("%d_%s", time.Now().UTC().UnixNano(), filepath.Base(filename)))
	dst, err := os.Create(archivePath)
	if err != nil {
		return "", newAdminIngestionOperationError(http.StatusInternalServerError, "Failed to store uploaded archive")
	}
	if _, err := io.Copy(dst, archive); err != nil {
		_ = dst.Close()
		return "", newAdminIngestionOperationError(http.StatusInternalServerError, "Failed to save archive content")
	}
	if err := dst.Close(); err != nil {
		return "", newAdminIngestionOperationError(http.StatusInternalServerError, "Failed to finalize uploaded archive")
	}
	return archivePath, nil
}

func (a *App) createUploadSkillFromIngestion(
	ctx context.Context,
	user *models.User,
	input adminUploadIngestionInput,
	archive multipart.File,
	header *multipart.FileHeader,
) (adminIngestionMutationResult, error) {
	if user == nil {
		return adminIngestionMutationResult{}, newAdminIngestionOperationError(http.StatusUnauthorized, "Unauthorized")
	}
	if a.skillService == nil || a.uploadService == nil {
		return adminIngestionMutationResult{}, newAdminIngestionOperationError(http.StatusServiceUnavailable, "Upload ingestion service unavailable")
	}
	if archive == nil || header == nil {
		return adminIngestionMutationResult{}, newAdminIngestionOperationError(http.StatusBadRequest, "Missing archive file")
	}

	archivePath, err := a.storeUploadedArchive(user.ID, archive, header.Filename)
	if err != nil {
		return adminIngestionMutationResult{}, err
	}

	meta, err := a.uploadService.ExtractFromZipFile(archivePath)
	if err != nil {
		return adminIngestionMutationResult{}, newAdminIngestionOperationError(http.StatusBadRequest, "Failed to parse archive: "+err.Error())
	}

	category, subcategory := resolveCategorySelection(input.Category, input.Subcategory, "tools", "automation-tools")
	tags := append(meta.Tags, services.ParseTagInput(input.Tags)...)
	createdSkill, err := a.skillService.CreateSkill(ctx, services.CreateSkillInput{
		OwnerID:         user.ID,
		Name:            meta.Name,
		Description:     meta.Description,
		Content:         meta.Content,
		Tags:            tags,
		CategorySlug:    category,
		SubcategorySlug: subcategory,
		Visibility:      parseVisibility(input.Visibility),
		SourceType:      models.SourceTypeUpload,
		SourcePath:      archivePath,
		InstallCommand:  input.InstallCommand,
		QualityScore:    input.QualityScore,
	})
	if err != nil {
		return adminIngestionMutationResult{}, classifyAdminSkillCreateError(err, "Failed to create skill from archive")
	}

	a.recordAudit(ctx, user, services.RecordAuditInput{
		Action:     "skill_create_upload",
		TargetType: "skill",
		TargetID:   createdSkill.ID,
		Summary:    "Imported skill from archive",
		Details: auditDetailsJSON(map[string]string{
			"name":       createdSkill.Name,
			"archive":    filepath.Base(archivePath),
			"visibility": string(createdSkill.Visibility),
		}),
	})

	return adminIngestionMutationResult{
		item:    createdSkill,
		status:  "created",
		message: "Archive skill imported",
	}, nil
}

func (a *App) createSkillMPSkillFromIngestion(
	ctx context.Context,
	user *models.User,
	input adminSkillMPIngestionInput,
) (adminIngestionMutationResult, error) {
	if user == nil {
		return adminIngestionMutationResult{}, newAdminIngestionOperationError(http.StatusUnauthorized, "Unauthorized")
	}
	if a.skillService == nil || a.skillMPService == nil {
		return adminIngestionMutationResult{}, newAdminIngestionOperationError(http.StatusServiceUnavailable, "SkillMP ingestion service unavailable")
	}

	meta, sourceURL, err := a.skillMPService.FetchSkill(ctx, services.SkillMPFetchInput{
		URL:     input.SkillMPURL,
		SkillID: input.SkillMPID,
		Token:   input.SkillMPToken,
	})
	if err != nil {
		return adminIngestionMutationResult{}, newAdminIngestionOperationError(http.StatusBadRequest, "SkillMP import failed: "+err.Error())
	}

	category, subcategory := resolveCategorySelection(input.Category, input.Subcategory, "data-ai", "llm-ai")
	now := time.Now().UTC()
	tags := append(meta.Tags, services.ParseTagInput(input.Tags)...)
	createdSkill, err := a.skillService.CreateSkill(ctx, services.CreateSkillInput{
		OwnerID:         user.ID,
		Name:            meta.Name,
		Description:     meta.Description,
		Content:         meta.Content,
		Tags:            tags,
		CategorySlug:    category,
		SubcategorySlug: subcategory,
		Visibility:      parseVisibility(input.Visibility),
		SourceType:      models.SourceTypeSkillMP,
		SourceURL:       sourceURL,
		InstallCommand:  defaultString(input.InstallCommand, "codex skill install skillmp:"+extractSkillMPIdentifier(sourceURL)),
		QualityScore:    input.QualityScore,
		LastSyncedAt:    &now,
	})
	if err != nil {
		return adminIngestionMutationResult{}, classifyAdminSkillCreateError(err, "Failed to store SkillMP skill")
	}

	a.recordAudit(ctx, user, services.RecordAuditInput{
		Action:     "skill_create_skillmp",
		TargetType: "skill",
		TargetID:   createdSkill.ID,
		Summary:    "Imported skill from SkillMP",
		Details: auditDetailsJSON(map[string]string{
			"name":       createdSkill.Name,
			"source_url": sourceURL,
		}),
	})

	return adminIngestionMutationResult{
		item:    createdSkill,
		status:  "created",
		message: "SkillMP skill imported",
	}, nil
}
