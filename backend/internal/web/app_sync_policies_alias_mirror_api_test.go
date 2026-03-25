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

func TestAPIAdminSyncPoliciesCreateRepositoryMirrorSyncsRepositorySettings(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/sync-policies/create",
		strings.NewReader(`{"policy_name":"Repository Sync Default Policy","target_scope":"system:repository-default","source_type":"repository","interval_minutes":35,"timeout_minutes":9,"batch_size":27,"timezone":"UTC","enabled":true,"max_retry":3}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncPoliciesCreate(recorder, req)
	if recorder.Code != http.StatusCreated {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusCreated, recorder.Body.String())
	}

	loaded, err := app.syncPolicyService.Get(context.Background())
	if err != nil {
		t.Fatalf("failed to load repository settings policy: %v", err)
	}
	if !loaded.Enabled || loaded.Interval != 35*time.Minute || loaded.Timeout != 9*time.Minute || loaded.BatchSize != 27 {
		t.Fatalf("unexpected repository settings policy after mirror create: %#v", loaded)
	}
}

func TestAPIAdminSyncPoliciesToggleRepositoryMirrorSyncsRepositorySettings(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	created := createSyncPolicyForTest(t, app, services.CreateSyncPolicyInput{
		PolicyName:      services.RepositorySyncPolicyMirrorName,
		TargetScope:     services.RepositorySyncPolicyMirrorTargetScope,
		SourceType:      models.SyncPolicySourceRepository,
		IntervalMinutes: 30,
		TimeoutMinutes:  10,
		BatchSize:       22,
		Timezone:        "UTC",
		Enabled:         true,
		MaxRetry:        3,
	})

	req := httptest.NewRequest(http.MethodPost, fmt.Sprintf("/api/v1/admin/sync-policies/%d/toggle", created.ID), nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	req = withURLParam(req, "policyID", fmt.Sprintf("%d", created.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncPoliciesToggle(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}

	loaded, err := app.syncPolicyService.Get(context.Background())
	if err != nil {
		t.Fatalf("failed to load repository settings policy after mirror toggle: %v", err)
	}
	if loaded.Enabled {
		t.Fatalf("expected repository settings policy to be disabled after mirror toggle: %#v", loaded)
	}
}

func TestAPIAdminSyncPoliciesDeleteRepositoryMirrorDisablesRepositorySettings(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	created := createSyncPolicyForTest(t, app, services.CreateSyncPolicyInput{
		PolicyName:      services.RepositorySyncPolicyMirrorName,
		TargetScope:     services.RepositorySyncPolicyMirrorTargetScope,
		SourceType:      models.SyncPolicySourceRepository,
		IntervalMinutes: 45,
		TimeoutMinutes:  12,
		BatchSize:       19,
		Timezone:        "UTC",
		Enabled:         true,
		MaxRetry:        3,
	})

	req := httptest.NewRequest(http.MethodPost, fmt.Sprintf("/api/v1/admin/sync-policies/%d/delete", created.ID), nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	req = withURLParam(req, "policyID", fmt.Sprintf("%d", created.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncPoliciesDelete(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}

	loaded, err := app.syncPolicyService.Get(context.Background())
	if err != nil {
		t.Fatalf("failed to load repository settings policy after mirror delete: %v", err)
	}
	if loaded.Enabled {
		t.Fatalf("expected repository settings policy to be disabled after mirror delete: %#v", loaded)
	}
}
