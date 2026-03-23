package web

import (
	"net/http"

	"skillsindex/internal/services"
)

func (a *App) handleAPIAdminOrganizations(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.organizationSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	organizations, err := a.organizationSvc.ListOrganizations(r.Context(), *user)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "list_failed", "message": err.Error()})
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
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.organizationSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	name, err := readStringField(r, "name")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}
	organization, err := a.organizationSvc.CreateOrganization(r.Context(), name, user.ID)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "create_failed", "message": err.Error()})
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
