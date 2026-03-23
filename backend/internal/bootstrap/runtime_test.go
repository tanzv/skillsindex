package bootstrap

import (
	"bytes"
	"log"
	"net"
	"strings"
	"testing"

	"skillsindex/internal/config"
)

func TestNormalizeAPIConfigSetsDefaults(t *testing.T) {
	cfg := config.Config{
		AppEnv: "development",
	}

	normalized := NormalizeRuntimeConfig(cfg, RunOptions{})

	if normalized.APIOnly {
		t.Fatalf("expected APIOnly to keep configured value when not forced")
	}
	if len(normalized.CORSAllowedOrigins) != 1 {
		t.Fatalf("expected exactly one default cors origin, got %d", len(normalized.CORSAllowedOrigins))
	}
	if normalized.CORSAllowedOrigins[0] != "http://localhost:5173" {
		t.Fatalf("unexpected default cors origin: %s", normalized.CORSAllowedOrigins[0])
	}
}

func TestNormalizeAPIConfigPreservesConfiguredOrigins(t *testing.T) {
	cfg := config.Config{
		AppEnv:             "development",
		CORSAllowedOrigins: []string{"https://app.example.com"},
	}

	normalized := NormalizeRuntimeConfig(cfg, RunOptions{})

	if len(normalized.CORSAllowedOrigins) != 1 {
		t.Fatalf("expected configured cors origins to be preserved")
	}
	if normalized.CORSAllowedOrigins[0] != "https://app.example.com" {
		t.Fatalf("unexpected configured cors origin: %s", normalized.CORSAllowedOrigins[0])
	}
}

func TestNormalizeRuntimeConfigForcesAPIOnlyForAPICommand(t *testing.T) {
	cfg := config.Config{
		AppEnv:  "development",
		APIOnly: false,
	}

	normalized := NormalizeRuntimeConfig(cfg, RunOptions{ForceAPIOnly: true})

	if !normalized.APIOnly {
		t.Fatalf("expected APIOnly to be true when forced")
	}
}

func TestNormalizeRuntimeConfigSkipsDefaultCORSInProduction(t *testing.T) {
	cfg := config.Config{
		AppEnv: "production",
	}

	normalized := NormalizeRuntimeConfig(cfg, RunOptions{})

	if len(normalized.CORSAllowedOrigins) != 0 {
		t.Fatalf("expected no implicit cors origin in production")
	}
}

func TestValidateSecurityDefaultsRejectsProductionDefaultSessionSecret(t *testing.T) {
	cfg := config.Config{
		AppEnv:        "production",
		SessionSecret: "change-me-in-production",
		AdminPassword: "custom-strong-password",
	}

	err := ValidateSecurityDefaults(cfg)
	if err == nil {
		t.Fatalf("expected session secret validation error")
	}
	if !strings.Contains(err.Error(), "SESSION_SECRET") {
		t.Fatalf("expected session secret error message, got %v", err)
	}
}

func TestValidateSecurityDefaultsRejectsProductionDefaultAdminPassword(t *testing.T) {
	cfg := config.Config{
		AppEnv:        "production",
		SessionSecret: "custom-session-secret",
		AdminPassword: "Admin123456!",
	}

	err := ValidateSecurityDefaults(cfg)
	if err == nil {
		t.Fatalf("expected admin password validation error")
	}
	if !strings.Contains(err.Error(), "ADMIN_PASSWORD") {
		t.Fatalf("expected admin password error message, got %v", err)
	}
}

func TestValidateSecurityDefaultsAllowsDevelopmentDefaults(t *testing.T) {
	cfg := config.Config{
		AppEnv:        "development",
		SessionSecret: "change-me-in-production",
		AdminPassword: "Admin123456!",
	}

	if err := ValidateSecurityDefaults(cfg); err != nil {
		t.Fatalf("expected defaults to be allowed in development, got %v", err)
	}
}

func TestLogAPIKeyWarningWhenUnset(t *testing.T) {
	var output bytes.Buffer
	logger := log.New(&output, "", 0)

	LogAPIKeyWarning(logger, config.Config{})

	if !strings.Contains(output.String(), "API_KEYS is empty") {
		t.Fatalf("expected missing api key warning to be logged")
	}
}

func TestLogAPIKeyWarningSkipsWhenConfigured(t *testing.T) {
	var output bytes.Buffer
	logger := log.New(&output, "", 0)

	LogAPIKeyWarning(logger, config.Config{APIKeys: []string{"k1"}})

	if output.Len() != 0 {
		t.Fatalf("expected no warning log when api keys are configured")
	}
}

func TestResolveTemplateGlobUsesWebTemplatesWhenNotAPIOnly(t *testing.T) {
	got := resolveTemplateGlob(false)

	if got != "web/templates/*.tmpl" {
		t.Fatalf("unexpected template glob: %s", got)
	}
}

