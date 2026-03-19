package web

import (
	"context"
	"net/http"
	"strings"

	"skillsindex/internal/catalog"
)

func (a *App) handleLocalizedAlias(w http.ResponseWriter, r *http.Request) {
	target, locale, ok := localizedAliasTarget(r.URL.Path)
	if !ok {
		http.NotFound(w, r)
		return
	}
	target = setLocaleOnTarget(target, r.URL.Query(), locale)
	http.Redirect(w, r, target, http.StatusTemporaryRedirect)
}

func (a *App) handleLightAlias(w http.ResponseWriter, r *http.Request) {
	target := strings.TrimPrefix(r.URL.Path, "/light")
	if strings.TrimSpace(target) == "" {
		target = "/"
	}
	if !strings.HasPrefix(target, "/") {
		target = "/" + target
	}
	params := r.URL.Query()
	encoded := params.Encode()
	if encoded != "" {
		target += "?" + encoded
	}
	http.Redirect(w, r, target, http.StatusTemporaryRedirect)
}

func (a *App) handleMobileLoginAlias(w http.ResponseWriter, r *http.Request) {
	target := strings.TrimPrefix(r.URL.Path, "/mobile")
	if strings.TrimSpace(target) == "" {
		target = "/login"
	}
	if !strings.HasPrefix(target, "/") {
		target = "/" + target
	}
	params := r.URL.Query()
	encoded := params.Encode()
	if encoded != "" {
		target += "?" + encoded
	}
	http.Redirect(w, r, target, http.StatusTemporaryRedirect)
}

func (a *App) baseScenarioView(ctx context.Context, page string, title string) ViewData {
	totalSkills, _ := a.skillService.CountPublicSkills(ctx)
	categoryCards, _ := a.loadCategoryCards(ctx, "")
	view := ViewData{
		Page:              page,
		Title:             title,
		TotalSkills:       totalSkills,
		Categories:        categoryCards,
		CatalogCategories: catalog.Categories(),
	}
	a.populateHomeHighlights(ctx, &view)
	return view
}
