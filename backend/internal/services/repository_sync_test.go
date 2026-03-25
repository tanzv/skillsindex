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

func TestCloneAndExtractSupportsRepositoryFilePath(t *testing.T) {
	tmp := t.TempDir()
	repoPath := filepath.Join(tmp, "repo")
	if err := os.MkdirAll(filepath.Join(repoPath, "skills", "ops-guide"), 0o755); err != nil {
		t.Fatalf("failed to create repo path: %v", err)
	}
	runGit(t, repoPath, "init")
	runGit(t, repoPath, "config", "user.name", "test")
	runGit(t, repoPath, "config", "user.email", "test@example.com")

	skillFile := strings.Join([]string{
		"---",
		"name: ops-guide",
		"description: Operator guidance skill",
		"tags:",
		"  - operations",
		"  - guide",
		"---",
		"",
		"# Ops Guide",
		"",
		"Use the operator checklist.",
	}, "\n")
	if err := os.WriteFile(filepath.Join(repoPath, "skills", "ops-guide", "SKILL.md"), []byte(skillFile), 0o644); err != nil {
		t.Fatalf("failed to write SKILL.md: %v", err)
	}
	runGit(t, repoPath, "add", "skills/ops-guide/SKILL.md")
	runGit(t, repoPath, "commit", "-m", "init")

	svc := NewRepositorySyncService()
	meta, err := svc.CloneAndExtract(context.Background(), RepoSource{
		URL:  repoPath,
		Path: "skills/ops-guide/SKILL.md",
	})
	if err != nil {
		t.Fatalf("clone and extract failed for file path: %v", err)
	}

	if meta.Name != "ops-guide" {
		t.Fatalf("unexpected name: %q", meta.Name)
	}
	if meta.Description != "Operator guidance skill" {
		t.Fatalf("unexpected description: %q", meta.Description)
	}
	if len(meta.Tags) != 2 || meta.Tags[0] != "operations" || meta.Tags[1] != "guide" {
		t.Fatalf("unexpected tags: %#v", meta.Tags)
	}
	if meta.Analysis.EntryFile != "SKILL.md" {
		t.Fatalf("unexpected analysis entry file: %q", meta.Analysis.EntryFile)
	}
}

func TestNormalizeRepoSourceParsesGitHubTreeURL(t *testing.T) {
	source := NormalizeRepoSource(RepoSource{
		URL: "https://github.com/obra/superpowers/tree/main/skills/using-superpowers",
	})

	if source.URL != "https://github.com/obra/superpowers.git" {
		t.Fatalf("unexpected normalized repo url: %q", source.URL)
	}
	if source.Branch != "main" {
		t.Fatalf("unexpected normalized repo branch: %q", source.Branch)
	}
	if source.Path != "skills/using-superpowers" {
		t.Fatalf("unexpected normalized repo path: %q", source.Path)
	}
}

func TestNormalizeRepoSourceKeepsExplicitBranchAndPath(t *testing.T) {
	source := NormalizeRepoSource(RepoSource{
		URL:    "https://github.com/obra/superpowers/tree/main/skills/using-superpowers",
		Branch: "release",
		Path:   "skills/custom-skill",
	})

	if source.URL != "https://github.com/obra/superpowers.git" {
		t.Fatalf("unexpected normalized repo url: %q", source.URL)
	}
	if source.Branch != "release" {
		t.Fatalf("expected explicit branch to win, got %q", source.Branch)
	}
	if source.Path != "skills/custom-skill" {
		t.Fatalf("expected explicit path to win, got %q", source.Path)
	}
}

func TestNormalizeRepoSourceParsesGitHubRawSkillFile(t *testing.T) {
	source := NormalizeRepoSource(RepoSource{
		URL: "https://raw.githubusercontent.com/obra/superpowers/main/skills/using-superpowers/SKILL.md",
	})

	if source.URL != "https://github.com/obra/superpowers.git" {
		t.Fatalf("unexpected normalized repo url: %q", source.URL)
	}
	if source.Branch != "main" {
		t.Fatalf("unexpected normalized repo branch: %q", source.Branch)
	}
	if source.Path != "skills/using-superpowers" {
		t.Fatalf("unexpected normalized repo path: %q", source.Path)
	}
}

func TestNormalizeRepoSourceParsesGitLabTreeURL(t *testing.T) {
	source := NormalizeRepoSource(RepoSource{
		URL: "https://gitlab.com/acme/platform/skills/-/tree/main/skills/release-guard",
	})

	if source.URL != "https://gitlab.com/acme/platform/skills.git" {
		t.Fatalf("unexpected normalized repo url: %q", source.URL)
	}
	if source.Branch != "main" {
		t.Fatalf("unexpected normalized repo branch: %q", source.Branch)
	}
	if source.Path != "skills/release-guard" {
		t.Fatalf("unexpected normalized repo path: %q", source.Path)
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
