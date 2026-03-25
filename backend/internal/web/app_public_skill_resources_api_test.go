package web

import (
	"archive/zip"
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"testing"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func createPublicSkillExtensionUploadArchive(t *testing.T) string {
	t.Helper()

	archivePath := filepath.Join(t.TempDir(), "public-skill-upload.zip")
	file, err := os.Create(archivePath)
	if err != nil {
		t.Fatalf("failed to create upload archive: %v", err)
	}

	archiveWriter := zip.NewWriter(file)
	manifestWriter, err := archiveWriter.Create("skill.json")
	if err != nil {
		t.Fatalf("failed to create skill.json entry: %v", err)
	}
	_, _ = manifestWriter.Write([]byte(`{
  "name": "Upload Resource Skill",
  "description": "Browse upload-backed resources.",
  "tags": ["upload", "resources"],
  "content_file": "SKILL.md"
}`))

	skillWriter, err := archiveWriter.Create("SKILL.md")
	if err != nil {
		t.Fatalf("failed to create SKILL.md entry: %v", err)
	}
	_, _ = skillWriter.Write([]byte(`---
name: upload-resource-skill
description: Browse upload-backed resources.
---

# Upload Resource Skill

Read [guide](references/guide.md).
Use superpowers:systematic-debugging before fixes.
`))

	guideWriter, err := archiveWriter.Create("references/guide.md")
	if err != nil {
		t.Fatalf("failed to create references/guide.md entry: %v", err)
	}
	_, _ = guideWriter.Write([]byte("# Upload Guide\n\nBrowse uploaded guide.\n"))

	if err := archiveWriter.Close(); err != nil {
		t.Fatalf("failed to close upload archive writer: %v", err)
	}
	if err := file.Close(); err != nil {
		t.Fatalf("failed to close upload archive file: %v", err)
	}

	return archivePath
}

func TestHandleAPIPublicSkillResourceContentReturnsSelectedFile(t *testing.T) {
	app, owner, _, _ := setupPublicSkillExtensionAPITestApp(t)
	repoPath := createPublicSkillExtensionRepository(t)
	app.repositoryService = services.NewRepositorySyncService()

	repositorySkill, err := app.skillService.CreateSkill(context.Background(), services.CreateSkillInput{
		OwnerID:         owner.ID,
		Name:            "Repository Content Skill",
		Description:     "Read real repository file content.",
		Content:         "# Repository Content Skill\n\nFallback content.",
		Tags:            []string{"repo", "content"},
		CategorySlug:    "development",
		SubcategorySlug: "automation",
		Visibility:      models.VisibilityPublic,
		SourceType:      models.SourceTypeRepository,
		RecordOrigin:    models.RecordOriginImported,
		SourceURL:       repoPath,
		RepoURL:         repoPath,
		InstallCommand:  "codex skill install local/repository-content-skill",
		StarCount:       77,
		QualityScore:    9.0,
	})
	if err != nil {
		t.Fatalf("failed to create repository skill: %v", err)
	}

	req := httptest.NewRequest(
		http.MethodGet,
		"/api/v1/public/skills/"+strconv.FormatUint(uint64(repositorySkill.ID), 10)+"/resource-file?path=docs%2Fguide.md",
		nil,
	)
	req = withURLParams(req, map[string]string{
		"skillID": strconv.FormatUint(uint64(repositorySkill.ID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleAPIPublicSkillResourceContent(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	body := recorder.Body.String()
	if !strings.Contains(body, `"path":"docs/guide.md"`) {
		t.Fatalf("expected selected file path in resource content response: %s", body)
	}
	if !strings.Contains(body, `"language":"Markdown"`) {
		t.Fatalf("expected markdown language in resource content response: %s", body)
	}
	if !strings.Contains(body, `Use the repository guide.`) {
		t.Fatalf("expected repository file content in response: %s", body)
	}
}

func TestHandleAPIPublicSkillResourcesReturnsUploadFilesAndTopology(t *testing.T) {
	app, owner, _, _ := setupPublicSkillExtensionAPITestApp(t)
	archivePath := createPublicSkillExtensionUploadArchive(t)
	app.uploadService = services.NewUploadService()

	uploadSkill, err := app.skillService.CreateSkill(context.Background(), services.CreateSkillInput{
		OwnerID:         owner.ID,
		Name:            "Upload Resource Skill",
		Description:     "Browse upload-backed resources.",
		Content:         "# Upload Resource Skill\n\nFallback content.",
		Tags:            []string{"upload", "resources"},
		CategorySlug:    "tools",
		SubcategorySlug: "automation-tools",
		Visibility:      models.VisibilityPublic,
		SourceType:      models.SourceTypeUpload,
		RecordOrigin:    models.RecordOriginImported,
		SourcePath:      archivePath,
		InstallCommand:  "codex skill install upload/resource-skill",
		StarCount:       42,
		QualityScore:    8.7,
	})
	if err != nil {
		t.Fatalf("failed to create upload skill: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/skills/"+strconv.FormatUint(uint64(uploadSkill.ID), 10)+"/resources", nil)
	req = withURLParams(req, map[string]string{
		"skillID": strconv.FormatUint(uint64(uploadSkill.ID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleAPIPublicSkillResources(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}
	body := recorder.Body.String()
	if !strings.Contains(body, `"entry_file":"SKILL.md"`) {
		t.Fatalf("missing parsed entry file in upload resources response: %s", body)
	}
	if !strings.Contains(body, `"mechanism":"skill_manifest"`) {
		t.Fatalf("missing parsed mechanism in upload resources response: %s", body)
	}
	if !strings.Contains(body, `"metadata_sources":["SKILL.md.frontmatter","skill.json","skill.json.content_file"]`) {
		t.Fatalf("missing parsed metadata sources in upload resources response: %s", body)
	}
	if !strings.Contains(body, `"reference_count":1`) {
		t.Fatalf("missing parsed reference count in upload resources response: %s", body)
	}
	if !strings.Contains(body, `"dependency_count":2`) {
		t.Fatalf("missing parsed dependency count in upload resources response: %s", body)
	}
	if !strings.Contains(body, `"reference_paths":["references/guide.md"]`) {
		t.Fatalf("missing parsed reference paths in upload resources response: %s", body)
	}
	if !strings.Contains(body, `"name":"references/guide.md"`) {
		t.Fatalf("missing uploaded guide file in upload resources response: %s", body)
	}
}
