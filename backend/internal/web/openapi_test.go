package web

import (
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
		"/api/v1/account/apikeys",
		"/api/v1/account/apikeys/{keyID}/revoke",
		"/api/v1/account/apikeys/{keyID}/rotate",
		"/api/v1/account/apikeys/{keyID}/scopes",
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
		"/api/v1/admin/ingestion/manual",
		"/api/v1/admin/ingestion/upload",
		"/api/v1/admin/ingestion/repository",
		"/api/v1/admin/ingestion/skillmp",
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

func TestBuildOpenAPISpecPublicMarketplaceIncludesConditionalUnauthorizedResponse(t *testing.T) {
	spec := buildOpenAPISpec("http://127.0.0.1:8080")
	paths, ok := spec["paths"].(map[string]any)
	if !ok {
		t.Fatalf("missing paths object")
	}

	marketplacePath, ok := paths["/api/v1/public/marketplace"].(map[string]any)
	if !ok {
		t.Fatalf("missing public marketplace path")
	}
	getOp, ok := marketplacePath["get"].(map[string]any)
	if !ok {
		t.Fatalf("missing public marketplace get operation")
	}
	responses, ok := getOp["responses"].(map[string]any)
	if !ok {
		t.Fatalf("missing public marketplace responses")
	}
	if _, exists := responses["401"]; !exists {
		t.Fatalf("public marketplace responses should include 401 for private marketplace mode")
	}
}

func TestBuildOpenAPISpecAuthLoginIncludesTooManyRequestsResponse(t *testing.T) {
	spec := buildOpenAPISpec("http://127.0.0.1:8080")
	paths, ok := spec["paths"].(map[string]any)
	if !ok {
		t.Fatalf("missing paths object")
	}

	loginPath, ok := paths["/api/v1/auth/login"].(map[string]any)
	if !ok {
		t.Fatalf("missing auth login path")
	}
	postOp, ok := loginPath["post"].(map[string]any)
	if !ok {
		t.Fatalf("missing auth login post operation")
	}
	responses, ok := postOp["responses"].(map[string]any)
	if !ok {
		t.Fatalf("missing auth login responses")
	}
	if _, exists := responses["429"]; !exists {
		t.Fatalf("auth login responses should include 429 for login throttling")
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
