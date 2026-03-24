package web

import (
	"fmt"
	"html/template"
	"math"
	"net/url"
	"path/filepath"
	"strings"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

// AppDependencies groups web-layer dependencies and runtime options.
type AppDependencies struct {
	AuthService           *services.AuthService
	SessionService        *services.SessionService
	UserSessionService    *services.UserSessionService
	SkillService          *services.SkillService
	APIKeyService         *services.APIKeyService
	InteractionService    *services.SkillInteractionService
	AuditService          *services.AuditService
	IntegrationService    *services.IntegrationService
	IncidentService       *services.IncidentService
	ModerationService     *services.ModerationService
	OpsService            *services.OpsService
	AsyncJobService       *services.AsyncJobService
	SyncJobService        *services.SyncJobService
	SyncGovernanceService *services.SyncGovernanceService
	SkillVersionService   *services.SkillVersionService
	OrganizationService   *services.OrganizationService
	OAuthGrantService     *services.OAuthGrantService
	DingTalkService       *services.DingTalkService
	UploadService         *services.UploadService
	RepositoryService     *services.RepositorySyncService
	SkillMPService        *services.SkillMPService
	SettingsService       *services.SettingsService
	SyncPolicyService     *services.RepositorySyncPolicyService
	SyncPolicyRecordSvc   *services.SyncPolicyService
	APISpecRegistrySvc    *services.APISpecRegistryService
	APIPublishSvc         *services.APIPublishService
	APIPolicySvc          *services.APIPolicyService
	APIMockSvc            *services.APIMockService
	APIExportSvc          *services.APIExportService
	APIContractRuntimeSvc *services.APIContractRuntimeService
	AllowRegistration     bool
	CookieSecure          bool
	APIOnly               bool
	CORSAllowedOrigins    []string
	APIKeys               []string
	TemplateGlob          string
	StoragePath           string
}

// NewApp initializes the HTTP app with optional template rendering support.
func NewApp(deps AppDependencies) (*App, error) {
	translations := loadTranslations(filepath.Join("docs", "i18n"))
	tmpl, err := buildAppTemplates(deps.APIOnly, deps.TemplateGlob, translations)
	if err != nil {
		return nil, err
	}
	repoSyncCoordinator := services.NewRepositorySyncCoordinator(deps.SkillService, deps.RepositoryService)

	return &App{
		authService:           deps.AuthService,
		sessionService:        deps.SessionService,
		userSessionSvc:        deps.UserSessionService,
		skillService:          deps.SkillService,
		apiKeyService:         deps.APIKeyService,
		interaction:           deps.InteractionService,
		auditService:          deps.AuditService,
		integrationSvc:        deps.IntegrationService,
		incidentSvc:           deps.IncidentService,
		moderationSvc:         deps.ModerationService,
		opsService:            deps.OpsService,
		asyncJobSvc:           deps.AsyncJobService,
		syncJobSvc:            deps.SyncJobService,
		syncGovernanceSvc:     deps.SyncGovernanceService,
		skillVersionSvc:       deps.SkillVersionService,
		organizationSvc:       deps.OrganizationService,
		oauthGrantService:     deps.OAuthGrantService,
		dingTalkService:       deps.DingTalkService,
		uploadService:         deps.UploadService,
		repositoryService:     deps.RepositoryService,
		repoSyncRunner:        repoSyncCoordinator,
		repoSyncBatchRunner:   repoSyncCoordinator.SyncBatch,
		skillMPService:        deps.SkillMPService,
		settingsService:       deps.SettingsService,
		syncPolicyService:     deps.SyncPolicyService,
		syncPolicyRecordSvc:   deps.SyncPolicyRecordSvc,
		apiSpecRegistrySvc:    deps.APISpecRegistrySvc,
		apiPublishSvc:         deps.APIPublishSvc,
		apiPolicySvc:          deps.APIPolicySvc,
		apiMockSvc:            deps.APIMockSvc,
		apiExportSvc:          deps.APIExportSvc,
		apiContractRuntimeSvc: deps.APIContractRuntimeSvc,
		allowRegistration:     deps.AllowRegistration,
		cookieSecure:          deps.CookieSecure,
		apiKeys:               buildAPIKeySet(deps.APIKeys),
		translations:          translations,
		templates:             tmpl,
		storagePath:           deps.StoragePath,
		apiOnly:               deps.APIOnly,
		corsOrigins:           buildOriginSet(deps.CORSAllowedOrigins),
	}, nil
}

func buildAppTemplates(apiOnly bool, templateGlob string, translations translationCatalog) (*template.Template, error) {
	if apiOnly {
		return nil, nil
	}
	if strings.TrimSpace(templateGlob) == "" {
		return nil, fmt.Errorf("template glob is required when api-only mode is disabled")
	}

	parsed, err := template.New("layout").Funcs(buildAppTemplateFuncMap(translations)).ParseGlob(templateGlob)
	if err != nil {
		return nil, fmt.Errorf("failed to parse templates: %w", err)
	}
	return parsed, nil
}

func buildAppTemplateFuncMap(translations translationCatalog) template.FuncMap {
	return template.FuncMap{
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
}

func buildAPIKeySet(apiKeys []string) map[string]struct{} {
	keySet := make(map[string]struct{}, len(apiKeys))
	for _, key := range apiKeys {
		clean := strings.TrimSpace(key)
		if clean == "" {
			continue
		}
		keySet[clean] = struct{}{}
	}
	return keySet
}

func buildOriginSet(origins []string) map[string]struct{} {
	originSet := make(map[string]struct{}, len(origins))
	for _, origin := range origins {
		clean := strings.TrimSpace(origin)
		if clean == "" {
			continue
		}
		originSet[clean] = struct{}{}
	}
	return originSet
}
