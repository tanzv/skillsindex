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

func TestExtractSkillFromDirectoryUsesSkillMarkdownFrontmatter(t *testing.T) {
	basePath := t.TempDir()
	skillContent := `---
name: webapp-testing
description: Toolkit for interacting with and testing local web applications.
tags:
  - browser
  - playwright
license: Apache-2.0
---

# Web Application Testing

Use Playwright to verify live browser flows.
`
	if err := os.WriteFile(filepath.Join(basePath, "SKILL.md"), []byte(skillContent), 0o644); err != nil {
		t.Fatalf("failed to write SKILL.md: %v", err)
	}

	extracted, err := extractSkillFromDirectory(basePath)
	if err != nil {
		t.Fatalf("expected extraction to succeed: %v", err)
	}
	if extracted.Name != "webapp-testing" {
		t.Fatalf("unexpected name from frontmatter: got=%q", extracted.Name)
	}
	if extracted.Description != "Toolkit for interacting with and testing local web applications." {
		t.Fatalf("unexpected description from frontmatter: got=%q", extracted.Description)
	}
	if len(extracted.Tags) != 2 || extracted.Tags[0] != "browser" || extracted.Tags[1] != "playwright" {
		t.Fatalf("unexpected tags from frontmatter: %#v", extracted.Tags)
	}
	if strings.Contains(extracted.Content, "license: Apache-2.0") {
		t.Fatalf("expected markdown frontmatter to be stripped from content: %q", extracted.Content)
	}
	if !strings.Contains(extracted.Content, "# Web Application Testing") {
		t.Fatalf("expected content to retain markdown body: %q", extracted.Content)
	}
	if !strings.Contains(extracted.Content, "Playwright") {
		t.Fatalf("expected content to retain searchable body text: %q", extracted.Content)
	}
}

func TestExtractSkillFromDirectoryFallsBackToSkillMarkdownTagsWhenManifestOmitsThem(t *testing.T) {
	basePath := t.TempDir()
	if err := os.WriteFile(filepath.Join(basePath, "skill.json"), []byte(`{
  "content_file": "SKILL.md"
}`), 0o644); err != nil {
		t.Fatalf("failed to write skill.json: %v", err)
	}
	if err := os.WriteFile(filepath.Join(basePath, "SKILL.md"), []byte(`---
name: webapp-testing
description: Browser automation skill
tags:
  - browser
  - playwright
---

# Web Application Testing

Use Playwright for browser automation.
`), 0o644); err != nil {
		t.Fatalf("failed to write SKILL.md: %v", err)
	}

	extracted, err := extractSkillFromDirectory(basePath)
	if err != nil {
		t.Fatalf("expected extraction to succeed: %v", err)
	}
	if len(extracted.Tags) != 2 || extracted.Tags[0] != "browser" || extracted.Tags[1] != "playwright" {
		t.Fatalf("expected tags to fall back to SKILL.md frontmatter, got %#v", extracted.Tags)
	}
}

func TestExtractSkillFromDirectoryReturnsActionableErrorForMalformedSkillFrontmatter(t *testing.T) {
	basePath := t.TempDir()
	if err := os.WriteFile(filepath.Join(basePath, "SKILL.md"), []byte(`---
name: webapp-testing
description: [broken
---

# Web Application Testing
`), 0o644); err != nil {
		t.Fatalf("failed to write SKILL.md: %v", err)
	}

	_, err := extractSkillFromDirectory(basePath)
	if err == nil {
		t.Fatalf("expected extraction to fail for malformed SKILL.md frontmatter")
	}
	if !strings.Contains(err.Error(), "failed to parse SKILL.md frontmatter") {
		t.Fatalf("expected actionable frontmatter parsing error, got: %v", err)
	}
}
