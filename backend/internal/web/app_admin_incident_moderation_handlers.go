package web

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"skillsindex/internal/services"
)

func (a *App) handleAdminIntegrationCreate(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if !currentUser.CanViewAllSkills() {
		redirectAdminPath(w, r, "/admin/integrations", "", "Permission denied")
		return
	}
	if a.integrationSvc == nil {
		redirectAdminPath(w, r, "/admin/integrations/new", "", "Integration service unavailable")
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectAdminPath(w, r, "/admin/integrations/new", "", "Invalid form payload")
		return
	}

	enabled := parseBoolFlag(r.FormValue("enabled"), false)
	connector, err := a.integrationSvc.CreateConnector(r.Context(), services.CreateConnectorInput{
		Name:        r.FormValue("name"),
		Provider:    r.FormValue("provider"),
		Description: r.FormValue("description"),
		BaseURL:     r.FormValue("base_url"),
		ConfigJSON:  r.FormValue("config_json"),
		Enabled:     enabled,
		CreatedBy:   currentUser.ID,
	})
	if err != nil {
		redirectAdminPath(w, r, "/admin/integrations/new", "", err.Error())
		return
	}

	a.recordAudit(r.Context(), currentUser, services.RecordAuditInput{
		Action:     "integration_connector_create",
		TargetType: "integration_connector",
		TargetID:   connector.ID,
		Summary:    "Created integration connector",
		Details: auditDetailsJSON(map[string]string{
			"name":     connector.Name,
			"provider": connector.Provider,
			"enabled":  strconv.FormatBool(connector.Enabled),
		}),
	})
	redirectAdminPath(w, r, "/admin/integrations/list", "Connector created", "")
}

func (a *App) handleAdminIncidentCreate(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if !currentUser.CanAccessDashboard() {
		redirectAdminPath(w, r, "/admin/incidents", "", "Permission denied")
		return
	}
	if a.incidentSvc == nil {
		redirectAdminPath(w, r, "/admin/incidents", "", "Incident service unavailable")
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectAdminPath(w, r, "/admin/incidents", "", "Invalid form payload")
		return
	}

	var ownerUserID *uint
	ownerRaw := strings.TrimSpace(r.FormValue("owner_user_id"))
	if ownerRaw != "" {
		value, parseErr := strconv.ParseUint(ownerRaw, 10, 64)
		if parseErr != nil {
			redirectAdminPath(w, r, "/admin/incidents", "", "Invalid owner id")
			return
		}
		ownerID := uint(value)
		ownerUserID = &ownerID
	}

	severity := parseIncidentSeverity(r.FormValue("severity"))
	incident, err := a.incidentSvc.CreateIncident(r.Context(), services.CreateIncidentInput{
		Title:       r.FormValue("title"),
		Summary:     r.FormValue("summary"),
		Severity:    severity,
		Source:      r.FormValue("source"),
		Impact:      r.FormValue("impact"),
		OwnerUserID: ownerUserID,
		CreatedBy:   currentUser.ID,
	})
	if err != nil {
		redirectAdminPath(w, r, "/admin/incidents", "", err.Error())
		return
	}

	a.recordAudit(r.Context(), currentUser, services.RecordAuditInput{
		Action:     "incident_create",
		TargetType: "incident",
		TargetID:   incident.ID,
		Summary:    "Created incident record",
		Details: auditDetailsJSON(map[string]string{
			"title":    incident.Title,
			"severity": string(incident.Severity),
			"status":   string(incident.Status),
		}),
	})
	redirectAdminPath(
		w,
		r,
		"/admin/incidents/"+strconv.FormatUint(uint64(incident.ID), 10)+"/response",
		"Incident created",
		"",
	)
}

