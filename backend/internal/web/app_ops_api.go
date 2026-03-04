package web

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) requireOpsAdmin(w http.ResponseWriter, r *http.Request) (*models.User, bool) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return nil, false
	}
	if !currentUser.CanViewAllSkills() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return nil, false
	}
	if a.opsService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return nil, false
	}
	return currentUser, true
}

func (a *App) handleAPIAdminOpsMetrics(w http.ResponseWriter, r *http.Request) {
	_, ok := a.requireOpsAdmin(w, r)
	if !ok {
		return
	}

	metrics, err := a.opsService.BuildMetrics(r.Context(), time.Now().UTC())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "metrics_failed", "message": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"item": metrics})
}

func (a *App) handleAPIAdminOpsAlerts(w http.ResponseWriter, r *http.Request) {
	_, ok := a.requireOpsAdmin(w, r)
	if !ok {
		return
	}

	alerts, err := a.opsService.BuildAlerts(r.Context(), time.Now().UTC())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "alerts_failed", "message": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": alerts, "total": len(alerts)})
}

func (a *App) handleAPIAdminOpsAuditExport(w http.ResponseWriter, r *http.Request) {
	_, ok := a.requireOpsAdmin(w, r)
	if !ok {
		return
	}

	from := parseOpsTimeQuery(r.URL.Query().Get("from"), time.Now().UTC().Add(-24*time.Hour))
	to := parseOpsTimeQuery(r.URL.Query().Get("to"), time.Now().UTC())
	format := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("format")))
	if format == "" {
		format = "json"
	}

	raw, contentType, filename, err := a.opsService.ExportAudit(r.Context(), services.AuditExportInput{
		From:   from,
		To:     to,
		Format: format,
	})
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "audit_export_failed", "message": err.Error()})
		return
	}

	w.Header().Set("Content-Type", contentType)
	w.Header().Set("Content-Disposition", `attachment; filename="`+filename+`"`)
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(raw)
}

func (a *App) handleAPIAdminOpsReleaseGates(w http.ResponseWriter, r *http.Request) {
	_, ok := a.requireOpsAdmin(w, r)
	if !ok {
		return
	}

	snapshot, err := a.opsService.BuildReleaseGates(r.Context(), time.Now().UTC())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "release_gates_failed", "message": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"item": snapshot})
}

func (a *App) handleAPIAdminOpsReleaseGatesRun(w http.ResponseWriter, r *http.Request) {
	currentUser, ok := a.requireOpsAdmin(w, r)
	if !ok {
		return
	}

	snapshot, err := a.opsService.BuildReleaseGates(r.Context(), time.Now().UTC())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "release_gates_failed", "message": err.Error()})
		return
	}
	if err := a.opsService.RecordReleaseGateRun(r.Context(), currentUser.ID, snapshot); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "release_gate_audit_failed", "message": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"item": snapshot})
}

func (a *App) handleAPIAdminOpsRecoveryDrills(w http.ResponseWriter, r *http.Request) {
	_, ok := a.requireOpsAdmin(w, r)
	if !ok {
		return
	}

	limit := 20
	if raw := strings.TrimSpace(r.URL.Query().Get("limit")); raw != "" {
		if parsed, err := strconv.Atoi(raw); err == nil {
			limit = parsed
		}
	}

	items, err := a.opsService.ListRecoveryDrills(r.Context(), limit)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "recovery_drills_failed", "message": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items, "total": len(items)})
}

func (a *App) handleAPIAdminOpsRecoveryDrillRun(w http.ResponseWriter, r *http.Request) {
	currentUser, ok := a.requireOpsAdmin(w, r)
	if !ok {
		return
	}

	input, err := readOpsRecoveryDrillRunInput(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_recovery_drill_input", "message": err.Error()})
		return
	}

	record, err := a.opsService.RecordRecoveryDrill(r.Context(), currentUser.ID, services.RecordRecoveryDrillInput{
		RPOHours:   input.RPOHours,
		RTOHours:   input.RTOHours,
		Note:       input.Note,
		OccurredAt: input.OccurredAt,
	})
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "recovery_drill_failed", "message": err.Error()})
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"item": record})
}

