package web

import (
	"math"
	"net/http"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) handleAPIPublicMarketplace(w http.ResponseWriter, r *http.Request) {
	if !a.ensureMarketplaceAccess(w, r) {
		return
	}
	if a.skillService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Skill service unavailable")
		return
	}

	query := strings.TrimSpace(r.URL.Query().Get("q"))
	tagFilter := strings.TrimSpace(r.URL.Query().Get("tags"))
	category := strings.TrimSpace(r.URL.Query().Get("category"))
	subcategory := strings.TrimSpace(r.URL.Query().Get("subcategory"))
	categoryGroup := strings.TrimSpace(r.URL.Query().Get("category_group"))
	subcategoryGroup := strings.TrimSpace(r.URL.Query().Get("subcategory_group"))
	scope := normalizeMarketplaceScope(r.URL.Query().Get("scope"))
	sortBy := normalizeMarketplaceSort(r.URL.Query().Get("sort"))
	mode := normalizeMarketplaceMode(r.URL.Query().Get("mode"))
	page := parsePositiveInt(r.URL.Query().Get("page"), 1)
	pageSize := parsePositiveInt(r.URL.Query().Get("page_size"), 24)
	if pageSize > 24 && !isUnpaginatedMarketplaceScope(scope) {
		pageSize = 24
	}
	tags := services.ParseTagInput(tagFilter)

	totalSkills, err := a.skillService.CountPublicSkills(r.Context())
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "summary_query_failed", err, "Failed to count public skills")
		return
	}

	rawCategoryCards, err := a.loadCategoryCards(r.Context(), "")
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "category_query_failed", err, "Failed to load category cards")
		return
	}
	presentationTaxonomy := a.marketplacePresentationTaxonomy(r.Context())
	presentationCategoryCards := buildMarketplacePresentationCategoryCardsWithTaxonomy(rawCategoryCards, presentationTaxonomy)

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

	if isUnpaginatedMarketplaceScope(scope) {
		allSkills, err := a.skillService.ListPublicSkills(r.Context())
		if err != nil {
			writeAPIErrorFromError(w, r, http.StatusInternalServerError, "search_failed", err, "Failed to query marketplace skills")
			return
		}

		filteredSkills := filterMarketplaceSkillsByKeywordAndTags(allSkills, query, tags)
		filteredSkills = filterSkillsByMarketplaceSelectionWithTaxonomy(
			filteredSkills,
			category,
			subcategory,
			categoryGroup,
			subcategoryGroup,
			presentationTaxonomy,
		)
		sortMarketplaceSkillsInPlace(filteredSkills, sortBy)

		items = filteredSkills
		totalItems = int64(len(filteredSkills))
		currentPage = 1
		currentPageSize = maxInt(len(filteredSkills), 1)
		topTags = buildTopTags(filteredSkills, 12)
	} else if mode == "ai" && query != "" {
		semanticItems, err := a.skillService.AISemanticSearchPublicSkills(r.Context(), query, 48)
		if err != nil {
			writeAPIErrorFromError(w, r, http.StatusInternalServerError, "ai_search_failed", err, "Failed to run AI search")
			return
		}
		semanticItems = filterSkillsByMarketplaceSelectionWithTaxonomy(
			semanticItems,
			category,
			subcategory,
			categoryGroup,
			subcategoryGroup,
			presentationTaxonomy,
		)
		items = semanticItems
		totalItems = int64(len(semanticItems))
		currentPage = 1
		currentPageSize = maxInt(len(semanticItems), 1)
	} else if categoryGroup != "" || subcategoryGroup != "" {
		allSkills, err := a.skillService.ListPublicSkills(r.Context())
		if err != nil {
			writeAPIErrorFromError(w, r, http.StatusInternalServerError, "search_failed", err, "Failed to query marketplace skills")
			return
		}

		filteredSkills := filterMarketplaceSkillsByKeywordAndTags(allSkills, query, services.ParseTagInput(tagFilter))
		filteredSkills = filterSkillsByMarketplaceSelectionWithTaxonomy(
			filteredSkills,
			category,
			subcategory,
			categoryGroup,
			subcategoryGroup,
			presentationTaxonomy,
		)
		sortMarketplaceSkillsInPlace(filteredSkills, sortBy)

		totalItems = int64(len(filteredSkills))
		totalPages := maxInt(int(math.Ceil(float64(totalItems)/float64(maxInt(pageSize, 1)))), 1)
		if page > totalPages {
			page = totalPages
		}
		currentPage = page
		items = sliceMarketplaceSkills(filteredSkills, page, pageSize)
	} else {
		result, err := a.skillService.SearchPublicSkills(r.Context(), services.PublicSearchInput{
			Query:           query,
			Tags:            tags,
			CategorySlug:    category,
			SubcategorySlug: subcategory,
			SortBy:          sortBy,
			Page:            page,
			Limit:           pageSize,
		})
		if err != nil {
			writeAPIErrorFromError(w, r, http.StatusInternalServerError, "search_failed", err, "Failed to query marketplace skills")
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

	summary := buildAPIPublicMarketplaceSummary(publicMarketplaceSummaryInput{
		RawCategoryCards:          rawCategoryCards,
		PresentationCategoryCards: presentationCategoryCards,
		PresentationTaxonomy:      presentationTaxonomy,
		CategoryFilter:            category,
		CategoryGroupFilter:       categoryGroup,
		MatchingSkills:            totalItems,
		TopTags:                   topTags,
		TotalSkills:               totalSkills,
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"filters": map[string]any{
			"q":                 query,
			"tags":              tagFilter,
			"scope":             scope,
			"category":          category,
			"subcategory":       subcategory,
			"category_group":    categoryGroup,
			"subcategory_group": subcategoryGroup,
			"sort":              sortBy,
			"mode":              mode,
			"page_size":         pageSize,
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
		"categories":           mapCategoryCardsToAPI(presentationCategoryCards),
		"top_tags":             topTags,
		"filter_options":       buildMarketplaceFilterOptions(rawCategoryCards),
		"items":                resultToAPIItemsWithTaxonomy(items, presentationTaxonomy),
		"summary":              summary,
		"session_user":         sessionUser,
		"can_access_dashboard": canAccessDashboard,
	})
}

func (a *App) handleAPISearch(w http.ResponseWriter, r *http.Request) {
	presentationTaxonomy := a.marketplacePresentationTaxonomy(r.Context())
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
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "search_failed", err, "Failed to search marketplace skills")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"items": resultToAPIItemsWithTaxonomy(result.Items, presentationTaxonomy),
		"page":  result.Page,
		"limit": result.Limit,
		"total": result.Total,
	})
}

func (a *App) handleAPIAISearch(w http.ResponseWriter, r *http.Request) {
	presentationTaxonomy := a.marketplacePresentationTaxonomy(r.Context())
	page := parsePositiveInt(r.URL.Query().Get("page"), 1)
	if page < 1 {
		page = 1
	}
	limit := parsePositiveInt(r.URL.Query().Get("limit"), 20)
	if limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	items, err := a.skillService.AISemanticSearchPublicSkills(r.Context(), strings.TrimSpace(r.URL.Query().Get("q")), 100)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "ai_search_failed", err, "Failed to run AI search")
		return
	}

	total := len(items)
	start := (page - 1) * limit
	if start >= total {
		items = []models.Skill{}
	} else {
		end := start + limit
		if end > total {
			end = total
		}
		items = items[start:end]
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"items": resultToAPIItemsWithTaxonomy(items, presentationTaxonomy),
		"page":  page,
		"limit": limit,
		"total": total,
	})
}
