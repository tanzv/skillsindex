package web

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func TestAPIAdminSyncRunsAliasList(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	ownerID := uint(11)
	_, err := app.syncJobSvc.RecordRun(context.Background(), services.RecordSyncRunInput{
		Trigger:     "manual",
		Scope:       "owned",
		OwnerUserID: &ownerID,
		Candidates:  2,
		Synced:      2,
		Failed:      0,
		StartedAt:   time.Now().UTC().Add(-2 * time.Second),
		FinishedAt:  time.Now().UTC(),
	})
	if err != nil {
		t.Fatalf("failed to create sync run: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/sync-runs?limit=20", nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncRuns(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	total, _ := payload["total"].(float64)
	if total < 1 {
		t.Fatalf("expected at least one sync run in alias list payload: %#v", payload)
	}
}

func TestAPIAdminSyncRunsAliasDetail(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	ownerID := uint(31)
	recorded, err := app.syncJobSvc.RecordRun(context.Background(), services.RecordSyncRunInput{
		Trigger:     "scheduled",
		Scope:       "all",
		OwnerUserID: &ownerID,
		Candidates:  3,
		Synced:      3,
		Failed:      0,
		StartedAt:   time.Now().UTC().Add(-3 * time.Second),
		FinishedAt:  time.Now().UTC(),
	})
	if err != nil {
		t.Fatalf("failed to create sync run: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/admin/sync-runs/%d", recorded.ID), nil)
	req = withCurrentUser(req, &models.User{ID: ownerID, Role: models.RoleMember})
	req = withURLParam(req, "runID", fmt.Sprintf("%d", recorded.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncRunDetail(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	item, ok := payload["item"].(map[string]any)
	if !ok {
		t.Fatalf("missing item payload: %#v", payload)
	}
	gotID, _ := item["ID"].(float64)
	if gotID == 0 {
		gotID, _ = item["id"].(float64)
	}
	if uint(gotID) != recorded.ID {
		t.Fatalf("unexpected sync run id: got=%v want=%d", gotID, recorded.ID)
	}
}
