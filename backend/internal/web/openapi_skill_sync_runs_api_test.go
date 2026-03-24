package web

import "testing"

func TestBuildOpenAPISpecProtectedSkillSyncRunListIncludesScopedFilters(t *testing.T) {
	spec := buildOpenAPISpec("http://127.0.0.1:8080")
	paths, ok := spec["paths"].(map[string]any)
	if !ok {
		t.Fatalf("missing paths object")
	}

	pathItem, ok := paths["/api/v1/skills/{skillID}/sync-runs"].(map[string]any)
	if !ok {
		t.Fatalf("missing protected skill sync run list path")
	}
	getOp, ok := pathItem["get"].(map[string]any)
	if !ok {
		t.Fatalf("missing protected skill sync run list get operation")
	}

	params, ok := getOp["parameters"].([]map[string]any)
	if !ok {
		t.Fatalf("missing parameters for protected skill sync run list")
	}
	found := make(map[string]struct{}, len(params))
	for _, param := range params {
		name, _ := param["name"].(string)
		if name != "" {
			found[name] = struct{}{}
		}
	}

	for _, name := range []string{
		"skillID",
		"policy_id",
		"job_id",
		"status",
		"trigger_type",
		"include_errored",
		"limit",
	} {
		if _, exists := found[name]; !exists {
			t.Fatalf("protected skill sync run list should include %s filter, got=%#v", name, params)
		}
	}
	for _, name := range []string{"owner_id", "target_skill_id"} {
		if _, exists := found[name]; exists {
			t.Fatalf("protected skill sync run list should not expose %s filter, got=%#v", name, params)
		}
	}

	responses, ok := getOp["responses"].(map[string]any)
	if !ok {
		t.Fatalf("missing responses for protected skill sync run list")
	}
	if _, exists := responses["400"]; !exists {
		t.Fatalf("protected skill sync run list should include 400 response")
	}
	if _, exists := responses["500"]; !exists {
		t.Fatalf("protected skill sync run list should include 500 response")
	}
}

func TestBuildOpenAPISpecProtectedSkillSyncRunDetailIncludesServerErrorResponse(t *testing.T) {
	spec := buildOpenAPISpec("http://127.0.0.1:8080")
	paths, ok := spec["paths"].(map[string]any)
	if !ok {
		t.Fatalf("missing paths object")
	}

	pathItem, ok := paths["/api/v1/skills/{skillID}/sync-runs/{runID}"].(map[string]any)
	if !ok {
		t.Fatalf("missing protected skill sync run detail path")
	}
	getOp, ok := pathItem["get"].(map[string]any)
	if !ok {
		t.Fatalf("missing protected skill sync run detail get operation")
	}

	responses, ok := getOp["responses"].(map[string]any)
	if !ok {
		t.Fatalf("missing responses for protected skill sync run detail")
	}
	if _, exists := responses["500"]; !exists {
		t.Fatalf("protected skill sync run detail should include 500 response")
	}
}
