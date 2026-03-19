package web

import (
	"net/url"
	"testing"

	"skillsindex/internal/models"
)

func TestBuildMarketplacePageLinkPreservesFilters(t *testing.T) {
	values := baseMarketplaceQueryValues(
		"go api",
		"go,automation",
		"stars",
		"keyword",
		"development",
		"backend",
	)

	link := buildMarketplacePageLink("/", values, 2)
	parsed, err := url.Parse(link)
	if err != nil {
		t.Fatalf("failed to parse link: %v", err)
	}

	query := parsed.Query()
	assertQueryValue(t, query, "q", "go api")
	assertQueryValue(t, query, "tags", "go,automation")
	assertQueryValue(t, query, "sort", "stars")
	assertQueryValue(t, query, "mode", "keyword")
	assertQueryValue(t, query, "category", "development")
	assertQueryValue(t, query, "subcategory", "backend")
	assertQueryValue(t, query, "page", "2")
}

func TestNormalizeTimelineInterval(t *testing.T) {
	cases := []struct {
		name  string
		input string
		want  string
	}{
		{name: "day", input: "day", want: "day"},
		{name: "week", input: "week", want: "week"},
		{name: "month", input: "month", want: "month"},
		{name: "trim and lowercase", input: " MONTH ", want: "month"},
		{name: "fallback", input: "hour", want: "week"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got := normalizeTimelineInterval(tc.input)
			if got != tc.want {
				t.Fatalf("unexpected interval: got=%s want=%s", got, tc.want)
			}
		})
	}
}

func TestLocalizedAliasTarget(t *testing.T) {
	cases := []struct {
		name    string
		path    string
		want    string
		locale  string
		matched bool
	}{
		{name: "zh root", path: "/zh", want: "/", locale: "zh", matched: true},
		{name: "zh slash", path: "/zh/", want: "/", locale: "zh", matched: true},
		{name: "zh docs", path: "/zh/docs", want: "/docs", locale: "zh", matched: true},
		{name: "zh api docs", path: "/zh/docs/api", want: "/docs/api", locale: "zh", matched: true},
		{name: "skillsmp", path: "/skillsmp", want: "/", locale: "", matched: true},
		{name: "other path", path: "/about", want: "", locale: "", matched: false},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got, locale, ok := localizedAliasTarget(tc.path)
			if ok != tc.matched {
				t.Fatalf("unexpected match flag: got=%v want=%v", ok, tc.matched)
			}
			if got != tc.want {
				t.Fatalf("unexpected target: got=%s want=%s", got, tc.want)
			}
			if locale != tc.locale {
				t.Fatalf("unexpected locale: got=%s want=%s", locale, tc.locale)
			}
		})
	}
}

func TestNormalizeLocale(t *testing.T) {
	cases := []struct {
		name  string
		input string
		want  string
	}{
		{name: "english", input: "en", want: "en"},
		{name: "chinese", input: "zh", want: "zh"},
		{name: "uppercase", input: "ZH", want: "zh"},
		{name: "unsupported", input: "fr", want: "en"},
		{name: "empty", input: "", want: "en"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got := normalizeLocale(tc.input)
			if got != tc.want {
				t.Fatalf("unexpected locale: got=%s want=%s", got, tc.want)
			}
		})
	}
}

func TestParseRoleValue(t *testing.T) {
	cases := []struct {
		name    string
		input   string
		want    models.UserRole
		matched bool
	}{
		{name: "viewer", input: "viewer", want: models.RoleViewer, matched: true},
		{name: "member", input: "member", want: models.RoleMember, matched: true},
		{name: "admin", input: "admin", want: models.RoleAdmin, matched: true},
		{name: "super admin", input: "super_admin", want: models.RoleSuperAdmin, matched: true},
		{name: "invalid", input: "owner", want: "", matched: false},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got, ok := parseRoleValue(tc.input)
			if ok != tc.matched {
				t.Fatalf("unexpected matched flag: got=%v want=%v", ok, tc.matched)
			}
			if got != tc.want {
				t.Fatalf("unexpected role: got=%s want=%s", got, tc.want)
			}
		})
	}
}

func TestParseOrganizationRoleValue(t *testing.T) {
	cases := []struct {
		name    string
		input   string
		want    models.OrganizationRole
		matched bool
	}{
		{name: "owner", input: "owner", want: models.OrganizationRoleOwner, matched: true},
		{name: "admin", input: "admin", want: models.OrganizationRoleAdmin, matched: true},
		{name: "member", input: "member", want: models.OrganizationRoleMember, matched: true},
		{name: "viewer", input: "viewer", want: models.OrganizationRoleViewer, matched: true},
		{name: "invalid", input: "manager", want: "", matched: false},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got, ok := parseOrganizationRoleValue(tc.input)
			if ok != tc.matched {
				t.Fatalf("unexpected matched flag: got=%v want=%v", ok, tc.matched)
			}
			if got != tc.want {
				t.Fatalf("unexpected role: got=%s want=%s", got, tc.want)
			}
		})
	}
}

