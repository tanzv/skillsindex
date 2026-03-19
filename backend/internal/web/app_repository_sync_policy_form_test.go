package web

import (
	"context"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
	"time"

	"skillsindex/internal/models"
)

func TestReadRepositorySyncPolicyUpdateInputForm(t *testing.T) {
	form := url.Values{}
	form.Set("enabled", "true")
	form.Set("interval", "20m")
	form.Set("timeout", "6m")
	form.Set("batch_size", "35")
	req := httptest.NewRequest(http.MethodPost, "/admin/sync-policy/repository", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	input, err := readRepositorySyncPolicyUpdateInput(req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if input.Enabled == nil || !*input.Enabled {
		t.Fatalf("expected enabled=true, got=%v", input.Enabled)
	}
	if input.Interval == nil || *input.Interval != 20*time.Minute {
		t.Fatalf("unexpected interval: %v", input.Interval)
	}
	if input.Timeout == nil || *input.Timeout != 6*time.Minute {
		t.Fatalf("unexpected timeout: %v", input.Timeout)
	}
	if input.BatchSize == nil || *input.BatchSize != 35 {
		t.Fatalf("unexpected batch size: %v", input.BatchSize)
	}
}

func TestReadRepositorySyncPolicyUpdateInputFormInvalid(t *testing.T) {
	form := url.Values{}
	form.Set("interval", "bad")
	req := httptest.NewRequest(http.MethodPost, "/admin/sync-policy/repository", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	_, err := readRepositorySyncPolicyUpdateInput(req)
	if err == nil {
		t.Fatalf("expected error for invalid interval")
	}
}

func TestAdminRepositorySyncPolicyUpdateFormPermissionDenied(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	form := url.Values{}
	form.Set("enabled", "true")
	req := httptest.NewRequest(http.MethodPost, "/admin/sync-policy/repository?section=records&subsection=sync-jobs", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req = withCurrentUser(req, &models.User{ID: 10, Role: models.RoleMember})
	recorder := httptest.NewRecorder()

	app.handleAdminRepositorySyncPolicyUpdate(recorder, req)
	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	if !strings.Contains(recorder.Header().Get("Location"), "err=Permission+denied") {
		t.Fatalf("unexpected redirect location: %s", recorder.Header().Get("Location"))
	}
}

func TestAdminRepositorySyncPolicyUpdateFormSuccess(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	form := url.Values{}
	form.Set("enabled", "true")
	form.Set("interval", "12m")
	form.Set("timeout", "2m")
	form.Set("batch_size", "66")
	req := httptest.NewRequest(http.MethodPost, "/admin/sync-policy/repository?section=records&subsection=sync-jobs", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	recorder := httptest.NewRecorder()

	app.handleAdminRepositorySyncPolicyUpdate(recorder, req)
	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}

	updated, err := app.syncPolicyService.Get(context.Background())
	if err != nil {
		t.Fatalf("failed to read updated policy: %v", err)
	}
	if !updated.Enabled || updated.Interval != 12*time.Minute || updated.Timeout != 2*time.Minute || updated.BatchSize != 66 {
		t.Fatalf("unexpected updated policy: %#v", updated)
	}
}
