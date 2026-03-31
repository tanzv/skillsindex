package web

import (
	"errors"
	"net/http"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func parseOrganizationRoleValue(raw string) (models.OrganizationRole, bool) {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case string(models.OrganizationRoleOwner):
		return models.OrganizationRoleOwner, true
	case string(models.OrganizationRoleAdmin):
		return models.OrganizationRoleAdmin, true
	case string(models.OrganizationRoleMember):
		return models.OrganizationRoleMember, true
	case string(models.OrganizationRoleViewer):
		return models.OrganizationRoleViewer, true
	default:
		return "", false
	}
}

func writeOrganizationServiceError(w http.ResponseWriter, r *http.Request, err error) {
	switch {
	case errors.Is(err, services.ErrOrganizationPermissionDenied):
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
	case errors.Is(err, services.ErrOrganizationNotFound):
		writeAPIError(w, r, http.StatusNotFound, "organization_not_found", "Organization not found")
	case errors.Is(err, services.ErrOrganizationMembershipNotFound):
		writeAPIError(w, r, http.StatusNotFound, "membership_not_found", "Organization membership not found")
	case errors.Is(err, services.ErrOrganizationLastOwner):
		writeAPIError(w, r, http.StatusConflict, "last_owner_guard", "The last organization owner cannot be removed")
	default:
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "organization_operation_failed", err, "Organization operation failed")
	}
}

func userStatusValue(user models.User) string {
	status := strings.TrimSpace(strings.ToLower(string(user.Status)))
	if status == "" {
		return string(models.UserStatusActive)
	}
	return status
}
