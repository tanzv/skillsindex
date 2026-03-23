package web

import (
	"net/http"
	"strings"

	"skillsindex/internal/catalog"
	"skillsindex/internal/services"

	"github.com/go-chi/chi/v5"
)

func (a *App) handleCompare(w http.ResponseWriter, r *http.Request) {
	view := a.baseScenarioView(r.Context(), "compare", "Skill Comparison Center")
	a.render(w, r, view)
}

func (a *App) handleRollout(w http.ResponseWriter, r *http.Request) {
	view := a.baseScenarioView(r.Context(), "rollout", "Install and Rollout Workflow")
	a.render(w, r, view)
}

func (a *App) handleWorkspace(w http.ResponseWriter, r *http.Request) {
	view := a.baseScenarioView(r.Context(), "workspace", "Team Workspace")
	result, err := a.skillService.SearchPublicSkills(r.Context(), services.PublicSearchInput{
		SortBy: "recent",
		Page:   1,
		Limit:  12,
	})
	if err == nil {
		view.Skills = result.Items
		view.TotalItems = result.Total
	}
	a.render(w, r, view)
}

func (a *App) handleGovernance(w http.ResponseWriter, r *http.Request) {
	view := a.baseScenarioView(r.Context(), "governance", "Governance Center")
	a.render(w, r, view)
}

func (a *App) handleAuthPrototype(w http.ResponseWriter, r *http.Request) {
	view := ViewData{
		Page:              "prototype_auth",
		Title:             "Auth and DingTalk OAuth Prototype",
		CatalogCategories: catalog.Categories(),
	}
	a.render(w, r, view)
}

func (a *App) handleStatePage(w http.ResponseWriter, r *http.Request) {
	state := strings.ToLower(strings.TrimSpace(chi.URLParam(r, "state")))
	view := ViewData{
		CatalogCategories: catalog.Categories(),
	}
	switch state {
	case "loading":
		view.Page = "state_loading"
		view.Title = "State Loading"
		a.render(w, r, view)
	case "empty":
		view.Page = "state_empty"
		view.Title = "State Empty Result"
		a.render(w, r, view)
	case "error":
		view.Page = "state_error"
		view.Title = "State Error and Retry"
		a.renderWithStatus(w, r, http.StatusServiceUnavailable, view)
	case "permission-denied", "permission":
		view.Page = "state_permission"
		view.Title = "State Permission Denied"
		a.renderWithStatus(w, r, http.StatusForbidden, view)
	default:
		http.NotFound(w, r)
	}
}
