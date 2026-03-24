package web

import "testing"

func TestBuildOpenAPISpecAdminIngestionOperationsIncludeRuntimeErrors(t *testing.T) {
	spec := buildOpenAPISpec("http://127.0.0.1:8080")
	paths, ok := spec["paths"].(map[string]any)
	if !ok {
		t.Fatalf("missing paths object")
	}

	for _, testCase := range []struct {
		pathKey string
	}{
		{pathKey: "/api/v1/admin/ingestion/manual"},
		{pathKey: "/api/v1/admin/ingestion/upload"},
		{pathKey: "/api/v1/admin/ingestion/repository"},
		{pathKey: "/api/v1/admin/ingestion/skillmp"},
	} {
		pathItem, ok := paths[testCase.pathKey].(map[string]any)
		if !ok {
			t.Fatalf("missing path item: %s", testCase.pathKey)
		}
		postOp, ok := pathItem["post"].(map[string]any)
		if !ok {
			t.Fatalf("missing post operation: %s", testCase.pathKey)
		}
		assertOpenAPIResponsesContain(t, postOp, "201", "400", "401", "409", "500", "503")
	}
}
