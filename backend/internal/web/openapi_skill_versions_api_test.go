package web

import "testing"

func TestBuildOpenAPISpecProtectedSkillVersionPaths(t *testing.T) {
	spec := buildOpenAPISpec("http://127.0.0.1:8080")
	paths, ok := spec["paths"].(map[string]any)
	if !ok {
		t.Fatalf("missing paths object")
	}

	for _, path := range []string{
		"/api/v1/skills/{skillID}/versions",
		"/api/v1/skills/{skillID}/versions/{versionID}",
	} {
		if _, exists := paths[path]; !exists {
			t.Fatalf("missing protected skill version path: %s", path)
		}
	}
}

func TestBuildOpenAPISpecProtectedSkillVersionSchemas(t *testing.T) {
	spec := buildOpenAPISpec("http://127.0.0.1:8080")
	components, ok := spec["components"].(map[string]any)
	if !ok {
		t.Fatalf("missing components object")
	}
	schemas, ok := components["schemas"].(map[string]any)
	if !ok {
		t.Fatalf("missing schemas object")
	}

	versionItem, ok := schemas["SkillVersionItem"].(map[string]any)
	if !ok {
		t.Fatalf("missing SkillVersionItem schema")
	}
	properties, ok := versionItem["properties"].(map[string]any)
	if !ok {
		t.Fatalf("missing SkillVersionItem properties")
	}
	for _, key := range []string{"run_id", "actor_user_id", "changed_fields", "run"} {
		if _, exists := properties[key]; !exists {
			t.Fatalf("SkillVersionItem should include %s", key)
		}
	}
	if _, ok := schemas["SkillVersionsResponse"].(map[string]any); !ok {
		t.Fatalf("missing SkillVersionsResponse schema")
	}
	if _, ok := schemas["SkillVersionDetailResponse"].(map[string]any); !ok {
		t.Fatalf("missing SkillVersionDetailResponse schema")
	}
}

func TestBuildOpenAPISpecProtectedSkillVersionListQueryParams(t *testing.T) {
	spec := buildOpenAPISpec("http://127.0.0.1:8080")
	paths, ok := spec["paths"].(map[string]any)
	if !ok {
		t.Fatalf("missing paths object")
	}

	pathItem, ok := paths["/api/v1/skills/{skillID}/versions"].(map[string]any)
	if !ok {
		t.Fatalf("missing protected skill version list path")
	}
	getOp, ok := pathItem["get"].(map[string]any)
	if !ok {
		t.Fatalf("missing protected skill version list get operation")
	}
	params, ok := getOp["parameters"].([]map[string]any)
	if !ok {
		t.Fatalf("missing protected skill version list parameters")
	}

	found := make(map[string]struct{}, len(params))
	for _, param := range params {
		name, _ := param["name"].(string)
		if name != "" {
			found[name] = struct{}{}
		}
	}
	for _, name := range []string{"skillID", "trigger", "from_time", "to_time", "include_archived", "limit"} {
		if _, exists := found[name]; !exists {
			t.Fatalf("protected skill version list should include %s param, got=%#v", name, params)
		}
	}

	responses, ok := getOp["responses"].(map[string]any)
	if !ok {
		t.Fatalf("missing protected skill version list responses")
	}
	if _, exists := responses["400"]; !exists {
		t.Fatalf("protected skill version list should include 400 response")
	}
}

func TestBuildOpenAPISpecProtectedSkillVersionDetailIncludesBadRequest(t *testing.T) {
	spec := buildOpenAPISpec("http://127.0.0.1:8080")
	paths, ok := spec["paths"].(map[string]any)
	if !ok {
		t.Fatalf("missing paths object")
	}

	pathItem, ok := paths["/api/v1/skills/{skillID}/versions/{versionID}"].(map[string]any)
	if !ok {
		t.Fatalf("missing protected skill version detail path")
	}
	getOp, ok := pathItem["get"].(map[string]any)
	if !ok {
		t.Fatalf("missing protected skill version detail get operation")
	}
	responses, ok := getOp["responses"].(map[string]any)
	if !ok {
		t.Fatalf("missing protected skill version detail responses")
	}
	if _, exists := responses["400"]; !exists {
		t.Fatalf("protected skill version detail should include 400 response")
	}
}

func TestBuildOpenAPISpecProtectedSkillVersionMutationsIncludeServiceUnavailable(t *testing.T) {
	spec := buildOpenAPISpec("http://127.0.0.1:8080")
	paths, ok := spec["paths"].(map[string]any)
	if !ok {
		t.Fatalf("missing paths object")
	}

	for _, pathKey := range []string{
		"/api/v1/skills/{skillID}/versions/{versionID}/rollback",
		"/api/v1/skills/{skillID}/versions/{versionID}/restore",
	} {
		pathItem, ok := paths[pathKey].(map[string]any)
		if !ok {
			t.Fatalf("missing path item: %s", pathKey)
		}
		postOp, ok := pathItem["post"].(map[string]any)
		if !ok {
			t.Fatalf("missing post operation: %s", pathKey)
		}
		responses, ok := postOp["responses"].(map[string]any)
		if !ok {
			t.Fatalf("missing responses: %s", pathKey)
		}
		if _, exists := responses["503"]; !exists {
			t.Fatalf("path %s should include 503 response", pathKey)
		}
	}
}
