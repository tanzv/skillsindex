package web

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

type adminSkillVisibilityUpdateInput struct {
	Visibility string `json:"visibility"`
}

func (a *App) handleAPIAdminSkillSync(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if a.skillService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Skill service is unavailable")
		return
	}
	if a.repositoryService == nil && a.skillMPService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Remote sync service is unavailable")
		return
	}

	skill, ok := a.loadAdminManageableSkill(w, r, user)
	if !ok {
		return
	}

	updated, syncMessage, syncErr := a.syncAdminManagedSkill(r, skill, user)
	if syncErr != nil {
		status, code, message := classifyAdminSkillSyncError(syncErr)
		writeAPIErrorFromError(w, r, status, code, syncErr, message)
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":       true,
		"skill_id": updated.ID,
		"message":  syncMessage,
	})
}

func (a *App) handleAPIAdminSkillVisibilityUpdate(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if a.skillService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Skill service is unavailable")
		return
	}

	skill, ok := a.loadAdminManageableSkill(w, r, user)
	if !ok {
		return
	}

	var input adminSkillVisibilityUpdateInput
	if err := decodeJSONOrForm(r, &input); err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid request payload")
		return
	}

	nextVisibility, err := parseAdminSkillVisibilityInput(input.Visibility)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_visibility", err, "Invalid visibility value")
		return
	}

	if err := a.skillService.SetVisibility(r.Context(), skill.ID, skill.OwnerID, nextVisibility); err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "update_failed", err, "Failed to update skill visibility")
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

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":         true,
		"skill_id":   skill.ID,
		"visibility": string(nextVisibility),
	})
}

func (a *App) handleAPIAdminSkillDelete(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if a.skillService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Skill service is unavailable")
		return
	}

	skill, ok := a.loadAdminManageableSkill(w, r, user)
	if !ok {
		return
	}

	if err := a.skillService.DeleteSkill(r.Context(), skill.ID, skill.OwnerID); err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "delete_failed", err, "Failed to delete skill")
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

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":       true,
		"skill_id": skill.ID,
	})
}

func (a *App) loadAdminManageableSkill(w http.ResponseWriter, r *http.Request, user *models.User) (models.Skill, bool) {
	skillID, err := parseUintURLParam(r, "skillID")
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_skill_id", err, "Invalid skill id")
		return models.Skill{}, false
	}

	skill, err := a.skillService.GetSkillByID(r.Context(), skillID)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusNotFound, "skill_not_found", err, "Skill not found")
		return models.Skill{}, false
	}

	if user == nil || !user.CanManageSkill(skill.OwnerID) {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return models.Skill{}, false
	}

	return skill, true
}

func parseAdminSkillVisibilityInput(raw string) (models.SkillVisibility, error) {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case string(models.VisibilityPublic):
		return models.VisibilityPublic, nil
	case string(models.VisibilityPrivate):
		return models.VisibilityPrivate, nil
	default:
		return "", fmt.Errorf("unsupported visibility %q", strings.TrimSpace(raw))
	}
}

func classifyAdminSkillSyncError(err error) (int, string, string) {
	if err == nil {
		return http.StatusOK, "", ""
	}
	message := strings.ToLower(strings.TrimSpace(err.Error()))
	switch {
	case strings.Contains(message, "already running"):
		return http.StatusConflict, "sync_conflict", "A matching sync job is already running"
	case strings.Contains(message, "unsupported source type"):
		return http.StatusBadRequest, "unsupported_source_type", "Only repository and SkillMP skills can be synced"
	case strings.Contains(message, "service unavailable"):
		return http.StatusServiceUnavailable, "service_unavailable", "Remote sync service is unavailable"
	default:
		return http.StatusBadRequest, "sync_failed", "Failed to sync skill"
	}
}