func TestResolveTemplateGlobSkipsTemplatesInAPIOnlyMode(t *testing.T) {
	got := resolveTemplateGlob(true)

	if got != "" {
		t.Fatalf("expected empty template glob in api-only mode, got %s", got)
	}
}

func TestBuildStartupURLUsesAssignedPortForWildcardListener(t *testing.T) {
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("failed to allocate listener: %v", err)
	}
	defer listener.Close()

	got := buildStartupURL(listener)
	if !strings.HasPrefix(got, "http://127.0.0.1:") {
		t.Fatalf("unexpected startup url: %s", got)
	}
	if strings.HasSuffix(got, ":0") {
		t.Fatalf("startup url should use assigned port, got %s", got)
	}
}

func TestResolveStateInitializationOptionsDefaultsToAllEnabled(t *testing.T) {
	got := resolveStateInitializationOptions(nil)

	if !got.SeedData {
		t.Fatalf("expected SeedData to default to true")
	}
	if !got.DefaultAccount {
		t.Fatalf("expected DefaultAccount to default to true")
	}
	if !got.RegistrationSetting {
		t.Fatalf("expected RegistrationSetting to default to true")
	}
	if !got.RepositorySyncPolicy {
		t.Fatalf("expected RepositorySyncPolicy to default to true")
	}
	if !got.RepositorySyncMirror {
		t.Fatalf("expected RepositorySyncMirror to default to true")
	}
}

func TestResolveStateInitializationOptionsUsesProvidedOverrides(t *testing.T) {
	got := resolveStateInitializationOptions(&StateInitializationOptions{
		SeedData:             false,
		DefaultAccount:       false,
		RegistrationSetting:  true,
		RepositorySyncPolicy: false,
		RepositorySyncMirror: true,
	})

	if got.SeedData {
		t.Fatalf("expected SeedData override to be false")
	}
	if got.DefaultAccount {
		t.Fatalf("expected DefaultAccount override to be false")
	}
	if !got.RegistrationSetting {
		t.Fatalf("expected RegistrationSetting override to be true")
	}
	if got.RepositorySyncPolicy {
		t.Fatalf("expected RepositorySyncPolicy override to be false")
	}
	if !got.RepositorySyncMirror {
		t.Fatalf("expected RepositorySyncMirror override to be true")
	}
}

func TestAPIStateInitializationOptionsDisablesSeedAndDefaultAccount(t *testing.T) {
	got := APIStateInitializationOptions()
	if got == nil {
		t.Fatalf("expected API state initialization options")
	}
	if got.SeedData {
		t.Fatalf("expected API state initialization to disable SeedData")
	}
	if got.DefaultAccount {
		t.Fatalf("expected API state initialization to disable DefaultAccount")
	}
	if !got.RegistrationSetting {
		t.Fatalf("expected API state initialization to keep RegistrationSetting enabled")
	}
	if got.RepositorySyncPolicy {
		t.Fatalf("expected API state initialization to disable RepositorySyncPolicy")
	}
	if got.RepositorySyncMirror {
		t.Fatalf("expected API state initialization to disable RepositorySyncMirror")
	}
}

func TestBootstrapStateInitializationOptionsEnablesAll(t *testing.T) {
	got := BootstrapStateInitializationOptions()
	if got == nil {
		t.Fatalf("expected bootstrap state initialization options")
	}
	if !got.SeedData {
		t.Fatalf("expected bootstrap state initialization to enable SeedData")
	}
	if !got.DefaultAccount {
		t.Fatalf("expected bootstrap state initialization to enable DefaultAccount")
	}
	if !got.RegistrationSetting {
		t.Fatalf("expected bootstrap state initialization to enable RegistrationSetting")
	}
	if !got.RepositorySyncPolicy {
		t.Fatalf("expected bootstrap state initialization to enable RepositorySyncPolicy")
	}
	if !got.RepositorySyncMirror {
		t.Fatalf("expected bootstrap state initialization to enable RepositorySyncMirror")
	}
}

func TestServerStateInitializationOptionsDisablesSeedAndDefaultAccount(t *testing.T) {
	got := ServerStateInitializationOptions()
	if got == nil {
		t.Fatalf("expected server state initialization options")
	}
	if got.SeedData {
		t.Fatalf("expected server state initialization to disable SeedData")
	}
	if got.DefaultAccount {
		t.Fatalf("expected server state initialization to disable DefaultAccount")
	}
	if !got.RegistrationSetting {
		t.Fatalf("expected server state initialization to keep RegistrationSetting enabled")
	}
	if got.RepositorySyncPolicy {
		t.Fatalf("expected server state initialization to disable RepositorySyncPolicy")
	}
	if got.RepositorySyncMirror {
		t.Fatalf("expected server state initialization to disable RepositorySyncMirror")
	}
}
