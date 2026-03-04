package web

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) recordSkillMPSingleSyncRun(ctx context.Context, skill models.Skill, actorUserID uint, synced int, failed int, errorSummary string) {
	if a.syncJobSvc == nil || skill.ID == 0 || skill.OwnerID == 0 || actorUserID == 0 {
		return
	}

	targetSkillID := skill.ID
	ownerUserID := skill.OwnerID
	actorID := actorUserID
	_, _ = a.syncJobSvc.RecordRun(ctx, services.RecordSyncRunInput{
		Trigger:       "manual",
		Scope:         "single",
		TargetSkillID: &targetSkillID,
		OwnerUserID:   &ownerUserID,
		ActorUserID:   &actorID,
		Candidates:    1,
		Synced:        synced,
		Failed:        failed,
		ErrorSummary:  errorSummary,
	})
}

func (a *App) handleCreateManual(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectDashboard(w, r, "", "Invalid form payload")
		return
	}

	category, subcategory := resolveCategorySelection(r.FormValue("category"), r.FormValue("subcategory"), "development", "backend")
	createdSkill, err := a.skillService.CreateSkill(r.Context(), services.CreateSkillInput{
		OwnerID:         user.ID,
		Name:            r.FormValue("name"),
		Description:     r.FormValue("description"),
		Content:         r.FormValue("content"),
		Tags:            services.ParseTagInput(r.FormValue("tags")),
		CategorySlug:    category,
		SubcategorySlug: subcategory,
		Visibility:      parseVisibility(r.FormValue("visibility")),
		SourceType:      models.SourceTypeManual,
		InstallCommand:  strings.TrimSpace(r.FormValue("install_command")),
		StarCount:       parsePositiveInt(r.FormValue("star_count"), 0),
		QualityScore:    parseFloatDefault(r.FormValue("quality_score"), 8.0),
	})
	if err != nil {
		redirectDashboard(w, r, "", err.Error())
		return
	}
	a.recordAudit(r.Context(), user, services.RecordAuditInput{
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

	redirectDashboard(w, r, "Manual skill created", "")
}

func (a *App) handleUpload(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if err := r.ParseMultipartForm(32 << 20); err != nil {
		redirectDashboard(w, r, "", "Failed to parse upload form")
		return
	}
	archive, header, err := r.FormFile("archive")
	if err != nil {
		redirectDashboard(w, r, "", "Missing archive file")
		return
	}
	defer archive.Close()

	uploadDir := filepath.Join(a.storagePath, "uploads", strconv.FormatUint(uint64(user.ID), 10))
	if err := os.MkdirAll(uploadDir, 0o755); err != nil {
		redirectDashboard(w, r, "", "Failed to prepare upload storage")
		return
	}
	archivePath := filepath.Join(uploadDir, fmt.Sprintf("%d_%s", time.Now().UTC().UnixNano(), filepath.Base(header.Filename)))
	dst, err := os.Create(archivePath)
	if err != nil {
		redirectDashboard(w, r, "", "Failed to store uploaded archive")
		return
	}
	if _, err := io.Copy(dst, archive); err != nil {
		dst.Close()
		redirectDashboard(w, r, "", "Failed to save archive content")
		return
	}
	if err := dst.Close(); err != nil {
		redirectDashboard(w, r, "", "Failed to finalize uploaded archive")
		return
	}

	meta, err := a.uploadService.ExtractFromZipFile(archivePath)
	if err != nil {
		redirectDashboard(w, r, "", "Failed to parse archive: "+err.Error())
		return
	}

	category, subcategory := resolveCategorySelection(r.FormValue("category"), r.FormValue("subcategory"), "tools", "automation-tools")
	tags := append(meta.Tags, services.ParseTagInput(r.FormValue("tags"))...)
	createdSkill, err := a.skillService.CreateSkill(r.Context(), services.CreateSkillInput{
		OwnerID:         user.ID,
		Name:            meta.Name,
		Description:     meta.Description,
		Content:         meta.Content,
		Tags:            tags,
		CategorySlug:    category,
		SubcategorySlug: subcategory,
		Visibility:      parseVisibility(r.FormValue("visibility")),
		SourceType:      models.SourceTypeUpload,
		SourcePath:      archivePath,
		InstallCommand:  strings.TrimSpace(r.FormValue("install_command")),
		QualityScore:    parseFloatDefault(r.FormValue("quality_score"), 8.0),
	})
	if err != nil {
		redirectDashboard(w, r, "", "Failed to create skill from archive")
		return
	}
	a.recordAudit(r.Context(), user, services.RecordAuditInput{
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

	redirectDashboard(w, r, "Archive skill imported", "")
}

func (a *App) handleRepositoryCreate(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectDashboard(w, r, "", "Invalid form payload")
		return
	}

	source := services.RepoSource{
		URL:    strings.TrimSpace(r.FormValue("repo_url")),
		Branch: strings.TrimSpace(r.FormValue("repo_branch")),
		Path:   strings.TrimSpace(r.FormValue("repo_path")),
	}
	meta, err := a.repositoryService.CloneAndExtract(r.Context(), source)
	if err != nil {
		redirectDashboard(w, r, "", "Repository sync failed: "+err.Error())
		return
	}

	category, subcategory := resolveCategorySelection(r.FormValue("category"), r.FormValue("subcategory"), "devops", "git-workflows")
	now := time.Now().UTC()
	tags := append(meta.Tags, services.ParseTagInput(r.FormValue("tags"))...)
	createdSkill, err := a.skillService.CreateSkill(r.Context(), services.CreateSkillInput{
		OwnerID:         user.ID,
		Name:            meta.Name,
		Description:     meta.Description,
		Content:         meta.Content,
		Tags:            tags,
		CategorySlug:    category,
		SubcategorySlug: subcategory,
		Visibility:      parseVisibility(r.FormValue("visibility")),
		SourceType:      models.SourceTypeRepository,
		SourceURL:       source.URL,
		SourceBranch:    source.Branch,
		SourcePath:      source.Path,
		RepoURL:         source.URL,
		InstallCommand:  defaultString(strings.TrimSpace(r.FormValue("install_command")), "codex skill install github:"+trimGitURL(source.URL)),
		QualityScore:    parseFloatDefault(r.FormValue("quality_score"), 8.6),
		LastSyncedAt:    &now,
	})
	if err != nil {
		redirectDashboard(w, r, "", "Failed to store repository skill")
		return
	}
	a.recordAudit(r.Context(), user, services.RecordAuditInput{
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
	redirectDashboard(w, r, "Repository skill synced", "")
}

func (a *App) handleSkillMPCreate(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectDashboard(w, r, "", "Invalid form payload")
		return
	}

	meta, sourceURL, err := a.skillMPService.FetchSkill(r.Context(), services.SkillMPFetchInput{
		URL:     strings.TrimSpace(r.FormValue("skillmp_url")),
		SkillID: strings.TrimSpace(r.FormValue("skillmp_id")),
		Token:   strings.TrimSpace(r.FormValue("skillmp_token")),
	})
	if err != nil {
		redirectDashboard(w, r, "", "SkillMP import failed: "+err.Error())
		return
	}

	category, subcategory := resolveCategorySelection(r.FormValue("category"), r.FormValue("subcategory"), "data-ai", "llm-ai")
	now := time.Now().UTC()
	tags := append(meta.Tags, services.ParseTagInput(r.FormValue("tags"))...)
	createdSkill, err := a.skillService.CreateSkill(r.Context(), services.CreateSkillInput{
		OwnerID:         user.ID,
		Name:            meta.Name,
		Description:     meta.Description,
		Content:         meta.Content,
		Tags:            tags,
		CategorySlug:    category,
		SubcategorySlug: subcategory,
		Visibility:      parseVisibility(r.FormValue("visibility")),
		SourceType:      models.SourceTypeSkillMP,
		SourceURL:       sourceURL,
		InstallCommand:  defaultString(strings.TrimSpace(r.FormValue("install_command")), "codex skill install skillmp:"+extractSkillMPIdentifier(sourceURL)),
		QualityScore:    parseFloatDefault(r.FormValue("quality_score"), 8.8),
		LastSyncedAt:    &now,
	})
	if err != nil {
		redirectDashboard(w, r, "", "Failed to store SkillMP skill")
		return
	}
	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "skill_create_skillmp",
		TargetType: "skill",
		TargetID:   createdSkill.ID,
		Summary:    "Imported skill from SkillMP",
		Details: auditDetailsJSON(map[string]string{
			"name":       createdSkill.Name,
			"source_url": sourceURL,
		}),
	})
	redirectDashboard(w, r, "SkillMP skill imported", "")
}

func (a *App) handleUpdateVisibility(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	skillID, ok := parseSkillID(w, r)
	if !ok {
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectDashboard(w, r, "", "Invalid form payload")
		return
	}

	skill, err := a.skillService.GetSkillByID(r.Context(), skillID)
	if err != nil {
		redirectDashboard(w, r, "", "Skill not found")
		return
	}
	if !user.CanManageSkill(skill.OwnerID) {
		redirectDashboard(w, r, "", "Permission denied")
		return
	}

	nextVisibility := parseVisibility(r.FormValue("visibility"))
	if err := a.skillService.SetVisibility(r.Context(), skillID, skill.OwnerID, nextVisibility); err != nil {
		redirectDashboard(w, r, "", "Failed to update visibility")
		return
	}
	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "skill_update_visibility",
		TargetType: "skill",
		TargetID:   skill.ID,
		Summary:    "Updated skill visibility",
		Details: auditDetailsJSON(map[string]string{
			"name":           skill.Name,
			"owner_id":       strconv.FormatUint(uint64(skill.OwnerID), 10),
			"new_visibility": string(nextVisibility),
		}),
	})
	redirectDashboard(w, r, "Visibility updated", "")
}

