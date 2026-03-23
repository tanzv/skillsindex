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
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.skillVersionSvc == nil || a.skillService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	skillID, err := parseUintURLParam(r, "skillID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_skill_id"})
		return
	}
	versionID, err := parseUintURLParam(r, "versionID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_version_id"})
		return
	}
	skill, err := a.skillService.GetSkillByID(r.Context(), skillID)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "skill_not_found"})
		return
	}
	if !user.CanManageSkill(skill.OwnerID) {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}

	targetVersion, versionErr := a.skillVersionSvc.GetByID(r.Context(), skillID, versionID)
	if versionErr != nil {
		if errors.Is(versionErr, services.ErrSkillNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "version_not_found"})
			return
		}
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "version_query_failed", "message": versionErr.Error()})
		return
	}

	actorID := user.ID
	updated, rollbackErr := a.skillVersionSvc.RollbackVersion(r.Context(), skillID, versionID, skill.OwnerID, &actorID)
	if rollbackErr != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "rollback_failed", "message": rollbackErr.Error()})
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
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.skillVersionSvc == nil || a.skillService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	skillID, err := parseUintURLParam(r, "skillID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_skill_id"})
		return
	}
	versionID, err := parseUintURLParam(r, "versionID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_version_id"})
		return
	}
	skill, err := a.skillService.GetSkillByID(r.Context(), skillID)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "skill_not_found"})
		return
	}
	if !user.CanManageSkill(skill.OwnerID) {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}

	actorID := user.ID
	updated, restoreErr := a.skillVersionSvc.RestoreVersion(r.Context(), skillID, versionID, skill.OwnerID, &actorID)
	if restoreErr != nil {
		if errors.Is(restoreErr, services.ErrSkillNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "version_not_found"})
			return
		}
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "restore_failed", "message": restoreErr.Error()})
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
