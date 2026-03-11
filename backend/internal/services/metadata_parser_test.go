package services

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestExtractSkillFromDirectoryUsesManifestContentFile(t *testing.T) {
	basePath := t.TempDir()
	if err := os.MkdirAll(filepath.Join(basePath, "docs"), 0o755); err != nil {
		t.Fatalf("failed to create docs directory: %v", err)
	}
	if err := os.WriteFile(filepath.Join(basePath, "skill.json"), []byte(`{
  "name": "Manifest Skill",
  "description": "Loaded from manifest content file",
  "tags": ["manifest", "content-file"],
  "content_file": "docs/guide.md"
}`), 0o644); err != nil {
		t.Fatalf("failed to write skill.json: %v", err)
	}
	if err := os.WriteFile(filepath.Join(basePath, "docs", "guide.md"), []byte("# Manifest Skill\n\nLoaded from docs."), 0o644); err != nil {
		t.Fatalf("failed to write guide.md: %v", err)
	}

	extracted, err := extractSkillFromDirectory(basePath)
	if err != nil {
		t.Fatalf("expected extraction to succeed: %v", err)
	}
	if extracted.Name != "Manifest Skill" {
		t.Fatalf("unexpected name: got=%q want=%q", extracted.Name, "Manifest Skill")
	}
	if extracted.Description != "Loaded from manifest content file" {
		t.Fatalf("unexpected description: got=%q", extracted.Description)
	}
	if !strings.Contains(extracted.Content, "Loaded from docs.") {
		t.Fatalf("unexpected content: %q", extracted.Content)
	}
}

func TestExtractSkillFromDirectoryFallsBackToReadmeWhenContentFileMissing(t *testing.T) {
	basePath := t.TempDir()
	if err := os.WriteFile(filepath.Join(basePath, "skill.json"), []byte(`{
  "description": "Fallback description",
  "content_file": "missing.md"
}`), 0o644); err != nil {
		t.Fatalf("failed to write skill.json: %v", err)
	}
	if err := os.WriteFile(filepath.Join(basePath, "README.md"), []byte("# README Skill\n\nRecovered from README fallback."), 0o644); err != nil {
		t.Fatalf("failed to write README.md: %v", err)
	}

	extracted, err := extractSkillFromDirectory(basePath)
	if err != nil {
		t.Fatalf("expected extraction to succeed: %v", err)
	}
	if extracted.Name != "README Skill" {
		t.Fatalf("unexpected name from README fallback: got=%q", extracted.Name)
	}
	if !strings.Contains(extracted.Content, "Recovered from README fallback.") {
		t.Fatalf("unexpected fallback content: %q", extracted.Content)
	}
}

func TestExtractSkillFromDirectoryRejectsContentFileOutsideBase(t *testing.T) {
	basePath := t.TempDir()
	if err := os.WriteFile(filepath.Join(basePath, "skill.json"), []byte(`{
  "content_file": "../outside.md"
}`), 0o644); err != nil {
		t.Fatalf("failed to write skill.json: %v", err)
	}

	_, err := extractSkillFromDirectory(basePath)
	if err == nil {
		t.Fatalf("expected extraction to fail for out-of-root content_file")
	}
	if !strings.Contains(err.Error(), "content_file must stay within repository root") {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestExtractSkillFromDirectoryReturnsActionableEmptyContentError(t *testing.T) {
	basePath := t.TempDir()
	if err := os.WriteFile(filepath.Join(basePath, "README.md"), []byte("   \n"), 0o644); err != nil {
		t.Fatalf("failed to write README.md: %v", err)
	}

	_, err := extractSkillFromDirectory(basePath)
	if err == nil {
		t.Fatalf("expected extraction to fail for empty content")
	}
	if !strings.Contains(err.Error(), "README.md") || !strings.Contains(err.Error(), "content_file") {
		t.Fatalf("expected actionable error message, got: %v", err)
	}
}
