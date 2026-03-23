package config

import (
	"os"
	"path/filepath"
	"testing"
)

func TestLoadReadsDotEnvFromWorkingDirectory(t *testing.T) {
	tempDir := t.TempDir()
	envFilePath := filepath.Join(tempDir, ".env")
	envContent := "APP_ENV=staging\nAPP_PORT=19090\nADMIN_USERNAME=dotenv-admin\n"

	if err := os.WriteFile(envFilePath, []byte(envContent), 0o600); err != nil {
		t.Fatalf("failed to write env file: %v", err)
	}

	originalWorkingDirectory, err := os.Getwd()
	if err != nil {
		t.Fatalf("failed to capture working directory: %v", err)
	}
	if err := os.Chdir(tempDir); err != nil {
		t.Fatalf("failed to change working directory: %v", err)
	}
	t.Cleanup(func() {
		if chdirErr := os.Chdir(originalWorkingDirectory); chdirErr != nil {
			t.Fatalf("failed to restore working directory: %v", chdirErr)
		}
	})

	if err := os.Unsetenv("APP_ENV"); err != nil {
		t.Fatalf("failed to unset APP_ENV: %v", err)
	}
	if err := os.Unsetenv("APP_PORT"); err != nil {
		t.Fatalf("failed to unset APP_PORT: %v", err)
	}
	if err := os.Unsetenv("ADMIN_USERNAME"); err != nil {
		t.Fatalf("failed to unset ADMIN_USERNAME: %v", err)
	}

	cfg := Load()
	if cfg.AppEnv != "staging" {
		t.Fatalf("expected APP_ENV from .env, got %q", cfg.AppEnv)
	}
	if cfg.ServerPort != "19090" {
		t.Fatalf("expected APP_PORT from .env, got %q", cfg.ServerPort)
	}
	if cfg.AdminUsername != "dotenv-admin" {
		t.Fatalf("expected ADMIN_USERNAME from .env, got %q", cfg.AdminUsername)
	}
}

func TestLoadPrefersProcessEnvironmentOverDotEnv(t *testing.T) {
	tempDir := t.TempDir()
	envFilePath := filepath.Join(tempDir, ".env")
	envContent := "APP_ENV=staging\n"

	if err := os.WriteFile(envFilePath, []byte(envContent), 0o600); err != nil {
		t.Fatalf("failed to write env file: %v", err)
	}

	originalWorkingDirectory, err := os.Getwd()
	if err != nil {
		t.Fatalf("failed to capture working directory: %v", err)
	}
	if err := os.Chdir(tempDir); err != nil {
		t.Fatalf("failed to change working directory: %v", err)
	}
	t.Cleanup(func() {
		if chdirErr := os.Chdir(originalWorkingDirectory); chdirErr != nil {
			t.Fatalf("failed to restore working directory: %v", chdirErr)
		}
	})

	t.Setenv("APP_ENV", "production")

	cfg := Load()
	if cfg.AppEnv != "production" {
		t.Fatalf("expected explicit environment to win, got %q", cfg.AppEnv)
	}
}

func TestLoadAllowRegistration(t *testing.T) {
	t.Setenv("ALLOW_REGISTRATION", "false")
	cfg := Load()
	if cfg.AllowRegistration {
		t.Fatalf("expected allow registration to be false")
	}
}

func TestLoadAllowRegistrationDefault(t *testing.T) {
	if err := os.Unsetenv("ALLOW_REGISTRATION"); err != nil {
		t.Fatalf("failed to unset env: %v", err)
	}
	cfg := Load()
	if !cfg.AllowRegistration {
		t.Fatalf("expected default allow registration to be true")
	}
}

func TestLoadAPIKeys(t *testing.T) {
	t.Setenv("API_KEYS", "k1, k2 ,k3")
	cfg := Load()
	if len(cfg.APIKeys) != 3 {
		t.Fatalf("unexpected api key count: %d", len(cfg.APIKeys))
	}
	if cfg.APIKeys[0] != "k1" || cfg.APIKeys[1] != "k2" || cfg.APIKeys[2] != "k3" {
		t.Fatalf("unexpected api keys: %#v", cfg.APIKeys)
	}
}

func TestLoadAPIKeysDefaultEmpty(t *testing.T) {
	t.Setenv("API_KEYS", "")
	cfg := Load()
	if len(cfg.APIKeys) != 0 {
		t.Fatalf("expected default api key list to be empty")
	}
}

func TestLoadDefaultAdminConfig(t *testing.T) {
	cfg := Load()
	if cfg.AdminUsername == "" {
		t.Fatalf("expected default admin username")
	}
	if cfg.AdminPassword == "" {
		t.Fatalf("expected default admin password")
	}
	if cfg.AdminRole == "" {
		t.Fatalf("expected default admin role")
	}
}

func TestLoadDingTalkConfigDefaults(t *testing.T) {
	cfg := Load()
	if cfg.DingTalkRedirect == "" {
		t.Fatalf("expected default dingtalk redirect")
	}
	if cfg.DingTalkScope == "" {
		t.Fatalf("expected default dingtalk scope")
	}
	if cfg.DingTalkAuthBase == "" {
		t.Fatalf("expected default dingtalk auth base")
	}
	if cfg.DingTalkAPIBase == "" {
		t.Fatalf("expected default dingtalk api base")
	}
}

func TestLoadSessionCookieSecure(t *testing.T) {
	t.Setenv("SESSION_COOKIE_SECURE", "true")
	cfg := Load()
	if !cfg.SessionCookieSecure {
		t.Fatalf("expected session cookie secure to be true")
	}
}

func TestConfigIsProduction(t *testing.T) {
	t.Setenv("APP_ENV", "production")
	cfg := Load()
	if !cfg.IsProduction() {
		t.Fatalf("expected config to be production")
	}
}

func TestLoadAPIOnly(t *testing.T) {
	t.Setenv("API_ONLY", "true")
	cfg := Load()
	if !cfg.APIOnly {
		t.Fatalf("expected api only mode to be true")
	}
}

func TestLoadCORSAllowedOrigins(t *testing.T) {
	t.Setenv("CORS_ALLOWED_ORIGINS", "http://localhost:5173, https://app.example.com")
	cfg := Load()
	if len(cfg.CORSAllowedOrigins) != 2 {
		t.Fatalf("unexpected cors origins count: %d", len(cfg.CORSAllowedOrigins))
	}
	if cfg.CORSAllowedOrigins[0] != "http://localhost:5173" {
		t.Fatalf("unexpected first origin: %s", cfg.CORSAllowedOrigins[0])
	}
	if cfg.CORSAllowedOrigins[1] != "https://app.example.com" {
		t.Fatalf("unexpected second origin: %s", cfg.CORSAllowedOrigins[1])
	}
}
