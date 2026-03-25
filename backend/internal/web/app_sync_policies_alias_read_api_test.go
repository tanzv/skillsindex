package web

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func TestAPIAdminSyncPoliciesListUsesFirstClassContracts(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	createSyncPolicyForTest(t, app, services.CreateSyncPolicyInput{
		PolicyName:      "Repository Hourly",
		TargetScope:     "all",
		SourceType:      models.SyncPolicySourceRepository,
		IntervalMinutes: 60,
		TimeoutMinutes:  8,
		BatchSize:       25,
		Timezone:        "UTC",
		Enabled:         true,
		MaxRetry:        3,
	})
	createSyncPolicyForTest(t, app, services.CreateSyncPolicyInput{
		PolicyName:      "SkillMP Disabled",
		TargetScope:     "team-a",
		SourceType:      models.SyncPolicySourceSkillMP,
		IntervalMinutes: 15,
		TimeoutMinutes:  5,
		BatchSize:       10,
		Timezone:        "Asia/Shanghai",
		Enabled:         false,
		MaxRetry:        1,
	})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/sync-policies?source_type=repository&enabled_only=true&limit=10", nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncPolicies(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}

	payload := decodeBodyMap(t, recorder)
	total, ok := payload["total"].(float64)
	if !ok || int(total) != 1 {
		t.Fatalf("unexpected total in payload: %#v", payload)
	}
	items, ok := payload["items"].([]any)
	if !ok || len(items) != 1 {
		t.Fatalf("unexpected items in payload: %#v", payload)
	}
	item, ok := items[0].(map[string]any)
	if !ok {
		t.Fatalf("unexpected item payload: %#v", items[0])
	}
	if got, _ := item["policy_name"].(string); got != "Repository Hourly" {
		t.Fatalf("unexpected policy_name: got=%q item=%#v", got, item)
	}
	if got, _ := item["target_scope"].(string); got != "all" {
		t.Fatalf("unexpected target_scope: got=%q item=%#v", got, item)
	}
	if got, _ := item["source_type"].(string); got != string(models.SyncPolicySourceRepository) {
		t.Fatalf("unexpected source_type: got=%q item=%#v", got, item)
	}
	if got, ok := item["interval_minutes"].(float64); !ok || int(got) != 60 {
		t.Fatalf("unexpected interval_minutes: %#v", item["interval_minutes"])
	}
	if got, ok := item["timeout_minutes"].(float64); !ok || int(got) != 8 {
		t.Fatalf("unexpected timeout_minutes: %#v", item["timeout_minutes"])
	}
	if got, ok := item["batch_size"].(float64); !ok || int(got) != 25 {
		t.Fatalf("unexpected batch_size: %#v", item["batch_size"])
	}
}

func TestAPIAdminSyncPoliciesListUnauthorizedUsesStandardErrorEnvelope(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/sync-policies", nil)
	req.Header.Set("X-Request-ID", "req-sync-policies-list-unauthorized")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncPolicies(recorder, req)
	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusUnauthorized, recorder.Body.String())
	}

	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "unauthorized" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Authentication required" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-sync-policies-list-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminSyncPoliciesListInvalidSourceTypeUsesStandardErrorEnvelope(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/sync-policies?source_type=invalid", nil)
	req.Header.Set("X-Request-ID", "req-sync-policies-list-invalid-source-type")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncPolicies(recorder, req)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusBadRequest, recorder.Body.String())
	}

	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_source_type" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Invalid sync policy source type" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-sync-policies-list-invalid-source-type" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminSyncPolicyDetailByID(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	created := createSyncPolicyForTest(t, app, services.CreateSyncPolicyInput{
		PolicyName:      "SkillMP Hourly",
		TargetScope:     "team-c",
		SourceType:      models.SyncPolicySourceSkillMP,
		IntervalMinutes: 60,
		TimeoutMinutes:  7,
		BatchSize:       18,
		Timezone:        "UTC",
		Enabled:         true,
		MaxRetry:        2,
	})

	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/admin/sync-policies/%d", created.ID), nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	req = withURLParam(req, "policyID", fmt.Sprintf("%d", created.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncPolicyDetail(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}

	payload := decodeBodyMap(t, recorder)
	item, ok := payload["item"].(map[string]any)
	if !ok {
		t.Fatalf("missing item payload: %#v", payload)
	}
	if got, _ := item["policy_name"].(string); got != "SkillMP Hourly" {
		t.Fatalf("unexpected policy_name: got=%q item=%#v", got, item)
	}
	if got, ok := item["id"].(float64); !ok || uint(got) != created.ID {
		t.Fatalf("unexpected id: %#v", item["id"])
	}
}

func TestAPIAdminSyncPolicyDetailByRepositoryAlias(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	created := createSyncPolicyForTest(t, app, services.CreateSyncPolicyInput{
		PolicyName:      services.RepositorySyncPolicyMirrorName,
		TargetScope:     services.RepositorySyncPolicyMirrorTargetScope,
		SourceType:      models.SyncPolicySourceRepository,
		IntervalMinutes: 40,
		TimeoutMinutes:  6,
		BatchSize:       24,
		Timezone:        "UTC",
		Enabled:         true,
		MaxRetry:        3,
	})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/sync-policies/repository", nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	req = withURLParam(req, "policyID", "repository")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncPolicyDetail(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}

	payload := decodeBodyMap(t, recorder)
	item, ok := payload["item"].(map[string]any)
	if !ok {
		t.Fatalf("missing item payload: %#v", payload)
	}
	if got, ok := item["id"].(float64); !ok || uint(got) != created.ID {
		t.Fatalf("unexpected mirror id: %#v", item["id"])
	}
	if got, _ := item["target_scope"].(string); got != services.RepositorySyncPolicyMirrorTargetScope {
		t.Fatalf("unexpected target_scope: got=%q item=%#v", got, item)
	}
}
