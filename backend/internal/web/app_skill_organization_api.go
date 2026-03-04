package web

import (
	"errors"
	"net/http"
	"strconv"

	"skillsindex/internal/services"
)

type apiSkillOrganizationBindRequest struct {
	OrganizationID uint `json:"organization_id"`
}

func (a *App) handleSkillOrganizationBind(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if a.skillService == nil || a.organizationSvc == nil {
		skillID, ok := parseSkillID(w, r)
		if !ok {
			return
		}
		redirectSkillDetail(w, r, skillID, "", "Service unavailable")
		return
	}

	skillID, ok := parseSkillID(w, r)
	if !ok {
		return
	}
	skill, err := a.skillService.GetSkillByID(r.Context(), skillID)
	if err != nil {
		redirectSkillDetail(w, r, skillID, "", "Skill not found")
		return
	}
	if !user.CanManageSkill(skill.OwnerID) {
		redirectSkillDetail(w, r, skillID, "", "Permission denied")
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectSkillDetail(w, r, skillID, "", "Invalid form payload")
		return
	}

	organizationValue, parseErr := strconv.ParseUint(r.FormValue("organization_id"), 10, 64)
	if parseErr != nil || organizationValue == 0 {
		redirectSkillDetail(w, r, skillID, "", "organization_id is required")
		return
	}
	organizationID := uint(organizationValue)

	if _, err := a.organizationSvc.GetByID(r.Context(), organizationID); err != nil {
		if errors.Is(err, services.ErrOrganizationNotFound) {
			redirectSkillDetail(w, r, skillID, "", "Organization not found")
			return
		}
		redirectSkillDetail(w, r, skillID, "", "Failed to load organization")
		return
	}

	canManageInOrg, err := a.organizationSvc.CanManageSkillInOrganization(r.Context(), *user, organizationID, skill.OwnerID)
	if err != nil {
		redirectSkillDetail(w, r, skillID, "", "Failed to validate organization permission")
		return
	}
	if !canManageInOrg {
		redirectSkillDetail(w, r, skillID, "", "Permission denied")
		return
	}

	if _, err := a.skillService.SetOrganization(r.Context(), skillID, &organizationID); err != nil {
		if errors.Is(err, services.ErrSkillNotFound) {
			redirectSkillDetail(w, r, skillID, "", "Skill not found")
			return
		}
		if errors.Is(err, services.ErrOrganizationNotFound) {
			redirectSkillDetail(w, r, skillID, "", "Organization not found")
			return
		}
		redirectSkillDetail(w, r, skillID, "", "Failed to bind organization")
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "skill_organization_bind",
		TargetType: "skill",
		TargetID:   skillID,
		Summary:    "Bound skill to organization",
		Details: auditDetailsJSON(map[string]string{
			"skill_id":        strconv.FormatUint(uint64(skillID), 10),
			"organization_id": strconv.FormatUint(uint64(organizationID), 10),
		}),
	})
	redirectSkillDetail(w, r, skillID, "Organization binding updated", "")
}

func (a *App) handleSkillOrganizationUnbind(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if a.skillService == nil {
		skillID, ok := parseSkillID(w, r)
		if !ok {
			return
		}
		redirectSkillDetail(w, r, skillID, "", "Service unavailable")
		return
	}

	skillID, ok := parseSkillID(w, r)
	if !ok {
		return
	}
	skill, err := a.skillService.GetSkillByID(r.Context(), skillID)
	if err != nil {
		redirectSkillDetail(w, r, skillID, "", "Skill not found")
		return
	}
	if !user.CanManageSkill(skill.OwnerID) {
		redirectSkillDetail(w, r, skillID, "", "Permission denied")
		return
	}

	organizationID := skill.OrganizationID
	if organizationID != nil {
		if a.organizationSvc == nil {
			redirectSkillDetail(w, r, skillID, "", "Service unavailable")
			return
		}

		canManageInOrg, permissionErr := a.organizationSvc.CanManageSkillInOrganization(
			r.Context(),
			*user,
			*organizationID,
			skill.OwnerID,
		)
		if permissionErr != nil {
			redirectSkillDetail(w, r, skillID, "", "Failed to validate organization permission")
			return
		}
		if !canManageInOrg {
			redirectSkillDetail(w, r, skillID, "", "Permission denied")
			return
		}

		if _, err := a.skillService.SetOrganization(r.Context(), skillID, nil); err != nil {
			if errors.Is(err, services.ErrSkillNotFound) {
				redirectSkillDetail(w, r, skillID, "", "Skill not found")
				return
			}
			redirectSkillDetail(w, r, skillID, "", "Failed to unbind organization")
			return
		}
	}

	auditDetails := map[string]string{
		"skill_id": strconv.FormatUint(uint64(skillID), 10),
	}
	if organizationID != nil {
		auditDetails["organization_id"] = strconv.FormatUint(uint64(*organizationID), 10)
	}
	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "skill_organization_unbind",
		TargetType: "skill",
		TargetID:   skillID,
		Summary:    "Unbound skill from organization",
		Details:    auditDetailsJSON(auditDetails),
	})
	redirectSkillDetail(w, r, skillID, "Organization unbound", "")
}

