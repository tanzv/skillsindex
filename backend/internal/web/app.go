package web

import (
	"fmt"
	"html/template"
	"math"
	"net/url"
	"path/filepath"
	"strings"
	"time"

	"skillsindex/internal/catalog"
	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

type contextKey string

const currentUserKey contextKey = "current_user"
const ssoStateCookieName = "skillsindex_sso_state"
const apiKeyFlashCookieName = "skillsindex_flash_api_key"
const csrfCookieName = "skillsindex_csrf"
const csrfTokenFormField = "csrf_token"

var authProviderOrder = []string{
	"dingtalk",
	"github",
	"google",
	"wecom",
	"microsoft",
}

var authProviderLabelKeys = map[string]string{
	"dingtalk":  "auth.sign_in_dingtalk",
	"github":    "auth.sign_in_github",
	"google":    "auth.sign_in_google",
	"wecom":     "auth.sign_in_wecom",
	"microsoft": "auth.sign_in_microsoft",
}

var authProviderShortLabelKeys = map[string]string{
	"dingtalk":  "auth.provider_dingtalk",
	"github":    "auth.provider_github",
	"google":    "auth.provider_google",
	"wecom":     "auth.provider_wecom",
	"microsoft": "auth.provider_microsoft",
}

var authProviderIconPaths = map[string]string{
	"dingtalk":  "/static/icons/auth/dingtalk.svg",
	"github":    "/static/icons/auth/github.svg",
	"google":    "/static/icons/auth/google.svg",
	"wecom":     "/static/icons/auth/wecom.svg",
	"microsoft": "/static/icons/auth/microsoft.svg",
}

// App wires handlers, templates, and domain services for web delivery.
type App struct {
	authService       *services.AuthService
	sessionService    *services.SessionService
	userSessionSvc    *services.UserSessionService
	skillService      *services.SkillService
	apiKeyService     *services.APIKeyService
	interaction       *services.SkillInteractionService
	auditService      *services.AuditService
	integrationSvc    *services.IntegrationService
	incidentSvc       *services.IncidentService
	moderationSvc     *services.ModerationService
	opsService        *services.OpsService
	asyncJobSvc       *services.AsyncJobService
	syncJobSvc        *services.SyncJobService
	skillVersionSvc   *services.SkillVersionService
	organizationSvc   *services.OrganizationService
	oauthGrantService *services.OAuthGrantService
	dingTalkService   *services.DingTalkService
	uploadService     *services.UploadService
	repositoryService *services.RepositorySyncService
	repoSyncRunner    *services.RepositorySyncCoordinator
	skillMPService    *services.SkillMPService
	settingsService   *services.SettingsService
	syncPolicyService *services.RepositorySyncPolicyService
	allowRegistration bool
	apiKeys           map[string]struct{}
	translations      translationCatalog
	templates         *template.Template
	storagePath       string
	cookieSecure      bool
	apiOnly           bool
	corsOrigins       map[string]struct{}
}

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
	Name  string
	Count int
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

// ViewData is rendered by the shared template.
type ViewData struct {
	Page                    string
	Title                   string
	CurrentUser             *models.User
	AccountSection          string
	AccountCurrentSessionID string
	AccountSessionIssued    *time.Time
	AccountSessionExpires   *time.Time
	AccountSessions         []models.UserSession
	PasswordResetToken      string
	AdminSection            string
	AdminAccessMode         string
	AdminIngestionSource    string
	AdminRecordsMode        string
	AdminIntegrationsMode   string
	AdminIncidentsMode      string
	AdminIncidentID         string
	AdminModerationStatus   string
	AdminOpsMode            string
	DingTalkEnabled         bool
	DingTalkGrant           *models.OAuthGrant
	AuthProviders           []AuthProviderOption
	AdminAuthProviders      []AuthProviderOption
	AuthProviderCount       int
	AuthProviderActive      int
	RoleChoices             []models.UserRole
	AuditLogs               []models.AuditLog
	Skills                  []models.Skill
	FeaturedSkills          []models.Skill
	Skill                   *models.Skill
	UserSkills              []models.Skill
	AdminUsers              []models.User
	AdminShowOwner          bool
	AdminTotalCount         int
	AdminCanManageUsers     bool
	AdminPublicCount        int
	AdminPrivateCount       int
	AdminSyncableCount      int
	AdminShowAPIKeyOwner    bool
	AdminAPIKeys            []models.APIKey
	AdminNewAPIKey          string
	AdminAPIKeyOwner        string
	AdminAPIKeyStatus       string
	AdminConnectors         []models.IntegrationConnector
	AdminWebhookLogs        []models.WebhookDeliveryLog
	AdminIncidents          []models.Incident
	AdminIncident           *models.Incident
	AdminModerationCases    []models.ModerationCase
	AdminOpsMetrics         services.OpsMetrics
	AdminOpsAlerts          []services.OpsAlert
	AdminOpsReleaseGates    services.OpsReleaseGateSnapshot
	AdminOpsRecoveryDrills  []services.OpsRecoveryDrillRecord
	AdminOpsReleases        []services.OpsReleaseRecord
	AdminOpsChangeApprovals []services.OpsChangeApprovalRecord
	AdminOpsBackupPlans     []services.OpsBackupPlanRecord
	AdminOpsBackupRuns      []services.OpsBackupRunRecord
	AdminAsyncJobs          []models.AsyncJob
	AdminAsyncJobDetail     *models.AsyncJob
	AdminSyncRuns           []models.SyncJobRun
	AdminSyncRunDetail      *models.SyncJobRun
	AdminSyncPolicy         services.RepositorySyncPolicy
	SkillVersions           []models.SkillVersion
	SkillVersionDetail      *models.SkillVersion
	SkillVersionCompare     *services.SkillVersionCompareResult
	CSRFToken               string
	TopTags                 []TagCard
	Query                   string
	TagFilter               string
	CategoryFilter          string
	SubcategoryFilter       string
	Locale                  string
	LocaleSwitchEN          string
	LocaleSwitchZH          string
	PrevPageURL             string
	NextPageURL             string
	Message                 string
	Error                   string
	AllowRegistration       bool
	CatalogCategories       []catalog.Category
	Categories              []CategoryCard
	SelectedCategory        *CategoryCard
	SelectedSubcategory     string
	SortBy                  string
	SearchMode              string
	PageNumber              int
	PageSize                int
	TotalItems              int64
	TotalSkills             int64
	TimelineInterval        string
	TimelineDayURL          string
	TimelineWeekURL         string
	TimelineMonthURL        string
	TimelinePoints          []TimelineViewPoint
	TimelineSVGPoints       string
	DocsDefaultAPIKey       string
	DetailStats             services.SkillStats
	DetailFavorited         bool
	DetailUserRating        int
	DetailComments          []models.SkillComment
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
	ID             uint      `json:"id"`
	Name           string    `json:"name"`
	Description    string    `json:"description"`
	Content        string    `json:"content"`
	Category       string    `json:"category"`
	Subcategory    string    `json:"subcategory"`
	Tags           []string  `json:"tags"`
	SourceType     string    `json:"source_type"`
	SourceURL      string    `json:"source_url"`
	StarCount      int       `json:"star_count"`
	QualityScore   float64   `json:"quality_score"`
	InstallCommand string    `json:"install_command"`
	UpdatedAt      time.Time `json:"updated_at"`
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

// NewApp initializes the HTTP app with optional template rendering support.
func NewApp(
	authService *services.AuthService,
	sessionService *services.SessionService,
	userSessionService *services.UserSessionService,
	skillService *services.SkillService,
	apiKeyService *services.APIKeyService,
	interactionService *services.SkillInteractionService,
	auditService *services.AuditService,
	integrationService *services.IntegrationService,
	incidentService *services.IncidentService,
	moderationService *services.ModerationService,
	opsService *services.OpsService,
	asyncJobService *services.AsyncJobService,
	syncJobService *services.SyncJobService,
	skillVersionService *services.SkillVersionService,
	organizationService *services.OrganizationService,
	oauthGrantService *services.OAuthGrantService,
	dingTalkService *services.DingTalkService,
	uploadService *services.UploadService,
	repositoryService *services.RepositorySyncService,
	skillMPService *services.SkillMPService,
	settingsService *services.SettingsService,
	syncPolicyService *services.RepositorySyncPolicyService,
	allowRegistration bool,
	cookieSecure bool,
	apiOnly bool,
	corsAllowedOrigins []string,
	apiKeys []string,
	templateGlob string,
	storagePath string,
) (*App, error) {
	translations := loadTranslations(filepath.Join("docs", "i18n"))

	funcMap := template.FuncMap{
		"tagNames": func(tags []models.Tag) string {
			if len(tags) == 0 {
				return ""
			}
			names := make([]string, 0, len(tags))
			for _, tag := range tags {
				names = append(names, tag.Name)
			}
			return strings.Join(names, ", ")
		},
		"formatTimePtr": func(value *time.Time) string {
			if value == nil {
				return "Never"
			}
			return value.UTC().Format("2006-01-02 15:04 UTC")
		},
		"formatTime": func(value time.Time) string {
			return value.UTC().Format("2006-01-02")
		},
		"formatDateTime": func(value time.Time) string {
			return value.UTC().Format("2006-01-02 15:04 UTC")
		},
		"isSyncable": func(source models.SkillSourceType) bool {
			return source == models.SourceTypeRepository || source == models.SourceTypeSkillMP
		},
		"totalPages": func(total int64, pageSize int) int {
			if pageSize <= 0 {
				return 1
			}
			pages := int(math.Ceil(float64(total) / float64(pageSize)))
			if pages < 1 {
				pages = 1
			}
			return pages
		},
		"plus":    func(value int, delta int) int { return value + delta },
		"minus":   func(value int, delta int) int { return value - delta },
		"toUpper": strings.ToUpper,
		"tr": func(locale string, key string) string {
			return translations.translate(locale, key)
		},
		"queryEscape": func(value string) string {
			return url.QueryEscape(value)
		},
		"canAccessDashboard": func(user *models.User) bool {
			if user == nil {
				return false
			}
			return user.CanAccessDashboard()
		},
		"canManageUsers": func(user *models.User) bool {
			if user == nil {
				return false
			}
			return user.CanManageUsers()
		},
		"canViewAllSkills": func(user *models.User) bool {
			if user == nil {
				return false
			}
			return user.CanViewAllSkills()
		},
		"apiKeyStatus": func(key models.APIKey) string {
			if key.RevokedAt != nil {
				return "revoked"
			}
			if key.ExpiresAt != nil && time.Now().UTC().After(key.ExpiresAt.UTC()) {
				return "expired"
			}
			return "active"
		},
		"apiKeyScopes": func(key models.APIKey) string {
			scopes := services.APIKeyScopes(key)
			if len(scopes) == 0 {
				return "legacy-all"
			}
			return strings.Join(scopes, ", ")
		},
		"roleKey": func(role models.UserRole) string {
			return roleTranslationKey(role)
		},
		"ownerSelected": func(current *uint, userID uint) bool {
			if current == nil {
				return false
			}
			return *current == userID
		},
		"sessionLabel": func(value string) string {
			clean := strings.TrimSpace(value)
			if len(clean) <= 14 {
				return clean
			}
			return clean[:8] + "..." + clean[len(clean)-4:]
		},
		"topFeaturedQuality":         topFeaturedQuality,
		"topFeaturedPercent":         topFeaturedPercent,
		"isAdminPage":                isAdminPage,
		"isAuthShellPage":            isAuthShellPage,
		"isLoginPage":                isLoginPage,
		"isRegisterPage":             isRegisterPage,
		"isPasswordResetRequestPage": isPasswordResetRequestPage,
		"isPasswordResetConfirmPage": isPasswordResetConfirmPage,
		"loginPath":                  loginPath,
		"registerPath":               registerPath,
		"passwordResetRequestPath":   passwordResetRequestPath,
		"passwordResetConfirmPath":   passwordResetConfirmPath,
		"bodyClass":                  bodyClass,
	}

	var tmpl *template.Template
	if !apiOnly {
		if strings.TrimSpace(templateGlob) == "" {
			return nil, fmt.Errorf("template glob is required when api-only mode is disabled")
		}
		parsed, err := template.New("layout").Funcs(funcMap).ParseGlob(templateGlob)
		if err != nil {
			return nil, fmt.Errorf("failed to parse templates: %w", err)
		}
		tmpl = parsed
	}

	keySet := make(map[string]struct{}, len(apiKeys))
	for _, key := range apiKeys {
		clean := strings.TrimSpace(key)
		if clean == "" {
			continue
		}
		keySet[clean] = struct{}{}
	}

	corsOriginSet := make(map[string]struct{}, len(corsAllowedOrigins))
	for _, origin := range corsAllowedOrigins {
		clean := strings.TrimSpace(origin)
		if clean == "" {
			continue
		}
		corsOriginSet[clean] = struct{}{}
	}
	return &App{
		authService:       authService,
		sessionService:    sessionService,
		userSessionSvc:    userSessionService,
		skillService:      skillService,
		apiKeyService:     apiKeyService,
		interaction:       interactionService,
		auditService:      auditService,
		integrationSvc:    integrationService,
		incidentSvc:       incidentService,
		moderationSvc:     moderationService,
		opsService:        opsService,
		asyncJobSvc:       asyncJobService,
		syncJobSvc:        syncJobService,
		skillVersionSvc:   skillVersionService,
		organizationSvc:   organizationService,
		oauthGrantService: oauthGrantService,
		dingTalkService:   dingTalkService,
		uploadService:     uploadService,
		repositoryService: repositoryService,
		repoSyncRunner:    services.NewRepositorySyncCoordinator(skillService, repositoryService),
		skillMPService:    skillMPService,
		settingsService:   settingsService,
		syncPolicyService: syncPolicyService,
		allowRegistration: allowRegistration,
		cookieSecure:      cookieSecure,
		apiKeys:           keySet,
		translations:      translations,
		templates:         tmpl,
		storagePath:       storagePath,
		apiOnly:           apiOnly,
		corsOrigins:       corsOriginSet,
	}, nil
}
