package web

import "testing"

func TestBuildOpenAPISpecAdminAPIManagementOperationsIncludeRuntimeErrors(t *testing.T) {
	paths := buildOpenAPISpecPaths(t)

	currentSpecGet := openAPIPathOperation(t, paths, "/api/v1/admin/api-management/specs/current", "get")
	assertOpenAPIResponsesContain(t, currentSpecGet, "200", "401", "403", "404", "500", "503")
	assertOpenAPIResponseRef(t, currentSpecGet, "200", "ObjectResponse")

	importPost := openAPIPathOperation(t, paths, "/api/v1/admin/api-management/specs/import", "post")
	assertOpenAPIResponsesContain(t, importPost, "201", "400", "401", "403", "503")
	assertOpenAPIResponseRef(t, importPost, "201", "ObjectResponse")

	validatePost := openAPIPathOperation(t, paths, "/api/v1/admin/api-management/specs/{specID}/validate", "post")
	assertOpenAPIResponsesContain(t, validatePost, "200", "400", "401", "403", "404", "503")
	assertOpenAPIResponseRef(t, validatePost, "200", "ObjectResponse")

	publishPost := openAPIPathOperation(t, paths, "/api/v1/admin/api-management/specs/{specID}/publish", "post")
	assertOpenAPIResponsesContain(t, publishPost, "200", "400", "401", "403", "404", "503")
	assertOpenAPIResponseRef(t, publishPost, "200", "ObjectResponse")

	exportJSONGet := openAPIPathOperation(t, paths, "/api/v1/admin/api-management/specs/current/export.json", "get")
	assertOpenAPIResponsesContain(t, exportJSONGet, "200", "401", "403", "500", "503")

	exportYAMLGet := openAPIPathOperation(t, paths, "/api/v1/admin/api-management/specs/current/export.yaml", "get")
	assertOpenAPIResponsesContain(t, exportYAMLGet, "200", "401", "403", "500", "503")

	exportsGet := openAPIPathOperation(t, paths, "/api/v1/admin/api-management/exports", "get")
	assertOpenAPIResponsesContain(t, exportsGet, "200", "400", "401", "403", "503")
	assertOpenAPIResponseRef(t, exportsGet, "200", "ObjectResponse")

	exportsPost := openAPIPathOperation(t, paths, "/api/v1/admin/api-management/exports", "post")
	assertOpenAPIResponsesContain(t, exportsPost, "201", "400", "401", "403", "503")
	assertOpenAPIResponseRef(t, exportsPost, "201", "ObjectResponse")

	operationsGet := openAPIPathOperation(t, paths, "/api/v1/admin/api-management/operations", "get")
	assertOpenAPIResponsesContain(t, operationsGet, "200", "400", "401", "403", "503")
	assertOpenAPIResponseRef(t, operationsGet, "200", "ObjectResponse")

	policyGet := openAPIPathOperation(t, paths, "/api/v1/admin/api-management/operations/{operationID}/policy", "get")
	assertOpenAPIResponsesContain(t, policyGet, "200", "400", "401", "403", "404", "503")
	assertOpenAPIResponseRef(t, policyGet, "200", "ObjectResponse")
	assertOpenAPIParameterType(t, policyGet, "operationID", "path", "string")

	policyPost := openAPIPathOperation(t, paths, "/api/v1/admin/api-management/operations/{operationID}/policy", "post")
	assertOpenAPIResponsesContain(t, policyPost, "200", "400", "401", "403", "404", "503")
	assertOpenAPIResponseRef(t, policyPost, "200", "ObjectResponse")
	assertOpenAPIParameterType(t, policyPost, "operationID", "path", "string")

	mockProfilesGet := openAPIPathOperation(t, paths, "/api/v1/admin/api-management/mock/profiles", "get")
	assertOpenAPIResponsesContain(t, mockProfilesGet, "200", "400", "401", "403", "503")
	assertOpenAPIResponseRef(t, mockProfilesGet, "200", "ObjectResponse")

	mockProfilesPost := openAPIPathOperation(t, paths, "/api/v1/admin/api-management/mock/profiles", "post")
	assertOpenAPIResponsesContain(t, mockProfilesPost, "200", "400", "401", "403", "503")
	assertOpenAPIResponseRef(t, mockProfilesPost, "200", "ObjectResponse")

	mockOverridesGet := openAPIPathOperation(t, paths, "/api/v1/admin/api-management/mock/profiles/{profileID}/overrides", "get")
	assertOpenAPIResponsesContain(t, mockOverridesGet, "200", "400", "401", "403", "404", "503")
	assertOpenAPIResponseRef(t, mockOverridesGet, "200", "ObjectResponse")
	assertOpenAPIParameterType(t, mockOverridesGet, "profileID", "path", "integer")

	mockOverridePost := openAPIPathOperation(t, paths, "/api/v1/admin/api-management/mock/profiles/{profileID}/overrides/{operationID}", "post")
	assertOpenAPIResponsesContain(t, mockOverridePost, "200", "400", "401", "403", "404", "503")
	assertOpenAPIResponseRef(t, mockOverridePost, "200", "ObjectResponse")
	assertOpenAPIParameterType(t, mockOverridePost, "profileID", "path", "integer")
	assertOpenAPIParameterType(t, mockOverridePost, "operationID", "path", "string")

	mockResolvePost := openAPIPathOperation(t, paths, "/api/v1/admin/api-management/mock/resolve", "post")
	assertOpenAPIResponsesContain(t, mockResolvePost, "200", "400", "401", "403", "404", "503")
	assertOpenAPIResponseRef(t, mockResolvePost, "200", "ObjectResponse")
}

func assertOpenAPIParameterType(t *testing.T, operation map[string]any, name string, in string, wantType string) {
	t.Helper()

	parameters, ok := operation["parameters"].([]map[string]any)
	if !ok {
		t.Fatalf("missing parameters: %#v", operation)
	}
	for _, parameter := range parameters {
		parameterName, _ := parameter["name"].(string)
		parameterIn, _ := parameter["in"].(string)
		if parameterName != name || parameterIn != in {
			continue
		}
		schema, ok := parameter["schema"].(map[string]any)
		if !ok {
			t.Fatalf("missing schema for parameter %s: %#v", name, parameter)
		}
		gotType, _ := schema["type"].(string)
		if gotType != wantType {
			t.Fatalf("unexpected schema type for parameter %s: got=%q want=%q", name, gotType, wantType)
		}
		return
	}

	t.Fatalf("missing %s parameter %s: %#v", in, name, operation["parameters"])
}
