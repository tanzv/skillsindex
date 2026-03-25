package services

import (
	"archive/zip"
	"os"
	"path/filepath"
	"reflect"
	"testing"
)

func TestExtractFromZipFile(t *testing.T) {
	tmp := t.TempDir()
	zipPath := filepath.Join(tmp, "skill.zip")

	file, err := os.Create(zipPath)
	if err != nil {
		t.Fatalf("failed to create zip file: %v", err)
	}
	zw := zip.NewWriter(file)

	manifestWriter, err := zw.Create("skill.json")
	if err != nil {
		t.Fatalf("failed to create manifest entry: %v", err)
	}
	manifest := `{
  "name": "Upload Skill",
  "description": "Skill loaded from zip",
  "tags": ["upload", "archive"],
  "content_file": "README.md"
}`
	if _, err := manifestWriter.Write([]byte(manifest)); err != nil {
		t.Fatalf("failed to write manifest: %v", err)
	}

	readmeWriter, err := zw.Create("README.md")
	if err != nil {
		t.Fatalf("failed to create readme entry: %v", err)
	}
	if _, err := readmeWriter.Write([]byte("# Upload Skill\n\nArchive content")); err != nil {
		t.Fatalf("failed to write readme: %v", err)
	}

	if err := zw.Close(); err != nil {
		t.Fatalf("failed to close zip writer: %v", err)
	}
	if err := file.Close(); err != nil {
		t.Fatalf("failed to close file: %v", err)
	}

	svc := NewUploadService()
	meta, err := svc.ExtractFromZipFile(zipPath)
	if err != nil {
		t.Fatalf("extract failed: %v", err)
	}

	if meta.Name != "Upload Skill" {
		t.Fatalf("unexpected name: %s", meta.Name)
	}
	if len(meta.Tags) != 2 || meta.Tags[0] != "upload" || meta.Tags[1] != "archive" {
		t.Fatalf("unexpected tags: %#v", meta.Tags)
	}
	if meta.Content == "" {
		t.Fatalf("expected content to be extracted")
	}
}

func TestExtractFromZipFileBuildsAnalysis(t *testing.T) {
	tmp := t.TempDir()
	zipPath := filepath.Join(tmp, "skill-analysis.zip")

	file, err := os.Create(zipPath)
	if err != nil {
		t.Fatalf("failed to create zip file: %v", err)
	}
	zw := zip.NewWriter(file)

	manifestWriter, err := zw.Create("skill.json")
	if err != nil {
		t.Fatalf("failed to create manifest entry: %v", err)
	}
	manifest := `{
  "name": "Upload Analysis Skill",
  "description": "Skill loaded from zip with analysis",
  "tags": ["upload", "analysis"],
  "content_file": "SKILL.md"
}`
	if _, err := manifestWriter.Write([]byte(manifest)); err != nil {
		t.Fatalf("failed to write manifest: %v", err)
	}

	skillWriter, err := zw.Create("SKILL.md")
	if err != nil {
		t.Fatalf("failed to create skill entry: %v", err)
	}
	skillContent := `---
name: upload-analysis-skill
description: Upload analysis skill
---

# Upload Analysis Skill

Read [guide](references/guide.md).
Use superpowers:test-driven-development before changes.
`
	if _, err := skillWriter.Write([]byte(skillContent)); err != nil {
		t.Fatalf("failed to write skill content: %v", err)
	}

	referenceWriter, err := zw.Create("references/guide.md")
	if err != nil {
		t.Fatalf("failed to create reference entry: %v", err)
	}
	if _, err := referenceWriter.Write([]byte("# Guide\n")); err != nil {
		t.Fatalf("failed to write reference content: %v", err)
	}

	if err := zw.Close(); err != nil {
		t.Fatalf("failed to close zip writer: %v", err)
	}
	if err := file.Close(); err != nil {
		t.Fatalf("failed to close file: %v", err)
	}

	svc := NewUploadService()
	meta, err := svc.ExtractFromZipFile(zipPath)
	if err != nil {
		t.Fatalf("extract failed: %v", err)
	}

	if meta.Analysis.EntryFile != "SKILL.md" {
		t.Fatalf("unexpected analysis entry file: %q", meta.Analysis.EntryFile)
	}
	if meta.Analysis.Mechanism != "skill_manifest" {
		t.Fatalf("unexpected analysis mechanism: %q", meta.Analysis.Mechanism)
	}
	expectedSources := []string{"SKILL.md.frontmatter", "skill.json", "skill.json.content_file"}
	if !reflect.DeepEqual(meta.Analysis.MetadataSources, expectedSources) {
		t.Fatalf("unexpected analysis metadata sources: got=%#v want=%#v", meta.Analysis.MetadataSources, expectedSources)
	}
	expectedPaths := []string{"references/guide.md"}
	if !reflect.DeepEqual(meta.Analysis.ReferencePaths, expectedPaths) {
		t.Fatalf("unexpected analysis reference paths: got=%#v want=%#v", meta.Analysis.ReferencePaths, expectedPaths)
	}
	expectedDependencies := []SourceDependency{
		{Kind: "file", Target: "references/guide.md"},
		{Kind: "skill", Target: "superpowers:test-driven-development"},
	}
	if !reflect.DeepEqual(meta.Analysis.Dependencies, expectedDependencies) {
		t.Fatalf("unexpected analysis dependencies: got=%#v want=%#v", meta.Analysis.Dependencies, expectedDependencies)
	}

	snapshot, err := svc.DescribeSource(zipPath, 16)
	if err != nil {
		t.Fatalf("describe source failed: %v", err)
	}
	if len(snapshot.Files) != 3 {
		t.Fatalf("unexpected file count: got=%d want=%d", len(snapshot.Files), 3)
	}
	if !reflect.DeepEqual(snapshot.Topology, meta.Analysis) {
		t.Fatalf("unexpected topology snapshot: got=%#v want=%#v", snapshot.Topology, meta.Analysis)
	}
}
