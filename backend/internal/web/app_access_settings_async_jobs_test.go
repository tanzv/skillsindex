package web

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func TestAPIAdminJobsListFiltersByOwnerForMember(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	ownerID := uint(31)
	otherOwnerID := uint(41)
	now := time.Now().UTC()

	if _, _, err := app.asyncJobSvc.CreateOrGetActive(context.Background(), services.CreateAsyncJobInput{
		JobType:       models.AsyncJobTypeSyncRepository,
		OwnerUserID:   &ownerID,
		MaxAttempts:   3,
		PayloadDigest: "digest-member-owner",
	}, now); err != nil {
		t.Fatalf("failed to create owner async job: %v", err)
	}
	if _, _, err := app.asyncJobSvc.CreateOrGetActive(context.Background(), services.CreateAsyncJobInput{
		JobType:       models.AsyncJobTypeSyncRepository,
		OwnerUserID:   &otherOwnerID,
		MaxAttempts:   3,
		PayloadDigest: "digest-member-other",
	}, now.Add(1*time.Second)); err != nil {
		t.Fatalf("failed to create other async job: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/jobs?limit=50", nil)
	req = withCurrentUser(req, &models.User{ID: ownerID, Role: models.RoleMember})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminJobs(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}

	payload := decodeBodyMap(t, recorder)
	total, ok := payload["total"].(float64)
	if !ok {
		t.Fatalf("missing total field in response: %#v", payload)
	}
	if int(total) != 1 {
		t.Fatalf("expected total=1 for owner filter, got=%v", total)
	}
}

func TestAPIAdminJobDetailPermission(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	ownerID := uint(51)
	now := time.Now().UTC()
	created, _, err := app.asyncJobSvc.CreateOrGetActive(context.Background(), services.CreateAsyncJobInput{
		JobType:       models.AsyncJobTypeSyncRepository,
		OwnerUserID:   &ownerID,
		MaxAttempts:   3,
		PayloadDigest: "digest-job-detail",
	}, now)
	if err != nil {
		t.Fatalf("failed to create async job: %v", err)
	}

	reqForbidden := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/admin/jobs/%d", created.ID), nil)
	reqForbidden = withCurrentUser(reqForbidden, &models.User{ID: 52, Role: models.RoleMember})
	reqForbidden = withURLParam(reqForbidden, "jobID", fmt.Sprintf("%d", created.ID))
	recorderForbidden := httptest.NewRecorder()

	app.handleAPIAdminJobDetail(recorderForbidden, reqForbidden)
	if recorderForbidden.Code != http.StatusForbidden {
		t.Fatalf("unexpected status code: got=%d want=%d", recorderForbidden.Code, http.StatusForbidden)
	}

	reqOwner := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/admin/jobs/%d", created.ID), nil)
	reqOwner = withCurrentUser(reqOwner, &models.User{ID: ownerID, Role: models.RoleMember})
	reqOwner = withURLParam(reqOwner, "jobID", fmt.Sprintf("%d", created.ID))
	recorderOwner := httptest.NewRecorder()

	app.handleAPIAdminJobDetail(recorderOwner, reqOwner)
	if recorderOwner.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorderOwner.Code, http.StatusOK)
	}

	payload := decodeBodyMap(t, recorderOwner)
	item, ok := payload["item"].(map[string]any)
	if !ok {
		t.Fatalf("missing item payload: %#v", payload)
	}
	if got, _ := item["job_type"].(string); got != string(models.AsyncJobTypeSyncRepository) {
		t.Fatalf("unexpected job_type payload: got=%q item=%#v", got, item)
	}
}

func TestAdminJobRetryFormSuccess(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	ownerID := uint(61)
	operatorID := uint(62)
	now := time.Now().UTC()
	created, _, err := app.asyncJobSvc.CreateOrGetActive(context.Background(), services.CreateAsyncJobInput{
		JobType:       models.AsyncJobTypeSyncRepository,
		OwnerUserID:   &ownerID,
		MaxAttempts:   3,
		PayloadDigest: "digest-job-retry",
	}, now)
	if err != nil {
		t.Fatalf("failed to create async job: %v", err)
	}
	if _, err := app.asyncJobSvc.Start(context.Background(), created.ID, now.Add(1*time.Second)); err != nil {
		t.Fatalf("failed to start async job: %v", err)
	}
	if _, err := app.asyncJobSvc.MarkFailed(context.Background(), created.ID, "network_error", "temporary timeout", now.Add(2*time.Second)); err != nil {
		t.Fatalf("failed to fail async job: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, fmt.Sprintf("/admin/jobs/%d/retry", created.ID), nil)
	req = withCurrentUser(req, &models.User{ID: operatorID, Role: models.RoleAdmin})
	req = withURLParam(req, "jobID", fmt.Sprintf("%d", created.ID))
	recorder := httptest.NewRecorder()

	app.handleAdminJobRetry(recorder, req)
	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	if !strings.HasPrefix(recorder.Header().Get("Location"), "/admin/jobs/"+fmt.Sprintf("%d", created.ID)) {
		t.Fatalf("unexpected redirect location: %s", recorder.Header().Get("Location"))
	}

	updated, err := app.asyncJobSvc.GetByID(context.Background(), created.ID)
	if err != nil {
		t.Fatalf("failed to load async job after retry: %v", err)
	}
	if updated.Status != models.AsyncJobStatusPending {
		t.Fatalf("unexpected status after retry: got=%s want=%s", updated.Status, models.AsyncJobStatusPending)
	}
	if updated.Attempt != 2 {
		t.Fatalf("unexpected attempt after retry: got=%d want=2", updated.Attempt)
	}
}

func TestAdminJobCancelFormPermissionDenied(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	ownerID := uint(71)
	now := time.Now().UTC()
	created, _, err := app.asyncJobSvc.CreateOrGetActive(context.Background(), services.CreateAsyncJobInput{
		JobType:       models.AsyncJobTypeSyncRepository,
		OwnerUserID:   &ownerID,
		MaxAttempts:   3,
		PayloadDigest: "digest-job-cancel-denied",
	}, now)
	if err != nil {
		t.Fatalf("failed to create async job: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, fmt.Sprintf("/admin/jobs/%d/cancel", created.ID), nil)
	req = withCurrentUser(req, &models.User{ID: 72, Role: models.RoleMember})
	req = withURLParam(req, "jobID", fmt.Sprintf("%d", created.ID))
	recorder := httptest.NewRecorder()

	app.handleAdminJobCancel(recorder, req)
	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	if !strings.Contains(recorder.Header().Get("Location"), "err=Permission+denied") {
		t.Fatalf("unexpected redirect location: %s", recorder.Header().Get("Location"))
	}
}
