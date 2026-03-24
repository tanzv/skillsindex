package web

import "testing"

func TestBuildOpenAPISpecAdminSSOOperationsIncludeRuntimeErrors(t *testing.T) {
	spec := buildOpenAPISpec("http://127.0.0.1:8080")
	paths, ok := spec["paths"].(map[string]any)
	if !ok {
		t.Fatalf("missing paths object")
	}

	providersPath, ok := paths["/api/v1/admin/sso/providers"].(map[string]any)
	if !ok {
		t.Fatalf("missing admin sso providers path")
	}
	providersGet, ok := providersPath["get"].(map[string]any)
	if !ok {
		t.Fatalf("missing admin sso providers get operation")
	}
	assertOpenAPIResponsesContain(t, providersGet, "200", "400", "401", "403", "500", "503")

	providersPost, ok := providersPath["post"].(map[string]any)
	if !ok {
		t.Fatalf("missing admin sso providers post operation")
	}
	assertOpenAPIResponsesContain(t, providersPost, "201", "400", "401", "403", "409", "500", "503")

	disablePath, ok := paths["/api/v1/admin/sso/providers/{providerID}/disable"].(map[string]any)
	if !ok {
		t.Fatalf("missing admin sso provider disable path")
	}
	disablePost, ok := disablePath["post"].(map[string]any)
	if !ok {
		t.Fatalf("missing admin sso provider disable post operation")
	}
	assertOpenAPIResponsesContain(t, disablePost, "200", "400", "401", "403", "404", "500", "503")

	syncPath, ok := paths["/api/v1/admin/sso/users/sync"].(map[string]any)
	if !ok {
		t.Fatalf("missing admin sso users sync path")
	}
	syncPost, ok := syncPath["post"].(map[string]any)
	if !ok {
		t.Fatalf("missing admin sso users sync post operation")
	}
	assertOpenAPIResponsesContain(t, syncPost, "200", "400", "401", "403", "404", "500", "503")
}
