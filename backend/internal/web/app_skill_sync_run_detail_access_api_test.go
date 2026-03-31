package web

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"
	"time"

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
