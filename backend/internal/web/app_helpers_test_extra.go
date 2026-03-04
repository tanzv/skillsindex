package web

import (
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"skillsindex/internal/models"
)

func TestRedirectDashboardWithFiltersUsesSectionPath(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/skills/1/visibility?section=records", nil)
	recorder := httptest.NewRecorder()

	redirectDashboardWithFilters(recorder, req, "Visibility updated", "", "", "")

	resp := recorder.Result()
	if resp.StatusCode != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", resp.StatusCode, http.StatusSeeOther)
	}
	location := resp.Header.Get("Location")
	if location != "/admin/records?msg=Visibility+updated" {
		t.Fatalf("unexpected redirect location: got=%s", location)
	}
}

func TestRedirectDashboardWithNewKeyDoesNotExposePlaintextInURL(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/admin/apikeys?section=apikeys", nil)
	recorder := httptest.NewRecorder()

	redirectDashboardWithNewKey(recorder, req, "API key created", "sk_live_sensitive", "", "")

	resp := recorder.Result()
	location := resp.Header.Get("Location")
	if strings.Contains(location, "new_api_key=") {
		t.Fatalf("redirect location should not expose plaintext api key, got=%s", location)
	}
}

func TestAPIKeyFlashCookieLifecycle(t *testing.T) {
	issueRecorder := httptest.NewRecorder()
	setAPIKeyFlashCookie(issueRecorder, "sk_live_flash_value", false)
	issueResp := issueRecorder.Result()
	setCookies := issueResp.Cookies()
	if len(setCookies) == 0 {
		t.Fatalf("expected set-cookie header for flash key")
	}

	var flashCookie *http.Cookie
	for _, cookie := range setCookies {
		if cookie.Name == apiKeyFlashCookieName {
			flashCookie = cookie
			break
		}
	}
	if flashCookie == nil {
		t.Fatalf("expected flash cookie to be issued")
	}
	if flashCookie.Path != "/admin" {
		t.Fatalf("unexpected flash cookie path: got=%s want=/admin", flashCookie.Path)
	}

	readReq := httptest.NewRequest(http.MethodGet, "/admin/apikeys", nil)
	readReq.AddCookie(flashCookie)
	clearRecorder := httptest.NewRecorder()

	value := consumeAPIKeyFlashCookie(clearRecorder, readReq, false)
	if value != "sk_live_flash_value" {
		t.Fatalf("unexpected flash cookie value: got=%s", value)
	}

	clearResp := clearRecorder.Result()
	cleared := false
	for _, cookie := range clearResp.Cookies() {
		if cookie.Name == apiKeyFlashCookieName && cookie.MaxAge == -1 {
			if cookie.Path != "/admin" {
				t.Fatalf("unexpected cleared cookie path: got=%s want=/admin", cookie.Path)
			}
			cleared = true
			break
		}
	}
	if !cleared {
		t.Fatalf("expected flash cookie to be cleared after read")
	}
}

func TestEnsureCSRFTokenSetsCookie(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/login", nil)
	recorder := httptest.NewRecorder()

	token := ensureCSRFToken(recorder, req, false)
	if token == "" {
		t.Fatalf("expected csrf token to be generated")
	}

	resp := recorder.Result()
	var csrfCookie *http.Cookie
	for _, cookie := range resp.Cookies() {
		if cookie.Name == csrfCookieName {
			csrfCookie = cookie
			break
		}
	}
	if csrfCookie == nil {
		t.Fatalf("expected csrf cookie to be issued")
	}
	if csrfCookie.Value != token {
		t.Fatalf("unexpected csrf cookie value")
	}
	if !csrfCookie.HttpOnly {
		t.Fatalf("expected csrf cookie to be HttpOnly")
	}
	if csrfCookie.Path != "/" {
		t.Fatalf("unexpected csrf cookie path: got=%s want=/", csrfCookie.Path)
	}
}

func TestRequireCSRFRejectsMissingToken(t *testing.T) {
	app := &App{}
	handler := app.requireCSRF(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))

	req := httptest.NewRequest(http.MethodPost, "/login", strings.NewReader("username=u"))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, req)
	if recorder.Code != http.StatusForbidden {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusForbidden)
	}
}

func TestRequireCSRFAcceptsMatchingToken(t *testing.T) {
	app := &App{}
	handler := app.requireCSRF(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))

	req := httptest.NewRequest(http.MethodPost, "/login", strings.NewReader("csrf_token=csrf_demo"))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.AddCookie(&http.Cookie{Name: csrfCookieName, Value: "csrf_demo"})
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, req)
	if recorder.Code != http.StatusNoContent {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusNoContent)
	}
}

func TestRoleTranslationKey(t *testing.T) {
	cases := []struct {
		role models.UserRole
		want string
	}{
		{role: models.RoleViewer, want: "role.viewer"},
		{role: models.RoleMember, want: "role.member"},
		{role: models.RoleAdmin, want: "role.admin"},
		{role: models.RoleSuperAdmin, want: "role.super_admin"},
		{role: models.UserRole("unknown"), want: "role.member"},
	}
	for _, tc := range cases {
		got := roleTranslationKey(tc.role)
		if got != tc.want {
			t.Fatalf("unexpected translation key: got=%s want=%s", got, tc.want)
		}
	}
}

func TestAuditDetailsJSON(t *testing.T) {
	raw := auditDetailsJSON(map[string]string{
		" key ": " value ",
		"":      "ignored",
	})
	want := `{"key":"value"}`
	if raw != want {
		t.Fatalf("unexpected audit details json: got=%s want=%s", raw, want)
	}

	empty := auditDetailsJSON(map[string]string{" ": "x"})
	if empty != "" {
		t.Fatalf("expected empty json for invalid map, got=%s", empty)
	}
}

