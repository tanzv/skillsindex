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
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if a.skillService == nil || a.organizationSvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Skill organization services are unavailable")
		return
	}

	skillID, ok := parseSkillID(w, r)
	if !ok {
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

	var input apiSkillOrganizationBindRequest
	if err := decodeJSONOrForm(r, &input); err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid payload")
		return
	}
	if input.OrganizationID == 0 {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_payload", "organization_id is required")
		return
	}

	if _, err := a.organizationSvc.GetByID(r.Context(), input.OrganizationID); err != nil {
		if errors.Is(err, services.ErrOrganizationNotFound) {
			writeAPIError(w, r, http.StatusNotFound, "organization_not_found", "Organization not found")
			return
		}
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "organization_query_failed", err, "Failed to load organization")
		return
	}

	canManageInOrg, err := a.organizationSvc.CanManageSkillInOrganization(r.Context(), *user, input.OrganizationID, skill.OwnerID)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "organization_permission_check_failed", err, "Failed to validate organization permission")
		return
	}
	if !canManageInOrg {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}

	updatedSkill, err := a.skillService.SetOrganization(r.Context(), skillID, &input.OrganizationID)
	if err != nil {
		if errors.Is(err, services.ErrSkillNotFound) {
			writeAPIError(w, r, http.StatusNotFound, "skill_not_found", "Skill not found")
			return
		}
		if errors.Is(err, services.ErrOrganizationNotFound) {
			writeAPIError(w, r, http.StatusNotFound, "organization_not_found", "Organization not found")
			return
		}
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "organization_bind_failed", err, "Failed to bind organization")
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
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if a.skillService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Skill organization services are unavailable")
		return
	}

	skillID, ok := parseSkillID(w, r)
	if !ok {
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

	organizationID := skill.OrganizationID
	if organizationID != nil {
		if a.organizationSvc == nil {
			writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Skill organization services are unavailable")
			return
		}

		canManageInOrg, permissionErr := a.organizationSvc.CanManageSkillInOrganization(
			r.Context(),
			*user,
			*organizationID,
			skill.OwnerID,
		)
		if permissionErr != nil {
			writeAPIErrorFromError(w, r, http.StatusInternalServerError, "organization_permission_check_failed", permissionErr, "Failed to validate organization permission")
			return
		}
		if !canManageInOrg {
			writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
			return
		}
		if _, err := a.skillService.SetOrganization(r.Context(), skillID, nil); err != nil {
			if errors.Is(err, services.ErrSkillNotFound) {
				writeAPIError(w, r, http.StatusNotFound, "skill_not_found", "Skill not found")
				return
			}
			writeAPIErrorFromError(w, r, http.StatusInternalServerError, "organization_unbind_failed", err, "Failed to unbind organization")
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
