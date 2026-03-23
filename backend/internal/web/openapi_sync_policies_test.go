package web

import "testing"

func TestBuildOpenAPISpecSyncPoliciesContracts(t *testing.T) {
	spec := buildOpenAPISpec("http://127.0.0.1:8080")
	components, ok := spec["components"].(map[string]any)
	if !ok {
		t.Fatalf("missing components object")
	}
	schemas, ok := components["schemas"].(map[string]any)
	if !ok {
		t.Fatalf("missing schemas object")
	}
	syncPolicyItem, ok := schemas["SyncPolicyItem"].(map[string]any)
	if !ok {
		t.Fatalf("missing SyncPolicyItem schema")
	}
	properties, ok := syncPolicyItem["properties"].(map[string]any)
	if !ok {
		t.Fatalf("missing SyncPolicyItem properties")
	}
	for _, name := range []string{
		"id",
		"policy_id",
		"policy_name",
		"target_scope",
		"source_type",
		"interval_minutes",
		"timeout_minutes",
		"batch_size",
		"timezone",
		"enabled",
		"max_retry",
		"created_at",
		"updated_at",
	} {
		if _, exists := properties[name]; !exists {
			t.Fatalf("SyncPolicyItem should include %s", name)
		}
	}

	paths, ok := spec["paths"].(map[string]any)
	if !ok {
		t.Fatalf("missing paths object")
	}
	listPath, ok := paths["/api/v1/admin/sync-policies"].(map[string]any)
	if !ok {
		t.Fatalf("missing sync policies path")
	}
	listGet, ok := listPath["get"].(map[string]any)
	if !ok {
		t.Fatalf("missing sync policies get operation")
	}
	params, ok := listGet["parameters"].([]map[string]any)
	if !ok {
		t.Fatalf("missing sync policies query params")
	}
	requiredParams := map[string]struct{}{
		"source_type":     {},
		"enabled_only":    {},
		"include_deleted": {},
		"limit":           {},
	}
	for _, param := range params {
		if name, _ := param["name"].(string); name != "" {
			delete(requiredParams, name)
		}
	}
	if len(requiredParams) != 0 {
		t.Fatalf("missing sync policy query params: %#v", requiredParams)
	}
	assertOpenAPIResponseRef(t, listGet, "200", "SyncPoliciesResponse")
	assertOpenAPIResponsesContain(t, listGet, "400", "401", "403", "500", "503")

	detailPath, ok := paths["/api/v1/admin/sync-policies/{policyID}"].(map[string]any)
	if !ok {
		t.Fatalf("missing sync policy detail path")
	}
	detailGet, ok := detailPath["get"].(map[string]any)
	if !ok {
		t.Fatalf("missing sync policy detail get operation")
	}
	assertOpenAPIResponseRef(t, detailGet, "200", "SyncPolicyDetailResponse")
	assertOpenAPIResponsesContain(t, detailGet, "400", "401", "403", "404", "500", "503")
}
