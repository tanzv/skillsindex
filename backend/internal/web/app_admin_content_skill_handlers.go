package web

import (
	"fmt"
	"net/http"
	"strconv"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

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
