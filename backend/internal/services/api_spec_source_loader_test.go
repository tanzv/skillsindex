package services

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func writeOpenAPITestSpec(t *testing.T, relativePath string, raw string) string {
	t.Helper()

	roots, err := discoverAPISpecSourceRoots()
	if err != nil {
		t.Fatalf("failed to discover openapi source roots: %v", err)
	}
	targetPath := filepath.Join(roots[0], relativePath)
	if err := os.MkdirAll(filepath.Dir(targetPath), 0o755); err != nil {
		t.Fatalf("failed to create spec fixture directory: %v", err)
	}
	if err := os.WriteFile(targetPath, []byte(raw), 0o644); err != nil {
		t.Fatalf("failed to write spec fixture: %v", err)
	}
	t.Cleanup(func() {
		_ = os.Remove(targetPath)
		_ = os.Remove(filepath.Dir(targetPath))
	})
	return targetPath
}

func TestAPISpecRegistryServiceValidateDraftRefreshesBundleMetadata(t *testing.T) {
	db := setupAPISpecRegistryTestDB(t)
	service := NewAPISpecRegistryService(db, t.TempDir())
	sourcePath := writeOpenAPITestSpec(t, filepath.Join("tmp-spec-tests", t.Name(), "root.yaml"), strings.Join([]string{
		"openapi: 3.0.3",
		"info:",
		"  title: Initial Snapshot",
		"  version: 1.0.0",
		"paths: {}",
		"",
	}, "\n"))

	result, err := service.ImportDraft(context.Background(), ImportAPISpecDraftInput{
		Name:        "SkillsIndex API",
		Slug:        "skillsindex-api-refresh",
		SourcePath:  sourcePath,
		ActorUserID: 7,
	})
	if err != nil {
		t.Fatalf("expected import to succeed, got %v", err)
	}
	initialChecksum := result.Spec.Checksum

	if err := os.WriteFile(sourcePath, []byte(strings.Join([]string{
		"openapi: 3.0.3",
		"info:",
		"  title: Refreshed Snapshot",
		"  version: 2.0.0",
		"paths: {}",
		"",
	}, "\n")), 0o644); err != nil {
		t.Fatalf("failed to rewrite source fixture: %v", err)
	}

	validated, err := service.ValidateDraft(context.Background(), result.Spec.ID)
	if err != nil {
		t.Fatalf("expected validate to succeed, got %v", err)
	}
	if validated.SemanticVersion != "2.0.0" {
		t.Fatalf("expected refreshed semantic version, got %s", validated.SemanticVersion)
	}
	if validated.Checksum == initialChecksum {
		t.Fatalf("expected validate to refresh checksum")
	}

	raw, err := os.ReadFile(validated.BundlePath)
	if err != nil {
		t.Fatalf("failed to read refreshed bundle: %v", err)
	}
	if !strings.Contains(string(raw), "Refreshed Snapshot") {
		t.Fatalf("expected refreshed bundle content, got %s", string(raw))
	}
}

func TestAPISpecRegistryServiceImportDraftRejectsSourceOutsideAllowedRoots(t *testing.T) {
	db := setupAPISpecRegistryTestDB(t)
	service := NewAPISpecRegistryService(db, t.TempDir())

	sourcePath := filepath.Join(t.TempDir(), "root.yaml")
	if err := os.WriteFile(sourcePath, []byte("openapi: 3.0.3\ninfo:\n  title: Outside Root\n  version: 1.0.0\npaths: {}\n"), 0o644); err != nil {
		t.Fatalf("failed to write outside source fixture: %v", err)
	}

	_, err := service.ImportDraft(context.Background(), ImportAPISpecDraftInput{
		Name:        "Outside API",
		Slug:        "outside-api",
		SourcePath:  sourcePath,
		ActorUserID: 7,
	})
	if err == nil || !strings.Contains(err.Error(), "must stay within repository openapi source roots") {
		t.Fatalf("expected source root restriction error, got %v", err)
	}
}

func TestAPISpecRegistryServiceImportDraftRejectsExternalRefs(t *testing.T) {
	db := setupAPISpecRegistryTestDB(t)
	service := NewAPISpecRegistryService(db, t.TempDir())
	sourcePath := writeOpenAPITestSpec(t, filepath.Join("tmp-spec-tests", t.Name(), "remote-root.yaml"), strings.Join([]string{
		"openapi: 3.0.3",
		"info:",
		"  title: Remote Ref Snapshot",
		"  version: 1.0.0",
		"paths: {}",
		"components:",
		"  schemas:",
		"    Health:",
		"      $ref: https://example.com/schemas/health.yaml",
		"",
	}, "\n"))

	_, err := service.ImportDraft(context.Background(), ImportAPISpecDraftInput{
		Name:        "Remote Ref API",
		Slug:        "remote-ref-api",
		SourcePath:  sourcePath,
		ActorUserID: 7,
	})
	if err == nil || !strings.Contains(err.Error(), "external refs are not allowed") {
		t.Fatalf("expected external ref restriction error, got %v", err)
	}
}
