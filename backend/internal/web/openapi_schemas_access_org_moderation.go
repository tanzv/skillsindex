package web

func openAPISchemasAccessOrgModeration() map[string]any {
	schemas := map[string]any{}
	mergeOpenAPIPathMap(schemas, openAPISchemasAccessCore())
	mergeOpenAPIPathMap(schemas, openAPISchemasAccessProviderSettings())
	mergeOpenAPIPathMap(schemas, openAPISchemasOrganizations())
	mergeOpenAPIPathMap(schemas, openAPISchemasModeration())
	mergeOpenAPIPathMap(schemas, openAPISchemasGenericObjects())
	return schemas
}
