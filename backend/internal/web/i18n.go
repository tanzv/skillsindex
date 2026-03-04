package web

import (
	"encoding/json"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
)

type translationCatalog map[string]map[string]string

func loadTranslations(dir string) translationCatalog {
	catalog := translationCatalog{
		"en": defaultEnglishTranslations(),
	}

	entries, err := os.ReadDir(dir)
	if err != nil {
		return catalog
	}

	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(strings.ToLower(entry.Name()), ".json") {
			continue
		}

		localeToken := strings.TrimSuffix(entry.Name(), filepath.Ext(entry.Name()))
		locale, ok := parseLocale(localeToken)
		if !ok {
			continue
		}

		raw, err := os.ReadFile(filepath.Join(dir, entry.Name()))
		if err != nil {
			continue
		}
		pairs := make(map[string]string)
		if err := json.Unmarshal(raw, &pairs); err != nil {
			continue
		}
		if _, exists := catalog[locale]; !exists {
			catalog[locale] = make(map[string]string)
		}
		for key, value := range pairs {
			trimmedKey := strings.TrimSpace(key)
			if trimmedKey == "" {
				continue
			}
			catalog[locale][trimmedKey] = value
		}
	}

	return catalog
}

func defaultEnglishTranslations() map[string]string {
	return map[string]string{
		"nav.marketplace":                       "Marketplace",
		"nav.categories":                        "Categories",
		"nav.timeline":                          "Timeline",
		"nav.compare":                           "Compare",
		"nav.rollout":                           "Rollout",
		"nav.workspace":                         "Workspace",
		"nav.governance":                        "Governance",
		"nav.docs":                              "Docs",
		"nav.api":                               "API",
		"nav.about":                             "About",
		"nav.prototype":                         "Prototype",
		"nav.admin":                             "Admin",
		"nav.sign_in":                           "Sign in",
		"nav.sign_out":                          "Sign out",
		"nav.create_account":                    "Create account",
		"auth.sign_in":                          "Sign in",
		"auth.username":                         "Username",
		"auth.password":                         "Password",
		"auth.register_note":                    "Use a secure password to initialize your workspace identity.",
		"auth.already_have_account":             "Already have an account?",
		"auth.need_account":                     "Need an account?",
		"auth.or_sign_in_with":                  "Or continue with",
		"auth.sign_in_dingtalk":                 "Sign in with DingTalk",
		"auth.sign_in_github":                   "Continue with GitHub",
		"auth.sign_in_google":                   "Continue with Google",
		"auth.sign_in_wecom":                    "Continue with WeCom",
		"auth.sign_in_microsoft":                "Continue with Microsoft",
		"auth.provider_dingtalk":                "DingTalk",
		"auth.provider_github":                  "GitHub",
		"auth.provider_google":                  "Google",
		"auth.provider_wecom":                   "WeCom",
		"auth.provider_microsoft":               "Microsoft",
		"auth.provider_more":                    "More",
		"auth.third_party_sign_in":              "Available sign-in methods",
		"auth.third_party_register":             "Available registration methods",
		"auth.third_party_configured_by_admin":  "Shown automatically from admin identity provider settings.",
		"auth.third_party_more_soon":            "Additional providers can be enabled in admin settings.",
		"auth.third_party_admin_enable_hint":    "Ask your administrator to enable DingTalk OAuth.",
		"auth.third_party_admin_configure_hint": "Ask your administrator to configure enabled providers and OAuth endpoints.",
		"auth.third_party_none_configured":      "No third-party providers are enabled yet.",
		"auth.login_kicker":                     "Enterprise Intranet · SkillOps",
		"auth.login_headline":                   "Internal skill asset and release governance platform.",
		"auth.login_summary":                    "A controlled internal entry point for enterprise skills with permission-aware access.",
		"auth.login_stat_discovery":             "Asset",
		"auth.login_stat_discovery_value":       "Unified Catalog Entry",
		"auth.login_stat_operations":            "Change",
		"auth.login_stat_operations_value":      "Standard Approval Flow",
		"auth.login_stat_security":              "Stability",
		"auth.login_stat_security_value":        "Reliable Access Control",
		"auth.login_stat_integration":           "Integration",
		"auth.login_stat_integration_value":     "DingTalk + OpenAPI",
		"auth.login_chip_enterprise":            "Intranet Only",
		"auth.login_chip_workflow":              "Governance First",
		"auth.login_chip_data":                  "Role Based",
		"auth.login_context_line":               "Single entry for authorized internal skill access.",
		"auth.login_context_meta":               "Internal Use Only",
		"auth.login_note":                       "Sign in with your local account. Third-party methods follow admin configuration.",

		"home.kicker":                          "skills marketplace command center",
		"home.headline":                        "Open Skill Marketplace for AI and Automation Workflows",
		"home.summary":                         "Index, search, share, sync, and install practical skills from repositories, archives, and SkillMP endpoints.",
		"home.cta_api":                         "Explore API",
		"home.search":                          "Search Skills",
		"home.results":                         "Results",
		"home.popular":                         "Popular Tags",
		"home.top_skills":                      "Top Skills",
		"home.top_skills_note":                 "Ranked by community stars and quality score.",
		"home.metric_public_skills":            "Public Skills",
		"home.metric_categories":               "Categories",
		"home.metric_query_results":            "Current Query Results",
		"home.search_note":                     "Structured filtering for teams, repositories, and operational use cases.",
		"home.label_mode":                      "Mode",
		"home.mode_keyword":                    "Keyword",
		"home.mode_ai":                         "AI Semantic",
		"home.label_keyword":                   "Keyword",
		"home.placeholder_keyword":             "go api, llm eval, kubernetes incident",
		"home.label_tags":                      "Tags",
		"home.placeholder_tags":                "go,automation",
		"home.label_sort":                      "Sort",
		"home.sort_recent":                     "Recent",
		"home.sort_stars":                      "Stars",
		"home.sort_quality":                    "Quality",
		"home.label_category":                  "Category",
		"home.option_all_categories":           "All categories",
		"home.label_subcategory":               "Subcategory",
		"home.option_all_subcategories":        "All subcategories",
		"home.action_search":                   "Search",
		"home.empty_featured":                  "No featured skills available yet.",
		"home.empty_tags":                      "Tag data will appear after public skills are indexed.",
		"home.category_snapshot":               "Category Snapshot",
		"home.unit_skills":                     "skills",
		"home.unit_subcategories":              "subcategories",
		"home.results_ai_suffix":               "(AI semantic)",
		"home.matching_skills":                 "matching skills",
		"home.empty_results":                   "No skills found with current filters.",
		"home.pagination_page":                 "Page",
		"home.pagination_prev":                 "Previous",
		"home.pagination_next":                 "Next",
		"home.results_states_title":            "Results and Pipeline States",
		"home.snapshot_metrics":                "Skills",
		"home.quick_actions":                   "Quick Actions",
		"home.quick_action_browse":             "Browse categories",
		"home.quick_action_api":                "Open API docs",
		"home.quick_action_admin":              "Open admin",
		"home.quick_action_detail":             "Open detail",
		"home.quick_action_signin":             "Sign in to continue",
		"home.signal_index":                    "Public Skills Indexed",
		"home.signal_quality":                  "Query Quality",
		"home.signal_quality_note":             "Based on spotlight score",
		"home.deck_label":                      "Command Deck",
		"home.signal_quality_banner":           "96.4% query accuracy after tag normalization",
		"compare.title":                        "Skill Comparison Center",
		"compare.summary":                      "Evaluate top skills across quality, stars, and freshness.",
		"compare.top_candidates":               "Top Candidates",
		"compare.category_lens":                "Category Lens",
		"compare.working_set":                  "Working Set",
		"compare.head_note":                    "Marketplace / Compare / Decision",
		"compare.selection_set":                "Selection Set",
		"compare.feasibility":                  "Feasibility Matrix",
		"compare.feasibility_reliability":      "Reliability:",
		"compare.feasibility_diversity":        "Category diversity:",
		"compare.feasibility_velocity":         "Signal velocity:",
		"compare.feasibility_compatibility":    "Compatibility scope:",
		"compare.recommendation":               "Recommendation",
		"compare.primary_recommendation":       "Primary:",
		"compare.fallback_recommendation":      "Fallback:",
		"compare.rationale":                    "Rationale:",
		"compare.decision_actions":             "Decision Actions",
		"compare.action_choose":                "Promote selected skill",
		"compare.action_plan":                  "Plan fallback route",
		"compare.action_rollout":               "Open rollout workflow",
		"compare.findings":                     "Findings",
		"compare.finding_coverage":             "Coverage aligned with current operational scope",
		"compare.finding_stability":            "Stability baseline verified",
		"compare.finding_owner":                "Ownership review assigned",
		"compare.rollout_predictor":            "Rollout Predictor",
		"compare.predictor_success":            "Predicted success:",
		"compare.predictor_risk":               "Risk signal count:",
		"compare.predictor_window":             "Estimated impact window: 18 min",
		"rollout.title":                        "Install and Rollout Workflow",
		"rollout.summary":                      "From ingestion source to verified publish in a clear operational path.",
		"rollout.pipeline":                     "Pipeline Stages",
		"rollout.step_source":                  "Select source: manual, ZIP, repository, or SkillMP",
		"rollout.step_validate":                "Validate metadata, tags, and visibility policy",
		"rollout.step_publish":                 "Publish to marketplace and assign ownership",
		"rollout.step_observe":                 "Observe sync, audit, and quality drift",
		"rollout.actions":                      "Command Links",
		"rollout.action_ingestion":             "Open ingestion",
		"rollout.action_records":               "Open records",
		"rollout.action_sync":                  "Open sync jobs",
		"rollout.head_note":                    "Decision / Install / Verify / Release",
		"rollout.validation_title":             "Policy Validation",
		"rollout.publish_title":                "Publish Command",
		"rollout.observe_title":                "Observation Window",
		"rollout.status_approval_title":        "Approval Gate",
		"rollout.status_approval_body":         "Security reviewer: approved\nOps owner: approved\nChange ticket: CHG-1641",
		"rollout.status_rollback_title":        "Rollback Plan",
		"rollout.status_rollback_body":         "Auto rollback threshold: 2.5% error\nBase stability baseline: 24 h",
		"rollout.status_release_title":         "Release Summary",
		"rollout.status_release_body":          "Status: rollout 94%\nSuccess ratio: 96.7%\nNext audit: scheduled",
		"workspace.title":                      "Team Workspace",
		"workspace.summary":                    "Keep teams aligned on current skill inventory and operational links.",
		"workspace.recent":                     "Recent Skill Updates",
		"workspace.quick_links":                "Workspace Links",
		"workspace.kpi_installed":              "Installed Skills",
		"workspace.kpi_installed_note":         "active",
		"workspace.kpi_runs":                   "Automation Runs",
		"workspace.kpi_runs_note":              "today",
		"workspace.kpi_health":                 "Health Score",
		"workspace.kpi_health_note":            "quality baseline",
		"workspace.automation_queue":           "Automation Queue",
		"workspace.queue_pending":              "Queued:",
		"workspace.queue_running":              "Running:",
		"workspace.queue_risk":                 "Risk signals:",
		"workspace.alerts":                     "Alerts",
		"workspace.alert_one":                  "Verify connector health in all zones",
		"workspace.alert_two":                  "No critical drift reported",
		"workspace.alert_three":                "Sync queue remains stable",
		"workspace.quick_actions":              "Quick Actions",
		"workspace.action_compare":             "Open compare center",
		"workspace.action_rollout":             "Review rollout queue",
		"workspace.action_audit":               "View audit stream",
		"governance.title":                     "Governance Center",
		"governance.summary":                   "Control visibility, integration boundaries, and audit-backed accountability.",
		"governance.controls":                  "Governance Controls",
		"governance.control_visibility":        "Visibility policy and publication boundaries",
		"governance.control_sync":              "Sync ownership and repository trust",
		"governance.control_audit":             "Audit evidence and action traceability",
		"governance.control_access":            "Role access and token governance",
		"governance.entry_points":              "Entry Points",
		"governance.access":                    "Access Gateway",
		"governance.integrations":              "Integration Gateway",
		"governance.incidents":                 "Incident Gateway",
		"governance.audit":                     "Audit Logs",
		"governance.head_note":                 "Policy / Keyflow / Compliance / Incident",
		"governance.policy_engine":             "Policy Engine",
		"governance.audit_ledger":              "Audit Ledger",
		"governance.ledger_window":             "Recent review window:",
		"governance.ledger_scope":              "Coverage scope:",
		"governance.compliance_status":         "Compliance Status",
		"governance.status_policy":             "Policy conformance:",
		"governance.status_access":             "Access gates checked:",
		"governance.status_sync":               "Sync evidence tracked:",
		"governance.key_lifecycle":             "Key Lifecycle",
		"governance.lifecycle_active":          "Active keys:",
		"governance.lifecycle_expiring":        "Expiring in 7 days:",
		"governance.lifecycle_rotation":        "Rotation cadence:",
		"governance.lifecycle_rotation_window": "14 d",
		"governance.incident_response":         "Incident Response",
		"governance.response_capture":          "Capture recovery logs",
		"governance.response_review":           "Review escalation paths",
		"governance.response_drill":            "Run readiness drill",
		"governance.operational_controls":      "Operational Controls",
		"state.loading_title":                  "Loading in Progress",
		"state.loading_summary":                "The platform is still collecting data for this view.",
		"state.loading_nav":                    "State / Loading",
		"state.loading_hint":                   "System is processing your request",
		"state.empty_title":                    "No Data in Current Scope",
		"state.empty_summary":                  "No records match your current scope. Adjust filters or ingest new skills.",
		"state.empty_nav":                      "State / Empty Result",
		"state.empty_hint":                     "No skill matched your current filters",
		"state.error_title":                    "Service Error Detected",
		"state.error_summary":                  "The request failed. Retry now or return to marketplace.",
		"state.error_nav":                      "State / Error and Retry",
		"state.error_hint":                     "The last operation failed",
		"state.permission_title":               "Permission Denied",
		"state.permission_summary":             "Your current account role cannot access this page.",
		"state.permission_nav":                 "State / Permission Denied",
		"state.permission_hint":                "Insufficient role permissions",
		"state.action_retry":                   "Retry",
		"state.action_home":                    "Back to marketplace",
		"state.action_login":                   "Sign in",
		"state.action_reset":                   "Reset filters",
		"state.action_backup":                  "Use backup route",
		"state.action_request":                 "Request access",

		"admin.title":                              "Admin Console",
		"admin.subtitle":                           "Manage your skills, sync remote sources, and publish visibility in one place.",
		"admin.current_role":                       "Current role",
		"admin.nav.overview":                       "Overview",
		"admin.nav.access":                         "Access",
		"admin.nav.ingestion":                      "Ingestion",
		"admin.nav.records":                        "Records",
		"admin.nav.integrations":                   "Integrations",
		"admin.nav.incidents":                      "Incidents",
		"admin.nav.moderation":                     "Moderation",
		"admin.nav.apikeys":                        "API Keys",
		"admin.nav.ops":                            "Ops",
		"admin.nav.users":                          "Users",
		"admin.nav.audit":                          "Audit",
		"admin.access_title":                       "Access and Identity Gateway",
		"admin.access_summary":                     "Control account openness, role paths, and identity related guardrails.",
		"admin.access_registration":                "Registration Policy",
		"admin.access_registration_open":           "Public account creation is enabled.",
		"admin.access_registration_closed":         "Public account creation is disabled.",
		"admin.access_registration_toggle_label":   "Allow public registration",
		"admin.access_registration_update":         "Update policy",
		"admin.access_auth_providers_note":         "Choose which third-party providers are visible in login and registration pages.",
		"admin.access_auth_providers_update":       "Update login providers",
		"admin.access_role_matrix":                 "Role Matrix",
		"admin.incidents_title":                    "Incident Gateway",
		"admin.incidents_summary":                  "Track operational failures and recovery actions with audit context.",
		"admin.incidents_action_audit":             "Open audit logs",
		"admin.incidents_action_sync":              "Open sync records",
		"admin.incidents_action_simulate":          "Open error state",
		"admin.moderation_title":                   "Moderation Queue",
		"admin.moderation_summary":                 "Review reports for skills and comments, then resolve or reject with traceable actions.",
		"admin.moderation_filter_all":              "All",
		"admin.moderation_filter_open":             "Open",
		"admin.moderation_filter_resolved":         "Resolved",
		"admin.moderation_filter_rejected":         "Rejected",
		"admin.moderation_field_target":            "Target type",
		"admin.moderation_target_skill":            "Skill",
		"admin.moderation_target_comment":          "Comment",
		"admin.moderation_field_reason_code":       "Reason code",
		"admin.moderation_field_reason_detail":     "Reason detail",
		"admin.moderation_field_skill_id":          "Skill ID",
		"admin.moderation_field_comment_id":        "Comment ID",
		"admin.moderation_field_reporter_id":       "Reporter user ID",
		"admin.moderation_create":                  "Create case",
		"admin.moderation_table_case_id":           "Case",
		"admin.moderation_table_target":            "Target",
		"admin.moderation_table_skill":             "Skill",
		"admin.moderation_table_comment":           "Comment",
		"admin.moderation_table_reason":            "Reason",
		"admin.moderation_table_reporter":          "Reporter",
		"admin.moderation_table_status":            "Status",
		"admin.moderation_table_action":            "Action",
		"admin.moderation_table_resolver":          "Resolver",
		"admin.moderation_table_created":           "Created",
		"admin.moderation_action_none":             "No action",
		"admin.moderation_action_flagged":          "Flagged",
		"admin.moderation_action_hidden":           "Hidden",
		"admin.moderation_action_deleted":          "Deleted",
		"admin.moderation_resolution_note":         "Resolution note",
		"admin.moderation_rejection_note":          "Rejection note",
		"admin.moderation_resolve":                 "Resolve",
		"admin.moderation_reject":                  "Reject",
		"admin.moderation_empty":                   "No moderation cases found.",
		"admin.ingestion_title":                    "Skill Ingestion Workflow",
		"admin.ingestion_subtitle":                 "Choose one source, complete metadata once, and submit.",
		"admin.records_filter_keyword":             "Keyword",
		"admin.records_filter_keyword_placeholder": "Filter by name, owner, category",
		"admin.sync_repositories_now":              "Sync repositories now",
		"admin.sync_repositories_note":             "Run a manual repository batch sync. Scheduled sync keeps running in background.",
		"admin.sync_policy_title":                  "Repository Sync Policy",
		"admin.sync_policy_summary":                "Control scheduler behavior for repository synchronization.",
		"admin.sync_policy_enabled":                "Scheduler",
		"admin.sync_policy_enabled_on":             "Enabled",
		"admin.sync_policy_enabled_off":            "Disabled",
		"admin.sync_policy_interval":               "Interval",
		"admin.sync_policy_timeout":                "Timeout",
		"admin.sync_policy_batch_size":             "Batch size",
		"admin.sync_policy_update":                 "Update sync policy",
		"admin.sync_jobs_open_detail":              "View detail",
		"admin.sync_jobs_detail_title":             "Sync Job Detail",
		"admin.sync_jobs_detail_summary":           "Selected sync run",
		"admin.sync_jobs_detail_empty":             "Select one sync run from the table to inspect execution details.",
		"admin.records_filter_source":              "Source",
		"admin.records_filter_visibility":          "Visibility",
		"admin.filter_all":                         "All",
		"admin.users":                              "Account Management",
		"admin.audit_logs":                         "Audit Logs",
		"admin.table_owner":                        "Owner",
		"admin.table_role":                         "Role",
		"admin.table_created":                      "Created",
		"admin.table_time":                         "Time",
		"admin.table_actor":                        "Actor",
		"admin.table_action":                       "Action",
		"admin.table_target":                       "Target",
		"admin.table_summary":                      "Summary",
		"admin.table_details":                      "Details",
		"admin.action_save":                        "Save",
		"admin.action_sync":                        "Sync",
		"admin.action_history":                     "History",
		"admin.action_delete":                      "Delete",
		"admin.update_role":                        "Update role",
		"admin.action_update_role":                 "Update role",
		"admin.api_keys":                           "API Keys",
		"admin.api_keys_desc":                      "Create and revoke account-scoped keys for OpenAPI access.",
		"admin.api_key_name":                       "Key name",
		"admin.api_key_name_placeholder":           "CI / Integrations / Local script",
		"admin.api_key_expire_days":                "Expire in days (0 = never)",
		"admin.api_key_scopes":                     "Scopes",
		"admin.api_key_scopes_placeholder":         "skills.search.read,skills.ai_search.read",
		"admin.api_key_create":                     "Create API key",
		"admin.api_key_created":                    "This key is shown only once. Copy it now:",
		"admin.api_key_prefix":                     "Prefix",
		"admin.api_key_created_at":                 "Created at",
		"admin.api_key_last_used":                  "Last used",
		"admin.api_key_expires_at":                 "Expires at",
		"admin.api_key_status":                     "Status",
		"admin.api_key_status_all":                 "All",
		"admin.api_key_status_active":              "Active",
		"admin.api_key_status_revoked":             "Revoked",
		"admin.api_key_status_expired":             "Expired",
		"admin.api_key_filter_owner":               "Owner filter",
		"admin.api_key_filter_status":              "Status filter",
		"admin.api_key_filter_apply":               "Apply filter",
		"admin.api_key_rotate":                     "Rotate",
		"admin.api_key_revoke":                     "Revoke",
		"admin.api_key_empty":                      "No API keys yet.",
		"admin.confirm_delete_skill":               "Delete this skill? This action cannot be undone.",
		"admin.confirm_revoke_apikey":              "Revoke this API key?",
		"admin.confirm_rotate_apikey":              "Rotate this API key? The old token will stop working immediately.",
		"admin.confirm_update_role":                "Update this user role?",
		"detail.interaction":                       "Interaction",
		"detail.favorites":                         "Favorites",
		"detail.rating":                            "Rating",
		"detail.comments":                          "Comments",
		"detail.favorite_on":                       "Add to favorites",
		"detail.favorite_off":                      "Remove favorite",
		"detail.rate_submit":                       "Submit rating",
		"detail.comment_label":                     "Comment",
		"detail.comment_placeholder":               "Share practical feedback or implementation notes",
		"detail.comment_submit":                    "Post comment",
		"detail.comment_delete":                    "Delete comment",
		"detail.comment_empty":                     "No comments yet.",
		"detail.intelligence_title":                "Skill Intelligence View",
		"detail.head_note":                         "Marketplace / Recovery / Automation / Ops",
		"detail.skill_summary":                     "Skill Summary",
		"detail.signal_title":                      "Rating and Stability Signals",
		"detail.version_track":                     "Version Track",
		"detail.usage_snapshot":                    "Usage and Community Snapshot",
		"detail.install_release":                   "Install and Release",
		"detail.metadata":                          "Metadata",
		"detail.action_panel":                      "Action Panel",
		"detail.dependencies":                      "Dependencies and Compatibility",
		"detail.updated_at":                        "Updated",
		"detail.category":                          "Category",
		"detail.subcategory":                       "Subcategory",
		"detail.source":                            "Source",
		"detail.login_for_interaction":             "Sign in to favorite, rate, and comment.",
		"role.viewer":                              "Viewer",
		"role.member":                              "Member",
		"role.admin":                               "Admin",
		"role.super_admin":                         "Super Admin",
		"admin.empty_users":                        "No users found.",
		"admin.empty_audit_logs":                   "No audit records yet.",
		"dingtalk.title":                           "DingTalk Personal Authorization",
		"dingtalk.bound_external_id":               "Bound external identity",
		"dingtalk.expires_at":                      "Access token expires at",
		"dingtalk.action_authorize":                "Authorize DingTalk",
		"dingtalk.action_reauthorize":              "Re-authorize",
		"dingtalk.action_check_profile":            "Check /api/v1/dingtalk/me",
		"dingtalk.action_revoke":                   "Revoke authorization",
		"dingtalk.not_authorized":                  "No DingTalk personal authorization yet.",
		"dingtalk.not_configured":                  "DingTalk OAuth is not configured by administrator.",
	}
}

