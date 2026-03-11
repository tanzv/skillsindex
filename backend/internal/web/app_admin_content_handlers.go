package web

import (
	"context"
	"net/http"
	"strconv"

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
	input, err := readAdminManualIngestionInput(r)
	if err != nil {
		redirectDashboard(w, r, "", "Invalid form payload")
		return
	}
	result, err := a.submitManualIngestion(r.Context(), user, input)
	if err != nil {
		redirectDashboard(w, r, "", adminIngestionOperationMessage(err, "Failed to create manual skill"))
		return
	}

	redirectDashboard(w, r, result.message, "")
}

func (a *App) handleUpload(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	input, archive, header, err := readAdminUploadIngestionInput(r)
	if err != nil {
		redirectDashboard(w, r, "", adminIngestionOperationMessage(err, "Failed to parse upload form"))
		return
	}
	defer archive.Close()

	result, err := a.submitUploadIngestion(r.Context(), user, input, archive, header)
	if err != nil {
		redirectDashboard(w, r, "", adminIngestionOperationMessage(err, "Failed to create skill from archive"))
		return
	}

	redirectDashboard(w, r, result.message, "")
}

func (a *App) handleRepositoryCreate(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	input, err := readAdminRepositoryIngestionInput(r)
	if err != nil {
		redirectDashboard(w, r, "", "Invalid form payload")
		return
	}
	result, err := a.submitRepositoryIngestion(r.Context(), user, input)
	if err != nil {
		redirectDashboard(w, r, "", adminIngestionOperationMessage(err, "Failed to store repository skill"))
		return
	}
	redirectDashboard(w, r, result.message, "")
}

func (a *App) handleSkillMPCreate(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	input, err := readAdminSkillMPIngestionInput(r)
	if err != nil {
		redirectDashboard(w, r, "", "Invalid form payload")
		return
	}
	result, err := a.submitSkillMPIngestion(r.Context(), user, input)
	if err != nil {
		redirectDashboard(w, r, "", adminIngestionOperationMessage(err, "Failed to store SkillMP skill"))
		return
	}
	redirectDashboard(w, r, result.message, "")
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
