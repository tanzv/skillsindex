package web

import (
	"bytes"
	"strings"
	"testing"
)

func templateAuthProviders(dingTalkEnabled bool) []AuthProviderOption {
	dingtalkURL := ""
	if dingTalkEnabled {
		dingtalkURL = "/auth/dingtalk/start"
	}
	return []AuthProviderOption{
		{
			Key:       "dingtalk",
			LabelKey:  "auth.sign_in_dingtalk",
			IconPath:  "/static/icons/auth/dingtalk.svg",
			URL:       dingtalkURL,
			Enabled:   true,
			Available: dingTalkEnabled,
		},
		{
			Key:       "github",
			LabelKey:  "auth.sign_in_github",
			IconPath:  "/static/icons/auth/github.svg",
			Enabled:   true,
			Available: false,
		},
		{
			Key:       "google",
			LabelKey:  "auth.sign_in_google",
			IconPath:  "/static/icons/auth/google.svg",
			Enabled:   true,
			Available: false,
		},
		{
			Key:       "wecom",
			LabelKey:  "auth.sign_in_wecom",
			IconPath:  "/static/icons/auth/wecom.svg",
			Enabled:   true,
			Available: false,
		},
		{
			Key:       "microsoft",
			LabelKey:  "auth.sign_in_microsoft",
			IconPath:  "/static/icons/auth/microsoft.svg",
			Enabled:   true,
			Available: false,
		},
	}
}

func TestLayoutTemplateRendersDarkHomeMarkers(t *testing.T) {
	tmpl := mustParseLayoutTemplate(t)

	var out bytes.Buffer
	if err := tmpl.ExecuteTemplate(&out, "layout", ViewData{
		Page:              "home",
		Title:             "Skill Marketplace",
		Locale:            "en",
		AllowRegistration: true,
	}); err != nil {
		t.Fatalf("execute home template failed: %v", err)
	}

	body := out.String()
	required := []string{
		`<body class="page-home">`,
		`class="container home-topbar"`,
		`class="home-prototype"`,
		`class="home-prototype-hero"`,
		`class="home-prototype-search-form"`,
		`class="home-prototype-results-list"`,
		`id="home-search-panel"`,
	}
	for _, marker := range required {
		if !strings.Contains(body, marker) {
			t.Fatalf("home template missing marker: %s", marker)
		}
	}
}

func TestLayoutTemplateRendersModernLoginMarkers(t *testing.T) {
	tmpl := mustParseLayoutTemplate(t)

	var out bytes.Buffer
	if err := tmpl.ExecuteTemplate(&out, "layout", ViewData{
		Page:               "login",
		Title:              "Sign In",
		Locale:             "en",
		CSRFToken:          "csrf_demo",
		AllowRegistration:  true,
		AuthProviders:      templateAuthProviders(true),
		AuthProviderCount:  5,
		AuthProviderActive: 1,
	}); err != nil {
		t.Fatalf("execute login template failed: %v", err)
	}

	body := out.String()
	required := []string{
		`<body class="page-login">`,
		`class="auth-layout"`,
		`auth-visual-panel`,
		`auth-form-panel`,
		`Internal skill asset and release governance platform.`,
		`name="csrf_token" value="csrf_demo"`,
	}
	for _, marker := range required {
		if !strings.Contains(body, marker) {
			t.Fatalf("login template missing marker: %s", marker)
		}
	}
}

func TestLayoutTemplateRendersLightLoginVariant(t *testing.T) {
	tmpl := mustParseLayoutTemplate(t)

	var out bytes.Buffer
	if err := tmpl.ExecuteTemplate(&out, "layout", ViewData{
		Page:               "login_light",
		Title:              "Sign In",
		Locale:             "en",
		CSRFToken:          "csrf_demo",
		AllowRegistration:  true,
		AuthProviders:      templateAuthProviders(true),
		AuthProviderCount:  5,
		AuthProviderActive: 1,
	}); err != nil {
		t.Fatalf("execute light login template failed: %v", err)
	}

	body := out.String()
	required := []string{
		`<body class="page-login page-login-light">`,
		`class="auth-header"`,
		`class="auth-layout"`,
		`action="/light/login"`,
	}
	for _, marker := range required {
		if !strings.Contains(body, marker) {
			t.Fatalf("light login template missing marker: %s", marker)
		}
	}
}