func (a *App) handleAPIAdminOpsReleases(w http.ResponseWriter, r *http.Request) {
	_, ok := a.requireOpsAdmin(w, r)
	if !ok {
		return
	}

	limit := 20
	if raw := strings.TrimSpace(r.URL.Query().Get("limit")); raw != "" {
		if parsed, err := strconv.Atoi(raw); err == nil {
			limit = parsed
		}
	}
	items, err := a.opsService.ListReleases(r.Context(), limit)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "releases_failed", "message": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items, "total": len(items)})
}

func (a *App) handleAPIAdminOpsReleasesCreate(w http.ResponseWriter, r *http.Request) {
	currentUser, ok := a.requireOpsAdmin(w, r)
	if !ok {
		return
	}

	input, err := readOpsReleaseCreateInput(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_release_input", "message": err.Error()})
		return
	}
	record, err := a.opsService.RecordRelease(r.Context(), currentUser.ID, input)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "release_record_failed", "message": err.Error()})
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"item": record})
}

func (a *App) handleAPIAdminOpsChangeApprovals(w http.ResponseWriter, r *http.Request) {
	_, ok := a.requireOpsAdmin(w, r)
	if !ok {
		return
	}

	limit := 20
	if raw := strings.TrimSpace(r.URL.Query().Get("limit")); raw != "" {
		if parsed, err := strconv.Atoi(raw); err == nil {
			limit = parsed
		}
	}
	items, err := a.opsService.ListChangeApprovals(r.Context(), limit)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "change_approvals_failed", "message": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items, "total": len(items)})
}

func (a *App) handleAPIAdminOpsChangeApprovalsCreate(w http.ResponseWriter, r *http.Request) {
	currentUser, ok := a.requireOpsAdmin(w, r)
	if !ok {
		return
	}

	input, err := readOpsChangeApprovalCreateInput(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_change_approval_input", "message": err.Error()})
		return
	}
	record, err := a.opsService.RecordChangeApproval(r.Context(), currentUser.ID, input)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "change_approval_record_failed", "message": err.Error()})
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"item": record})
}

func (a *App) handleAPIAdminOpsBackupPlans(w http.ResponseWriter, r *http.Request) {
	_, ok := a.requireOpsAdmin(w, r)
	if !ok {
		return
	}

	limit := 20
	if raw := strings.TrimSpace(r.URL.Query().Get("limit")); raw != "" {
		if parsed, err := strconv.Atoi(raw); err == nil {
			limit = parsed
		}
	}
	items, err := a.opsService.ListBackupPlans(r.Context(), limit)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "backup_plans_failed", "message": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items, "total": len(items)})
}

func (a *App) handleAPIAdminOpsBackupPlansUpsert(w http.ResponseWriter, r *http.Request) {
	currentUser, ok := a.requireOpsAdmin(w, r)
	if !ok {
		return
	}

	input, err := readOpsBackupPlanUpsertInput(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_backup_plan_input", "message": err.Error()})
		return
	}
	record, err := a.opsService.UpsertBackupPlan(r.Context(), currentUser.ID, input)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "backup_plan_record_failed", "message": err.Error()})
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"item": record})
}

func (a *App) handleAPIAdminOpsBackupRuns(w http.ResponseWriter, r *http.Request) {
	_, ok := a.requireOpsAdmin(w, r)
	if !ok {
		return
	}

	limit := 20
	if raw := strings.TrimSpace(r.URL.Query().Get("limit")); raw != "" {
		if parsed, err := strconv.Atoi(raw); err == nil {
			limit = parsed
		}
	}
	items, err := a.opsService.ListBackupRuns(r.Context(), limit)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "backup_runs_failed", "message": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items, "total": len(items)})
}

func (a *App) handleAPIAdminOpsBackupRunsCreate(w http.ResponseWriter, r *http.Request) {
	currentUser, ok := a.requireOpsAdmin(w, r)
	if !ok {
		return
	}

	input, err := readOpsBackupRunCreateInput(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_backup_run_input", "message": err.Error()})
		return
	}
	record, err := a.opsService.RecordBackupRun(r.Context(), currentUser.ID, input)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "backup_run_record_failed", "message": err.Error()})
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"item": record})
}
