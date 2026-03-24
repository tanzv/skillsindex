package web

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func TestAPISkillSyncRunDetailUnauthorized(t *testing.T) {
	app, _, _, _, _, skillA, _ := setupSkillSyncRunsTestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/skills/1/sync-runs/1", nil)
	req.Header.Set("X-Request-ID", "req-skill-sync-run-detail-unauthorized")
	req = withURLParams(req, map[string]string{
		"skillID": strconv.FormatUint(uint64(skillA.ID), 10),
		"runID":   "1",
	})
	recorder := httptest.NewRecorder()

	app.handleAPISkillSyncRunDetail(recorder, req)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusUnauthorized)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "unauthorized" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Authentication required" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-skill-sync-run-detail-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPISkillSyncRunDetailForbidden(t *testing.T) {
	app, _, _, member, _, skillA, _ := setupSkillSyncRunsTestApp(t)
	ownerID := skillA.OwnerID
	targetSkillID := skillA.ID

	recorded, err := app.syncJobSvc.RecordRun(context.Background(), services.RecordSyncRunInput{
		Trigger:       "manual",
		Scope:         "owned",
		TargetSkillID: &targetSkillID,
		OwnerUserID:   &ownerID,
		Candidates:    1,
		Synced:        1,
		StartedAt:     time.Now().UTC().Add(-2 * time.Second),
		FinishedAt:    time.Now().UTC(),
	})
	if err != nil {
		t.Fatalf("failed to create run: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/skills/%d/sync-runs/%d", skillA.ID, recorded.ID), nil)
	req = withCurrentUser(req, &member)
	req = withURLParams(req, map[string]string{
		"skillID": strconv.FormatUint(uint64(skillA.ID), 10),
		"runID":   strconv.FormatUint(uint64(recorded.ID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleAPISkillSyncRunDetail(recorder, req)

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusForbidden)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "permission_denied" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
}

func TestAPISkillSyncRunDetailSkillNotFound(t *testing.T) {
	app, _, _, _, admin, _, _ := setupSkillSyncRunsTestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/skills/99999/sync-runs/1", nil)
	req = withCurrentUser(req, &admin)
	req = withURLParams(req, map[string]string{
		"skillID": "99999",
		"runID":   "1",
	})
	recorder := httptest.NewRecorder()

	app.handleAPISkillSyncRunDetail(recorder, req)

	if recorder.Code != http.StatusNotFound {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusNotFound)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "skill_not_found" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
}

func TestAPISkillSyncRunDetailInvalidRunID(t *testing.T) {
	app, _, owner, _, _, skillA, _ := setupSkillSyncRunsTestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/skills/1/sync-runs/invalid", nil)
	req.Header.Set("X-Request-ID", "req-skill-sync-run-detail-invalid-run")
	req = withCurrentUser(req, &owner)
	req = withURLParams(req, map[string]string{
		"skillID": strconv.FormatUint(uint64(skillA.ID), 10),
		"runID":   "invalid",
	})
	recorder := httptest.NewRecorder()

	app.handleAPISkillSyncRunDetail(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_run_id" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Invalid sync run id" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-skill-sync-run-detail-invalid-run" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPISkillSyncRunDetailRunNotFoundOrMismatch(t *testing.T) {
	app, _, owner, _, _, skillA, skillB := setupSkillSyncRunsTestApp(t)
	ownerID := owner.ID
	targetSkillBID := skillB.ID

	mismatchRun, err := app.syncJobSvc.RecordRun(context.Background(), services.RecordSyncRunInput{
		Trigger:       "manual",
		Scope:         "owned",
		TargetSkillID: &targetSkillBID,
		OwnerUserID:   &ownerID,
		Candidates:    1,
		Synced:        1,
		StartedAt:     time.Now().UTC().Add(-2 * time.Second),
		FinishedAt:    time.Now().UTC(),
	})
	if err != nil {
		t.Fatalf("failed to create mismatch run: %v", err)
	}

	nilTargetRun, err := app.syncJobSvc.RecordRun(context.Background(), services.RecordSyncRunInput{
		Trigger:     "manual",
		Scope:       "owned",
		OwnerUserID: &ownerID,
		Candidates:  1,
		Synced:      1,
		StartedAt:   time.Now().UTC().Add(-1 * time.Second),
		FinishedAt:  time.Now().UTC(),
	})
	if err != nil {
		t.Fatalf("failed to create nil-target run: %v", err)
	}

	cases := []struct {
		name  string
		runID string
	}{
		{name: "missing run", runID: "999999"},
		{name: "target skill mismatch", runID: strconv.FormatUint(uint64(mismatchRun.ID), 10)},
		{name: "target skill missing", runID: strconv.FormatUint(uint64(nilTargetRun.ID), 10)},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/api/v1/skills/1/sync-runs/1", nil)
			req = withCurrentUser(req, &owner)
			req = withURLParams(req, map[string]string{
				"skillID": strconv.FormatUint(uint64(skillA.ID), 10),
				"runID":   tc.runID,
			})
			recorder := httptest.NewRecorder()

			app.handleAPISkillSyncRunDetail(recorder, req)

			if recorder.Code != http.StatusNotFound {
				t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusNotFound)
			}
			payload := decodeBodyMap(t, recorder)
			if payload["error"] != "sync_run_not_found" {
				t.Fatalf("unexpected error payload: %#v", payload)
			}
		})
	}
}