func TestLayoutTemplateRendersMobileLightLoginVariant(t *testing.T) {
	tmpl := mustParseLayoutTemplate(t)

	var out bytes.Buffer
	if err := tmpl.ExecuteTemplate(&out, "layout", ViewData{
		Page:               "login_mobile_light",
		Title:              "Sign In",
		Locale:             "en",
		CSRFToken:          "csrf_demo",
		AllowRegistration:  true,
		AuthProviders:      templateAuthProviders(true),
		AuthProviderCount:  5,
		AuthProviderActive: 1,
	}); err != nil {
		t.Fatalf("execute mobile light login template failed: %v", err)
	}

	body := out.String()
	required := []string{
		`<body class="page-login page-login-mobile page-login-light">`,
		`class="container auth-topbar"`,
		`class="auth-layout"`,
		`action="/mobile/light/login"`,
	}
	for _, marker := range required {
		if !strings.Contains(body, marker) {
			t.Fatalf("mobile light login template missing marker: %s", marker)
		}
	}
}

func TestLayoutTemplateRendersLoginThirdPartyAuthWhenDingTalkEnabled(t *testing.T) {
	tmpl := mustParseLayoutTemplate(t)

	var out bytes.Buffer
	if err := tmpl.ExecuteTemplate(&out, "layout", ViewData{
		Page:               "login",
		Title:              "Sign In",
		Locale:             "en",
		CSRFToken:          "csrf_demo",
		AllowRegistration:  true,
		DingTalkEnabled:    true,
		AuthProviders:      templateAuthProviders(true),
		AuthProviderCount:  5,
		AuthProviderActive: 1,
	}); err != nil {
		t.Fatalf("execute login template failed: %v", err)
	}

	body := out.String()
	required := []string{
		`data-auth-third-party="true"`,
		`href="/auth/dingtalk/start" data-provider="dingtalk"`,
		`class="auth-provider-circle-row"`,
		`data-provider="github"`,
		`data-provider="google"`,
		`data-provider="more"`,
		`+2`,
		`/static/icons/auth/github.svg`,
	}
	for _, marker := range required {
		if !strings.Contains(body, marker) {
			t.Fatalf("login third-party template missing marker: %s", marker)
		}
	}
}

func TestLayoutTemplateRendersLoginThirdPartyAuthFallbackWhenDingTalkDisabled(t *testing.T) {
	tmpl := mustParseLayoutTemplate(t)

	var out bytes.Buffer
	if err := tmpl.ExecuteTemplate(&out, "layout", ViewData{
		Page:               "login",
		Title:              "Sign In",
		Locale:             "en",
		CSRFToken:          "csrf_demo",
		AllowRegistration:  true,
		DingTalkEnabled:    false,
		AuthProviders:      templateAuthProviders(false),
		AuthProviderCount:  5,
		AuthProviderActive: 0,
	}); err != nil {
		t.Fatalf("execute login template failed: %v", err)
	}

	body := out.String()
	required := []string{
		`data-auth-third-party="true"`,
		`class="auth-provider-circle is-disabled is-primary" data-provider="dingtalk" disabled`,
		`Ask your administrator to configure enabled providers and OAuth endpoints.`,
	}
	for _, marker := range required {
		if !strings.Contains(body, marker) {
			t.Fatalf("login third-party fallback missing marker: %s", marker)
		}
	}
	if strings.Contains(body, `href="/auth/dingtalk/start" data-provider="dingtalk"`) {
		t.Fatalf("login third-party fallback should not expose active DingTalk link")
	}
}

func TestLayoutTemplateRendersRegisterThirdPartyAuthSection(t *testing.T) {
	tmpl := mustParseLayoutTemplate(t)

	var out bytes.Buffer
	if err := tmpl.ExecuteTemplate(&out, "layout", ViewData{
		Page:               "register",
		Title:              "Create Account",
		Locale:             "en",
		CSRFToken:          "csrf_demo",
		DingTalkEnabled:    false,
		AuthProviders:      templateAuthProviders(false),
		AuthProviderCount:  5,
		AuthProviderActive: 0,
	}); err != nil {
		t.Fatalf("execute register template failed: %v", err)
	}

	body := out.String()
	required := []string{
		`<body class="page-register">`,
		`data-auth-third-party="true"`,
		`data-provider="dingtalk"`,
		`data-provider="github"`,
		`data-provider="google"`,
		`data-provider="more"`,
	}
	for _, marker := range required {
		if !strings.Contains(body, marker) {
			t.Fatalf("register third-party template missing marker: %s", marker)
		}
	}
}

