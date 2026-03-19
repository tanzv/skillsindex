package web

import (
	"context"
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
