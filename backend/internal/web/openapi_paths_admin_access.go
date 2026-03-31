package web

func openAPIPathsAdminAccess() map[string]any {
	paths := map[string]any{}
	mergeOpenAPIPathMap(paths, openAPIPathsAdminAccessAccounts())
	mergeOpenAPIPathMap(paths, openAPIPathsAdminAccessUserCenter())
	mergeOpenAPIPathMap(paths, openAPIPathsAdminAccessProviderSettings())
	mergeOpenAPIPathMap(paths, openAPIPathsAdminAccessOrganizations())
	return paths
}
