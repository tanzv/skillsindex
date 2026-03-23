package web

import (
	"net/http"

	"skillsindex/internal/catalog"
)

func (a *App) handleDocs(w http.ResponseWriter, r *http.Request) {
	a.render(w, r, ViewData{Page: "docs", Title: "Documentation", CatalogCategories: catalog.Categories()})
}

func (a *App) handleAPIDocs(w http.ResponseWriter, r *http.Request) {
	a.render(w, r, ViewData{
		Page:              "api_docs",
		Title:             "API Documentation",
		DocsDefaultAPIKey: a.firstAPIKey(),
		CatalogCategories: catalog.Categories(),
	})
}

func (a *App) handleSwaggerDocs(w http.ResponseWriter, r *http.Request) {
	a.render(w, r, ViewData{
		Page:              "swagger",
		Title:             "API Explorer",
		DocsDefaultAPIKey: a.firstAPIKey(),
		CatalogCategories: catalog.Categories(),
	})
}

func (a *App) handleOpenAPI(w http.ResponseWriter, r *http.Request) {
	spec := buildOpenAPISpec(resolveServerURL(r))
	writeJSON(w, http.StatusOK, spec)
}

func (a *App) handleOpenAPIYAML(w http.ResponseWriter, r *http.Request) {
	spec := buildOpenAPISpec(resolveServerURL(r))
	raw, err := marshalOpenAPIYAML(spec)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "openapi_yaml_failed", "message": "Failed to generate OpenAPI YAML"})
		return
	}
	w.Header().Set("Content-Type", "application/yaml; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(raw)
}
