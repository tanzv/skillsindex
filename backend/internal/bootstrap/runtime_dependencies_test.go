package bootstrap

import (
	"testing"

	"skillsindex/internal/config"
	"skillsindex/internal/services"
)

func TestBuildWebAppDependenciesUsesProvidedRepositorySyncCoordinator(t *testing.T) {
	coordinator := services.NewRepositorySyncCoordinator(nil, nil)

	deps := buildWebAppDependencies(config.Config{
		AllowRegistration:   true,
		SessionCookieSecure: true,
		APIOnly:             true,
		CORSAllowedOrigins:  []string{"https://example.com"},
		APIKeys:             []string{"key-1"},
		StoragePath:         "./storage",
	}, runtimeServices{
		repositorySyncCoordinator: coordinator,
	})

	if deps.SyncDependencies.RepositorySyncCoordinator != coordinator {
		t.Fatalf("expected web app dependencies to reuse provided repository sync coordinator")
	}
	if !deps.AllowRegistration {
		t.Fatalf("expected allow registration flag to be preserved")
	}
	if !deps.CookieSecure {
		t.Fatalf("expected cookie secure flag to be preserved")
	}
}