func TestNormalizeModerationListStatus(t *testing.T) {
	cases := []struct {
		name  string
		input string
		want  string
	}{
		{name: "all fallback", input: "", want: "all"},
		{name: "open", input: "open", want: "open"},
		{name: "resolved", input: "resolved", want: "resolved"},
		{name: "rejected", input: "rejected", want: "rejected"},
		{name: "trim and lowercase", input: " ReJeCtEd ", want: "rejected"},
		{name: "invalid fallback", input: "queued", want: "all"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got := normalizeModerationListStatus(tc.input)
			if got != tc.want {
				t.Fatalf("unexpected moderation list status: got=%s want=%s", got, tc.want)
			}
		})
	}
}

func TestAdminPageHelpers(t *testing.T) {
	if got := normalizeAdminSection(" INGESTION "); got != "ingestion" {
		t.Fatalf("unexpected normalized section: got=%s want=ingestion", got)
	}
	if got := normalizeAdminSection("accounts"); got != "access" {
		t.Fatalf("unexpected normalized section for accounts: got=%s want=access", got)
	}
	if got := normalizeAdminSection("incidents"); got != "incidents" {
		t.Fatalf("unexpected normalized section for incidents: got=%s want=incidents", got)
	}
	if got := normalizeAdminSection("moderation"); got != "moderation" {
		t.Fatalf("unexpected normalized section for moderation: got=%s want=moderation", got)
	}
	if got := normalizeAdminSection("ops"); got != "ops" {
		t.Fatalf("unexpected normalized section for ops: got=%s want=ops", got)
	}
	if got := adminPageName("records"); got != "admin_records" {
		t.Fatalf("unexpected admin page name: got=%s want=admin_records", got)
	}
	if got := adminPageName("unknown"); got != "admin_overview" {
		t.Fatalf("unexpected fallback admin page name: got=%s want=admin_overview", got)
	}
	if !isAdminPage("admin_overview") {
		t.Fatalf("expected admin_overview to be recognized as admin page")
	}
	if !isAdminPage("admin") {
		t.Fatalf("expected admin to be recognized as admin page")
	}
	if isAdminPage("home") {
		t.Fatalf("expected home to not be recognized as admin page")
	}
	if got := bodyClass("admin_audit"); got != "page-admin" {
		t.Fatalf("unexpected admin body class: got=%s want=page-admin", got)
	}
	if got := bodyClass("timeline"); got != "page-home page-timeline" {
		t.Fatalf("unexpected timeline body class: got=%s want=page-home page-timeline", got)
	}
	if got := bodyClass("docs"); got != "page-home page-docs" {
		t.Fatalf("unexpected docs body class: got=%s want=page-home page-docs", got)
	}
	if got := bodyClass("compare"); got != "page-home page-compare" {
		t.Fatalf("unexpected compare body class: got=%s want=page-home page-compare", got)
	}
	if got := bodyClass("detail"); got != "page-home page-detail" {
		t.Fatalf("unexpected detail body class: got=%s want=page-home page-detail", got)
	}
	if got := bodyClass("prototype_auth"); got != "page-home page-prototype_auth" {
		t.Fatalf("unexpected prototype body class: got=%s want=page-home page-prototype_auth", got)
	}
	if got := bodyClass("login_light"); got != "page-login page-login-light" {
		t.Fatalf("unexpected light login body class: got=%s want=page-login page-login-light", got)
	}
	if got := bodyClass("login_mobile"); got != "page-login page-login-mobile" {
		t.Fatalf("unexpected mobile login body class: got=%s want=page-login page-login-mobile", got)
	}
	if got := bodyClass("login_mobile_light"); got != "page-login page-login-mobile page-login-light" {
		t.Fatalf("unexpected mobile light login body class: got=%s want=page-login page-login-mobile page-login-light", got)
	}
	if got := bodyClass("register_light"); got != "page-register page-login-light" {
		t.Fatalf("unexpected light register body class: got=%s want=page-register page-login-light", got)
	}
	if got := bodyClass("register_mobile"); got != "page-register page-login-mobile" {
		t.Fatalf("unexpected mobile register body class: got=%s want=page-register page-login-mobile", got)
	}
	if got := bodyClass("register_mobile_light"); got != "page-register page-login-mobile page-login-light" {
		t.Fatalf("unexpected mobile light register body class: got=%s want=page-register page-login-mobile page-login-light", got)
	}
	if got := bodyClass("password_reset_request_light"); got != "page-login page-login-light" {
		t.Fatalf("unexpected light reset-request body class: got=%s want=page-login page-login-light", got)
	}
	if got := bodyClass("password_reset_confirm_mobile"); got != "page-login page-login-mobile" {
		t.Fatalf("unexpected mobile reset-confirm body class: got=%s want=page-login page-login-mobile", got)
	}
}
