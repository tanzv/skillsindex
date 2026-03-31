package web

import "testing"

func TestBuildOpenAPISpecVersionCompareQueryParams(t *testing.T) {
	paths := buildOpenAPISpecPaths(t)
	getOp := openAPIPathOperation(t, paths, "/skills/{skillID}/versions/compare", "get")
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
	paths := buildOpenAPISpecPaths(t)
	getOp := openAPIPathOperation(t, paths, "/skills/{skillID}/versions", "get")
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
