package web

import (
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
	asyncJobID := uint(0)
	if a.asyncJobSvc != nil {
		payloadDigest := fmt.Sprintf("manual:sync_repository:%s:%d", scope, limit)
		created, _, createErr := a.asyncJobSvc.CreateOrGetActive(r.Context(), services.CreateAsyncJobInput{
			JobType:       models.AsyncJobTypeSyncRepository,
			OwnerUserID:   ownerID,
			ActorUserID:   &user.ID,
			MaxAttempts:   3,
			PayloadDigest: payloadDigest,
		}, startedAt)
		if createErr == nil {
			asyncJobID = created.ID
			if _, startErr := a.asyncJobSvc.Start(r.Context(), asyncJobID, startedAt); startErr != nil && !errors.Is(startErr, services.ErrAsyncJobInvalidTransition) {
				asyncJobID = 0
			}
		}
	}
	summary, err := a.repoSyncRunner.SyncBatch(r.Context(), ownerID, nil, limit)
	finishedAt := time.Now().UTC()
	if a.asyncJobSvc != nil && asyncJobID != 0 {
		errorSummary := ""
		if err != nil {
			errorSummary = err.Error()
			_, _ = a.asyncJobSvc.MarkFailed(r.Context(), asyncJobID, "sync_batch_failed", errorSummary, finishedAt)
		} else if len(summary.Errors) > 0 {
			errorSummary = strings.Join(summary.Errors, " | ")
			_, _ = a.asyncJobSvc.MarkFailed(r.Context(), asyncJobID, "sync_partial_failed", errorSummary, finishedAt)
		} else {
			_, _ = a.asyncJobSvc.MarkSucceeded(r.Context(), asyncJobID, finishedAt)
		}
	}
	if a.syncJobSvc != nil {
		var actorID *uint
		actorID = &user.ID
		errorSummary := ""
		if err != nil {
			errorSummary = err.Error()
		} else if len(summary.Errors) > 0 {
			errorSummary = strings.Join(summary.Errors, " | ")
		}
		_, _ = a.syncJobSvc.RecordRun(r.Context(), services.RecordSyncRunInput{
			Trigger:      "manual",
			Scope:        scope,
			OwnerUserID:  ownerID,
			ActorUserID:  actorID,
			Candidates:   summary.Candidates,
			Synced:       summary.Synced,
			Failed:       summary.Failed,
			StartedAt:    startedAt,
			FinishedAt:   finishedAt,
			ErrorSummary: errorSummary,
		})
	}
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

func (a *App) handleRollbackSkillVersion(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if a.skillVersionSvc == nil {
		redirectDashboard(w, r, "", "Version service unavailable")
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
	targetVersion, targetErr := a.skillVersionSvc.GetByID(r.Context(), skillID, versionID)
	if targetErr != nil {
		redirectSkillDetail(w, r, skillID, "", "Skill version not found")
		return
	}

	var actorID *uint
	actorID = &user.ID
	updated, err := a.skillVersionSvc.RollbackVersion(r.Context(), skillID, versionID, skill.OwnerID, actorID)
	if err != nil {
		redirectSkillDetail(w, r, skillID, "", "Failed to rollback skill version")
		return
	}

	auditDetails := map[string]string{
		"skill_id":              strconv.FormatUint(uint64(updated.ID), 10),
		"version_id":            strconv.FormatUint(uint64(versionID), 10),
		"target_version_number": strconv.Itoa(targetVersion.VersionNumber),
	}
	latestVersions, listErr := a.skillVersionSvc.ListBySkill(r.Context(), services.ListSkillVersionsInput{
		SkillID:         updated.ID,
		IncludeArchived: true,
		Limit:           1,
	})
	if listErr == nil && len(latestVersions) > 0 {
		rollbackSnapshot := latestVersions[0]
		auditDetails["rollback_snapshot_version"] = strconv.Itoa(rollbackSnapshot.VersionNumber)
		auditDetails["rollback_trigger"] = rollbackSnapshot.Trigger
		auditDetails["rollback_before_digest"] = rollbackSnapshot.BeforeDigest
		auditDetails["rollback_after_digest"] = rollbackSnapshot.AfterDigest
		auditDetails["rollback_risk_level"] = rollbackSnapshot.RiskLevel
		auditDetails["rollback_change_summary"] = rollbackSnapshot.ChangeSummary
	}
	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "skill_rollback_version",
		TargetType: "skill",
		TargetID:   updated.ID,
		Summary:    "Rolled back skill to a historical version",
		Details:    auditDetailsJSON(auditDetails),
	})
	redirectSkillDetail(w, r, updated.ID, "Skill rolled back from version snapshot", "")
}

func (a *App) handleRestoreSkillVersion(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if a.skillVersionSvc == nil {
		redirectDashboard(w, r, "", "Version service unavailable")
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

	var actorID *uint
	actorID = &user.ID
	updated, err := a.skillVersionSvc.RestoreVersion(r.Context(), skillID, versionID, skill.OwnerID, actorID)
	if err != nil {
		redirectSkillDetail(w, r, skillID, "", "Failed to restore skill version")
		return
	}
	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "skill_restore_version",
		TargetType: "skill",
		TargetID:   updated.ID,
		Summary:    "Restored skill to a historical version",
		Details: auditDetailsJSON(map[string]string{
			"skill_id":   strconv.FormatUint(uint64(updated.ID), 10),
			"version_id": strconv.FormatUint(uint64(versionID), 10),
		}),
	})
	redirectSkillDetail(w, r, updated.ID, "Skill restored from version snapshot", "")
}

func (a *App) handleDeleteSkill(w http.ResponseWriter, r *http.Request) {
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

	if err := a.skillService.DeleteSkill(r.Context(), skillID, skill.OwnerID); err != nil {
		redirectDashboard(w, r, "", "Failed to delete skill")
		return
	}
	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "skill_delete",
		TargetType: "skill",
		TargetID:   skill.ID,
		Summary:    "Deleted skill",
		Details: auditDetailsJSON(map[string]string{
			"name":     skill.Name,
			"owner_id": strconv.FormatUint(uint64(skill.OwnerID), 10),
		}),
	})
	redirectDashboard(w, r, "Skill deleted", "")
}
