package web

import (
	"context"
	"errors"
	"math"
	"net/http"
	"strings"

	"skillsindex/internal/catalog"
	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"github.com/go-chi/chi/v5"
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

func (a *App) handleHome(w http.ResponseWriter, r *http.Request) {
	query := strings.TrimSpace(r.URL.Query().Get("q"))
	tagFilter := strings.TrimSpace(r.URL.Query().Get("tags"))
	category := strings.TrimSpace(r.URL.Query().Get("category"))
	subcategory := strings.TrimSpace(r.URL.Query().Get("subcategory"))
	sortBy := defaultString(strings.TrimSpace(r.URL.Query().Get("sort")), "recent")
	mode := defaultString(strings.TrimSpace(r.URL.Query().Get("mode")), "keyword")
	page := parsePositiveInt(r.URL.Query().Get("page"), 1)
	pageSize := 24

	totalSkills, _ := a.skillService.CountPublicSkills(r.Context())
	categoryCards, _ := a.loadCategoryCards(r.Context(), "")

	view := ViewData{
		Page:              "home",
		Title:             "Skill Marketplace",
		Query:             query,
		TagFilter:         tagFilter,
		CategoryFilter:    category,
		SubcategoryFilter: subcategory,
		SortBy:            sortBy,
		SearchMode:        mode,
		PageNumber:        page,
		PageSize:          pageSize,
		Message:           strings.TrimSpace(r.URL.Query().Get("msg")),
		Error:             strings.TrimSpace(r.URL.Query().Get("err")),
		TotalSkills:       totalSkills,
		Categories:        categoryCards,
		CatalogCategories: catalog.Categories(),
	}
	a.populateHomeHighlights(r.Context(), &view)

	if mode == "ai" && query != "" {
		items, err := a.skillService.AISemanticSearchPublicSkills(r.Context(), query, 48)
		if err != nil {
			view.Error = "Failed to run AI search"
			a.renderWithStatus(w, r, http.StatusInternalServerError, view)
			return
		}
		items = filterSkillsByCategory(items, category, subcategory)
		view.Skills = items
		view.TotalItems = int64(len(items))
		view.PageNumber = 1
		view.PageSize = len(items)
		a.render(w, r, view)
		return
	}

	result, err := a.skillService.SearchPublicSkills(r.Context(), services.PublicSearchInput{
		Query:           query,
		Tags:            services.ParseTagInput(tagFilter),
		CategorySlug:    category,
		SubcategorySlug: subcategory,
		SortBy:          sortBy,
		Page:            page,
		Limit:           pageSize,
	})
	if err != nil {
		view.Error = "Failed to query marketplace skills"
		a.renderWithStatus(w, r, http.StatusInternalServerError, view)
		return
	}

	view.Skills = result.Items
	view.TotalItems = result.Total
	baseValues := baseMarketplaceQueryValues(query, tagFilter, sortBy, mode, category, subcategory)
	totalPages := int(math.Ceil(float64(result.Total) / float64(maxInt(result.Limit, 1))))
	if totalPages < 1 {
		totalPages = 1
	}
	if result.Page > 1 {
		view.PrevPageURL = buildMarketplacePageLink("/", baseValues, result.Page-1)
	}
	if result.Page < totalPages {
		view.NextPageURL = buildMarketplacePageLink("/", baseValues, result.Page+1)
	}
	a.render(w, r, view)
}

func (a *App) handleCategories(w http.ResponseWriter, r *http.Request) {
	cards, err := a.loadCategoryCards(r.Context(), "")
	if err != nil {
		a.renderWithStatus(w, r, http.StatusInternalServerError, ViewData{Page: "categories", Title: "Categories", Error: "Failed to load categories"})
		return
	}
	a.render(w, r, ViewData{
		Page:              "categories",
		Title:             "Category Index",
		Categories:        cards,
		CatalogCategories: catalog.Categories(),
	})
}

func (a *App) handleCategoryDetail(w http.ResponseWriter, r *http.Request) {
	categorySlug := strings.TrimSpace(chi.URLParam(r, "categorySlug"))
	categoryDef, ok := catalog.FindCategory(categorySlug)
	if !ok {
		http.NotFound(w, r)
		return
	}

	subcategory := strings.TrimSpace(r.URL.Query().Get("subcategory"))
	query := strings.TrimSpace(r.URL.Query().Get("q"))
	tagFilter := strings.TrimSpace(r.URL.Query().Get("tags"))
	sortBy := defaultString(strings.TrimSpace(r.URL.Query().Get("sort")), "recent")
	page := parsePositiveInt(r.URL.Query().Get("page"), 1)
	pageSize := 24

	result, err := a.skillService.SearchPublicSkills(r.Context(), services.PublicSearchInput{
		Query:           query,
		Tags:            services.ParseTagInput(tagFilter),
		CategorySlug:    categorySlug,
		SubcategorySlug: subcategory,
		SortBy:          sortBy,
		Page:            page,
		Limit:           pageSize,
	})
	if err != nil {
		a.renderWithStatus(w, r, http.StatusInternalServerError, ViewData{Page: "category", Title: categoryDef.Name, Error: "Failed to query category skills"})
		return
	}

	cards, _ := a.loadCategoryCards(r.Context(), categorySlug)
	selected := findCategoryCard(cards, categorySlug)
	a.render(w, r, ViewData{
		Page:                "category",
		Title:               categoryDef.Name,
		Skills:              result.Items,
		TotalItems:          result.Total,
		PageNumber:          result.Page,
		PageSize:            result.Limit,
		Query:               query,
		TagFilter:           tagFilter,
		SortBy:              sortBy,
		SelectedCategory:    selected,
		SelectedSubcategory: subcategory,
		Categories:          cards,
		CatalogCategories:   catalog.Categories(),
	})
}

func (a *App) handleTimeline(w http.ResponseWriter, r *http.Request) {
	interval := normalizeTimelineInterval(r.URL.Query().Get("interval"))
	points, err := a.skillService.BuildTimeline(r.Context(), interval)
	if err != nil {
		a.renderWithStatus(w, r, http.StatusInternalServerError, ViewData{Page: "timeline", Title: "Skills Timeline", Error: "Failed to build timeline"})
		return
	}

	viewPoints := make([]TimelineViewPoint, 0, len(points))
	for _, point := range points {
		viewPoints = append(viewPoints, TimelineViewPoint{
			Bucket:     point.BucketDate.Format("2006-01-02"),
			Count:      point.Count,
			Cumulative: point.Cumulative,
		})
	}

	a.render(w, r, ViewData{
		Page:              "timeline",
		Title:             "Skills Timeline",
		TimelineInterval:  interval,
		TimelineDayURL:    "/timeline?interval=day",
		TimelineWeekURL:   "/timeline?interval=week",
		TimelineMonthURL:  "/timeline?interval=month",
		TimelinePoints:    viewPoints,
		TimelineSVGPoints: buildTimelineSVGPoints(points, 780, 220),
		CatalogCategories: catalog.Categories(),
	})
}

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

func (a *App) handleAbout(w http.ResponseWriter, r *http.Request) {
	a.render(w, r, ViewData{Page: "about", Title: "About", CatalogCategories: catalog.Categories()})
}

func (a *App) handleAPIPublicMarketplace(w http.ResponseWriter, r *http.Request) {
	if a.skillService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{
			"error":   "service_unavailable",
			"message": "Skill service unavailable",
		})
		return
	}

	query := strings.TrimSpace(r.URL.Query().Get("q"))
	tagFilter := strings.TrimSpace(r.URL.Query().Get("tags"))
	category := strings.TrimSpace(r.URL.Query().Get("category"))
	subcategory := strings.TrimSpace(r.URL.Query().Get("subcategory"))
	sortBy := normalizeMarketplaceSort(r.URL.Query().Get("sort"))
	mode := normalizeMarketplaceMode(r.URL.Query().Get("mode"))
	page := parsePositiveInt(r.URL.Query().Get("page"), 1)
	pageSize := 24

	totalSkills, err := a.skillService.CountPublicSkills(r.Context())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{
			"error":   "summary_query_failed",
			"message": "Failed to count public skills",
		})
		return
	}

	categoryCards, err := a.loadCategoryCards(r.Context(), "")
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{
			"error":   "category_query_failed",
			"message": "Failed to load category cards",
		})
		return
	}

	topTags := []TagCard{}
	if highlight, err := a.skillService.SearchPublicSkills(r.Context(), services.PublicSearchInput{
		SortBy: "stars",
		Page:   1,
		Limit:  120,
	}); err == nil {
		topTags = buildTopTags(highlight.Items, 12)
	}

	var (
		items           []models.Skill
		totalItems      int64
		currentPage     = page
		currentPageSize = pageSize
	)

	if mode == "ai" && query != "" {
		semanticItems, err := a.skillService.AISemanticSearchPublicSkills(r.Context(), query, 48)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]any{
				"error":   "ai_search_failed",
				"message": "Failed to run AI search",
			})
			return
		}
		semanticItems = filterSkillsByCategory(semanticItems, category, subcategory)
		items = semanticItems
		totalItems = int64(len(semanticItems))
		currentPage = 1
		currentPageSize = maxInt(len(semanticItems), 1)
	} else {
		result, err := a.skillService.SearchPublicSkills(r.Context(), services.PublicSearchInput{
			Query:           query,
			Tags:            services.ParseTagInput(tagFilter),
			CategorySlug:    category,
			SubcategorySlug: subcategory,
			SortBy:          sortBy,
			Page:            page,
			Limit:           pageSize,
		})
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]any{
				"error":   "search_failed",
				"message": "Failed to query marketplace skills",
			})
			return
		}
		items = result.Items
		totalItems = result.Total
		currentPage = result.Page
		currentPageSize = maxInt(result.Limit, 1)
	}

	totalPages := int(math.Ceil(float64(totalItems) / float64(maxInt(currentPageSize, 1))))
	if totalPages < 1 {
		totalPages = 1
	}
	prevPage := 0
	nextPage := 0
	if currentPage > 1 {
		prevPage = currentPage - 1
	}
	if currentPage < totalPages {
		nextPage = currentPage + 1
	}

	var (
		sessionUser        *apiAuthUserResponse
		canAccessDashboard bool
	)
	if current := currentUserFromContext(r.Context()); current != nil {
		user := *current
		if a.authService != nil {
			if loaded, err := a.authService.GetUserByID(r.Context(), current.ID); err == nil {
				user = loaded
			}
		}
		payload := buildAPIAuthUserResponse(user)
		sessionUser = &payload
		canAccessDashboard = user.CanAccessDashboard()
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"filters": map[string]any{
			"q":           query,
			"tags":        tagFilter,
			"category":    category,
			"subcategory": subcategory,
			"sort":        sortBy,
			"mode":        mode,
		},
		"stats": map[string]any{
			"total_skills":    totalSkills,
			"matching_skills": totalItems,
		},
		"pagination": map[string]any{
			"page":        currentPage,
			"page_size":   currentPageSize,
			"total_items": totalItems,
			"total_pages": totalPages,
			"prev_page":   prevPage,
			"next_page":   nextPage,
		},
		"categories":           mapCategoryCardsToAPI(categoryCards),
		"top_tags":             topTags,
		"filter_options":       buildMarketplaceFilterOptions(categoryCards),
		"items":                resultToAPIItems(items),
		"session_user":         sessionUser,
		"can_access_dashboard": canAccessDashboard,
	})
}

