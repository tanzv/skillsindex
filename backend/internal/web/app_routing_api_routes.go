package web

import "github.com/go-chi/chi/v5"

func (a *App) registerPublicAPIRoutes(r chi.Router) {
	a.registerMarketplaceAPIRoutes(r)
	a.registerAPIKeyRoutes(r)
}

func (a *App) registerMarketplaceAPIRoutes(r chi.Router) {
	r.Group(func(publicAPI chi.Router) {
		publicAPI.Use(a.requireMarketplaceAccess)
		publicAPI.Get("/api/v1/public/marketplace", a.handleAPIPublicMarketplace)
		publicAPI.Get("/api/v1/public/skills/compare", a.handleAPIPublicSkillCompare)
		publicAPI.Get("/api/v1/public/skills/{skillID}/resources", a.handleAPIPublicSkillResources)
		publicAPI.Get("/api/v1/public/skills/{skillID}/resource-file", a.handleAPIPublicSkillResourceContent)
		publicAPI.Get("/api/v1/public/skills/{skillID}/versions", a.handleAPIPublicSkillVersions)
		publicAPI.Get("/api/v1/public/skills/{skillID}", a.handleAPIPublicSkillDetail)
	})
}

func (a *App) registerAPIKeyRoutes(r chi.Router) {
	r.Route("/api/v1", func(api chi.Router) {
		api.Use(a.requireAPIKey)
		api.Get("/skills/search", a.handleAPISearch)
		api.Get("/skills/ai-search", a.handleAPIAISearch)
	})
}