func (a *App) handleRemoteSync(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	skillID, ok := parseSkillID(w, r)
	if !ok {
		return
	}

	skill, err := a.skillService.GetSkillByID(r.Context(), skillID)
	if err != nil {
		redirectDashboard(w, r, "", "Skill not found")
		return
	}
	if !user.CanManageSkill(skill.OwnerID) {
		redirectDashboard(w, r, "", "Permission denied")
		return
	}

	switch skill.SourceType {
	case models.SourceTypeRepository:
		source := services.RepoSource{URL: skill.SourceURL, Branch: skill.SourceBranch, Path: skill.SourcePath}
		meta, syncErr := a.repositoryService.CloneAndExtract(r.Context(), source)
		if syncErr != nil {
			redirectDashboard(w, r, "", "Repository sync failed: "+syncErr.Error())
			return
		}
		_, err = a.skillService.UpdateSyncedSkill(r.Context(), services.SyncUpdateInput{
			SkillID:      skillID,
			OwnerID:      skill.OwnerID,
			SourceType:   models.SourceTypeRepository,
			SourceURL:    source.URL,
			SourceBranch: source.Branch,
			SourcePath:   source.Path,
			Meta:         meta,
		})
		if err != nil {
			redirectDashboard(w, r, "", "Failed to update skill from repository")
			return
		}
		a.recordAudit(r.Context(), user, services.RecordAuditInput{
			Action:     "skill_sync_repository",
			TargetType: "skill",
			TargetID:   skill.ID,
			Summary:    "Synced skill from repository",
			Details: auditDetailsJSON(map[string]string{
				"name":     skill.Name,
				"owner_id": strconv.FormatUint(uint64(skill.OwnerID), 10),
				"source":   source.URL,
			}),
		})
		redirectDashboard(w, r, "Repository skill updated", "")
	case models.SourceTypeSkillMP:
		meta, sourceURL, syncErr := a.skillMPService.FetchSkill(r.Context(), services.SkillMPFetchInput{URL: skill.SourceURL})
		if syncErr != nil {
			a.recordSkillMPSingleSyncRun(r.Context(), skill, user.ID, 0, 1, syncErr.Error())
			redirectDashboard(w, r, "", "SkillMP sync failed: "+syncErr.Error())
			return
		}
		_, err = a.skillService.UpdateSyncedSkill(r.Context(), services.SyncUpdateInput{
			SkillID:    skillID,
			OwnerID:    skill.OwnerID,
			SourceType: models.SourceTypeSkillMP,
			SourceURL:  sourceURL,
			Meta:       meta,
		})
		if err != nil {
			a.recordSkillMPSingleSyncRun(r.Context(), skill, user.ID, 0, 1, err.Error())
			redirectDashboard(w, r, "", "Failed to update skill from SkillMP")
			return
		}
		a.recordSkillMPSingleSyncRun(r.Context(), skill, user.ID, 1, 0, "")
		a.recordAudit(r.Context(), user, services.RecordAuditInput{
			Action:     "skill_sync_skillmp",
			TargetType: "skill",
			TargetID:   skill.ID,
			Summary:    "Synced skill from SkillMP",
			Details: auditDetailsJSON(map[string]string{
				"name":       skill.Name,
				"owner_id":   strconv.FormatUint(uint64(skill.OwnerID), 10),
				"source_url": sourceURL,
			}),
		})
		redirectDashboard(w, r, "SkillMP skill updated", "")
	default:
		redirectDashboard(w, r, "", "Only repository and SkillMP skills can be synced")
	}
}
