package web

import "testing"

func buildOpenAPISpecPaths(t *testing.T) map[string]any {
	t.Helper()

	spec := buildOpenAPISpec("http://127.0.0.1:8080")
	paths, ok := spec["paths"].(map[string]any)
	if !ok {
		t.Fatalf("missing paths object")
	}
	return paths
}

func buildOpenAPISpecSchemas(t *testing.T) map[string]any {
	t.Helper()

	spec := buildOpenAPISpec("http://127.0.0.1:8080")
	components, ok := spec["components"].(map[string]any)
	if !ok {
		t.Fatalf("missing components object")
	}
	schemas, ok := components["schemas"].(map[string]any)
	if !ok {
		t.Fatalf("missing schemas object")
	}
	return schemas
}

func openAPIPathOperation(t *testing.T, paths map[string]any, pathKey string, method string) map[string]any {
	t.Helper()

	pathItem, ok := paths[pathKey].(map[string]any)
	if !ok {
		t.Fatalf("missing path: %s", pathKey)
	}
	operation, ok := pathItem[method].(map[string]any)
	if !ok {
		t.Fatalf("missing %s operation for path: %s", method, pathKey)
	}
	return operation
}
