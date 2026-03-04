package services

import (
	"archive/zip"
	"os"
	"path/filepath"
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
