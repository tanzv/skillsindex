package services

import (
	"context"
	"strings"
	"testing"
	"time"
)

func TestEnsureCloneContextAddsDefaultDeadline(t *testing.T) {
	ctx, cancel := ensureCloneContext(context.Background())
	defer cancel()

	deadline, ok := ctx.Deadline()
	if !ok {
		t.Fatalf("expected clone context to include deadline")
	}

	remaining := time.Until(deadline)
	minRemaining := defaultRepositoryCloneTimeout - 5*time.Second
	maxRemaining := defaultRepositoryCloneTimeout + 5*time.Second
	if remaining < minRemaining || remaining > maxRemaining {
		t.Fatalf(
			"unexpected clone deadline window: remaining=%s expected between %s and %s",
			remaining,
			minRemaining,
			maxRemaining,
		)
	}
}

func TestEnsureCloneContextPreservesExistingDeadline(t *testing.T) {
	baseCtx, baseCancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer baseCancel()

	baseDeadline, baseHasDeadline := baseCtx.Deadline()
	if !baseHasDeadline {
		t.Fatalf("expected base context deadline")
	}

	ctx, cancel := ensureCloneContext(baseCtx)
	defer cancel()

	deadline, hasDeadline := ctx.Deadline()
	if !hasDeadline {
		t.Fatalf("expected clone context deadline")
	}
	if !deadline.Equal(baseDeadline) {
		t.Fatalf("expected clone context to preserve base deadline")
	}
}

func TestNewGitCommandDisablesInteractivePrompts(t *testing.T) {
	cmd := newGitCommand(context.Background(), "status")

	if !containsEnvVar(cmd.Env, "GIT_TERMINAL_PROMPT=0") {
		t.Fatalf("expected GIT_TERMINAL_PROMPT to be disabled")
	}
	if !containsEnvVar(cmd.Env, "GCM_INTERACTIVE=never") {
		t.Fatalf("expected GCM_INTERACTIVE to be disabled")
	}
}

func containsEnvVar(values []string, expected string) bool {
	for _, value := range values {
		if strings.TrimSpace(value) == expected {
			return true
		}
	}
	return false
}
