package web

import (
	"errors"
	"net/http"
	"strconv"

	"skillsindex/internal/services"
)

func (a *App) handleAPISkillVersionRollback(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if a.skillVersionSvc == nil || a.skillService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Skill version service is unavailable")
		return
	}

	skillID, err := parseUintURLParam(r, "skillID")
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_skill_id", "Invalid skill id")
		return
	}
	versionID, err := parseUintURLParam(r, "versionID")
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_version_id", "Invalid version id")
		return
	}
	skill, err := a.skillService.GetSkillByID(r.Context(), skillID)
	if err != nil {
		writeAPIError(w, r, http.StatusNotFound, "skill_not_found", "Skill not found")
		return
	}
	if !user.CanManageSkill(skill.OwnerID) {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}

	targetVersion, versionErr := a.skillVersionSvc.GetByID(r.Context(), skillID, versionID)
	if versionErr != nil {
		if errors.Is(versionErr, services.ErrSkillNotFound) {
			writeAPIError(w, r, http.StatusNotFound, "version_not_found", "Version not found")
			return
		}
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "version_query_failed", versionErr, "Failed to load skill version")
		return
	}

	actorID := user.ID
	updated, rollbackErr := a.skillVersionSvc.RollbackVersion(r.Context(), skillID, versionID, skill.OwnerID, &actorID)
	if rollbackErr != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "rollback_failed", rollbackErr, "Failed to roll back skill version")
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

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":                  true,
		"skill_id":            updated.ID,
		"rollback_version_id": versionID,
	})
}

func (a *App) handleAPISkillVersionRestore(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if a.skillVersionSvc == nil || a.skillService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Skill version service is unavailable")
		return
	}

	skillID, err := parseUintURLParam(r, "skillID")
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_skill_id", "Invalid skill id")
		return
	}
	versionID, err := parseUintURLParam(r, "versionID")
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_version_id", "Invalid version id")
		return
	}
	skill, err := a.skillService.GetSkillByID(r.Context(), skillID)
	if err != nil {
		writeAPIError(w, r, http.StatusNotFound, "skill_not_found", "Skill not found")
		return
	}
	if !user.CanManageSkill(skill.OwnerID) {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}

	actorID := user.ID
	updated, restoreErr := a.skillVersionSvc.RestoreVersion(r.Context(), skillID, versionID, skill.OwnerID, &actorID)
	if restoreErr != nil {
		if errors.Is(restoreErr, services.ErrSkillNotFound) {
			writeAPIError(w, r, http.StatusNotFound, "version_not_found", "Version not found")
			return
		}
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "restore_failed", restoreErr, "Failed to restore skill version")
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

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":                 true,
		"skill_id":           updated.ID,
		"restore_version_id": versionID,
	})
}
