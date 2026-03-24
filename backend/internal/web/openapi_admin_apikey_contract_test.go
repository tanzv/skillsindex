package web

import "testing"

func TestBuildOpenAPISpecAdminAPIKeyOperationsIncludeRuntimeErrors(t *testing.T) {
	spec := buildOpenAPISpec("http://127.0.0.1:8080")
	paths, ok := spec["paths"].(map[string]any)
	if !ok {
		t.Fatalf("missing paths object")
	}

	listPath, ok := paths["/api/v1/admin/apikeys"].(map[string]any)
	if !ok {
		t.Fatalf("missing admin apikey list path")
	}
	listGet, ok := listPath["get"].(map[string]any)
	if !ok {
		t.Fatalf("missing admin apikey list get operation")
	}
	assertOpenAPIResponsesContain(t, listGet, "200", "401", "403", "500", "503")

	listPost, ok := listPath["post"].(map[string]any)
	if !ok {
		t.Fatalf("missing admin apikey create post operation")
	}
	assertOpenAPIResponsesContain(t, listPost, "201", "400", "401", "403", "404", "500", "503")

	revokePath, ok := paths["/api/v1/admin/apikeys/{keyID}/revoke"].(map[string]any)
	if !ok {
		t.Fatalf("missing admin apikey revoke path")
	}
	revokePost, ok := revokePath["post"].(map[string]any)
	if !ok {
		t.Fatalf("missing admin apikey revoke post operation")
	}
	assertOpenAPIResponsesContain(t, revokePost, "200", "400", "401", "403", "404", "500", "503")

	rotatePath, ok := paths["/api/v1/admin/apikeys/{keyID}/rotate"].(map[string]any)
	if !ok {
		t.Fatalf("missing admin apikey rotate path")
	}
	rotatePost, ok := rotatePath["post"].(map[string]any)
	if !ok {
		t.Fatalf("missing admin apikey rotate post operation")
	}
	assertOpenAPIResponsesContain(t, rotatePost, "200", "400", "401", "403", "404", "500", "503")
}
