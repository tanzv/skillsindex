package web

import (
	"errors"
	"net/http"
	"strings"

	"skillsindex/internal/services"
)

func (a *App) handleSkillDetail(w http.ResponseWriter, r *http.Request) {
	skillID, ok := parseSkillID(w, r)
	if !ok {
		return
	}
	viewerID := uint(0)
	if user := currentUserFromContext(r.Context()); user != nil {
		viewerID = user.ID
	}

	skill, err := a.skillService.GetMarketplaceVisibleSkillByID(r.Context(), skillID, viewerID)
	if err != nil {
		if errors.Is(err, services.ErrSkillNotFound) {
			http.NotFound(w, r)
			return
		}
		a.renderWithStatus(w, r, http.StatusInternalServerError, ViewData{Page: "home", Title: "Skill Marketplace", Error: "Failed to load skill"})
		return
	}

	view := ViewData{
		Page:              "detail",
		Title:             skill.Name,
		Skill:             &skill,
		CatalogCategories: a.marketplaceCatalogCategories(r.Context()),
		Message:           strings.TrimSpace(r.URL.Query().Get("msg")),
		Error:             strings.TrimSpace(r.URL.Query().Get("err")),
	}
	if a.interaction != nil {
		stats, statsErr := a.interaction.GetStats(r.Context(), skill.ID)
		if statsErr == nil {
			view.DetailStats = stats
		}
		comments, commentsErr := a.interaction.ListComments(r.Context(), skill.ID, 80)
		if commentsErr == nil {
			view.DetailComments = comments
		}
		if viewerID != 0 {
			favorited, favErr := a.interaction.IsFavorite(r.Context(), skill.ID, viewerID)
			if favErr == nil {
				view.DetailFavorited = favorited
			}
			userRating, rated, ratingErr := a.interaction.GetUserRating(r.Context(), skill.ID, viewerID)
			if ratingErr == nil && rated {
				view.DetailUserRating = userRating
			}
		}
	}
	a.render(w, r, view)
}
