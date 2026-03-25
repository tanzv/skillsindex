package web

import (
	"html/template"
	"net/http"
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

// App wires handlers, templates, and domain services for web delivery.
type App struct {
	authService       *services.AuthService
	sessionService    *services.SessionService
	sessionStarter    func(http.ResponseWriter, *http.Request, uint) error
	userSessionSvc    *services.UserSessionService
	skillService      *services.SkillService
	apiKeyService     *services.APIKeyService
	interaction       *services.SkillInteractionService
	auditService      *services.AuditService
	integrationSvc    *services.IntegrationService
	incidentSvc       *services.IncidentService
	moderationSvc     *services.ModerationService
	opsService        *services.OpsService
	skillVersionSvc   *services.SkillVersionService
	organizationSvc   *services.OrganizationService
	oauthGrantService *services.OAuthGrantService
	dingTalkService   *services.DingTalkService
	uploadService     *services.UploadService
	syncRuntimeDependencies
	apiRuntimeDependencies
	skillMPService    *services.SkillMPService
	settingsService   *services.SettingsService
	loginThrottle     *loginThrottleState
	allowRegistration bool
	apiKeys           map[string]struct{}
	translations      translationCatalog
	templates         *template.Template
	storagePath       string
	cookieSecure      bool
	apiOnly           bool
	corsOrigins       map[string]struct{}
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
