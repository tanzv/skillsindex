package web

import (
	"context"
	"net/http"
	"net/http/httptest"
	"slices"
	"testing"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func TestAPIAdminAccountsUnauthorized(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/accounts", nil)
	req.Header.Set("X-Request-ID", "req-admin-accounts-unauthorized")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAccounts(recorder, req)

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
	if payload["request_id"] != "req-admin-accounts-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminAccountsForbidden(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	actor := createAdminAccessAPIUser(t, app, "access-admin", models.RoleAdmin)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/accounts", nil)
	req = withCurrentUser(req, &actor)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAccounts(recorder, req)

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusForbidden)
	}
}

func TestAPIAdminAccountsServiceUnavailable(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	actor := createAdminAccessAPIUser(t, app, "access-service-unavailable-actor", models.RoleSuperAdmin)
	app.authService = nil
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/accounts", nil)
	req = withCurrentUser(req, &actor)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAccounts(recorder, req)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusServiceUnavailable, recorder.Body.String())
	}
}

func TestAPIAdminAccountsSuccess(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	actor := createAdminAccessAPIUser(t, app, "access-actor", models.RoleSuperAdmin)
	targetOne := createAdminAccessAPIUser(t, app, "access-target-one", models.RoleMember)
	targetTwo := createAdminAccessAPIUser(t, app, "access-target-two", models.RoleAdmin)
	now := time.Now().UTC()
	sessionSvc := app.userSessionSvc

	if _, err := sessionSvc.CreateSession(context.Background(), services.CreateUserSessionInput{
		UserID:     targetOne.ID,
		SessionID:  "active-session-1",
		ExpiresAt:  now.Add(24 * time.Hour),
		LastSeenAt: now.Add(-5 * time.Minute),
	}); err != nil {
		t.Fatalf("failed to create first active session: %v", err)
	}
	if _, err := sessionSvc.CreateSession(context.Background(), services.CreateUserSessionInput{
		UserID:     targetOne.ID,
		SessionID:  "active-session-2",
		ExpiresAt:  now.Add(12 * time.Hour),
		LastSeenAt: now.Add(-1 * time.Minute),
	}); err != nil {
		t.Fatalf("failed to create second active session: %v", err)
	}
	if _, err := sessionSvc.CreateSession(context.Background(), services.CreateUserSessionInput{
		UserID:     targetTwo.ID,
		SessionID:  "expired-session",
		ExpiresAt:  now.Add(-1 * time.Hour),
		LastSeenAt: now.Add(-2 * time.Hour),
	}); err != nil {
		t.Fatalf("failed to create expired session: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/accounts", nil)
	req = withCurrentUser(req, &actor)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAccounts(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}
	payload := decodeBodyMap(t, recorder)
	if total, ok := payload["total"].(float64); !ok || int(total) != 3 {
		t.Fatalf("unexpected total: %#v", payload["total"])
	}
	items, ok := payload["items"].([]any)
	if !ok || len(items) != 3 {
		t.Fatalf("unexpected items payload: %#v", payload["items"])
	}

	usernames := make([]string, 0, len(items))
	var targetOneItem map[string]any
	for _, rawItem := range items {
		item, ok := rawItem.(map[string]any)
		if !ok {
			t.Fatalf("unexpected item shape: %#v", rawItem)
		}
		username, _ := item["username"].(string)
		usernames = append(usernames, username)
		if username == targetOne.Username {
			targetOneItem = item
		}
	}

	if !slices.Contains(usernames, actor.Username) {
		t.Fatalf("missing actor username in accounts response: %v", usernames)
	}
	if !slices.Contains(usernames, targetOne.Username) {
		t.Fatalf("missing targetOne username in accounts response: %v", usernames)
	}
	if !slices.Contains(usernames, targetTwo.Username) {
		t.Fatalf("missing targetTwo username in accounts response: %v", usernames)
	}
	if targetOneItem == nil {
		t.Fatalf("missing targetOne item in accounts response: %#v", items)
	}
	if count, ok := targetOneItem["active_session_count"].(float64); !ok || int(count) != 2 {
		t.Fatalf("unexpected active session count: %#v", targetOneItem["active_session_count"])
	}
	if _, ok := targetOneItem["last_seen_at"].(string); !ok {
		t.Fatalf("missing last_seen_at field: %#v", targetOneItem)
	}
}

func TestAPIAdminAccountsFiltersAndMetrics(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	actor := createAdminAccessAPIUser(t, app, "access-filter-actor", models.RoleSuperAdmin)
	targetOne := createAdminAccessAPIUser(t, app, "needle-member", models.RoleMember)
	targetTwo := createAdminAccessAPIUser(t, app, "other-admin", models.RoleAdmin)
	if err := app.authService.SetUserStatus(context.Background(), targetTwo.ID, models.UserStatusDisabled); err != nil {
		t.Fatalf("failed to disable second target: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/accounts?q=needle&role=member&status=active", nil)
	req = withCurrentUser(req, &actor)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAccounts(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}
	payload := decodeBodyMap(t, recorder)
	if total, ok := payload["total"].(float64); !ok || int(total) != 1 {
		t.Fatalf("unexpected filtered total: %#v", payload["total"])
	}
	items, ok := payload["items"].([]any)
	if !ok || len(items) != 1 {
		t.Fatalf("unexpected filtered items payload: %#v", payload["items"])
	}
	item, ok := items[0].(map[string]any)
	if !ok {
		t.Fatalf("unexpected filtered item shape: %#v", items[0])
	}
	if got, _ := item["username"].(string); got != targetOne.Username {
		t.Fatalf("unexpected filtered username: %#v", item["username"])
	}
	if count, ok := item["active_session_count"].(float64); !ok || int(count) != 0 {
		t.Fatalf("unexpected active session count: %#v", item["active_session_count"])
	}
}

func TestAPIAdminAccountsInvalidRole(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	actor := createAdminAccessAPIUser(t, app, "access-invalid-role-actor", models.RoleSuperAdmin)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/accounts?role=unknown", nil)
	req = withCurrentUser(req, &actor)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAccounts(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusBadRequest, recorder.Body.String())
	}
	payload := decodeBodyMap(t, recorder)
	if got, _ := payload["error"].(string); got != "invalid_role" {
		t.Fatalf("unexpected error code: %#v", payload["error"])
	}
}

func TestAPIAdminAccountsInvalidStatus(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	actor := createAdminAccessAPIUser(t, app, "access-invalid-status-actor", models.RoleSuperAdmin)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/accounts?status=locked", nil)
	req = withCurrentUser(req, &actor)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAccounts(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusBadRequest, recorder.Body.String())
	}
	payload := decodeBodyMap(t, recorder)
	if got, _ := payload["error"].(string); got != "invalid_status" {
		t.Fatalf("unexpected error code: %#v", payload["error"])
	}
}
