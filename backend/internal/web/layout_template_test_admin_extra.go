package web

import (
	"bytes"
	"strings"
	"testing"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func TestLayoutTemplateRendersCompareScenario(t *testing.T) {
	tmpl := mustParseLayoutTemplate(t)

	var out bytes.Buffer
	if err := tmpl.ExecuteTemplate(&out, "layout", ViewData{
		Page:   "compare",
		Title:  "Skill Comparison Center",
		Locale: "en",
	}); err != nil {
		t.Fatalf("execute compare template failed: %v", err)
	}

	body := out.String()
	required := []string{
		`<body class="page-home page-compare">`,
		`matrix-shell compare-matrix-shell`,
		`Skill Comparison Center`,
		`matrix-grid`,
	}
	for _, marker := range required {
		if !strings.Contains(body, marker) {
			t.Fatalf("compare template missing marker: %s", marker)
		}
	}
}

func TestLayoutTemplateRendersSkillVersionDetailDiffFields(t *testing.T) {
	tmpl := mustParseLayoutTemplate(t)
	now := time.Date(2026, time.February, 25, 10, 0, 0, 0, time.UTC)

	var out bytes.Buffer
	if err := tmpl.ExecuteTemplate(&out, "layout", ViewData{
		Page:      "skill_version_detail",
		Title:     "Skill Version Detail",
		Locale:    "en",
		CSRFToken: "csrf_demo",
		Skill: &models.Skill{
			ID:   9,
			Name: "Versioned Skill",
		},
		SkillVersions: []models.SkillVersion{
			{
				ID:            22,
				VersionNumber: 2,
			},
		},
		SkillVersionDetail: &models.SkillVersion{
			ID:                22,
			VersionNumber:     2,
			Trigger:           "sync",
			Name:              "Versioned Skill V2",
			Description:       "Description V2",
			Content:           "content-v2",
			CapturedAt:        now,
			TagsJSON:          `["alpha","beta"]`,
			ChangedFieldsJSON: `["name","content","tags"]`,
			BeforeDigest:      "before_digest_demo",
			AfterDigest:       "after_digest_demo",
			ChangeSummary:     "Changed 3 fields: name, content, tags. Risk level: medium",
			RiskLevel:         "medium",
		},
	}); err != nil {
		t.Fatalf("execute skill version detail template failed: %v", err)
	}

	body := out.String()
	required := []string{
		`id="skill-version-detail"`,
		`Change Summary`,
		`Risk Level`,
		`Before Digest`,
		`After Digest`,
		`Changed Fields JSON`,
		`before_digest_demo`,
		`after_digest_demo`,
		`[&#34;name&#34;,&#34;content&#34;,&#34;tags&#34;]`,
	}
	for _, marker := range required {
		if !strings.Contains(body, marker) {
			t.Fatalf("skill version detail template missing marker: %s", marker)
		}
	}
}

func TestLayoutTemplateRendersRolloutPrototypeLayout(t *testing.T) {
	tmpl := mustParseLayoutTemplate(t)

	var out bytes.Buffer
	if err := tmpl.ExecuteTemplate(&out, "layout", ViewData{
		Page:   "rollout",
		Title:  "Install and Rollout Workflow",
		Locale: "en",
	}); err != nil {
		t.Fatalf("execute rollout template failed: %v", err)
	}

	body := out.String()
	required := []string{
		`<body class="page-home page-rollout">`,
		`rollout-shell`,
		`rollout-grid`,
		`rollout-step-card`,
		`rollout-status-card rollout-status-card-highlight`,
		`Decision / Install / Verify / Release`,
	}
	for _, marker := range required {
		if !strings.Contains(body, marker) {
			t.Fatalf("rollout template missing marker: %s", marker)
		}
	}
}

func TestLayoutTemplateRendersAdminSubpageWithAdminBodyClass(t *testing.T) {
	tmpl := mustParseLayoutTemplate(t)

	adminUser := models.User{Role: models.RoleAdmin}
	var out bytes.Buffer
	if err := tmpl.ExecuteTemplate(&out, "layout", ViewData{
		Page:         "admin_records",
		Title:        "Admin Console",
		Locale:       "en",
		CurrentUser:  &adminUser,
		AdminSection: "records",
	}); err != nil {
		t.Fatalf("execute admin subpage template failed: %v", err)
	}

	body := out.String()
	required := []string{
		`<body class="page-admin">`,
		`class="admin-header"`,
		`class="admin-nav-link is-active" href="/admin/records"`,
		`id="admin-records"`,
		`href="/admin/records"`,
	}
	for _, marker := range required {
		if !strings.Contains(body, marker) {
			t.Fatalf("admin subpage template missing marker: %s", marker)
		}
	}
	if strings.Contains(body, `aria-label="Primary navigation"`) {
		t.Fatalf("admin subpage should not render primary site navigation")
	}
}

func TestLayoutTemplateRendersAdminIngestionPrototypeSubnav(t *testing.T) {
	tmpl := mustParseLayoutTemplate(t)

	adminUser := models.User{Role: models.RoleAdmin}
	var out bytes.Buffer
	if err := tmpl.ExecuteTemplate(&out, "layout", ViewData{
		Page:                 "admin_ingestion",
		Title:                "Admin Console",
		Locale:               "en",
		CurrentUser:          &adminUser,
		AdminSection:         "ingestion",
		AdminIngestionSource: "repository",
	}); err != nil {
		t.Fatalf("execute admin ingestion template failed: %v", err)
	}

	body := out.String()
	required := []string{
		`href="/admin/ingestion/repository"`,
		`class="admin-subnav-link is-active" href="/admin/ingestion/repository"`,
		`data-source-target="repo"`,
	}
	for _, marker := range required {
		if !strings.Contains(body, marker) {
			t.Fatalf("admin ingestion template missing marker: %s", marker)
		}
	}
}

func TestLayoutTemplateRendersAdminWorkspaceNavigation(t *testing.T) {
	tmpl := mustParseLayoutTemplate(t)

	adminUser := models.User{Role: models.RoleAdmin}
	var out bytes.Buffer
	if err := tmpl.ExecuteTemplate(&out, "layout", ViewData{
		Page:                "admin_overview",
		Title:               "Admin Console",
		Locale:              "en",
		CurrentUser:         &adminUser,
		AdminSection:        "overview",
		AdminCanManageUsers: true,
	}); err != nil {
		t.Fatalf("execute admin overview template failed: %v", err)
	}

	body := out.String()
	required := []string{
		`class="admin-header"`,
		`class="admin-shell"`,
		`class="admin-nav-link is-active" href="/admin"`,
		`href="/admin/ingestion"`,
		`class="admin-content-stack"`,
		`aria-label="Admin workspace navigation"`,
	}
	for _, marker := range required {
		if !strings.Contains(body, marker) {
			t.Fatalf("admin workspace missing marker: %s", marker)
		}
	}
}

func TestLayoutTemplateRendersAdminOpsMetricsWorkbench(t *testing.T) {
	tmpl := mustParseLayoutTemplate(t)
	adminUser := models.User{Role: models.RoleAdmin}
	now := time.Date(2026, time.February, 25, 11, 30, 0, 0, time.UTC)

	var out bytes.Buffer
	if err := tmpl.ExecuteTemplate(&out, "layout", ViewData{
		Page:         "admin_ops",
		Title:        "Admin Console",
		Locale:       "en",
		CurrentUser:  &adminUser,
		AdminSection: "ops",
		AdminOpsMode: "metrics",
		AdminOpsMetrics: services.OpsMetrics{
			GeneratedAt:           now,
			RequestQPS:            37.24,
			LatencyP50Ms:          95.12,
			LatencyP95Ms:          262.56,
			LatencyP99Ms:          488.74,
			ErrorRate4xx:          1.31,
			ErrorRate5xx:          0.22,
			SyncSuccessRate:       97.44,
			AuditWriteFailureRate: 0.41,
			TotalAuditLogs24h:     1821,
			TotalSyncRuns24h:      127,
			FailedSyncRuns24h:     3,
			RetentionDays:         90,
		},
	}); err != nil {
		t.Fatalf("execute admin ops metrics template failed: %v", err)
	}

	body := out.String()
	required := []string{
		`class="admin-subnav admin-subnav-ops"`,
		`class="admin-ops-shell admin-ops-shell-metrics"`,
		`class="admin-ops-kpi-grid"`,
		`class="admin-ops-signal-grid"`,
		`Sync failure count`,
		`37.24`,
		`97.44%`,
	}
	for _, marker := range required {
		if !strings.Contains(body, marker) {
			t.Fatalf("admin ops metrics template missing marker: %s", marker)
		}
	}
}

func TestLayoutTemplateRendersAdminModerationSection(t *testing.T) {
	tmpl := mustParseLayoutTemplate(t)

	adminUser := models.User{Role: models.RoleSuperAdmin}
	var out bytes.Buffer
	if err := tmpl.ExecuteTemplate(&out, "layout", ViewData{
		Page:                  "admin_moderation",
		Title:                 "Admin Console",
		Locale:                "en",
		CurrentUser:           &adminUser,
		AdminSection:          "moderation",
		AdminModerationStatus: "open",
	}); err != nil {
		t.Fatalf("execute admin moderation template failed: %v", err)
	}

	body := out.String()
	required := []string{
		`id="admin-moderation"`,
		`href="/admin/moderation"`,
		`Moderation Queue`,
		`name="target_type"`,
	}
	for _, marker := range required {
		if !strings.Contains(body, marker) {
			t.Fatalf("admin moderation template missing marker: %s", marker)
		}
	}
}