func TestBuildOAuthUsername(t *testing.T) {
	got := buildOAuthUsername("Ding User 01", "union-123")
	if got != "dinguser01" {
		t.Fatalf("unexpected oauth username: %s", got)
	}
	got = buildOAuthUsername("**", "union-123")
	if got != "dd_union-123" {
		t.Fatalf("unexpected oauth fallback username: %s", got)
	}
}

func TestValidateDingTalkState(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/auth/dingtalk/callback?state=abc", nil)
	req.AddCookie(&http.Cookie{Name: dingTalkStateCookieName, Value: "abc"})
	if !validateDingTalkState(req, "abc") {
		t.Fatalf("expected state validation to pass")
	}
	if validateDingTalkState(req, "wrong") {
		t.Fatalf("expected state validation to fail for mismatched value")
	}
}

func TestResolveLoginPageFromPath(t *testing.T) {
	cases := []struct {
		path string
		want string
	}{
		{path: "/login", want: "login"},
		{path: "/light/login", want: "login_light"},
		{path: "/mobile/login", want: "login_mobile"},
		{path: "/mobile/light/login", want: "login_mobile_light"},
		{path: "/unknown", want: "login"},
	}
	for _, tc := range cases {
		if got := resolveLoginPageFromPath(tc.path); got != tc.want {
			t.Fatalf("unexpected login page for path %s: got=%s want=%s", tc.path, got, tc.want)
		}
	}
}

func TestResolveRegisterAndPasswordResetPageFromPath(t *testing.T) {
	cases := []struct {
		path             string
		wantRegister     string
		wantResetRequest string
		wantResetConfirm string
	}{
		{
			path:             "/register",
			wantRegister:     "register",
			wantResetRequest: "password_reset_request",
			wantResetConfirm: "password_reset_confirm",
		},
		{
			path:             "/light/register",
			wantRegister:     "register_light",
			wantResetRequest: "password_reset_request_light",
			wantResetConfirm: "password_reset_confirm_light",
		},
		{
			path:             "/mobile/register",
			wantRegister:     "register_mobile",
			wantResetRequest: "password_reset_request_mobile",
			wantResetConfirm: "password_reset_confirm_mobile",
		},
		{
			path:             "/mobile/light/register",
			wantRegister:     "register_mobile_light",
			wantResetRequest: "password_reset_request_mobile_light",
			wantResetConfirm: "password_reset_confirm_mobile_light",
		},
	}
	for _, tc := range cases {
		if got := resolveRegisterPageFromPath(tc.path); got != tc.wantRegister {
			t.Fatalf("unexpected register page for path %s: got=%s want=%s", tc.path, got, tc.wantRegister)
		}
		if got := resolvePasswordResetRequestPageFromPath(tc.path); got != tc.wantResetRequest {
			t.Fatalf("unexpected reset request page for path %s: got=%s want=%s", tc.path, got, tc.wantResetRequest)
		}
		if got := resolvePasswordResetConfirmPageFromPath(tc.path); got != tc.wantResetConfirm {
			t.Fatalf("unexpected reset confirm page for path %s: got=%s want=%s", tc.path, got, tc.wantResetConfirm)
		}
	}
}

func TestAuthVariantPathHelpers(t *testing.T) {
	cases := []struct {
		page                 string
		wantLogin            string
		wantRegister         string
		wantResetRequestPath string
		wantResetConfirmPath string
	}{
		{
			page:                 "login",
			wantLogin:            "/login",
			wantRegister:         "/register",
			wantResetRequestPath: "/account/password-reset/request",
			wantResetConfirmPath: "/account/password-reset/confirm",
		},
		{
			page:                 "login_light",
			wantLogin:            "/light/login",
			wantRegister:         "/light/register",
			wantResetRequestPath: "/light/account/password-reset/request",
			wantResetConfirmPath: "/light/account/password-reset/confirm",
		},
		{
			page:                 "register_mobile",
			wantLogin:            "/mobile/login",
			wantRegister:         "/mobile/register",
			wantResetRequestPath: "/mobile/account/password-reset/request",
			wantResetConfirmPath: "/mobile/account/password-reset/confirm",
		},
		{
			page:                 "password_reset_confirm_mobile_light",
			wantLogin:            "/mobile/light/login",
			wantRegister:         "/mobile/light/register",
			wantResetRequestPath: "/mobile/light/account/password-reset/request",
			wantResetConfirmPath: "/mobile/light/account/password-reset/confirm",
		},
	}
	for _, tc := range cases {
		if got := loginPath(tc.page); got != tc.wantLogin {
			t.Fatalf("unexpected login path for page %s: got=%s want=%s", tc.page, got, tc.wantLogin)
		}
		if got := registerPath(tc.page); got != tc.wantRegister {
			t.Fatalf("unexpected register path for page %s: got=%s want=%s", tc.page, got, tc.wantRegister)
		}
		if got := passwordResetRequestPath(tc.page); got != tc.wantResetRequestPath {
			t.Fatalf("unexpected reset request path for page %s: got=%s want=%s", tc.page, got, tc.wantResetRequestPath)
		}
		if got := passwordResetConfirmPath(tc.page); got != tc.wantResetConfirmPath {
			t.Fatalf("unexpected reset confirm path for page %s: got=%s want=%s", tc.page, got, tc.wantResetConfirmPath)
		}
	}
}

func assertQueryValue(t *testing.T, values url.Values, key string, want string) {
	t.Helper()
	got := values.Get(key)
	if got != want {
		t.Fatalf("unexpected query value for %s: got=%s want=%s", key, got, want)
	}
}
