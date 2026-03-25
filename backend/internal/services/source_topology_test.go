package services

import (
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"
)

func TestBuildSourceTopologyExtractsLocalReferencedFiles(t *testing.T) {
	rootPath := t.TempDir()
	if err := os.MkdirAll(filepath.Join(rootPath, "references"), 0o755); err != nil {
		t.Fatalf("failed to create references directory: %v", err)
	}
	skillContent := strings.Join([]string{
		"---",
		"name: using-superpowers",
		"description: Use when starting any conversation",
		"---",
		"",
		"# Using Superpowers",
		"",
		"Read [the Codex mapping](references/codex-tools.md) and [the Gemini mapping](references/gemini-tools.md).",
		"Ignore [external docs](https://example.com/guide).",
		"Ignore [fragment](#usage).",
		"Inline note: `references/codex-tools.md`.",
		"Use superpowers:test-driven-development before implementation.",
		"",
	}, "\n")
	if err := os.WriteFile(filepath.Join(rootPath, "SKILL.md"), []byte(skillContent), 0o644); err != nil {
		t.Fatalf("failed to write SKILL.md: %v", err)
	}
	if err := os.WriteFile(filepath.Join(rootPath, "references", "codex-tools.md"), []byte("# Codex"), 0o644); err != nil {
		t.Fatalf("failed to write codex-tools.md: %v", err)
	}
	if err := os.WriteFile(filepath.Join(rootPath, "references", "gemini-tools.md"), []byte("# Gemini"), 0o644); err != nil {
		t.Fatalf("failed to write gemini-tools.md: %v", err)
	}

	topology, err := buildSourceTopology(rootPath, "SKILL.md")
	if err != nil {
		t.Fatalf("expected topology build to succeed: %v", err)
	}

	expectedPaths := []string{
		"references/codex-tools.md",
		"references/gemini-tools.md",
	}
	if topology.EntryFile != "SKILL.md" {
		t.Fatalf("unexpected entry file: %q", topology.EntryFile)
	}
	if !reflect.DeepEqual(topology.ReferencePaths, expectedPaths) {
		t.Fatalf("unexpected reference paths: got=%#v want=%#v", topology.ReferencePaths, expectedPaths)
	}
	if topology.Mechanism != "skill_markdown_frontmatter" {
		t.Fatalf("unexpected mechanism: %q", topology.Mechanism)
	}
	expectedMetadataSources := []string{"SKILL.md.frontmatter"}
	if !reflect.DeepEqual(topology.MetadataSources, expectedMetadataSources) {
		t.Fatalf("unexpected metadata sources: got=%#v want=%#v", topology.MetadataSources, expectedMetadataSources)
	}
	expectedDependencies := []SourceDependency{
		{Kind: "file", Target: "references/codex-tools.md"},
		{Kind: "file", Target: "references/gemini-tools.md"},
		{Kind: "skill", Target: "superpowers:test-driven-development"},
	}
	if !reflect.DeepEqual(topology.Dependencies, expectedDependencies) {
		t.Fatalf("unexpected dependencies: got=%#v want=%#v", topology.Dependencies, expectedDependencies)
	}
}
