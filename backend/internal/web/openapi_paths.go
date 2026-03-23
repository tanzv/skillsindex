package web

func openAPIPaths() map[string]any {
	paths := map[string]any{}
	mergeOpenAPIPathMap(paths, openAPIPathsPublicAuth())
	mergeOpenAPIPathMap(paths, openAPIPathsPublicSkillExtensions())
	mergeOpenAPIPathMap(paths, openAPIPathsAccountAPIKey())
	mergeOpenAPIPathMap(paths, openAPIPathsAdminIngestion())
	mergeOpenAPIPathMap(paths, openAPIPathsAdminCore())
	mergeOpenAPIPathMap(paths, openAPIPathsModerationInteraction())
	mergeOpenAPIPathMap(paths, openAPIPathsWebRoutes())
	return paths
}

func mergeOpenAPIPathMap(dst map[string]any, src map[string]any) {
	for key, value := range src {
		dst[key] = value
	}
}
