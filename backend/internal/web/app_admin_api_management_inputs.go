package web

// apiAdminImportSpecInput defines the request body for importing one OpenAPI draft.
type apiAdminImportSpecInput struct {
	Name       string `json:"name"`
	Slug       string `json:"slug"`
	SourcePath string `json:"source_path"`
}

// apiAdminPublishSpecInput defines the request body for publishing one imported spec.
type apiAdminPublishSpecInput struct {
	SpecID uint `json:"spec_id"`
}