func TestLayoutTemplateRendersLightRegisterVariant(t *testing.T) {
	tmpl := mustParseLayoutTemplate(t)

	var out bytes.Buffer
	if err := tmpl.ExecuteTemplate(&out, "layout", ViewData{
		Page:               "register_light",
		Title:              "Create Account",
		Locale:             "en",
		CSRFToken:          "csrf_demo",
		AuthProviders:      templateAuthProviders(false),
		AuthProviderCount:  5,
		AuthProviderActive: 0,
	}); err != nil {
		t.Fatalf("execute light register template failed: %v", err)
	}

	body := out.String()
	required := []string{
		`<body class="page-register page-login-light">`,
		`action="/light/register"`,
		`href="/light/login"`,
	}
	for _, marker := range required {
		if !strings.Contains(body, marker) {
			t.Fatalf("light register template missing marker: %s", marker)
		}
	}
}

func TestLayoutTemplateRendersMobileLightPasswordResetRequestVariant(t *testing.T) {
	tmpl := mustParseLayoutTemplate(t)

	var out bytes.Buffer
	if err := tmpl.ExecuteTemplate(&out, "layout", ViewData{
		Page:      "password_reset_request_mobile_light",
		Title:     "Request Password Reset",
		Locale:    "en",
		CSRFToken: "csrf_demo",
	}); err != nil {
		t.Fatalf("execute mobile light password reset request template failed: %v", err)
	}

	body := out.String()
	required := []string{
		`<body class="page-login page-login-mobile page-login-light">`,
		`action="/mobile/light/account/password-reset/request"`,
		`href="/mobile/light/account/password-reset/confirm"`,
		`href="/mobile/light/login"`,
	}
	for _, marker := range required {
		if !strings.Contains(body, marker) {
			t.Fatalf("mobile light reset request template missing marker: %s", marker)
		}
	}
}

func TestLayoutTemplateRendersLightPasswordResetConfirmVariant(t *testing.T) {
	tmpl := mustParseLayoutTemplate(t)

	var out bytes.Buffer
	if err := tmpl.ExecuteTemplate(&out, "layout", ViewData{
		Page:               "password_reset_confirm_light",
		Title:              "Reset Password",
		Locale:             "en",
		CSRFToken:          "csrf_demo",
		PasswordResetToken: "reset_token",
	}); err != nil {
		t.Fatalf("execute light password reset confirm template failed: %v", err)
	}

	body := out.String()
	required := []string{
		`<body class="page-login page-login-light">`,
		`action="/light/account/password-reset/confirm"`,
		`value="reset_token"`,
		`href="/light/account/password-reset/request"`,
		`href="/light/login"`,
	}
	for _, marker := range required {
		if !strings.Contains(body, marker) {
			t.Fatalf("light reset confirm template missing marker: %s", marker)
		}
	}
}

func TestLayoutTemplateRendersAuthPrototypePage(t *testing.T) {
	tmpl := mustParseLayoutTemplate(t)

	var out bytes.Buffer
	if err := tmpl.ExecuteTemplate(&out, "layout", ViewData{
		Page:   "prototype_auth",
		Title:  "Auth and DingTalk OAuth Prototype",
		Locale: "en",
	}); err != nil {
		t.Fatalf("execute auth prototype template failed: %v", err)
	}

	body := out.String()
	required := []string{
		`<body class="page-home page-prototype_auth">`,
		`id="prototype-auth"`,
		`Auth and DingTalk OAuth Prototype`,
		`Node IDs: Z0Xx0 (dark), 4M0zx (light)`,
		`href="/login"`,
		`href="/register"`,
		`href="/auth/dingtalk/start"`,
	}
	for _, marker := range required {
		if !strings.Contains(body, marker) {
			t.Fatalf("auth prototype template missing marker: %s", marker)
		}
	}
}
