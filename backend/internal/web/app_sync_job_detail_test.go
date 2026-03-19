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

func TestAPIAdminSyncJobDetailPermission(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	ownerID := uint(11)
	recorded, err := app.syncJobSvc.RecordRun(context.Background(), services.RecordSyncRunInput{
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

	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/admin/sync-jobs/%d", recorded.ID), nil)
	req = withCurrentUser(req, &models.User{ID: 99, Role: models.RoleMember})
	req = withURLParam(req, "runID", fmt.Sprintf("%d", recorded.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncJobDetail(recorder, req)
	if recorder.Code != http.StatusForbidden {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusForbidden)
	}

	reqOwner := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/admin/sync-jobs/%d", recorded.ID), nil)
	reqOwner = withCurrentUser(reqOwner, &models.User{ID: ownerID, Role: models.RoleMember})
	reqOwner = withURLParam(reqOwner, "runID", fmt.Sprintf("%d", recorded.ID))
	recorderOwner := httptest.NewRecorder()

	app.handleAPIAdminSyncJobDetail(recorderOwner, reqOwner)
	if recorderOwner.Code != http.StatusOK {
		t.Fatalf("unexpected owner status code: got=%d want=%d", recorderOwner.Code, http.StatusOK)
	}
}

func TestAPIAdminSyncJobDetailUnauthorized(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/sync-jobs/1", nil)
	req = withURLParam(req, "runID", "1")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncJobDetail(recorder, req)
	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusUnauthorized)
	}
}

func TestAPIAdminSyncJobDetailInvalidRunID(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/sync-jobs/invalid", nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	req = withURLParam(req, "runID", "invalid")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncJobDetail(recorder, req)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
}

func TestAPIAdminSyncJobDetailNotFound(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/sync-jobs/777", nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	req = withURLParam(req, "runID", "777")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncJobDetail(recorder, req)
	if recorder.Code != http.StatusNotFound {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusNotFound)
	}
}

func TestAPIAdminSyncJobDetailActorCanRead(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	ownerID := uint(7)
	actorID := uint(22)
	recorded, err := app.syncJobSvc.RecordRun(context.Background(), services.RecordSyncRunInput{
		Trigger:     "scheduled",
		Scope:       "all",
		OwnerUserID: &ownerID,
		ActorUserID: &actorID,
		Candidates:  3,
		Synced:      3,
		Failed:      0,
		StartedAt:   time.Now().UTC().Add(-3 * time.Second),
		FinishedAt:  time.Now().UTC(),
	})
	if err != nil {
		t.Fatalf("failed to create sync run: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/admin/sync-jobs/%d", recorded.ID), nil)
	req = withCurrentUser(req, &models.User{ID: actorID, Role: models.RoleMember})
	req = withURLParam(req, "runID", fmt.Sprintf("%d", recorded.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncJobDetail(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
}