func (a *App) syncAdminManagedSkill(r *http.Request, skill models.Skill, user *models.User) (models.Skill, string, error) {
	execution, governanceErr := a.startRemoteSyncGovernance(r.Context(), skill, user.ID)
	if governanceErr != nil {
		return models.Skill{}, "", fmt.Errorf("failed to start sync job: %w", governanceErr)
	}
	if execution.Deduped {
		return models.Skill{}, "", fmt.Errorf("a matching sync job is already running")
	}

	switch skill.SourceType {
	case models.SourceTypeRepository:
		updated, err := a.syncAdminRepositorySkill(r, execution, skill, user)
		return updated, "Repository skill updated", err
	case models.SourceTypeSkillMP:
		updated, err := a.syncAdminSkillMPSkill(r, execution, skill, user)
		return updated, "SkillMP skill updated", err
	default:
		err := fmt.Errorf("unsupported source type")
		a.completeRemoteSyncGovernance(r.Context(), execution, skill, user.ID, 0, 1, err)
		return models.Skill{}, "", err
	}
}

func (a *App) syncAdminRepositorySkill(
	r *http.Request,
	execution services.SyncGovernanceExecution,
	skill models.Skill,
	user *models.User,
) (models.Skill, error) {
	if a.repositoryService == nil {
		err := fmt.Errorf("repository sync service unavailable")
		a.completeRemoteSyncGovernance(r.Context(), execution, skill, user.ID, 0, 1, err)
		return models.Skill{}, err
	}

	source := services.RepoSource{URL: skill.SourceURL, Branch: skill.SourceBranch, Path: skill.SourcePath}
	meta, syncErr := a.repositoryService.CloneAndExtract(r.Context(), source)
	if syncErr != nil {
		a.completeRemoteSyncGovernance(r.Context(), execution, skill, user.ID, 0, 1, syncErr)
		return models.Skill{}, fmt.Errorf("repository sync failed: %w", syncErr)
	}

	var runID *uint
	if execution.Run.ID != 0 {
		runID = &execution.Run.ID
	}
	actorID := user.ID
	updated, err := a.skillService.UpdateRepositorySkillWithRunContext(r.Context(), services.RepositoryUpdateInput{
		SkillID: skill.ID,
		OwnerID: skill.OwnerID,
		Source:  source,
		Meta:    meta,
	}, &actorID, runID)
	if err != nil {
		a.completeRemoteSyncGovernance(r.Context(), execution, skill, user.ID, 0, 1, err)
		return models.Skill{}, fmt.Errorf("failed to update skill from repository: %w", err)
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

	return updated, nil
}

func (a *App) syncAdminSkillMPSkill(
	r *http.Request,
	execution services.SyncGovernanceExecution,
	skill models.Skill,
	user *models.User,
) (models.Skill, error) {
	if a.skillMPService == nil {
		err := fmt.Errorf("skillmp sync service unavailable")
		a.completeRemoteSyncGovernance(r.Context(), execution, skill, user.ID, 0, 1, err)
		return models.Skill{}, err
	}

	meta, sourceURL, syncErr := a.skillMPService.FetchSkill(r.Context(), services.SkillMPFetchInput{URL: skill.SourceURL})
	if syncErr != nil {
		a.completeRemoteSyncGovernance(r.Context(), execution, skill, user.ID, 0, 1, syncErr)
		return models.Skill{}, fmt.Errorf("skillmp sync failed: %w", syncErr)
	}

	var runID *uint
	if execution.Run.ID != 0 {
		runID = &execution.Run.ID
	}
	actorID := user.ID
	updated, err := a.skillService.UpdateSyncedSkillWithRunContext(r.Context(), services.SyncUpdateInput{
		SkillID:    skill.ID,
		OwnerID:    skill.OwnerID,
		SourceType: models.SourceTypeSkillMP,
		SourceURL:  sourceURL,
		Meta:       meta,
	}, &actorID, runID)
	if err != nil {
		a.completeRemoteSyncGovernance(r.Context(), execution, skill, user.ID, 0, 1, err)
		return models.Skill{}, fmt.Errorf("failed to update skill from SkillMP: %w", err)
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

	return updated, nil
}
