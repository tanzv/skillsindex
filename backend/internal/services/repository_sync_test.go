package services

import (
	"context"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

func TestCloneAndExtractSkillMetadata(t *testing.T) {
	tmp := t.TempDir()
	repoPath := filepath.Join(tmp, "repo")
	if err := os.MkdirAll(repoPath, 0o755); err != nil {
		t.Fatalf("failed to create repo path: %v", err)
	}
	runGit(t, repoPath, "init")
	runGit(t, repoPath, "config", "user.name", "test")
	runGit(t, repoPath, "config", "user.email", "test@example.com")

	manifest := `{
  "name": "Repo Skill",
  "description": "Skill loaded from repository",
  "tags": ["repo", "sync"],
  "content_file": "README.md"
}`
	if err := os.WriteFile(filepath.Join(repoPath, "skill.json"), []byte(manifest), 0o644); err != nil {
		t.Fatalf("failed to write skill.json: %v", err)
	}
	readme := "# Repo Skill\n\nRepository based skill content"
	if err := os.WriteFile(filepath.Join(repoPath, "README.md"), []byte(readme), 0o644); err != nil {
		t.Fatalf("failed to write README: %v", err)
	}
	runGit(t, repoPath, "add", "skill.json", "README.md")
	runGit(t, repoPath, "commit", "-m", "init")

	svc := NewRepositorySyncService()
	meta, err := svc.CloneAndExtract(context.Background(), RepoSource{
		URL: repoPath,
	})
	if err != nil {
		t.Fatalf("clone and extract failed: %v", err)
	}

	if meta.Name != "Repo Skill" {
		t.Fatalf("unexpected name: %s", meta.Name)
	}
	if meta.Description != "Skill loaded from repository" {
		t.Fatalf("unexpected description: %s", meta.Description)
	}
	if meta.Content == "" {
		t.Fatalf("expected content to be extracted")
	}
	if len(meta.Tags) != 2 || meta.Tags[0] != "repo" || meta.Tags[1] != "sync" {
		t.Fatalf("unexpected tags: %#v", meta.Tags)
	}
}

func TestCloneAndExtractRejectsRepositoryPathTraversal(t *testing.T) {
	tmp := t.TempDir()
	repoPath := filepath.Join(tmp, "repo")
	if err := os.MkdirAll(repoPath, 0o755); err != nil {
		t.Fatalf("failed to create repo path: %v", err)
	}
	runGit(t, repoPath, "init")
	runGit(t, repoPath, "config", "user.name", "test")
	runGit(t, repoPath, "config", "user.email", "test@example.com")
	if err := os.WriteFile(filepath.Join(repoPath, "README.md"), []byte("# Repo Skill\n\nContent"), 0o644); err != nil {
		t.Fatalf("failed to write README.md: %v", err)
	}
	runGit(t, repoPath, "add", "README.md")
	runGit(t, repoPath, "commit", "-m", "init")

	svc := NewRepositorySyncService()
	_, err := svc.CloneAndExtract(context.Background(), RepoSource{
		URL:  repoPath,
		Path: "../outside",
	})
	if err == nil {
		t.Fatalf("expected traversal repository path to fail")
	}
	if !strings.Contains(err.Error(), "invalid repository path") {
		t.Fatalf("unexpected error: %v", err)
	}
}

func runGit(t *testing.T, repoPath string, args ...string) {
	t.Helper()
	cmd := exec.Command("git", args...)
	cmd.Dir = repoPath
	out, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("git %s failed: %v: %s", strings.Join(args, " "), err, strings.TrimSpace(string(out)))
	}
}
