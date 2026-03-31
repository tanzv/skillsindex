package web

import (
	"strings"
	"testing"
)

func TestBuildOpenAPISpecAccountGovernancePermissionText(t *testing.T) {
	paths := buildOpenAPISpecPaths(t)
	getOp := openAPIPathOperation(t, paths, "/api/v1/admin/accounts", "get")

	desc, _ := getOp["description"].(string)
	if !strings.Contains(strings.ToLower(desc), "super admin") {
		t.Fatalf("unexpected accounts permission description: %s", desc)
	}
}

func TestBuildOpenAPISpecAccountGovernanceQueryParams(t *testing.T) {
	paths := buildOpenAPISpecPaths(t)
	getOp := openAPIPathOperation(t, paths, "/api/v1/admin/accounts", "get")
	params, ok := getOp["parameters"].([]map[string]any)
	if !ok {
		t.Fatalf("missing accounts query params")
	}

	found := make(map[string]struct{}, len(params))
	for _, param := range params {
		name, _ := param["name"].(string)
		if name != "" {
			found[name] = struct{}{}
		}
	}
	for _, name := range []string{"q", "role", "status"} {
		if _, exists := found[name]; !exists {
			t.Fatalf("missing accounts query param %s, got=%#v", name, params)
		}
	}

	responses, ok := getOp["responses"].(map[string]any)
	if !ok {
		t.Fatalf("missing accounts get responses")
	}
	if _, exists := responses["400"]; !exists {
		t.Fatalf("accounts get operation should include 400 response")
	}
}

func TestBuildOpenAPISpecAccountGovernanceMetricsSchema(t *testing.T) {
	schemas := buildOpenAPISpecSchemas(t)
	schema, ok := schemas["AdminAccountItem"].(map[string]any)
	if !ok {
		t.Fatalf("missing AdminAccountItem schema")
	}
	properties, ok := schema["properties"].(map[string]any)
	if !ok {
		t.Fatalf("missing AdminAccountItem properties")
	}
	for _, key := range []string{"last_seen_at", "active_session_count"} {
		if _, exists := properties[key]; !exists {
			t.Fatalf("AdminAccountItem should include %s", key)
		}
	}
}
