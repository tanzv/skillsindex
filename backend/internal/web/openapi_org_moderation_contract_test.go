package web

import "testing"

func TestBuildOpenAPISpecOrganizationOperationsIncludeRuntimeErrors(t *testing.T) {
	spec := buildOpenAPISpec("http://127.0.0.1:8080")
	paths, ok := spec["paths"].(map[string]any)
	if !ok {
		t.Fatalf("missing paths object")
	}

	orgsPath, ok := paths["/api/v1/admin/organizations"].(map[string]any)
	if !ok {
		t.Fatalf("missing organizations path")
	}
	orgsGet, ok := orgsPath["get"].(map[string]any)
	if !ok {
		t.Fatalf("missing organizations get operation")
	}
	assertOpenAPIResponsesContain(t, orgsGet, "200", "401", "500", "503")

	orgsPost, ok := orgsPath["post"].(map[string]any)
	if !ok {
		t.Fatalf("missing organizations post operation")
	}
	assertOpenAPIResponsesContain(t, orgsPost, "201", "400", "401", "503")

	membersPath, ok := paths["/api/v1/admin/organizations/{orgID}/members"].(map[string]any)
	if !ok {
		t.Fatalf("missing organization members path")
	}
	membersGet, ok := membersPath["get"].(map[string]any)
	if !ok {
		t.Fatalf("missing organization members get operation")
	}
	assertOpenAPIResponsesContain(t, membersGet, "200", "400", "401", "403", "404", "503")

	membersPost, ok := membersPath["post"].(map[string]any)
	if !ok {
		t.Fatalf("missing organization members post operation")
	}
	assertOpenAPIResponsesContain(t, membersPost, "200", "400", "401", "403", "404", "409", "503")

	rolePath, ok := paths["/api/v1/admin/organizations/{orgID}/members/{userID}/role"].(map[string]any)
	if !ok {
		t.Fatalf("missing organization role update path")
	}
	rolePost, ok := rolePath["post"].(map[string]any)
	if !ok {
		t.Fatalf("missing organization role update post operation")
	}
	assertOpenAPIResponsesContain(t, rolePost, "200", "400", "401", "403", "404", "409", "503")

	removePath, ok := paths["/api/v1/admin/organizations/{orgID}/members/{userID}/remove"].(map[string]any)
	if !ok {
		t.Fatalf("missing organization member remove path")
	}
	removePost, ok := removePath["post"].(map[string]any)
	if !ok {
		t.Fatalf("missing organization member remove post operation")
	}
	assertOpenAPIResponsesContain(t, removePost, "200", "400", "401", "403", "404", "409", "503")
}

func TestBuildOpenAPISpecModerationOperationsIncludeRuntimeErrors(t *testing.T) {
	spec := buildOpenAPISpec("http://127.0.0.1:8080")
	paths, ok := spec["paths"].(map[string]any)
	if !ok {
		t.Fatalf("missing paths object")
	}

	moderationPath, ok := paths["/api/v1/admin/moderation"].(map[string]any)
	if !ok {
		t.Fatalf("missing moderation path")
	}
	moderationGet, ok := moderationPath["get"].(map[string]any)
	if !ok {
		t.Fatalf("missing moderation get operation")
	}
	assertOpenAPIResponsesContain(t, moderationGet, "200", "401", "403", "500", "503")

	moderationPost, ok := moderationPath["post"].(map[string]any)
	if !ok {
		t.Fatalf("missing moderation post operation")
	}
	assertOpenAPIResponsesContain(t, moderationPost, "201", "400", "401", "403", "503")

	resolvePath, ok := paths["/api/v1/admin/moderation/{caseID}/resolve"].(map[string]any)
	if !ok {
		t.Fatalf("missing moderation resolve path")
	}
	resolvePost, ok := resolvePath["post"].(map[string]any)
	if !ok {
		t.Fatalf("missing moderation resolve post operation")
	}
	assertOpenAPIResponsesContain(t, resolvePost, "200", "400", "401", "403", "404", "409", "503")

	rejectPath, ok := paths["/api/v1/admin/moderation/{caseID}/reject"].(map[string]any)
	if !ok {
		t.Fatalf("missing moderation reject path")
	}
	rejectPost, ok := rejectPath["post"].(map[string]any)
	if !ok {
		t.Fatalf("missing moderation reject post operation")
	}
	assertOpenAPIResponsesContain(t, rejectPost, "200", "400", "401", "403", "404", "409", "503")
}

func TestBuildOpenAPISpecModerationReportsAndOrgBindingIncludeRuntimeErrors(t *testing.T) {
	spec := buildOpenAPISpec("http://127.0.0.1:8080")
	paths, ok := spec["paths"].(map[string]any)
	if !ok {
		t.Fatalf("missing paths object")
	}

	skillReportPath, ok := paths["/api/v1/skills/{skillID}/report"].(map[string]any)
	if !ok {
		t.Fatalf("missing skill report path")
	}
	skillReportPost, ok := skillReportPath["post"].(map[string]any)
	if !ok {
		t.Fatalf("missing skill report post operation")
	}
	assertOpenAPIResponsesContain(t, skillReportPost, "201", "400", "401", "403", "503")

	commentReportPath, ok := paths["/api/v1/skills/{skillID}/comments/{commentID}/report"].(map[string]any)
	if !ok {
		t.Fatalf("missing comment report path")
	}
	commentReportPost, ok := commentReportPath["post"].(map[string]any)
	if !ok {
		t.Fatalf("missing comment report post operation")
	}
	assertOpenAPIResponsesContain(t, commentReportPost, "201", "400", "401", "403", "503")

	orgBindPath, ok := paths["/api/v1/skills/{skillID}/organization-bind"].(map[string]any)
	if !ok {
		t.Fatalf("missing organization bind path")
	}
	orgBindPost, ok := orgBindPath["post"].(map[string]any)
	if !ok {
		t.Fatalf("missing organization bind post operation")
	}
	assertOpenAPIResponsesContain(t, orgBindPost, "200", "400", "401", "403", "404", "500", "503")

	orgUnbindPath, ok := paths["/api/v1/skills/{skillID}/organization-unbind"].(map[string]any)
	if !ok {
		t.Fatalf("missing organization unbind path")
	}
	orgUnbindPost, ok := orgUnbindPath["post"].(map[string]any)
	if !ok {
		t.Fatalf("missing organization unbind post operation")
	}
	assertOpenAPIResponsesContain(t, orgUnbindPost, "200", "401", "403", "404", "500", "503")
}
