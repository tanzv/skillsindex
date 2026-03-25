package web

import (
	"testing"

	"skillsindex/internal/services"
)

func TestNewAppUsesProvidedRepositorySyncCoordinator(t *testing.T) {
	coordinator := services.NewRepositorySyncCoordinator(nil, nil)

	app, err := NewApp(AppDependencies{
		APIOnly:     true,
		StoragePath: "./storage",
		SyncDependencies: SyncDependencies{
			RepositorySyncCoordinator: coordinator,
		},
	})
	if err != nil {
		t.Fatalf("expected app construction to succeed, got err=%v", err)
	}

	if app.repoSyncBatchRunner == nil {
		t.Fatalf("expected repository sync batch runner to be wired from provided coordinator")
	}
}

func TestNewAppDoesNotCreateRepositorySyncCoordinatorImplicitly(t *testing.T) {
	app, err := NewApp(AppDependencies{
		APIOnly:      true,
		StoragePath:  "./storage",
		SkillService: services.NewSkillService(nil),
		SyncDependencies: SyncDependencies{
			RepositoryService: services.NewRepositorySyncService(),
		},
	})
	if err != nil {
		t.Fatalf("expected app construction to succeed, got err=%v", err)
	}

	if app.repoSyncBatchRunner != nil {
		t.Fatalf("expected repository sync batch runner to stay nil without explicit coordinator injection")
	}
}
