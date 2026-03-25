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

func TestAPIAdminSyncPoliciesCreateReturnsFirstClassItem(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/sync-policies/create",
		strings.NewReader(`{"policy_name":"Repository Hourly","target_scope":"all","source_type":"repository","interval_minutes":60,"timeout_minutes":8,"batch_size":25,"timezone":"UTC","enabled":true,"max_retry":3,"retry_backoff":"5m"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncPoliciesCreate(recorder, req)
	if recorder.Code != http.StatusCreated {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusCreated, recorder.Body.String())
	}

	payload := decodeBodyMap(t, recorder)
	if got, _ := payload["policy_name"].(string); got != "Repository Hourly" {
		t.Fatalf("unexpected policy_name: got=%q payload=%#v", got, payload)
	}
	if got, _ := payload["target_scope"].(string); got != "all" {
		t.Fatalf("unexpected target_scope: got=%q payload=%#v", got, payload)
	}
	if got, _ := payload["source_type"].(string); got != "repository" {
		t.Fatalf("unexpected source_type: got=%q payload=%#v", got, payload)
	}
	if got, ok := payload["interval_minutes"].(float64); !ok || int(got) != 60 {
		t.Fatalf("unexpected interval_minutes: %#v", payload["interval_minutes"])
	}
	if got, ok := payload["timeout_minutes"].(float64); !ok || int(got) != 8 {
		t.Fatalf("unexpected timeout_minutes: %#v", payload["timeout_minutes"])
	}
	if got, ok := payload["batch_size"].(float64); !ok || int(got) != 25 {
		t.Fatalf("unexpected batch_size: %#v", payload["batch_size"])
	}
}

func TestAPIAdminSyncPoliciesUpdateSupportsRepositoryAliasResolution(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	created := createSyncPolicyForTest(t, app, services.CreateSyncPolicyInput{
		PolicyName:      services.RepositorySyncPolicyMirrorName,
		TargetScope:     services.RepositorySyncPolicyMirrorTargetScope,
		SourceType:      models.SyncPolicySourceRepository,
		IntervalMinutes: 60,
		TimeoutMinutes:  8,
		BatchSize:       20,
		Timezone:        "UTC",
		Enabled:         false,
		MaxRetry:        3,
	})

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/sync-policies/repository/update",
		strings.NewReader(`{"enabled":true,"interval_minutes":25,"timeout_minutes":4,"batch_size":31,"retry_backoff":"2m"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	req = withURLParam(req, "policyID", "repository")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncPoliciesUpdate(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}

	payload := decodeBodyMap(t, recorder)
	if got, ok := payload["enabled"].(bool); !ok || !got {
		t.Fatalf("unexpected enabled payload: %#v", payload)
	}
	if got, ok := payload["interval_minutes"].(float64); !ok || int(got) != 25 {
		t.Fatalf("unexpected interval_minutes payload: %#v", payload)
	}
	if got, ok := payload["timeout_minutes"].(float64); !ok || int(got) != 4 {
		t.Fatalf("unexpected timeout_minutes payload: %#v", payload)
	}
	if got, ok := payload["batch_size"].(float64); !ok || int(got) != 31 {
		t.Fatalf("unexpected batch_size payload: %#v", payload)
	}

	loaded, err := app.syncPolicyRecordSvc.GetByID(context.Background(), created.ID, true)
	if err != nil {
		t.Fatalf("failed to load policy after update: %v", err)
	}
	if !loaded.Enabled || loaded.IntervalMinutes != 25 || loaded.TimeoutMinutes != 4 || loaded.BatchSize != 31 || loaded.RetryBackoff != "2m" {
		t.Fatalf("unexpected updated policy: %#v", loaded)
	}

	settingsPolicy, err := app.syncPolicyService.Get(context.Background())
	if err != nil {
		t.Fatalf("failed to load repository settings policy after alias update: %v", err)
	}
	if !settingsPolicy.Enabled || settingsPolicy.Interval != 25*time.Minute || settingsPolicy.Timeout != 4*time.Minute || settingsPolicy.BatchSize != 31 {
		t.Fatalf("unexpected repository settings policy after alias update: %#v", settingsPolicy)
	}
}

func TestAPIAdminSyncPoliciesToggle(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	created := createSyncPolicyForTest(t, app, services.CreateSyncPolicyInput{
		PolicyName:      "SkillMP Daily",
		TargetScope:     "team-a",
		SourceType:      models.SyncPolicySourceSkillMP,
		IntervalMinutes: 1440,
		TimeoutMinutes:  30,
		BatchSize:       40,
		Timezone:        "UTC",
		Enabled:         true,
		MaxRetry:        2,
	})

	req := httptest.NewRequest(http.MethodPost, fmt.Sprintf("/api/v1/admin/sync-policies/%d/toggle", created.ID), nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	req = withURLParam(req, "policyID", fmt.Sprintf("%d", created.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncPoliciesToggle(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}

	payload := decodeBodyMap(t, recorder)
	if got, ok := payload["enabled"].(bool); !ok || got {
		t.Fatalf("unexpected enabled payload after toggle: %#v", payload)
	}
}

func TestAPIAdminSyncPoliciesDeleteSoftDeletesPolicy(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	created := createSyncPolicyForTest(t, app, services.CreateSyncPolicyInput{
		PolicyName:      "SkillMP Daily",
		TargetScope:     "team-b",
		SourceType:      models.SyncPolicySourceSkillMP,
		IntervalMinutes: 120,
		TimeoutMinutes:  10,
		BatchSize:       12,
		Timezone:        "UTC",
		Enabled:         true,
		MaxRetry:        2,
	})

	req := httptest.NewRequest(http.MethodPost, fmt.Sprintf("/api/v1/admin/sync-policies/%d/delete", created.ID), nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	req = withURLParam(req, "policyID", fmt.Sprintf("%d", created.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncPoliciesDelete(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}

	visibleItems, err := app.syncPolicyRecordSvc.List(context.Background(), services.ListSyncPoliciesInput{Limit: 10})
	if err != nil {
		t.Fatalf("failed to list visible sync policies: %v", err)
	}
	if len(visibleItems) != 0 {
		t.Fatalf("expected no visible policies after soft delete, got=%d", len(visibleItems))
	}

	allItems, err := app.syncPolicyRecordSvc.List(context.Background(), services.ListSyncPoliciesInput{
		IncludeDeleted: true,
		Limit:          10,
	})
	if err != nil {
		t.Fatalf("failed to list deleted sync policies: %v", err)
	}
	if len(allItems) != 1 || allItems[0].DeletedAt == nil || allItems[0].Enabled {
		t.Fatalf("unexpected deleted policy state: %#v", allItems)
	}
}

func TestAPIAdminSyncPoliciesRejectsUnknownPolicyID(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/sync-policies/unknown/update", strings.NewReader(`{}`))
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	req = withURLParam(req, "policyID", "unknown")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncPoliciesUpdate(recorder, req)
	if recorder.Code != http.StatusNotFound {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusNotFound, recorder.Body.String())
	}
}
