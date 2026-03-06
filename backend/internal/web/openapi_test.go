package web

import (
	"html/template"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestBuildOpenAPISpecContainsCorePaths(t *testing.T) {
	spec := buildOpenAPISpec("http://127.0.0.1:8080")

	if got, ok := spec["openapi"].(string); !ok || got == "" {
		t.Fatalf("missing openapi version")
	}

	paths, ok := spec["paths"].(map[string]any)
	if !ok {
		t.Fatalf("missing paths object")
	}

	requiredPaths := []string{
		"/api/v1/public/marketplace",
		"/api/v1/public/skills/{skillID}",
		"/api/v1/skills/search",
		"/api/v1/skills/ai-search",
		"/api/v1/auth/login",
		"/api/v1/auth/providers",
		"/api/v1/auth/csrf",
		"/api/v1/auth/me",
		"/api/v1/auth/logout",
		"/api/v1/account/profile",
		"/api/v1/account/password-reset/request",
		"/api/v1/account/password-reset/confirm",
		"/api/v1/account/security/password",
		"/api/v1/account/sessions",
		"/api/v1/account/sessions/{sessionID}/revoke",
		"/api/v1/account/sessions/revoke-others",
		"/api/v1/dingtalk/me",
		"/auth/sso/start/{provider}",
		"/auth/sso/callback/{provider}",
		"/api/v1/admin/overview",
		"/api/v1/admin/skills",
		"/api/v1/admin/integrations",
		"/api/v1/admin/jobs",
		"/api/v1/admin/jobs/{jobID}",
		"/api/v1/admin/jobs/{jobID}/retry",
		"/api/v1/admin/jobs/{jobID}/cancel",
		"/api/v1/admin/sync-jobs",
		"/api/v1/admin/sync-jobs/{runID}",
		"/api/v1/admin/sync-runs",
		"/api/v1/admin/sync-runs/{runID}",
		"/api/v1/admin/sync-policy/repository",
		"/api/v1/admin/sync-policies",
		"/api/v1/admin/sync-policies/create",
		"/api/v1/admin/sync-policies/{policyID}/update",
		"/api/v1/admin/sync-policies/{policyID}/toggle",
		"/api/v1/admin/sync-policies/{policyID}/delete",
		"/api/v1/admin/ops/metrics",
		"/api/v1/admin/ops/alerts",
		"/api/v1/admin/ops/audit-export",
		"/api/v1/admin/ops/release-gates",
		"/api/v1/admin/ops/release-gates/run",
		"/api/v1/admin/ops/recovery-drills",
		"/api/v1/admin/ops/recovery-drills/run",
		"/api/v1/admin/ops/releases",
		"/api/v1/admin/ops/change-approvals",
		"/api/v1/admin/ops/backup/plans",
		"/api/v1/admin/ops/backup/runs",
		"/api/v1/admin/apikeys",
		"/api/v1/admin/apikeys/{keyID}",
		"/api/v1/admin/apikeys/{keyID}/revoke",
		"/api/v1/admin/apikeys/{keyID}/rotate",
		"/api/v1/admin/apikeys/{keyID}/scopes",
		"/api/v1/admin/sso/providers",
		"/api/v1/admin/sso/providers/{providerID}/disable",
		"/api/v1/admin/sso/users/sync",
		"/api/v1/admin/settings/registration",
		"/api/v1/admin/settings/auth-providers",
		"/api/v1/admin/accounts",
		"/api/v1/admin/user-center/accounts",
		"/api/v1/admin/user-center/sync",
		"/api/v1/admin/user-center/permissions/{userID}",
		"/api/v1/admin/users/{userID}/role",
		"/api/v1/admin/accounts/{userID}/status",
		"/api/v1/admin/accounts/{userID}/force-signout",
		"/api/v1/admin/accounts/{userID}/password-reset",
		"/api/v1/admin/organizations",
		"/api/v1/admin/organizations/{orgID}/members",
		"/api/v1/admin/organizations/{orgID}/members/{userID}/role",
		"/api/v1/admin/organizations/{orgID}/members/{userID}/remove",
		"/api/v1/admin/moderation",
		"/api/v1/admin/moderation/{caseID}/resolve",
		"/api/v1/admin/moderation/{caseID}/reject",
		"/api/v1/skills/{skillID}/report",
		"/api/v1/skills/{skillID}/comments/{commentID}/report",
		"/api/v1/skills/{skillID}/favorite",
		"/api/v1/skills/{skillID}/rating",
		"/api/v1/skills/{skillID}/comments",
		"/api/v1/skills/{skillID}/comments/{commentID}/delete",
		"/api/v1/skills/{skillID}/sync-runs",
		"/api/v1/skills/{skillID}/sync-runs/{runID}",
		"/api/v1/skills/{skillID}/organization-bind",
		"/api/v1/skills/{skillID}/organization-unbind",
		"/api/v1/skills/{skillID}/versions/{versionID}/rollback",
		"/api/v1/skills/{skillID}/versions/{versionID}/restore",
		"/skills/{skillID}/versions",
		"/skills/{skillID}/versions/{versionID}",
		"/skills/{skillID}/versions/compare",
		"/skills/{skillID}/versions/{versionID}/rollback",
		"/skills/{skillID}/favorite",
		"/skills/{skillID}/rating",
		"/skills/{skillID}/comments",
		"/skills/{skillID}/comments/{commentID}/delete",
		"/skills/{skillID}/organization-bind",
		"/skills/{skillID}/organization-unbind",
		"/admin/apikeys/create",
		"/admin/apikeys/{keyID}/revoke",
		"/admin/apikeys/{keyID}/rotate",
		"/admin/users/{userID}/role",
		"/admin/sso/providers/create",
		"/admin/sso/providers/{providerID}/disable",
		"/admin/sso/users/sync",
	}
	for _, path := range requiredPaths {
		if _, exists := paths[path]; !exists {
			t.Fatalf("missing required path in openapi spec: %s", path)
		}
	}
}

func TestBuildOpenAPISpecInteractionSecurity(t *testing.T) {
	spec := buildOpenAPISpec("http://127.0.0.1:8080")
	paths, ok := spec["paths"].(map[string]any)
	if !ok {
		t.Fatalf("missing paths object")
	}

	favoritePath, ok := paths["/skills/{skillID}/favorite"].(map[string]any)
	if !ok {
		t.Fatalf("missing favorite path")
	}
	post, ok := favoritePath["post"].(map[string]any)
	if !ok {
		t.Fatalf("missing favorite post operation")
	}
	security, ok := post["security"].([]map[string]any)
	if !ok || len(security) == 0 {
		t.Fatalf("missing session security for favorite endpoint")
	}
}

func TestBuildOpenAPISpecSyncRunItemContainsTargetSkillID(t *testing.T) {
	spec := buildOpenAPISpec("http://127.0.0.1:8080")
	components, ok := spec["components"].(map[string]any)
	if !ok {
		t.Fatalf("missing components object")
	}
	schemas, ok := components["schemas"].(map[string]any)
	if !ok {
		t.Fatalf("missing schemas object")
	}
	syncJobRunItem, ok := schemas["SyncJobRunItem"].(map[string]any)
	if !ok {
		t.Fatalf("missing SyncJobRunItem schema")
	}
	properties, ok := syncJobRunItem["properties"].(map[string]any)
	if !ok {
		t.Fatalf("missing SyncJobRunItem properties")
	}
	if _, exists := properties["target_skill_id"]; !exists {
		t.Fatalf("SyncJobRunItem should include target_skill_id")
	}
}

func TestBuildOpenAPISpecPublicSearchIncludesScopeDeniedResponse(t *testing.T) {
	spec := buildOpenAPISpec("http://127.0.0.1:8080")
	paths, ok := spec["paths"].(map[string]any)
	if !ok {
		t.Fatalf("missing paths object")
	}

	searchPath, ok := paths["/api/v1/skills/search"].(map[string]any)
	if !ok {
		t.Fatalf("missing search path")
	}
	getOp, ok := searchPath["get"].(map[string]any)
	if !ok {
		t.Fatalf("missing search get operation")
	}
	responses, ok := getOp["responses"].(map[string]any)
	if !ok {
		t.Fatalf("missing search responses")
	}
	if _, exists := responses["403"]; !exists {
		t.Fatalf("search responses should include 403 for scope denied")
	}
}

func TestBuildOpenAPISpecVersionCompareQueryParams(t *testing.T) {
	spec := buildOpenAPISpec("http://127.0.0.1:8080")
	paths, ok := spec["paths"].(map[string]any)
	if !ok {
		t.Fatalf("missing paths object")
	}

	comparePath, ok := paths["/skills/{skillID}/versions/compare"].(map[string]any)
	if !ok {
		t.Fatalf("missing version compare path")
	}
	getOp, ok := comparePath["get"].(map[string]any)
	if !ok {
		t.Fatalf("missing compare get operation")
	}
	params, ok := getOp["parameters"].([]map[string]any)
	if !ok {
		t.Fatalf("missing compare query parameters")
	}

	var hasFrom bool
	var hasTo bool
	for _, item := range params {
		name, _ := item["name"].(string)
		switch name {
		case "from":
			hasFrom = true
		case "to":
			hasTo = true
		}
	}
	if !hasFrom || !hasTo {
		t.Fatalf("compare params must include from and to, got=%#v", params)
	}
}

func TestBuildOpenAPISpecVersionListArchivedQueryParam(t *testing.T) {
	spec := buildOpenAPISpec("http://127.0.0.1:8080")
	paths, ok := spec["paths"].(map[string]any)
	if !ok {
		t.Fatalf("missing paths object")
	}

	historyPath, ok := paths["/skills/{skillID}/versions"].(map[string]any)
	if !ok {
		t.Fatalf("missing version history path")
	}
	getOp, ok := historyPath["get"].(map[string]any)
	if !ok {
		t.Fatalf("missing version history get operation")
	}
	params, ok := getOp["parameters"].([]map[string]any)
	if !ok {
		t.Fatalf("missing version history parameters")
	}

	var hasIncludeArchived bool
	for _, item := range params {
		name, _ := item["name"].(string)
		if name == "include_archived" {
			hasIncludeArchived = true
			break
		}
	}
	if !hasIncludeArchived {
		t.Fatalf("version history params must include include_archived, got=%#v", params)
	}
}

func TestBuildOpenAPISpecAccountGovernancePermissionText(t *testing.T) {
	spec := buildOpenAPISpec("http://127.0.0.1:8080")
	paths, ok := spec["paths"].(map[string]any)
	if !ok {
		t.Fatalf("missing paths object")
	}

	accountsPath, ok := paths["/api/v1/admin/accounts"].(map[string]any)
	if !ok {
		t.Fatalf("missing accounts path")
	}
	getOp, ok := accountsPath["get"].(map[string]any)
	if !ok {
		t.Fatalf("missing accounts get operation")
	}
	desc, _ := getOp["description"].(string)
	if !strings.Contains(strings.ToLower(desc), "super admin") {
		t.Fatalf("unexpected accounts permission description: %s", desc)
	}
}

func TestResolveServerURL(t *testing.T) {
	req := httptest.NewRequest("GET", "http://example.com/openapi.json", nil)
	req.Host = "api.example.com"
	req.Header.Set("X-Forwarded-Proto", "https")

	got := resolveServerURL(req)
	if got != "https://api.example.com" {
		t.Fatalf("unexpected server url: got=%s", got)
	}
}

func TestMarshalOpenAPIYAML(t *testing.T) {
	spec := buildOpenAPISpec("http://127.0.0.1:8080")
	raw, err := marshalOpenAPIYAML(spec)
	if err != nil {
		t.Fatalf("marshal openapi yaml failed: %v", err)
	}
	body := string(raw)
	if !strings.Contains(body, "openapi: 3.0.3") {
		t.Fatalf("yaml should contain openapi version, got=%s", body)
	}
	if !strings.Contains(body, "/api/v1/skills/search:") {
		t.Fatalf("yaml should contain search path")
	}
}

func TestHandleOpenAPIYAML(t *testing.T) {
	app := &App{}
	req := httptest.NewRequest(http.MethodGet, "http://example.com/openapi.yaml", nil)
	req.Host = "api.example.com"
	req.Header.Set("X-Forwarded-Proto", "https")
	recorder := httptest.NewRecorder()

	app.handleOpenAPIYAML(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	if contentType := recorder.Header().Get("Content-Type"); !strings.Contains(contentType, "yaml") {
		t.Fatalf("unexpected content type: %s", contentType)
	}
	body := recorder.Body.String()
	if !strings.Contains(body, "openapi: 3.0.3") {
		t.Fatalf("yaml response missing openapi version")
	}
	if !strings.Contains(body, "url: https://api.example.com") {
		t.Fatalf("yaml response missing resolved server url")
	}
}

func TestHandleSwaggerDocs(t *testing.T) {
	app := &App{
		templates: template.Must(template.New("layout").Parse(`{{define "layout"}}{{.Page}}|{{.Title}}{{end}}`)),
	}
	req := httptest.NewRequest(http.MethodGet, "http://example.com/docs/swagger", nil)
	recorder := httptest.NewRecorder()

	app.handleSwaggerDocs(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	if body := recorder.Body.String(); body != "swagger|API Explorer" {
		t.Fatalf("unexpected rendered body: %s", body)
	}
}
