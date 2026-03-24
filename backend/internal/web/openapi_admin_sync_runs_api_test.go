package web

import "testing"

func TestBuildOpenAPISpecAdminSyncRunErrorResponses(t *testing.T) {
	spec := buildOpenAPISpec("http://127.0.0.1:8080")
	paths, ok := spec["paths"].(map[string]any)
	if !ok {
		t.Fatalf("missing paths object")
	}

	for _, pathKey := range []string{
		"/api/v1/admin/sync-jobs",
		"/api/v1/admin/sync-jobs/{runID}",
		"/api/v1/admin/sync-runs",
		"/api/v1/admin/sync-runs/{runID}",
	} {
		pathItem, ok := paths[pathKey].(map[string]any)
		if !ok {
			t.Fatalf("missing path item: %s", pathKey)
		}
		getOp, ok := pathItem["get"].(map[string]any)
		if !ok {
			t.Fatalf("missing get operation: %s", pathKey)
		}
		responses, ok := getOp["responses"].(map[string]any)
		if !ok {
			t.Fatalf("missing responses: %s", pathKey)
		}
		if _, exists := responses["503"]; !exists {
			t.Fatalf("path %s should include 503 response", pathKey)
		}
		if _, exists := responses["500"]; !exists {
			t.Fatalf("path %s should include 500 response", pathKey)
		}
		if pathKey == "/api/v1/admin/sync-jobs" || pathKey == "/api/v1/admin/sync-runs" || pathKey == "/api/v1/admin/sync-jobs/{runID}" || pathKey == "/api/v1/admin/sync-runs/{runID}" {
			if _, exists := responses["400"]; !exists {
				t.Fatalf("path %s should include 400 response", pathKey)
			}
		}
	}
}
