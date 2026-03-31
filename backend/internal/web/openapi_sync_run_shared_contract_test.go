package web

import "testing"

func TestBuildOpenAPISpecSyncRunItemContainsTargetSkillID(t *testing.T) {
	schemas := buildOpenAPISpecSchemas(t)
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
	if _, exists := properties["version"]; !exists {
		t.Fatalf("SyncJobRunItem should include version summary")
	}
	if _, exists := properties["audit"]; !exists {
		t.Fatalf("SyncJobRunItem should include audit summary")
	}
}

func TestBuildOpenAPISpecAdminSyncRunListIncludesUnifiedFilters(t *testing.T) {
	paths := buildOpenAPISpecPaths(t)
	requiredParams := map[string]struct{}{
		"owner_id":        {},
		"policy_id":       {},
		"job_id":          {},
		"target_skill_id": {},
		"status":          {},
		"trigger_type":    {},
		"include_errored": {},
		"limit":           {},
	}
	for _, pathKey := range []string{"/api/v1/admin/sync-jobs", "/api/v1/admin/sync-runs"} {
		getOp := openAPIPathOperation(t, paths, pathKey, "get")
		params, ok := getOp["parameters"].([]map[string]any)
		if !ok {
			t.Fatalf("missing parameters for path: %s", pathKey)
		}

		found := make(map[string]struct{}, len(params))
		for _, param := range params {
			name, _ := param["name"].(string)
			if name != "" {
				found[name] = struct{}{}
			}
		}
		for name := range requiredParams {
			if _, exists := found[name]; !exists {
				t.Fatalf("path %s missing query param %s", pathKey, name)
			}
		}
	}
}
