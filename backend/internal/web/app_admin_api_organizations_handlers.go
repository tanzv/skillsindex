package web

import (
	"net/http"

	"skillsindex/internal/services"
)

func (a *App) handleAPIAdminOrganizations(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if a.organizationSvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Organization service is unavailable")
		return
	}

	organizations, err := a.organizationSvc.ListOrganizations(r.Context(), *user)
	if err != nil {
		writeAPIError(w, r, http.StatusInternalServerError, "list_failed", "Failed to load organizations")
		return
	}

	items := make([]apiOrganizationItem, 0, len(organizations))
	for _, org := range organizations {
		items = append(items, apiOrganizationItem{
			ID:        org.ID,
			Name:      org.Name,
			Slug:      org.Slug,
			CreatedAt: org.CreatedAt,
			UpdatedAt: org.UpdatedAt,
		})
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items, "total": len(items)})
}

func (a *App) handleAPIAdminOrganizationCreate(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if a.organizationSvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Organization service is unavailable")
		return
	}

	name, err := readStringField(r, "name")
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid request payload")
		return
	}
	organization, err := a.organizationSvc.CreateOrganization(r.Context(), name, user.ID)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "create_failed", err, "Failed to create organization")
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "organization_create",
		TargetType: "organization",
		TargetID:   organization.ID,
		Summary:    "Created organization through admin api",
		Details: auditDetailsJSON(map[string]string{
			"name": organization.Name,
			"slug": organization.Slug,
		}),
	})

	writeJSON(w, http.StatusCreated, map[string]any{
		"id":         organization.ID,
		"name":       organization.Name,
		"slug":       organization.Slug,
		"created_at": organization.CreatedAt,
		"updated_at": organization.UpdatedAt,
	})
}
