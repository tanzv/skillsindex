package web

import "testing"

func TestBuildOpenAPISpecInteractionSecurity(t *testing.T) {
	paths := buildOpenAPISpecPaths(t)
	post := openAPIPathOperation(t, paths, "/skills/{skillID}/favorite", "post")

	security, ok := post["security"].([]map[string]any)
	if !ok || len(security) == 0 {
		t.Fatalf("missing session security for favorite endpoint")
	}
}

func TestBuildOpenAPISpecAISearchPaginationContract(t *testing.T) {
	paths := buildOpenAPISpecPaths(t)
	getOp := openAPIPathOperation(t, paths, "/api/v1/skills/ai-search", "get")
	params, ok := getOp["parameters"].([]map[string]any)
	if !ok {
		t.Fatalf("missing ai search parameters")
	}

	found := make(map[string]struct{}, len(params))
	for _, param := range params {
		name, _ := param["name"].(string)
		if name != "" {
			found[name] = struct{}{}
		}
	}
	for _, name := range []string{"q", "page", "limit", "api_key"} {
		if _, exists := found[name]; !exists {
			t.Fatalf("missing ai search query param %s", name)
		}
	}

	schemas := buildOpenAPISpecSchemas(t)
	schema, ok := schemas["AISearchSkillsResponse"].(map[string]any)
	if !ok {
		t.Fatalf("missing AI search response schema")
	}
	properties, ok := schema["properties"].(map[string]any)
	if !ok {
		t.Fatalf("missing AI search response properties")
	}
	for _, key := range []string{"items", "page", "limit", "total"} {
		if _, exists := properties[key]; !exists {
			t.Fatalf("AI search response schema should include %s", key)
		}
	}
}

func TestBuildOpenAPISpecPublicSearchIncludesScopeDeniedResponse(t *testing.T) {
	paths := buildOpenAPISpecPaths(t)
	getOp := openAPIPathOperation(t, paths, "/api/v1/skills/search", "get")

	responses, ok := getOp["responses"].(map[string]any)
	if !ok {
		t.Fatalf("missing search responses")
	}
	if _, exists := responses["403"]; !exists {
		t.Fatalf("search responses should include 403 for scope denied")
	}
}

func TestBuildOpenAPISpecPublicMarketplaceIncludesConditionalUnauthorizedResponse(t *testing.T) {
	paths := buildOpenAPISpecPaths(t)
	getOp := openAPIPathOperation(t, paths, "/api/v1/public/marketplace", "get")

	responses, ok := getOp["responses"].(map[string]any)
	if !ok {
		t.Fatalf("missing public marketplace responses")
	}
	if _, exists := responses["401"]; !exists {
		t.Fatalf("public marketplace responses should include 401 for private marketplace mode")
	}
}

func TestBuildOpenAPISpecPublicMarketplaceIncludesGroupedQueryFilters(t *testing.T) {
	paths := buildOpenAPISpecPaths(t)
	getOp := openAPIPathOperation(t, paths, "/api/v1/public/marketplace", "get")
	params, ok := getOp["parameters"].([]map[string]any)
	if !ok {
		t.Fatalf("missing public marketplace parameters")
	}

	var hasCategoryGroup bool
	var hasSubcategoryGroup bool
	var hasPageSize bool
	for _, item := range params {
		name, _ := item["name"].(string)
		switch name {
		case "category_group":
			hasCategoryGroup = true
		case "subcategory_group":
			hasSubcategoryGroup = true
		case "page_size":
			hasPageSize = true
		}
	}

	if !hasCategoryGroup || !hasSubcategoryGroup || !hasPageSize {
		t.Fatalf("public marketplace parameters should include grouped taxonomy filters: %+v", params)
	}
}

func TestBuildOpenAPISpecAuthLoginIncludesTooManyRequestsResponse(t *testing.T) {
	paths := buildOpenAPISpecPaths(t)
	postOp := openAPIPathOperation(t, paths, "/api/v1/auth/login", "post")

	responses, ok := postOp["responses"].(map[string]any)
	if !ok {
		t.Fatalf("missing auth login responses")
	}
	if _, exists := responses["429"]; !exists {
		t.Fatalf("auth login responses should include 429 for login throttling")
	}
}
