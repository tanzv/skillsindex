package web

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) handleRepositorySyncBatch(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectDashboard(w, r, "", "Invalid form payload")
		return
	}

	limit := parsePositiveInt(r.FormValue("limit"), 50)
	var ownerID *uint
	scope := strings.ToLower(strings.TrimSpace(r.FormValue("scope")))
	if !user.CanViewAllSkills() || strings.EqualFold(scope, "owned") {
		ownerID = &user.ID
	}
	if scope == "" {
		if ownerID != nil {
			scope = "owned"
		} else {
			scope = "all"
		}
	}

	startedAt := time.Now().UTC()
	batchRunner := a.repositorySyncBatchRunner()
	if batchRunner == nil {
		redirectDashboard(w, r, "", "Repository sync runner unavailable")
		return
	}

	var execution services.SyncGovernanceExecution
	legacyAsyncJobID := uint(0)
	if a.syncGovernanceSvc != nil {
		startedExecution, startErr := a.syncGovernanceSvc.Start(r.Context(), services.StartSyncGovernanceInput{
			JobType:       models.AsyncJobTypeSyncRepository,
			Trigger:       "manual",
			TriggerType:   services.SyncRunTriggerTypeManual,
			Scope:         scope,
			OwnerUserID:   ownerID,
			ActorUserID:   &user.ID,
			MaxAttempts:   3,
			PayloadDigest: fmt.Sprintf("manual:sync_repository:%s:%d", scope, limit),
			StartedAt:     startedAt,
		})
		if startErr != nil {
			redirectDashboard(w, r, "", "Failed to start repository sync job")
			return
		}
		if startedExecution.Deduped {
			redirectDashboard(w, r, "", "A matching repository sync job is already running")
			return
		}
		execution = startedExecution
	} else if a.asyncJobSvc != nil {
		created, _, createErr := a.asyncJobSvc.CreateOrGetActive(r.Context(), services.CreateAsyncJobInput{
			JobType:       models.AsyncJobTypeSyncRepository,
			OwnerUserID:   ownerID,
			ActorUserID:   &user.ID,
			MaxAttempts:   3,
			PayloadDigest: fmt.Sprintf("manual:sync_repository:%s:%d", scope, limit),
		}, startedAt)
		if createErr == nil {
			legacyAsyncJobID = created.ID
			if _, startErr := a.asyncJobSvc.Start(r.Context(), legacyAsyncJobID, startedAt); startErr != nil && !errors.Is(startErr, services.ErrAsyncJobInvalidTransition) {
				legacyAsyncJobID = 0
			}
		}
	}

	summary, err := batchRunner(r.Context(), ownerID, nil, limit)
	finishedAt := time.Now().UTC()
	a.completeRepositorySyncBatchGovernance(r, execution, legacyAsyncJobID, ownerID, user.ID, scope, summary, startedAt, finishedAt, err)
	if err != nil {
		redirectDashboard(w, r, "", "Repository sync batch failed: "+err.Error())
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "repository_sync_batch",
		TargetType: "repository",
		TargetID:   0,
		Summary:    "Executed manual repository sync batch",
		Details: auditDetailsJSON(map[string]string{
			"scope":      scope,
			"candidates": strconv.Itoa(summary.Candidates),
			"synced":     strconv.Itoa(summary.Synced),
			"failed":     strconv.Itoa(summary.Failed),
		}),
	})

	message := fmt.Sprintf(
		"Repository sync finished: candidates=%d synced=%d failed=%d",
		summary.Candidates,
		summary.Synced,
		summary.Failed,
	)
	if summary.Failed > 0 && len(summary.Errors) > 0 {
		redirectDashboard(w, r, message, summary.Errors[0])
		return
	}
	redirectDashboard(w, r, message, "")
}