func (a *App) handleAdminIncidentResponse(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if !currentUser.CanAccessDashboard() {
		redirectAdminPath(w, r, "/admin/incidents", "", "Permission denied")
		return
	}
	if a.incidentSvc == nil {
		redirectAdminPath(w, r, "/admin/incidents", "", "Incident service unavailable")
		return
	}
	incidentID, ok := parseIncidentID(w, r)
	if !ok {
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectAdminPath(w, r, "/admin/incidents/"+strconv.FormatUint(uint64(incidentID), 10)+"/response", "", "Invalid form payload")
		return
	}

	var ownerUserID *uint
	ownerRaw := strings.TrimSpace(r.FormValue("owner_user_id"))
	if ownerRaw != "" {
		value, parseErr := strconv.ParseUint(ownerRaw, 10, 64)
		if parseErr != nil {
			redirectAdminPath(w, r, "/admin/incidents/"+strconv.FormatUint(uint64(incidentID), 10)+"/response", "", "Invalid owner id")
			return
		}
		ownerID := uint(value)
		ownerUserID = &ownerID
	}

	status, statusOK := parseIncidentStatus(r.FormValue("status"))
	if !statusOK {
		redirectAdminPath(w, r, "/admin/incidents/"+strconv.FormatUint(uint64(incidentID), 10)+"/response", "", "Invalid incident status")
		return
	}
	incident, err := a.incidentSvc.UpdateResponse(r.Context(), services.UpdateIncidentResponseInput{
		IncidentID:    incidentID,
		Status:        status,
		ResponseNotes: r.FormValue("response_notes"),
		Impact:        r.FormValue("impact"),
		OwnerUserID:   ownerUserID,
	})
	if err != nil {
		if errors.Is(err, services.ErrIncidentNotFound) {
			redirectAdminPath(w, r, "/admin/incidents", "", "Incident not found")
			return
		}
		redirectAdminPath(w, r, "/admin/incidents/"+strconv.FormatUint(uint64(incidentID), 10)+"/response", "", "Failed to update incident response")
		return
	}

	a.recordAudit(r.Context(), currentUser, services.RecordAuditInput{
		Action:     "incident_response_update",
		TargetType: "incident",
		TargetID:   incident.ID,
		Summary:    "Updated incident response",
		Details: auditDetailsJSON(map[string]string{
			"status": string(incident.Status),
		}),
	})
	redirectAdminPath(w, r, "/admin/incidents/"+strconv.FormatUint(uint64(incidentID), 10)+"/response", "Incident response updated", "")
}

func (a *App) handleAdminIncidentPostmortem(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if !currentUser.CanAccessDashboard() {
		redirectAdminPath(w, r, "/admin/incidents", "", "Permission denied")
		return
	}
	if a.incidentSvc == nil {
		redirectAdminPath(w, r, "/admin/incidents", "", "Incident service unavailable")
		return
	}
	incidentID, ok := parseIncidentID(w, r)
	if !ok {
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectAdminPath(w, r, "/admin/incidents/"+strconv.FormatUint(uint64(incidentID), 10)+"/postmortem", "", "Invalid form payload")
		return
	}

	status, statusOK := parseIncidentStatus(r.FormValue("status"))
	if !statusOK {
		redirectAdminPath(w, r, "/admin/incidents/"+strconv.FormatUint(uint64(incidentID), 10)+"/postmortem", "", "Invalid incident status")
		return
	}

	incident, err := a.incidentSvc.UpdatePostmortem(r.Context(), services.UpdateIncidentPostmortemInput{
		IncidentID: incidentID,
		Postmortem: r.FormValue("postmortem"),
		Status:     status,
	})
	if err != nil {
		if errors.Is(err, services.ErrIncidentNotFound) {
			redirectAdminPath(w, r, "/admin/incidents", "", "Incident not found")
			return
		}
		redirectAdminPath(w, r, "/admin/incidents/"+strconv.FormatUint(uint64(incidentID), 10)+"/postmortem", "", "Failed to update postmortem")
		return
	}

	a.recordAudit(r.Context(), currentUser, services.RecordAuditInput{
		Action:     "incident_postmortem_update",
		TargetType: "incident",
		TargetID:   incident.ID,
		Summary:    "Updated incident postmortem",
		Details: auditDetailsJSON(map[string]string{
			"status": string(incident.Status),
		}),
	})
	redirectAdminPath(w, r, "/admin/incidents/"+strconv.FormatUint(uint64(incidentID), 10)+"/postmortem", "Incident postmortem updated", "")
}
