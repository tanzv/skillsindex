package web

import "testing"

func TestBuildOpenAPISpecAdminAccessOperationsIncludeRuntimeErrors(t *testing.T) {
	spec := buildOpenAPISpec("http://127.0.0.1:8080")
	paths, ok := spec["paths"].(map[string]any)
	if !ok {
		t.Fatalf("missing paths object")
	}

	accountsPath, ok := paths["/api/v1/admin/accounts"].(map[string]any)
	if !ok {
		t.Fatalf("missing admin accounts path")
	}
	accountsGet, ok := accountsPath["get"].(map[string]any)
	if !ok {
		t.Fatalf("missing admin accounts get operation")
	}
	assertOpenAPIResponsesContain(t, accountsGet, "200", "400", "401", "403", "500", "503")

	userCenterAccountsPath, ok := paths["/api/v1/admin/user-center/accounts"].(map[string]any)
	if !ok {
		t.Fatalf("missing user center accounts path")
	}
	userCenterAccountsGet, ok := userCenterAccountsPath["get"].(map[string]any)
	if !ok {
		t.Fatalf("missing user center accounts get operation")
	}
	assertOpenAPIResponsesContain(t, userCenterAccountsGet, "200", "401", "403", "500", "503")

	userCenterSyncPath, ok := paths["/api/v1/admin/user-center/sync"].(map[string]any)
	if !ok {
		t.Fatalf("missing user center sync path")
	}
	userCenterSyncPost, ok := userCenterSyncPath["post"].(map[string]any)
	if !ok {
		t.Fatalf("missing user center sync post operation")
	}
	assertOpenAPIResponsesContain(t, userCenterSyncPost, "200", "400", "401", "403", "500", "503")

	permissionsPath, ok := paths["/api/v1/admin/user-center/permissions/{userID}"].(map[string]any)
	if !ok {
		t.Fatalf("missing user center permissions path")
	}
	permissionsGet, ok := permissionsPath["get"].(map[string]any)
	if !ok {
		t.Fatalf("missing user center permissions get operation")
	}
	assertOpenAPIResponsesContain(t, permissionsGet, "200", "400", "401", "403", "404", "500")

	permissionsPost, ok := permissionsPath["post"].(map[string]any)
	if !ok {
		t.Fatalf("missing user center permissions post operation")
	}
	assertOpenAPIResponsesContain(t, permissionsPost, "200", "400", "401", "403", "404", "500")

	authProvidersPath, ok := paths["/api/v1/admin/settings/auth-providers"].(map[string]any)
	if !ok {
		t.Fatalf("missing auth providers settings path")
	}
	authProvidersGet, ok := authProvidersPath["get"].(map[string]any)
	if !ok {
		t.Fatalf("missing auth providers settings get operation")
	}
	assertOpenAPIResponsesContain(t, authProvidersGet, "200", "401", "403", "500", "503")

	authProvidersPost, ok := authProvidersPath["post"].(map[string]any)
	if !ok {
		t.Fatalf("missing auth providers settings post operation")
	}
	assertOpenAPIResponsesContain(t, authProvidersPost, "200", "400", "401", "403", "500", "503")

	authProviderConfigsPath, ok := paths["/api/v1/admin/auth-provider-configs"].(map[string]any)
	if !ok {
		t.Fatalf("missing auth provider configs path")
	}
	authProviderConfigsGet, ok := authProviderConfigsPath["get"].(map[string]any)
	if !ok {
		t.Fatalf("missing auth provider configs get operation")
	}
	assertOpenAPIResponsesContain(t, authProviderConfigsGet, "200", "401", "403", "500", "503")

	authProviderConfigsPost, ok := authProviderConfigsPath["post"].(map[string]any)
	if !ok {
		t.Fatalf("missing auth provider configs post operation")
	}
	assertOpenAPIResponsesContain(t, authProviderConfigsPost, "200", "201", "400", "401", "403", "500", "503")

	authProviderDetailPath, ok := paths["/api/v1/admin/auth-provider-configs/{provider}"].(map[string]any)
	if !ok {
		t.Fatalf("missing auth provider detail path")
	}
	authProviderDetailGet, ok := authProviderDetailPath["get"].(map[string]any)
	if !ok {
		t.Fatalf("missing auth provider detail get operation")
	}
	assertOpenAPIResponsesContain(t, authProviderDetailGet, "200", "401", "403", "404", "500", "503")

	authProviderDisablePath, ok := paths["/api/v1/admin/auth-provider-configs/{provider}/disable"].(map[string]any)
	if !ok {
		t.Fatalf("missing auth provider disable path")
	}
	authProviderDisablePost, ok := authProviderDisablePath["post"].(map[string]any)
	if !ok {
		t.Fatalf("missing auth provider disable post operation")
	}
	assertOpenAPIResponsesContain(t, authProviderDisablePost, "200", "401", "403", "404", "500", "503")

	roleUpdatePath, ok := paths["/api/v1/admin/users/{userID}/role"].(map[string]any)
	if !ok {
		t.Fatalf("missing admin user role path")
	}
	roleUpdatePost, ok := roleUpdatePath["post"].(map[string]any)
	if !ok {
		t.Fatalf("missing admin user role post operation")
	}
	assertOpenAPIResponsesContain(t, roleUpdatePost, "200", "400", "401", "403", "404", "409", "500", "503")

	statusPath, ok := paths["/api/v1/admin/accounts/{userID}/status"].(map[string]any)
	if !ok {
		t.Fatalf("missing admin account status path")
	}
	statusPost, ok := statusPath["post"].(map[string]any)
	if !ok {
		t.Fatalf("missing admin account status post operation")
	}
	assertOpenAPIResponsesContain(t, statusPost, "200", "400", "401", "403", "404", "409", "500", "503")

	forceSignoutPath, ok := paths["/api/v1/admin/accounts/{userID}/force-signout"].(map[string]any)
	if !ok {
		t.Fatalf("missing admin account force signout path")
	}
	forceSignoutPost, ok := forceSignoutPath["post"].(map[string]any)
	if !ok {
		t.Fatalf("missing admin account force signout post operation")
	}
	assertOpenAPIResponsesContain(t, forceSignoutPost, "200", "400", "401", "403", "404", "500", "503")

	passwordResetPath, ok := paths["/api/v1/admin/accounts/{userID}/password-reset"].(map[string]any)
	if !ok {
		t.Fatalf("missing admin account password reset path")
	}
	passwordResetPost, ok := passwordResetPath["post"].(map[string]any)
	if !ok {
		t.Fatalf("missing admin account password reset post operation")
	}
	assertOpenAPIResponsesContain(t, passwordResetPost, "200", "400", "401", "403", "404", "500", "503")
}
