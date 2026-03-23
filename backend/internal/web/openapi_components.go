package web

func openAPIComponents() map[string]any {
	return map[string]any{
		"securitySchemes": openAPISecuritySchemes(),
		"schemas":         openAPISchemas(),
	}
}

func openAPISchemas() map[string]any {
	schemas := map[string]any{}
	mergeOpenAPIPathMap(schemas, openAPISchemasCore())
	mergeOpenAPIPathMap(schemas, openAPISchemasPublicSkillExtensions())
	mergeOpenAPIPathMap(schemas, openAPISchemasAccountAPIKey())
	mergeOpenAPIPathMap(schemas, openAPISchemasAdminAPIKey())
	mergeOpenAPIPathMap(schemas, openAPISchemasAdminIngestion())
	mergeOpenAPIPathMap(schemas, openAPISchemasAdminSSO())
	mergeOpenAPIPathMap(schemas, openAPISchemasAdminMetrics())
	mergeOpenAPIPathMap(schemas, openAPISchemasSyncPolicies())
	mergeOpenAPIPathMap(schemas, openAPISchemasOps())
	mergeOpenAPIPathMap(schemas, openAPISchemasAccessOrgModeration())
	return schemas
}
