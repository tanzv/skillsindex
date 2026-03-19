package web

import (
	"net/http"
	"strconv"

	"skillsindex/internal/services"
)

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

	actorID := &user.ID
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

	actorID := &user.ID
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