func (a *App) handleAPISkillOrganizationBind(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.skillService == nil || a.organizationSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	skillID, ok := parseSkillID(w, r)
	if !ok {
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

	var input apiSkillOrganizationBindRequest
	if err := decodeJSONOrForm(r, &input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}
	if input.OrganizationID == 0 {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": "organization_id is required"})
		return
	}

	if _, err := a.organizationSvc.GetByID(r.Context(), input.OrganizationID); err != nil {
		if errors.Is(err, services.ErrOrganizationNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "organization_not_found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "organization_query_failed", "message": err.Error()})
		return
	}

	canManageInOrg, err := a.organizationSvc.CanManageSkillInOrganization(r.Context(), *user, input.OrganizationID, skill.OwnerID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "organization_permission_check_failed", "message": err.Error()})
		return
	}
	if !canManageInOrg {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}

	updatedSkill, err := a.skillService.SetOrganization(r.Context(), skillID, &input.OrganizationID)
	if err != nil {
		if errors.Is(err, services.ErrSkillNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "skill_not_found"})
			return
		}
		if errors.Is(err, services.ErrOrganizationNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "organization_not_found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "organization_bind_failed", "message": err.Error()})
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "skill_organization_bind",
		TargetType: "skill",
		TargetID:   skillID,
		Summary:    "Bound skill to organization",
		Details: auditDetailsJSON(map[string]string{
			"skill_id":        strconv.FormatUint(uint64(skillID), 10),
			"organization_id": strconv.FormatUint(uint64(input.OrganizationID), 10),
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":              true,
		"skill_id":        updatedSkill.ID,
		"organization_id": updatedSkill.OrganizationID,
	})
}

func (a *App) handleAPISkillOrganizationUnbind(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.skillService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	skillID, ok := parseSkillID(w, r)
	if !ok {
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

	organizationID := skill.OrganizationID
	if organizationID != nil {
		if a.organizationSvc == nil {
			writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
			return
		}

		canManageInOrg, permissionErr := a.organizationSvc.CanManageSkillInOrganization(
			r.Context(),
			*user,
			*organizationID,
			skill.OwnerID,
		)
		if permissionErr != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]any{
				"error":   "organization_permission_check_failed",
				"message": permissionErr.Error(),
			})
			return
		}
		if !canManageInOrg {
			writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
			return
		}
		if _, err := a.skillService.SetOrganization(r.Context(), skillID, nil); err != nil {
			if errors.Is(err, services.ErrSkillNotFound) {
				writeJSON(w, http.StatusNotFound, map[string]any{"error": "skill_not_found"})
				return
			}
			writeJSON(w, http.StatusInternalServerError, map[string]any{
				"error":   "organization_unbind_failed",
				"message": err.Error(),
			})
			return
		}
	}

	auditDetails := map[string]string{
		"skill_id": strconv.FormatUint(uint64(skillID), 10),
	}
	if organizationID != nil {
		auditDetails["organization_id"] = strconv.FormatUint(uint64(*organizationID), 10)
	}
	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "skill_organization_unbind",
		TargetType: "skill",
		TargetID:   skillID,
		Summary:    "Unbound skill from organization",
		Details:    auditDetailsJSON(auditDetails),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":              true,
		"skill_id":        skillID,
		"organization_id": nil,
	})
}
