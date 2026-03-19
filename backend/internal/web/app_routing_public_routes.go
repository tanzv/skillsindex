package web

import "github.com/go-chi/chi/v5"

func (a *App) registerPublicWebRoutes(r chi.Router) {
	a.registerLocalizedAliasRoutes(r)
	a.registerMarketplacePageRoutes(r)
	a.registerDocumentationRoutes(r)
}

func (a *App) registerLocalizedAliasRoutes(r chi.Router) {
	r.Get("/zh", a.handleLocalizedAlias)
	r.Get("/zh/*", a.handleLocalizedAlias)
	r.Get("/skillsmp", a.handleLocalizedAlias)
	r.Get("/light", a.handleLightAlias)
	r.Get("/light/login", a.showLogin)
	r.Get("/light/register", a.showRegister)
	r.Get("/light/account/password-reset/request", a.showPasswordResetRequest)
	r.Get("/light/account/password-reset/confirm", a.showPasswordResetConfirm)
	r.Get("/light/*", a.handleLightAlias)
}

func (a *App) registerMarketplacePageRoutes(r chi.Router) {
	r.Group(func(publicMarketplace chi.Router) {
		publicMarketplace.Use(a.requireMarketplaceAccess)
		publicMarketplace.Get("/", a.handleHome)
		publicMarketplace.Get("/skills/{skillID}", a.handleSkillDetail)
		publicMarketplace.Get("/compare", a.handleCompare)
		publicMarketplace.Get("/rollout", a.handleRollout)
		publicMarketplace.Get("/workspace", a.handleWorkspace)
		publicMarketplace.Get("/governance", a.handleGovernance)
		publicMarketplace.Get("/categories", a.handleCategories)
		publicMarketplace.Get("/categories/{categorySlug}", a.handleCategoryDetail)
		publicMarketplace.Get("/timeline", a.handleTimeline)
		publicMarketplace.Get("/docs", a.handleDocs)
	})
}

func (a *App) registerDocumentationRoutes(r chi.Router) {
	r.Get("/prototype/auth", a.handleAuthPrototype)
	r.Get("/states/{state}", a.handleStatePage)
	r.Get("/docs/api", a.handleAPIDocs)
	r.Get("/docs/swagger", a.handleSwaggerDocs)
	r.Get("/openapi.json", a.handleOpenAPI)
	r.Get("/docs/openapi.json", a.handleOpenAPI)
	r.Get("/openapi.yaml", a.handleOpenAPIYAML)
	r.Get("/docs/openapi.yaml", a.handleOpenAPIYAML)
	r.Get("/about", a.handleAbout)
}
