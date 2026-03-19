package services

import (
	"errors"
	"time"

	"skillsindex/internal/models"

	"gorm.io/gorm"
)

var (
	// ErrSkillNotFound indicates that the requested skill does not exist for current scope.
	ErrSkillNotFound = errors.New("skill not found")
)

// SkillService handles skill search and management operations.
type SkillService struct {
	db             *gorm.DB
	versionService *SkillVersionService
}

// SearchInput is the filter input for searching skill items.
type SearchInput struct {
	ViewerUserID uint
	Query        string
	Tags         []string
	Limit        int
}

// CreateSkillInput defines fields for creating a skill.
type CreateSkillInput struct {
	OwnerID         uint
	OrganizationID  *uint
	Name            string
	Description     string
	Content         string
	Tags            []string
	CategorySlug    string
	SubcategorySlug string
	Visibility      models.SkillVisibility
	SourceType      models.SkillSourceType
	RecordOrigin    models.SkillRecordOrigin
	SourceURL       string
	SourceBranch    string
	SourcePath      string
	RepoURL         string
	InstallCommand  string
	StarCount       int
	QualityScore    float64
	LastSyncedAt    *time.Time
}

// RepositoryUpdateInput contains repository sync update payload.
type RepositoryUpdateInput struct {
	SkillID uint
	OwnerID uint
	Source  RepoSource
	Meta    ExtractedSkill
}

// SyncUpdateInput contains sync update payload for remote sources.
type SyncUpdateInput struct {
	SkillID      uint
	OwnerID      uint
	SourceType   models.SkillSourceType
	SourceURL    string
	SourceBranch string
	SourcePath   string
	Meta         ExtractedSkill
}

// PublicSearchInput is the filter input for marketplace public skills.
type PublicSearchInput struct {
	Query           string
	Tags            []string
	CategorySlug    string
	SubcategorySlug string
	SortBy          string
	Page            int
	Limit           int
}

// PublicSearchResult is a paginated result of public skills.
type PublicSearchResult struct {
	Items []models.Skill
	Total int64
	Page  int
	Limit int
}

// CategorySkillCount stores public skill counts per category slug.
type CategorySkillCount struct {
	CategorySlug string
	Count        int64
}

// TimelinePoint stores cumulative counts for a date bucket.
type TimelinePoint struct {
	BucketDate time.Time
	Count      int64
	Cumulative int64
}

// DashboardSkillCounts contains skill aggregates for dashboard widgets.
type DashboardSkillCounts struct {
	Total    int64
	Public   int64
	Private  int64
	Syncable int64
}

// NewSkillService creates a new skill service instance.
func NewSkillService(db *gorm.DB) *SkillService {
	return &SkillService{
		db:             db,
		versionService: NewSkillVersionService(db),
	}
}