func (a *App) repositorySyncBatchRunner() func(
	context.Context,
	*uint,
	*time.Time,
	int,
) (services.RepositorySyncSummary, error) {
	if a == nil {
		return nil
	}
	if a.repoSyncBatchRunner != nil {
		return a.repoSyncBatchRunner
	}
	if a.repoSyncRunner != nil {
		return a.repoSyncRunner.SyncBatch
	}
	return nil
}

func (a *App) completeRepositorySyncBatchGovernance(
	r *http.Request,
	execution services.SyncGovernanceExecution,
	legacyAsyncJobID uint,
	ownerID *uint,
	actorUserID uint,
	scope string,
	summary services.RepositorySyncSummary,
	startedAt time.Time,
	finishedAt time.Time,
	syncErr error,
) {
	if a == nil || r == nil {
		return
	}
	errorSummary := ""
	if syncErr != nil {
		errorSummary = syncErr.Error()
	} else if len(summary.Errors) > 0 {
		errorSummary = strings.Join(summary.Errors, " | ")
	}
	if a.syncGovernanceSvc != nil && execution.Job.ID != 0 && execution.Run.ID != 0 {
		actorID := actorUserID
		errorCode := ""
		errorMessage := errorSummary
		failedCount := summary.Failed
		if syncErr != nil {
			errorCode = "sync_batch_failed"
			if failedCount < 1 {
				failedCount = 1
			}
		} else if summary.Failed > 0 {
			errorCode = "sync_partial_failed"
		}
		_, _ = a.syncGovernanceSvc.Complete(r.Context(), services.CompleteSyncGovernanceInput{
			RunID:        execution.Run.ID,
			JobID:        execution.Job.ID,
			Candidates:   summary.Candidates,
			Synced:       summary.Synced,
			Failed:       failedCount,
			FinishedAt:   finishedAt,
			ErrorCode:    errorCode,
			ErrorMessage: errorMessage,
			ErrorSummary: errorSummary,
			ActorUserID:  &actorID,
			AuditAction:  "",
		})
		return
	}
	if a.asyncJobSvc != nil && legacyAsyncJobID != 0 {
		if syncErr != nil || summary.Failed > 0 {
			errorCode := "sync_batch_failed"
			if syncErr == nil {
				errorCode = "sync_partial_failed"
			}
			_, _ = a.asyncJobSvc.MarkFailed(r.Context(), legacyAsyncJobID, errorCode, errorSummary, finishedAt)
		} else {
			_, _ = a.asyncJobSvc.MarkSucceeded(r.Context(), legacyAsyncJobID, finishedAt)
		}
	}
	if a.syncJobSvc != nil {
		actorID := actorUserID
		_, _ = a.syncJobSvc.RecordRun(r.Context(), services.RecordSyncRunInput{
			Trigger:      "manual",
			Scope:        scope,
			OwnerUserID:  ownerID,
			ActorUserID:  &actorID,
			Candidates:   summary.Candidates,
			Synced:       summary.Synced,
			Failed:       summary.Failed,
			StartedAt:    startedAt,
			FinishedAt:   finishedAt,
			ErrorSummary: errorSummary,
		})
	}
}