func (c translationCatalog) translate(locale string, key string) string {
	key = strings.TrimSpace(key)
	if key == "" {
		return ""
	}
	normalized := normalizeLocale(locale)
	if values, ok := c[normalized]; ok {
		if text, found := values[key]; found && strings.TrimSpace(text) != "" {
			return text
		}
	}
	if values, ok := c["en"]; ok {
		if text, found := values[key]; found && strings.TrimSpace(text) != "" {
			return text
		}
	}
	return key
}

func normalizeLocale(raw string) string {
	if locale, ok := parseLocale(raw); ok {
		return locale
	}
	return "en"
}

func parseLocale(raw string) (string, bool) {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "en":
		return "en", true
	case "zh":
		return "zh", true
	default:
		return "", false
	}
}

func resolveLocale(w http.ResponseWriter, r *http.Request) string {
	if locale, ok := parseLocale(r.URL.Query().Get("lang")); ok {
		http.SetCookie(w, &http.Cookie{
			Name:     "skillsindex_locale",
			Value:    locale,
			Path:     "/",
			MaxAge:   60 * 60 * 24 * 365,
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
		})
		return locale
	}

	if cookie, err := r.Cookie("skillsindex_locale"); err == nil {
		if locale, ok := parseLocale(cookie.Value); ok {
			return locale
		}
	}

	accept := strings.ToLower(r.Header.Get("Accept-Language"))
	if strings.HasPrefix(accept, "zh") || strings.Contains(accept, ",zh") {
		return "zh"
	}
	return "en"
}

func buildLocaleSwitchURL(r *http.Request, locale string) string {
	normalized := normalizeLocale(locale)
	query := r.URL.Query()
	query.Set("lang", normalized)
	values := query.Encode()
	if values == "" {
		return r.URL.Path
	}
	return r.URL.Path + "?" + values
}

func setLocaleOnTarget(target string, currentQuery url.Values, locale string) string {
	if strings.TrimSpace(target) == "" {
		target = "/"
	}

	values := make(url.Values, len(currentQuery)+1)
	for key, item := range currentQuery {
		values[key] = append([]string(nil), item...)
	}
	if normalized, ok := parseLocale(locale); ok {
		values.Set("lang", normalized)
	}
	encoded := values.Encode()
	if encoded == "" {
		return target
	}
	return target + "?" + encoded
}
