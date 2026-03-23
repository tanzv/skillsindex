package web

import (
	"math"
	"net/http"
	"strings"

	"skillsindex/internal/catalog"
	"skillsindex/internal/services"

	"github.com/go-chi/chi/v5"
)

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

func (a *App) handleAbout(w http.ResponseWriter, r *http.Request) {
	a.render(w, r, ViewData{Page: "about", Title: "About", CatalogCategories: catalog.Categories()})
}
