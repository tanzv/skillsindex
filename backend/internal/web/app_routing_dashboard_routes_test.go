package web

import (
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"skillsindex/internal/models"
)

func TestDashboardRouteRegistrationAPIEndpoints(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	router := app.Router()
	currentUser := &models.User{ID: 1, Role: models.RoleSuperAdmin, Username: "route-admin"}

	testCases := []struct {
		name   string
		method string
		path   string
	}{
		{
			name:   "overview api route remains registered",
			method: http.MethodGet,
			path:   "/api/v1/admin/overview",
		},
		{
			name:   "accounts api route remains registered",
			method: http.MethodGet,
			path:   "/api/v1/admin/accounts",
		},
		{
			name:   "organizations api route remains registered",
			method: http.MethodGet,
			path:   "/api/v1/admin/organizations",
		},
		{
			name:   "apikeys api route remains registered",
			method: http.MethodGet,
			path:   "/api/v1/admin/apikeys",
		},
		{
			name:   "ops metrics api route remains registered",
			method: http.MethodGet,
			path:   "/api/v1/admin/ops/metrics",
		},
		{
			name:   "sync jobs api route remains registered",
			method: http.MethodGet,
			path:   "/api/v1/admin/sync-jobs",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(tc.method, tc.path, nil)
			req.Header.Set("Accept", "application/json")
			req = withCurrentUser(req, currentUser)
			recorder := httptest.NewRecorder()

			router.ServeHTTP(recorder, req)

			assertDashboardRouteResolved(t, recorder, tc.path)
		})
	}
}

func TestDashboardRouteRegistrationLegacyFormEndpoints(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	router := app.Router()
	currentUser := &models.User{ID: 1, Role: models.RoleSuperAdmin, Username: "route-admin"}

	testCases := []struct {
		name string
		path string
		form url.Values
	}{
		{
			name: "legacy account create route remains registered",
			path: "/admin/accounts/create",
			form: url.Values{
				"username": {"new-user"},
				"password": {"password-123"},
				"role":     {string(models.RoleMember)},
			},
		},
		{
			name: "legacy repository sync policy route remains registered",
			path: "/admin/sync-policy/repository",
			form: url.Values{
				"enabled":    {"true"},
				"interval":   {"20m"},
				"timeout":    {"5m"},
				"batch_size": {"25"},
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			req := newDashboardPOSTRequest(t, tc.path, tc.form)
			req = withCurrentUser(req, currentUser)
			recorder := httptest.NewRecorder()

			router.ServeHTTP(recorder, req)

			assertDashboardRouteResolved(t, recorder, tc.path)
		})
	}
}

func newDashboardPOSTRequest(t *testing.T, path string, form url.Values) *http.Request {
	t.Helper()

	const csrfToken = "dashboard-route-csrf-token"

	body := url.Values{}
	for key, values := range form {
		for _, value := range values {
			body.Add(key, value)
		}
	}
	body.Set(csrfTokenFormField, csrfToken)

	req := httptest.NewRequest(http.MethodPost, path, strings.NewReader(body.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.AddCookie(&http.Cookie{
		Name:  csrfCookieName,
		Value: csrfToken,
		Path:  "/",
	})
	return req
}

func assertDashboardRouteResolved(t *testing.T, recorder *httptest.ResponseRecorder, path string) {
	t.Helper()

	if recorder.Code == http.StatusNotFound {
		t.Fatalf("expected registered route for %s, got 404 body=%s", path, recorder.Body.String())
	}
	if recorder.Code == http.StatusMethodNotAllowed {
		t.Fatalf("expected registered route method for %s, got 405 body=%s", path, recorder.Body.String())
	}
}
