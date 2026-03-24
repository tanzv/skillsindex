package web

func openAPISchemasCore() map[string]any {
	schemas := map[string]any{}
	mergeOpenAPIPathMap(schemas, openAPISchemasCoreCatalogAndAuth())
	mergeOpenAPIPathMap(schemas, openAPISchemasCoreAccountInteractionForms())
	return schemas
}

func openAPISchemasCoreCatalogAndAuth() map[string]any {
	return map[string]any{
		"SkillItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"id":              map[string]any{"type": "integer"},
				"name":            map[string]any{"type": "string"},
				"description":     map[string]any{"type": "string"},
				"content":         map[string]any{"type": "string"},
				"category":        map[string]any{"type": "string"},
				"subcategory":     map[string]any{"type": "string"},
				"tags":            map[string]any{"type": "array", "items": map[string]any{"type": "string"}},
				"source_type":     map[string]any{"type": "string"},
				"source_url":      map[string]any{"type": "string"},
				"star_count":      map[string]any{"type": "integer"},
				"quality_score":   map[string]any{"type": "number"},
				"install_command": map[string]any{"type": "string"},
				"updated_at":      map[string]any{"type": "string", "format": "date-time"},
			},
		},
		"MarketplaceSubcategoryItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"slug":  map[string]any{"type": "string"},
				"name":  map[string]any{"type": "string"},
				"count": map[string]any{"type": "integer"},
			},
		},
		"MarketplaceCategoryItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"slug":        map[string]any{"type": "string"},
				"name":        map[string]any{"type": "string"},
				"description": map[string]any{"type": "string"},
				"count":       map[string]any{"type": "integer"},
				"subcategories": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/MarketplaceSubcategoryItem"},
				},
			},
		},
		"MarketplaceTagItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"name":  map[string]any{"type": "string"},
				"count": map[string]any{"type": "integer"},
			},
		},
		"MarketplaceFilterOptionItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"value": map[string]any{"type": "string"},
				"label": map[string]any{"type": "string"},
			},
		},
		"MarketplaceCategoryFilterOptions": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"category_slug": map[string]any{"type": "string"},
				"sort": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/MarketplaceFilterOptionItem"},
				},
				"mode": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/MarketplaceFilterOptionItem"},
				},
			},
		},
		"MarketplaceFilterOptions": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"sort": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/MarketplaceFilterOptionItem"},
				},
				"mode": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/MarketplaceFilterOptionItem"},
				},
				"category_overrides": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/MarketplaceCategoryFilterOptions"},
				},
			},
		},
		"PublicMarketplaceFilters": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"q":                 map[string]any{"type": "string"},
				"tags":              map[string]any{"type": "string"},
				"scope":             map[string]any{"type": "string"},
				"category":          map[string]any{"type": "string"},
				"subcategory":       map[string]any{"type": "string"},
				"category_group":    map[string]any{"type": "string"},
				"subcategory_group": map[string]any{"type": "string"},
				"sort":              map[string]any{"type": "string"},
				"mode":              map[string]any{"type": "string"},
				"page_size":         map[string]any{"type": "integer"},
			},
		},
		"PublicMarketplaceStats": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"total_skills":    map[string]any{"type": "integer"},
				"matching_skills": map[string]any{"type": "integer"},
			},
		},
		"PublicMarketplacePagination": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"page":        map[string]any{"type": "integer"},
				"page_size":   map[string]any{"type": "integer"},
				"total_items": map[string]any{"type": "integer"},
				"total_pages": map[string]any{"type": "integer"},
				"prev_page":   map[string]any{"type": "integer"},
				"next_page":   map[string]any{"type": "integer"},
			},
		},
		"PublicMarketplaceLandingSummary": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"total_skills":         map[string]any{"type": "integer"},
				"category_count":       map[string]any{"type": "integer"},
				"top_tag_count":        map[string]any{"type": "integer"},
				"featured_skill_count": map[string]any{"type": "integer"},
				"latest_skill_count":   map[string]any{"type": "integer"},
			},
		},
		"PublicMarketplaceCategoryHubSummary": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"total_categories":         map[string]any{"type": "integer"},
				"total_skills":             map[string]any{"type": "integer"},
				"top_tag_count":            map[string]any{"type": "integer"},
				"spotlight_category_count": map[string]any{"type": "integer"},
			},
		},
		"PublicMarketplaceCategoryDetailSummary": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"category_slug":     map[string]any{"type": "string"},
				"total_skills":      map[string]any{"type": "integer"},
				"matching_skills":   map[string]any{"type": "integer"},
				"subcategory_count": map[string]any{"type": "integer"},
			},
		},
		"PublicMarketplaceSummary": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"landing": map[string]any{
					"$ref": "#/components/schemas/PublicMarketplaceLandingSummary",
				},
				"category_hub": map[string]any{
					"$ref": "#/components/schemas/PublicMarketplaceCategoryHubSummary",
				},
				"category_detail": map[string]any{
					"$ref":     "#/components/schemas/PublicMarketplaceCategoryDetailSummary",
					"nullable": true,
				},
			},
		},
		"PublicMarketplaceResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"filters": map[string]any{"$ref": "#/components/schemas/PublicMarketplaceFilters"},
				"stats":   map[string]any{"$ref": "#/components/schemas/PublicMarketplaceStats"},
				"pagination": map[string]any{
					"$ref": "#/components/schemas/PublicMarketplacePagination",
				},
				"categories": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/MarketplaceCategoryItem"},
				},
				"top_tags": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/MarketplaceTagItem"},
				},
				"filter_options": map[string]any{
					"$ref": "#/components/schemas/MarketplaceFilterOptions",
				},
				"items": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/SkillItem"},
				},
				"summary": map[string]any{
					"$ref": "#/components/schemas/PublicMarketplaceSummary",
				},
				"session_user": map[string]any{
					"$ref":     "#/components/schemas/AuthSessionUser",
					"nullable": true,
				},
				"can_access_dashboard": map[string]any{"type": "boolean"},
			},
		},
		"PublicRankingSummary": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"total_compared":  map[string]any{"type": "integer"},
				"top_stars":       map[string]any{"type": "integer"},
				"top_quality":     map[string]any{"type": "number"},
				"average_quality": map[string]any{"type": "number"},
			},
		},
		"PublicRankingCategoryLeader": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"category_slug":   map[string]any{"type": "string"},
				"count":           map[string]any{"type": "integer"},
				"average_quality": map[string]any{"type": "number"},
				"leading_skill":   map[string]any{"$ref": "#/components/schemas/SkillItem"},
			},
		},
		"PublicRankingResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"sort": map[string]any{"type": "string"},
				"ranked_items": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/SkillItem"},
				},
				"highlights": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/SkillItem"},
				},
				"list_items": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/SkillItem"},
				},
				"summary": map[string]any{
					"$ref": "#/components/schemas/PublicRankingSummary",
				},
				"category_leaders": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/PublicRankingCategoryLeader"},
				},
			},
		},
		"PublicSkillDetailStats": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"favorite_count": map[string]any{"type": "integer"},
				"rating_count":   map[string]any{"type": "integer"},
				"rating_average": map[string]any{"type": "number"},
				"comment_count":  map[string]any{"type": "integer"},
			},
		},
		"PublicSkillDetailViewerState": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"can_interact": map[string]any{"type": "boolean"},
				"favorited":    map[string]any{"type": "boolean"},
				"rated":        map[string]any{"type": "boolean"},
				"rating":       map[string]any{"type": "integer"},
			},
		},
		"PublicSkillDetailComment": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"id":           map[string]any{"type": "integer"},
				"skill_id":     map[string]any{"type": "integer"},
				"user_id":      map[string]any{"type": "integer"},
				"username":     map[string]any{"type": "string"},
				"display_name": map[string]any{"type": "string"},
				"content":      map[string]any{"type": "string"},
				"created_at":   map[string]any{"type": "string", "format": "date-time"},
				"can_delete":   map[string]any{"type": "boolean"},
			},
		},
		"PublicSkillDetailResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"skill": map[string]any{"$ref": "#/components/schemas/SkillItem"},
				"stats": map[string]any{"$ref": "#/components/schemas/PublicSkillDetailStats"},
				"viewer_state": map[string]any{
					"$ref": "#/components/schemas/PublicSkillDetailViewerState",
				},
				"comments_limit": map[string]any{"type": "integer"},
				"comments": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/PublicSkillDetailComment"},
				},
				"related_skills": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/SkillItem"},
				},
			},
		},
		"SearchSkillsResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"items": map[string]any{"type": "array", "items": map[string]any{"$ref": "#/components/schemas/SkillItem"}},
				"page":  map[string]any{"type": "integer"},
				"limit": map[string]any{"type": "integer"},
				"total": map[string]any{"type": "integer"},
			},
		},
		"AISearchSkillsResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"items": map[string]any{"type": "array", "items": map[string]any{"$ref": "#/components/schemas/SkillItem"}},
				"page":  map[string]any{"type": "integer"},
				"limit": map[string]any{"type": "integer"},
				"total": map[string]any{"type": "integer"},
			},
		},
		"AuthLoginRequest": map[string]any{
			"type":     "object",
			"required": []string{"username", "password"},
			"properties": map[string]any{
				"username": map[string]any{"type": "string"},
				"password": map[string]any{"type": "string"},
			},
		},
		"AuthSessionUser": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"id":           map[string]any{"type": "integer"},
				"username":     map[string]any{"type": "string"},
				"display_name": map[string]any{"type": "string"},
				"role":         map[string]any{"type": "string"},
				"status":       map[string]any{"type": "string"},
			},
		},
		"AuthSessionResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"ok": map[string]any{"type": "boolean"},
				"user": map[string]any{
					"$ref":     "#/components/schemas/AuthSessionUser",
					"nullable": true,
				},
			},
		},
		"AuthProviderItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"key":        map[string]any{"type": "string"},
				"start_path": map[string]any{"type": "string"},
				"label":      map[string]any{"type": "string"},
			},
		},
		"AuthProvidersResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"ok": map[string]any{"type": "boolean"},
				"auth_providers": map[string]any{
					"type":  "array",
					"items": map[string]any{"type": "string"},
				},
				"items": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/AuthProviderItem"},
				},
			},
		},
	}
}