func (a *App) handleSkillVersions(w http.ResponseWriter, r *http.Request) {
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
	if a.skillVersionSvc == nil {
		redirectSkillDetail(w, r, skill.ID, "", "Version service unavailable")
		return
	}

	var capturedAfter *time.Time
	if raw := strings.TrimSpace(r.URL.Query().Get("from_time")); raw != "" {
		parsed := parseOpsTimeQuery(raw, time.Time{})
		if !parsed.IsZero() {
			capturedAfter = &parsed
		}
	}
	var capturedBefore *time.Time
	if raw := strings.TrimSpace(r.URL.Query().Get("to_time")); raw != "" {
		parsed := parseOpsTimeQuery(raw, time.Time{})
		if !parsed.IsZero() {
			capturedBefore = &parsed
		}
	}

	versions, err := a.skillVersionSvc.ListBySkill(r.Context(), services.ListSkillVersionsInput{
		SkillID:         skill.ID,
		Trigger:         strings.TrimSpace(r.URL.Query().Get("trigger")),
		CapturedAfter:   capturedAfter,
		CapturedBefore:  capturedBefore,
		IncludeArchived: parseBoolFlag(r.URL.Query().Get("include_archived"), false),
		Limit:           120,
	})
	if err != nil {
		redirectSkillDetail(w, r, skill.ID, "", "Failed to load version history")
		return
	}

	a.render(w, r, ViewData{
		Page:          "skill_versions",
		Title:         "Skill Version History",
		Skill:         &skill,
		SkillVersions: versions,
		TagFilter:     strings.TrimSpace(r.URL.Query().Get("trigger")),
		Message:       strings.TrimSpace(r.URL.Query().Get("msg")),
		Error:         strings.TrimSpace(r.URL.Query().Get("err")),
	})
}

func (a *App) handleSkillVersionDetail(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	skillID, ok := parseSkillID(w, r)
	if !ok {
		return
	}
	versionID, ok := parseVersionID(w, r)
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
	if a.skillVersionSvc == nil {
		redirectSkillDetail(w, r, skill.ID, "", "Version service unavailable")
		return
	}

	version, err := a.skillVersionSvc.GetByID(r.Context(), skill.ID, versionID)
	if err != nil {
		redirectSkillDetail(w, r, skill.ID, "", "Skill version not found")
		return
	}
	versions, err := a.skillVersionSvc.ListBySkill(r.Context(), services.ListSkillVersionsInput{
		SkillID: skill.ID,
		Limit:   120,
	})
	if err != nil {
		redirectSkillDetail(w, r, skill.ID, "", "Failed to load version history")
		return
	}

	a.render(w, r, ViewData{
		Page:               "skill_version_detail",
		Title:              "Skill Version Detail",
		Skill:              &skill,
		SkillVersions:      versions,
		SkillVersionDetail: &version,
		Message:            strings.TrimSpace(r.URL.Query().Get("msg")),
		Error:              strings.TrimSpace(r.URL.Query().Get("err")),
	})
}

func (a *App) handleSkillVersionCompare(w http.ResponseWriter, r *http.Request) {
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
	if a.skillVersionSvc == nil {
		redirectSkillDetail(w, r, skill.ID, "", "Version service unavailable")
		return
	}

	fromID, toID, ok := parseVersionCompareIDs(r)
	if !ok {
		seedVersions, listErr := a.skillVersionSvc.ListBySkill(r.Context(), services.ListSkillVersionsInput{
			SkillID: skill.ID,
			Limit:   2,
		})
		if listErr != nil || len(seedVersions) < 2 {
			redirectSkillDetail(w, r, skill.ID, "", "Need at least two versions to compare")
			return
		}
		fromID = seedVersions[1].ID
		toID = seedVersions[0].ID
	}

	compareResult, err := a.skillVersionSvc.CompareVersions(r.Context(), services.CompareSkillVersionsInput{
		SkillID:       skill.ID,
		FromVersionID: fromID,
		ToVersionID:   toID,
	})
	if err != nil {
		redirectSkillDetail(w, r, skill.ID, "", "Failed to compare versions")
		return
	}
	versions, err := a.skillVersionSvc.ListBySkill(r.Context(), services.ListSkillVersionsInput{
		SkillID: skill.ID,
		Limit:   120,
	})
	if err != nil {
		redirectSkillDetail(w, r, skill.ID, "", "Failed to load version history")
		return
	}

	a.render(w, r, ViewData{
		Page:                "skill_version_compare",
		Title:               "Skill Version Compare",
		Skill:               &skill,
		SkillVersions:       versions,
		SkillVersionCompare: &compareResult,
		Message:             strings.TrimSpace(r.URL.Query().Get("msg")),
		Error:               strings.TrimSpace(r.URL.Query().Get("err")),
	})
}
