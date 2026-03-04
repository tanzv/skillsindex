package services

import (
	"context"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"skillsindex/internal/models"
)

func TestRepositorySyncCoordinatorSyncBatch(t *testing.T) {
	db := setupSkillServiceTestDB(t)
	skillService := NewSkillService(db)
	repositoryService := NewRepositorySyncService()
	coordinator := NewRepositorySyncCoordinator(skillService, repositoryService)

	owner := models.User{Username: "repo-owner", PasswordHash: "hash"}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}

	repoPath := createRepositoryFixture(t)
	past := time.Now().UTC().Add(-2 * time.Hour)
	created, err := skillService.CreateSkill(context.Background(), CreateSkillInput{
		OwnerID:      owner.ID,
		Name:         "stale repository skill",
		Description:  "before sync",
		Content:      "before sync",
		SourceType:   models.SourceTypeRepository,
		SourceURL:    repoPath,
		SourceBranch: "",
		SourcePath:   "",
		LastSyncedAt: &past,
		Visibility:   models.VisibilityPrivate,
	})
	if err != nil {
		t.Fatalf("failed to create stale repository skill: %v", err)
	}

	summary, err := coordinator.SyncBatch(context.Background(), nil, nil, 10)
	if err != nil {
		t.Fatalf("sync batch failed: %v", err)
	}
	if summary.Candidates != 1 {
		t.Fatalf("unexpected candidate count: got=%d want=1", summary.Candidates)
	}
	if summary.Synced != 1 {
		t.Fatalf("unexpected synced count: got=%d want=1", summary.Synced)
	}
	if summary.Failed != 0 {
		t.Fatalf("unexpected failed count: got=%d want=0", summary.Failed)
	}

	updated, err := skillService.GetSkillByID(context.Background(), created.ID)
	if err != nil {
		t.Fatalf("failed to load synced skill: %v", err)
	}
	if updated.Name != "Repo Sync Fixture" {
		t.Fatalf("unexpected updated name: got=%s want=%s", updated.Name, "Repo Sync Fixture")
	}
	if updated.LastSyncedAt == nil {
		t.Fatalf("expected last_synced_at to be set")
	}
	if !updated.LastSyncedAt.After(past) {
		t.Fatalf("expected synced timestamp to be newer than previous value")
	}
}

func createRepositoryFixture(t *testing.T) string {
	t.Helper()

	tmp := t.TempDir()
	repoPath := filepath.Join(tmp, "repo")
	if err := os.MkdirAll(repoPath, 0o755); err != nil {
		t.Fatalf("failed to create repo path: %v", err)
	}
	runGitCommand(t, repoPath, "init")
	runGitCommand(t, repoPath, "config", "user.name", "test")
	runGitCommand(t, repoPath, "config", "user.email", "test@example.com")

	manifest := `{
  "name": "Repo Sync Fixture",
  "description": "Repository metadata for sync coordinator test",
  "tags": ["repository", "scheduler"],
  "content_file": "README.md"
}`
	if err := os.WriteFile(filepath.Join(repoPath, "skill.json"), []byte(manifest), 0o644); err != nil {
		t.Fatalf("failed to write skill.json: %v", err)
	}
	content := "# Repo Sync Fixture\n\nSynchronized from local git repository."
	if err := os.WriteFile(filepath.Join(repoPath, "README.md"), []byte(content), 0o644); err != nil {
		t.Fatalf("failed to write README.md: %v", err)
	}
	runGitCommand(t, repoPath, "add", "skill.json", "README.md")
	runGitCommand(t, repoPath, "commit", "-m", "initial")
	return repoPath
}

func runGitCommand(t *testing.T, repoPath string, args ...string) {
	t.Helper()
	cmd := exec.Command("git", args...)
	cmd.Dir = repoPath
	output, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("git %s failed: %v: %s", strings.Join(args, " "), err, strings.TrimSpace(string(output)))
	}
}