func (a *App) handleAPISearch(w http.ResponseWriter, r *http.Request) {
	result, err := a.skillService.SearchPublicSkills(r.Context(), services.PublicSearchInput{
		Query:           strings.TrimSpace(r.URL.Query().Get("q")),
		Tags:            services.ParseTagInput(strings.TrimSpace(r.URL.Query().Get("tags"))),
		CategorySlug:    strings.TrimSpace(r.URL.Query().Get("category")),
		SubcategorySlug: strings.TrimSpace(r.URL.Query().Get("subcategory")),
		SortBy:          defaultString(strings.TrimSpace(r.URL.Query().Get("sort")), "recent"),
		Page:            parsePositiveInt(r.URL.Query().Get("page"), 1),
		Limit:           parsePositiveInt(r.URL.Query().Get("limit"), 20),
	})
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "search_failed", "message": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"items": resultToAPIItems(result.Items),
		"page":  result.Page,
		"limit": result.Limit,
		"total": result.Total,
	})
}

func (a *App) handleAPIAISearch(w http.ResponseWriter, r *http.Request) {
	items, err := a.skillService.AISemanticSearchPublicSkills(
		r.Context(),
		strings.TrimSpace(r.URL.Query().Get("q")),
		parsePositiveInt(r.URL.Query().Get("limit"), 20),
	)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "ai_search_failed", "message": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"items": resultToAPIItems(items),
		"total": len(items),
	})
}

func (a *App) handleSkillDetail(w http.ResponseWriter, r *http.Request) {
	skillID, ok := parseSkillID(w, r)
	if !ok {
		return
	}
	viewerID := uint(0)
	if user := currentUserFromContext(r.Context()); user != nil {
		viewerID = user.ID
	}

	skill, err := a.skillService.GetVisibleSkillByID(r.Context(), skillID, viewerID)
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
		CatalogCategories: catalog.Categories(),
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
