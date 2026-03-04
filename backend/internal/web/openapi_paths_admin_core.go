package web

func openAPIPathsAdminCore() map[string]any {
	paths := map[string]any{}
	mergeOpenAPIPathMap(paths, openAPIPathsAdminOps())
	mergeOpenAPIPathMap(paths, openAPIPathsAdminSyncPolicies())
	mergeOpenAPIPathMap(paths, openAPIPathsAdminAccess())
	mergeOpenAPIPathMap(paths, openAPIPathsAdminSSO())
	mergeOpenAPIPathMap(paths, openAPIPathsAdminAPIKeyDetail())
	mergeOpenAPIPathMap(paths, openAPIPathsAdminAPIKeyScopes())
	return paths
}
