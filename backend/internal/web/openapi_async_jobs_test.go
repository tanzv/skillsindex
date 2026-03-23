package web

import "testing"

func TestBuildOpenAPISpecAsyncJobItemIncludesSyncRunID(t *testing.T) {
	spec := buildOpenAPISpec("http://127.0.0.1:8080")
	components, ok := spec["components"].(map[string]any)
	if !ok {
		t.Fatalf("missing components object")
	}
	schemas, ok := components["schemas"].(map[string]any)
	if !ok {
		t.Fatalf("missing schemas object")
	}
	asyncJobItem, ok := schemas["AsyncJobItem"].(map[string]any)
	if !ok {
		t.Fatalf("missing AsyncJobItem schema")
	}
	properties, ok := asyncJobItem["properties"].(map[string]any)
	if !ok {
		t.Fatalf("missing AsyncJobItem properties")
	}
	if _, exists := properties["sync_run_id"]; !exists {
		t.Fatalf("AsyncJobItem should include sync_run_id")
	}
}

func TestBuildOpenAPISpecAdminJobsOperationsIncludeContractDetails(t *testing.T) {
	spec := buildOpenAPISpec("http://127.0.0.1:8080")
	paths, ok := spec["paths"].(map[string]any)
	if !ok {
		t.Fatalf("missing paths object")
	}

	listPath, ok := paths["/api/v1/admin/jobs"].(map[string]any)
	if !ok {
		t.Fatalf("missing admin jobs path")
	}
	listGet, ok := listPath["get"].(map[string]any)
	if !ok {
		t.Fatalf("missing admin jobs get operation")
	}
	listParams, ok := listGet["parameters"].([]map[string]any)
	if !ok {
		t.Fatalf("missing admin jobs parameters")
	}
	requiredParams := map[string]struct{}{
		"owner_id": {},
		"status":   {},
		"job_type": {},
		"limit":    {},
	}
	for _, param := range listParams {
		if name, _ := param["name"].(string); name != "" {
			delete(requiredParams, name)
		}
	}
	if len(requiredParams) != 0 {
		t.Fatalf("admin jobs list missing parameters: %#v", requiredParams)
	}
	assertOpenAPIResponseRef(t, listGet, "200", "AsyncJobsResponse")
	assertOpenAPIResponsesContain(t, listGet, "400", "401", "500", "503")

	for _, pathKey := range []string{
		"/api/v1/admin/jobs/{jobID}",
		"/api/v1/admin/jobs/{jobID}/retry",
		"/api/v1/admin/jobs/{jobID}/cancel",
	} {
		pathItem, ok := paths[pathKey].(map[string]any)
		if !ok {
			t.Fatalf("missing path: %s", pathKey)
		}
		method := "get"
		if pathKey != "/api/v1/admin/jobs/{jobID}" {
			method = "post"
		}
		op, ok := pathItem[method].(map[string]any)
		if !ok {
			t.Fatalf("missing operation %s %s", method, pathKey)
		}
		assertOpenAPIResponseRef(t, op, "200", "AsyncJobDetailResponse")
		assertOpenAPIResponsesContain(t, op, "400", "401", "403", "404", "500", "503")
	}
}

func assertOpenAPIResponseRef(t *testing.T, operation map[string]any, statusCode string, wantSchema string) {
	t.Helper()

	responses, ok := operation["responses"].(map[string]any)
	if !ok {
		t.Fatalf("missing responses: %#v", operation)
	}
	response, ok := responses[statusCode].(map[string]any)
	if !ok {
		t.Fatalf("missing response %s: %#v", statusCode, responses)
	}
	content, ok := response["content"].(map[string]any)
	if !ok {
		t.Fatalf("missing response content for %s: %#v", statusCode, response)
	}
	applicationJSON, ok := content["application/json"].(map[string]any)
	if !ok {
		t.Fatalf("missing application/json content for %s: %#v", statusCode, content)
	}
	schema, ok := applicationJSON["schema"].(map[string]any)
	if !ok {
		t.Fatalf("missing schema for %s: %#v", statusCode, applicationJSON)
	}
	if got, _ := schema["$ref"].(string); got != "#/components/schemas/"+wantSchema {
		t.Fatalf("unexpected schema ref for %s: got=%q want=%q", statusCode, got, "#/components/schemas/"+wantSchema)
	}
}

func assertOpenAPIResponsesContain(t *testing.T, operation map[string]any, statusCodes ...string) {
	t.Helper()

	responses, ok := operation["responses"].(map[string]any)
	if !ok {
		t.Fatalf("missing responses: %#v", operation)
	}
	for _, statusCode := range statusCodes {
		if _, exists := responses[statusCode]; !exists {
			t.Fatalf("missing response %s: %#v", statusCode, responses)
		}
	}
}