func TestAPISkillSyncRunDetailSuccess(t *testing.T) {
	app, _, owner, _, _, skillA, _ := setupSkillSyncRunsTestApp(t)
	ownerID := owner.ID
	targetSkillID := skillA.ID

	recorded, err := app.syncJobSvc.RecordRun(context.Background(), services.RecordSyncRunInput{
		Trigger:       "scheduled",
		Scope:         "owned",
		TargetSkillID: &targetSkillID,
		OwnerUserID:   &ownerID,
		Candidates:    3,
		Synced:        2,
		Failed:        1,
		StartedAt:     time.Now().UTC().Add(-3 * time.Second),
		FinishedAt:    time.Now().UTC(),
	})
	if err != nil {
		t.Fatalf("failed to create run: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/skills/%d/sync-runs/%d", skillA.ID, recorded.ID), nil)
	req = withCurrentUser(req, &owner)
	req = withURLParams(req, map[string]string{
		"skillID": strconv.FormatUint(uint64(skillA.ID), 10),
		"runID":   strconv.FormatUint(uint64(recorded.ID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleAPISkillSyncRunDetail(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	item, ok := payload["item"].(map[string]any)
	if !ok {
		t.Fatalf("missing item payload: %#v", payload)
	}
	itemID, _ := item["id"].(float64)
	if itemID == 0 {
		itemID, _ = item["ID"].(float64)
	}
	if uint(itemID) != recorded.ID {
		t.Fatalf("unexpected item id: got=%v want=%d", itemID, recorded.ID)
	}
	targetID, _ := item["target_skill_id"].(float64)
	if targetID == 0 {
		targetID, _ = item["TargetSkillID"].(float64)
	}
	if uint(targetID) != skillA.ID {
		t.Fatalf("unexpected target skill id: got=%v want=%d", targetID, skillA.ID)
	}
}

func TestAPISkillSyncRunDetailIncludesVersionAndAuditSummary(t *testing.T) {
	app, db, owner, _, _, skillA, _ := setupSkillSyncRunsTestApp(t)
	ownerID := owner.ID
	targetSkillID := skillA.ID

	run, err := app.syncJobSvc.RecordRun(context.Background(), services.RecordSyncRunInput{
		Trigger:       "manual",
		TriggerType:   services.SyncRunTriggerTypeManual,
		Scope:         "single",
		Status:        services.SyncRunStatusSucceeded,
		TargetSkillID: &targetSkillID,
		OwnerUserID:   &ownerID,
		ActorUserID:   &ownerID,
		Candidates:    1,
		Synced:        1,
		StartedAt:     time.Now().UTC().Add(-2 * time.Second),
		FinishedAt:    time.Now().UTC(),
	})
	if err != nil {
		t.Fatalf("failed to create run: %v", err)
	}
	if err := app.skillVersionSvc.CaptureWithRunContext(context.Background(), skillA.ID, "sync", &ownerID, &run.ID); err != nil {
		t.Fatalf("failed to capture version with run context: %v", err)
	}
	auditSvc := services.NewAuditService(db)
	if err := auditSvc.Record(context.Background(), services.RecordAuditInput{
		ActorUserID: ownerID,
		Action:      "skill_sync",
		TargetType:  "skill",
		TargetID:    skillA.ID,
		Summary:     "Skill sync audit",
	}); err != nil {
		t.Fatalf("failed to record audit: %v", err)
	}
	var latestAudit models.AuditLog
	if err := db.Order("id DESC").First(&latestAudit).Error; err != nil {
		t.Fatalf("failed to load latest audit log: %v", err)
	}
	if err := db.Model(&models.AuditLog{}).Where("id = ?", latestAudit.ID).Update("created_at", run.FinishedAt.Add(30*time.Second)).Error; err != nil {
		t.Fatalf("failed to update audit timestamp: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/skills/%d/sync-runs/%d", skillA.ID, run.ID), nil)
	req = withCurrentUser(req, &owner)
	req = withURLParams(req, map[string]string{
		"skillID": strconv.FormatUint(uint64(skillA.ID), 10),
		"runID":   strconv.FormatUint(uint64(run.ID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleAPISkillSyncRunDetail(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}

	payload := decodeBodyMap(t, recorder)
	item, ok := payload["item"].(map[string]any)
	if !ok {
		t.Fatalf("missing item payload: %#v", payload)
	}
	if _, ok := item["version"].(map[string]any); !ok {
		t.Fatalf("expected version summary in payload: %#v", item)
	}
	audit, ok := item["audit"].(map[string]any)
	if !ok {
		t.Fatalf("expected audit summary in payload: %#v", item)
	}
	if latestTargetType, _ := audit["latest_target_type"].(string); latestTargetType != "skill" {
		t.Fatalf("unexpected latest target type: %#v", audit)
	}
}

func TestAPISkillSyncRunDetailAuditSummaryExcludesLaterAuditLogs(t *testing.T) {
	app, db, owner, _, _, skillA, _ := setupSkillSyncRunsTestApp(t)
	ownerID := owner.ID
	targetSkillID := skillA.ID
	startedAt := time.Now().UTC().Add(-3 * time.Minute)
	finishedAt := startedAt.Add(30 * time.Second)

	run, err := app.syncJobSvc.RecordRun(context.Background(), services.RecordSyncRunInput{
		Trigger:       "manual",
		TriggerType:   services.SyncRunTriggerTypeManual,
		Scope:         "single",
		Status:        services.SyncRunStatusSucceeded,
		TargetSkillID: &targetSkillID,
		OwnerUserID:   &ownerID,
		ActorUserID:   &ownerID,
		Candidates:    1,
		Synced:        1,
		StartedAt:     startedAt,
		FinishedAt:    finishedAt,
	})
	if err != nil {
		t.Fatalf("failed to create run: %v", err)
	}
	auditSvc := services.NewAuditService(db)
	if err := auditSvc.Record(context.Background(), services.RecordAuditInput{
		ActorUserID: ownerID,
		Action:      "skill_sync_in_window",
		TargetType:  "skill",
		TargetID:    skillA.ID,
		Summary:     "In-window audit",
	}); err != nil {
		t.Fatalf("failed to record in-window audit: %v", err)
	}
	if err := auditSvc.Record(context.Background(), services.RecordAuditInput{
		ActorUserID: ownerID,
		Action:      "skill_sync_late",
		TargetType:  "skill",
		TargetID:    skillA.ID,
		Summary:     "Late audit",
	}); err != nil {
		t.Fatalf("failed to record late audit: %v", err)
	}

	var logs []models.AuditLog
	if err := db.Order("id ASC").Find(&logs).Error; err != nil {
		t.Fatalf("failed to load audit logs: %v", err)
	}
	if len(logs) < 2 {
		t.Fatalf("expected at least two audit logs, got=%d", len(logs))
	}
	if err := db.Model(&models.AuditLog{}).Where("id = ?", logs[len(logs)-2].ID).Update("created_at", finishedAt.Add(30*time.Second)).Error; err != nil {
		t.Fatalf("failed to update in-window audit time: %v", err)
	}
	if err := db.Model(&models.AuditLog{}).Where("id = ?", logs[len(logs)-1].ID).Update("created_at", finishedAt.Add(5*time.Minute)).Error; err != nil {
		t.Fatalf("failed to update late audit time: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/skills/%d/sync-runs/%d", skillA.ID, run.ID), nil)
	req = withCurrentUser(req, &owner)
	req = withURLParams(req, map[string]string{
		"skillID": strconv.FormatUint(uint64(skillA.ID), 10),
		"runID":   strconv.FormatUint(uint64(run.ID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleAPISkillSyncRunDetail(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}

	payload := decodeBodyMap(t, recorder)
	item, ok := payload["item"].(map[string]any)
	if !ok {
		t.Fatalf("missing item payload: %#v", payload)
	}
	audit, ok := item["audit"].(map[string]any)
	if !ok {
		t.Fatalf("expected audit summary in payload: %#v", item)
	}
	if total, _ := audit["total"].(float64); int(total) != 1 {
		t.Fatalf("expected one in-window audit log, got=%#v", audit)
	}
	if latestAction, _ := audit["latest_action"].(string); latestAction != "skill_sync_in_window" {
		t.Fatalf("unexpected latest audit action: %#v", audit)
	}
}
