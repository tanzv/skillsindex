package web

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) startRemoteSyncGovernance(
	ctx context.Context,
	skill models.Skill,
	actorUserID uint,
) (services.SyncGovernanceExecution, error) {
	if a == nil || a.syncGovernanceSvc == nil || skill.ID == 0 || skill.OwnerID == 0 || actorUserID == 0 {
		return services.SyncGovernanceExecution{}, nil
	}
	targetSkillID := skill.ID
	ownerUserID := skill.OwnerID
	actorID := actorUserID
	return a.syncGovernanceSvc.Start(ctx, services.StartSyncGovernanceInput{
		JobType:       remoteSyncAsyncJobType(skill.SourceType),
		Trigger:       services.SyncRunTriggerTypeManual,
		TriggerType:   services.SyncRunTriggerTypeManual,
		Scope:         "single",
		TargetSkillID: &targetSkillID,
		OwnerUserID:   &ownerUserID,
		ActorUserID:   &actorID,
		MaxAttempts:   3,
		PayloadDigest: remoteSyncPayloadDigest(skill),
		StartedAt:     timeNowUTC(),
	})
}

func (a *App) completeRemoteSyncGovernance(
	ctx context.Context,
	execution services.SyncGovernanceExecution,
	skill models.Skill,
	actorUserID uint,
	synced int,
	failed int,
	err error,
) {
	if a == nil {
		return
	}
	errorSummary := ""
	errorCode := ""
	if err != nil {
		errorSummary = strings.TrimSpace(err.Error())
		errorCode = "sync_single_failed"
	}
	if a.syncGovernanceSvc != nil && execution.Job.ID != 0 && execution.Run.ID != 0 {
		actorID := actorUserID
		_, _ = a.syncGovernanceSvc.Complete(ctx, services.CompleteSyncGovernanceInput{
			RunID:        execution.Run.ID,
			JobID:        execution.Job.ID,
			Candidates:   1,
			Synced:       synced,
			Failed:       failed,
			FinishedAt:   timeNowUTC(),
			ErrorCode:    errorCode,
			ErrorMessage: errorSummary,
			ErrorSummary: errorSummary,
			ActorUserID:  &actorID,
		})
		return
	}
	a.recordLegacySingleRemoteSyncRun(ctx, skill, actorUserID, synced, failed, errorSummary)
}

func (a *App) recordLegacySingleRemoteSyncRun(
	ctx context.Context,
	skill models.Skill,
	actorUserID uint,
	synced int,
	failed int,
	errorSummary string,
) {
	if a == nil || a.syncJobSvc == nil || skill.ID == 0 || skill.OwnerID == 0 || actorUserID == 0 {
		return
	}
	targetSkillID := skill.ID
	ownerUserID := skill.OwnerID
	actorID := actorUserID
	_, _ = a.syncJobSvc.RecordRun(ctx, services.RecordSyncRunInput{
		Trigger:       services.SyncRunTriggerTypeManual,
		TriggerType:   services.SyncRunTriggerTypeManual,
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

	execution, governanceErr := a.startRemoteSyncGovernance(r.Context(), skill, user.ID)
	if governanceErr != nil {
		redirectDashboard(w, r, "", "Failed to start sync job")
		return
	}
	if execution.Deduped {
		redirectDashboard(w, r, "", "A matching sync job is already running")
		return
	}

	switch skill.SourceType {
	case models.SourceTypeRepository:
		source := services.RepoSource{URL: skill.SourceURL, Branch: skill.SourceBranch, Path: skill.SourcePath}
		meta, syncErr := a.repositoryService.CloneAndExtract(r.Context(), source)
		if syncErr != nil {
			a.completeRemoteSyncGovernance(r.Context(), execution, skill, user.ID, 0, 1, syncErr)
			redirectDashboard(w, r, "", "Repository sync failed: "+syncErr.Error())
			return
		}
		var runID *uint
		if execution.Run.ID != 0 {
			runID = &execution.Run.ID
		}
		actorID := user.ID
		_, err = a.skillService.UpdateRepositorySkillWithRunContext(r.Context(), services.RepositoryUpdateInput{
			SkillID: skillID,
			OwnerID: skill.OwnerID,
			Source:  source,
			Meta:    meta,
		}, &actorID, runID)
		if err != nil {
			a.completeRemoteSyncGovernance(r.Context(), execution, skill, user.ID, 0, 1, err)
			redirectDashboard(w, r, "", "Failed to update skill from repository")
			return
		}
		a.completeRemoteSyncGovernance(r.Context(), execution, skill, user.ID, 1, 0, nil)
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
			a.completeRemoteSyncGovernance(r.Context(), execution, skill, user.ID, 0, 1, syncErr)
			redirectDashboard(w, r, "", "SkillMP sync failed: "+syncErr.Error())
			return
		}
		var runID *uint
		if execution.Run.ID != 0 {
			runID = &execution.Run.ID
		}
		actorID := user.ID
		_, err = a.skillService.UpdateSyncedSkillWithRunContext(r.Context(), services.SyncUpdateInput{
			SkillID:    skillID,
			OwnerID:    skill.OwnerID,
			SourceType: models.SourceTypeSkillMP,
			SourceURL:  sourceURL,
			Meta:       meta,
		}, &actorID, runID)
		if err != nil {
			a.completeRemoteSyncGovernance(r.Context(), execution, skill, user.ID, 0, 1, err)
			redirectDashboard(w, r, "", "Failed to update skill from SkillMP")
			return
		}
		a.completeRemoteSyncGovernance(r.Context(), execution, skill, user.ID, 1, 0, nil)
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
		a.completeRemoteSyncGovernance(r.Context(), execution, skill, user.ID, 0, 1, fmt.Errorf("unsupported source type"))
		redirectDashboard(w, r, "", "Only repository and SkillMP skills can be synced")
	}
}

func remoteSyncAsyncJobType(sourceType models.SkillSourceType) models.AsyncJobType {
	if sourceType == models.SourceTypeSkillMP {
		return models.AsyncJobTypeSyncSkillMP
	}
	return models.AsyncJobTypeSyncRepository
}

func remoteSyncPayloadDigest(skill models.Skill) string {
	return fmt.Sprintf(
		"remote-sync:%s:%d:%s:%s:%s",
		string(skill.SourceType),
		skill.ID,
		strings.TrimSpace(skill.SourceURL),
		strings.TrimSpace(skill.SourceBranch),
		strings.TrimSpace(skill.SourcePath),
	)
}

func timeNowUTC() time.Time {
	return time.Now().UTC()
}
