package services

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

// RepoSource identifies a repository source for skill synchronization.
type RepoSource struct {
	URL    string
	Branch string
	Path   string
}

// RepositorySyncService imports skill data from git repositories.
type RepositorySyncService struct{}

const defaultRepositoryCloneTimeout = 2 * time.Minute

// NewRepositorySyncService creates a repository sync service.
func NewRepositorySyncService() *RepositorySyncService {
	return &RepositorySyncService{}
}

// CloneAndExtract clones the repository and returns extracted skill metadata.
func (s *RepositorySyncService) CloneAndExtract(ctx context.Context, source RepoSource) (ExtractedSkill, error) {
	if strings.TrimSpace(source.URL) == "" {
		return ExtractedSkill{}, fmt.Errorf("repository url is required")
	}

	tmpDir, err := os.MkdirTemp("", "skillsindex-repo-*")
	if err != nil {
		return ExtractedSkill{}, fmt.Errorf("failed to create temp dir: %w", err)
	}
	defer os.RemoveAll(tmpDir)

	if err := cloneRepository(ctx, source, tmpDir); err != nil {
		return ExtractedSkill{}, err
	}

	targetPath := tmpDir
	if p := strings.TrimSpace(source.Path); p != "" {
		joined := filepath.Join(tmpDir, p)
		cleanTarget := filepath.Clean(joined)
		cleanBase := filepath.Clean(tmpDir)
		prefix := cleanBase + string(os.PathSeparator)
		if cleanTarget != cleanBase && !strings.HasPrefix(cleanTarget, prefix) {
			return ExtractedSkill{}, fmt.Errorf("invalid repository path")
		}
		targetPath = cleanTarget
	}

	return extractSkillFromDirectory(targetPath)
}

func cloneRepository(ctx context.Context, source RepoSource, targetDir string) error {
	ctx, cancel := ensureCloneContext(ctx)
	defer cancel()

	branch := strings.TrimSpace(source.Branch)
	args := []string{"clone", "--depth", "1"}
	if branch != "" {
		args = append(args, "--branch", branch)
	}
	args = append(args, source.URL, targetDir)

	cmd := newGitCommand(ctx, args...)
	if output, err := cmd.CombinedOutput(); err == nil {
		return nil
	} else if branch == "" {
		return fmt.Errorf("failed to clone repository: %w: %s", err, strings.TrimSpace(string(output)))
	}

	// Fallback to default branch if the requested branch is missing.
	if err := os.RemoveAll(targetDir); err != nil {
		return fmt.Errorf("failed to reset target directory: %w", err)
	}
	if err := os.MkdirAll(targetDir, 0o755); err != nil {
		return fmt.Errorf("failed to recreate target directory: %w", err)
	}

	cmd = newGitCommand(ctx, "clone", "--depth", "1", source.URL, targetDir)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to clone repository: %w: %s", err, strings.TrimSpace(string(output)))
	}
	return nil
}

func ensureCloneContext(ctx context.Context) (context.Context, context.CancelFunc) {
	if _, hasDeadline := ctx.Deadline(); hasDeadline {
		return ctx, func() {}
	}
	return context.WithTimeout(ctx, defaultRepositoryCloneTimeout)
}

func newGitCommand(ctx context.Context, args ...string) *exec.Cmd {
	cmd := exec.CommandContext(ctx, "git", args...)
	cmd.Env = append(
		os.Environ(),
		"GIT_TERMINAL_PROMPT=0",
		"GCM_INTERACTIVE=never",
	)
	return cmd
}
