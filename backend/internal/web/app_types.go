package web

import "time"

// CategoryCard contains category display details and counts.
type CategoryCard struct {
	Slug          string
	Name          string
	Description   string
	Count         int64
	Subcategories []SubcategoryCard
}

// SubcategoryCard contains subcategory display details and count.
type SubcategoryCard struct {
	Slug  string
	Name  string
	Count int64
}

// TimelineViewPoint is a rendered timeline point.
type TimelineViewPoint struct {
	Bucket     string
	Count      int64
	Cumulative int64
}

// TagCard stores top tag usage for marketplace spotlight sections.
type TagCard struct {
	Name  string `json:"name"`
	Count int    `json:"count"`
}

// AuthProviderOption describes one third-party auth provider rendered in auth pages.
type AuthProviderOption struct {
	Key           string
	LabelKey      string
	ShortLabelKey string
	IconPath      string
	URL           string
	Enabled       bool
	Available     bool
}

type adminRouteContext struct {
	Section          string
	AccessMode       string
	IngestionSource  string
	RecordsMode      string
	IntegrationsMode string
	IncidentsMode    string
	IncidentID       string
	OpsMode          string
}

type apiSkillResponse struct {
	ID                    uint      `json:"id"`
	Name                  string    `json:"name"`
	Description           string    `json:"description"`
	Content               string    `json:"content"`
	Category              string    `json:"category"`
	Subcategory           string    `json:"subcategory"`
	CategoryGroup         string    `json:"category_group"`
	CategoryGroupLabel    string    `json:"category_group_label"`
	SubcategoryGroup      string    `json:"subcategory_group"`
	SubcategoryGroupLabel string    `json:"subcategory_group_label"`
	Tags                  []string  `json:"tags"`
	SourceType            string    `json:"source_type"`
	SourceURL             string    `json:"source_url"`
	StarCount             int       `json:"star_count"`
	QualityScore          float64   `json:"quality_score"`
	InstallCommand        string    `json:"install_command"`
	UpdatedAt             time.Time `json:"updated_at"`
}

type apiMarketplaceCategoryResponse struct {
	Slug          string                           `json:"slug"`
	Name          string                           `json:"name"`
	Description   string                           `json:"description"`
	Count         int64                            `json:"count"`
	Subcategories []apiMarketplaceSubcategoryEntry `json:"subcategories"`
}

type apiMarketplaceSubcategoryEntry struct {
	Slug  string `json:"slug"`
	Name  string `json:"name"`
	Count int64  `json:"count"`
}

type apiPublicMarketplaceLandingSummary struct {
	TotalSkills        int64 `json:"total_skills"`
	CategoryCount      int   `json:"category_count"`
	TopTagCount        int   `json:"top_tag_count"`
	FeaturedSkillCount int   `json:"featured_skill_count"`
	LatestSkillCount   int   `json:"latest_skill_count"`
}

type apiPublicMarketplaceCategoryHubSummary struct {
	TotalCategories        int   `json:"total_categories"`
	TotalSkills            int64 `json:"total_skills"`
	TopTagCount            int   `json:"top_tag_count"`
	SpotlightCategoryCount int   `json:"spotlight_category_count"`
}

type apiPublicMarketplaceCategoryDetailSummary struct {
	CategorySlug     string `json:"category_slug"`
	TotalSkills      int64  `json:"total_skills"`
	MatchingSkills   int64  `json:"matching_skills"`
	SubcategoryCount int    `json:"subcategory_count"`
}

type apiPublicMarketplaceSummary struct {
	Landing        apiPublicMarketplaceLandingSummary         `json:"landing"`
	CategoryHub    apiPublicMarketplaceCategoryHubSummary     `json:"category_hub"`
	CategoryDetail *apiPublicMarketplaceCategoryDetailSummary `json:"category_detail"`
}

type apiPublicRankingSummary struct {
	TotalCompared  int64   `json:"total_compared"`
	TopStars       int     `json:"top_stars"`
	TopQuality     float64 `json:"top_quality"`
	AverageQuality float64 `json:"average_quality"`
}

type apiPublicRankingCategoryLeader struct {
	CategorySlug   string           `json:"category_slug"`
	Count          int64            `json:"count"`
	AverageQuality float64          `json:"average_quality"`
	LeadingSkill   apiSkillResponse `json:"leading_skill"`
}
