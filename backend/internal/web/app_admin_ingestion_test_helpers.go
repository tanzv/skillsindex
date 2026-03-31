package web

import (
	"archive/zip"
	"bytes"
	"context"
	"fmt"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupAdminIngestionAPITestApp(t *testing.T) (*App, models.User) {
	t.Helper()

	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	if err := db.AutoMigrate(
		&models.User{},
		&models.Skill{},
		&models.Tag{},
		&models.SkillTag{},
		&models.SkillVersion{},
		&models.AsyncJob{},
		&models.AuditLog{},
	); err != nil {
		t.Fatalf("failed to migrate sqlite db: %v", err)
	}

	owner := models.User{Username: "ingestion-owner", PasswordHash: "hash", Role: models.RoleMember}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner user: %v", err)
	}

	app := &App{
		skillService: services.NewSkillService(db),
		syncRuntimeDependencies: syncRuntimeDependencies{
			asyncJobSvc:       services.NewAsyncJobService(db),
			repositoryService: services.NewRepositorySyncService(),
		},
		uploadService:  services.NewUploadService(),
		skillMPService: services.NewSkillMPService("", ""),
		auditService:   services.NewAuditService(db),
		storagePath:    t.TempDir(),
	}
	return app, owner
}

func assertAdminIngestionCreated(
	t *testing.T,
	recorder *httptest.ResponseRecorder,
	wantMessage string,
	wantSourceType string,
	wantOwnerUsername string,
) {
	t.Helper()

	if recorder.Code != http.StatusCreated {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusCreated, recorder.Body.String())
	}

	payload := decodeBodyMap(t, recorder)
	if got, _ := payload["status"].(string); got != "created" {
		t.Fatalf("unexpected status payload: got=%q payload=%#v", got, payload)
	}
	if got, _ := payload["message"].(string); got != wantMessage {
		t.Fatalf("unexpected message payload: got=%q want=%q payload=%#v", got, wantMessage, payload)
	}

	item, ok := payload["item"].(map[string]any)
	if !ok {
		t.Fatalf("missing item payload: %#v", payload)
	}
	if got, _ := item["source_type"].(string); got != wantSourceType {
		t.Fatalf("unexpected source_type: got=%q want=%q item=%#v", got, wantSourceType, item)
	}
	if got, _ := item["owner_username"].(string); got != wantOwnerUsername {
		t.Fatalf("unexpected owner_username: got=%q want=%q item=%#v", got, wantOwnerUsername, item)
	}
	idValue, ok := item["id"].(float64)
	if !ok || int(idValue) <= 0 {
		t.Fatalf("unexpected item id: %#v", item["id"])
	}
}

func createRepositoryFixture(t *testing.T) string {
	t.Helper()

	repoDir := t.TempDir()
	createRepositoryFixtureFiles(t, repoDir, map[string]string{
		"skill.json": `{"name":"Repository API Skill","description":"Imported from repository","tags":["repository","api"],"content_file":"README.md"}`,
		"README.md":  "# Repository API Skill\n\nImported from repository.\n",
	})

	runCommand(t, repoDir, "git", "init")
	runCommand(t, repoDir, "git", "config", "user.email", "test@example.com")
	runCommand(t, repoDir, "git", "config", "user.name", "Test User")
	runCommand(t, repoDir, "git", "add", ".")
	runCommand(t, repoDir, "git", "commit", "-m", "init")

	return repoDir
}

func createRepositoryFixtureFiles(t *testing.T, repoDir string, files map[string]string) {
	t.Helper()

	for relativePath, content := range files {
		fullPath := filepath.Join(repoDir, relativePath)
		if err := os.MkdirAll(filepath.Dir(fullPath), 0o755); err != nil {
			t.Fatalf("failed to create parent directory for %s: %v", relativePath, err)
		}
		if err := os.WriteFile(fullPath, []byte(content), 0o644); err != nil {
			t.Fatalf("failed to write %s: %v", relativePath, err)
		}
	}
}

func runCommand(t *testing.T, workdir string, name string, args ...string) {
	t.Helper()

	cmd := exec.Command(name, args...)
	cmd.Dir = workdir
	output, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("command failed: %s %s: %v: %s", name, strings.Join(args, " "), err, strings.TrimSpace(string(output)))
	}
}

func buildUploadRequest(t *testing.T, fields map[string]string) *http.Request {
	t.Helper()

	archiveBuffer := bytes.NewBuffer(nil)
	archiveWriter := zip.NewWriter(archiveBuffer)

	manifestWriter, err := archiveWriter.Create("skill.json")
	if err != nil {
		t.Fatalf("failed to create skill.json entry: %v", err)
	}
	_, _ = manifestWriter.Write([]byte(`{"name":"Archive API Skill","description":"Imported from archive","tags":["archive","api"],"content_file":"README.md"}`))

	readmeWriter, err := archiveWriter.Create("README.md")
	if err != nil {
		t.Fatalf("failed to create README.md entry: %v", err)
	}
	_, _ = readmeWriter.Write([]byte("# Archive API Skill\n\nImported from archive.\n"))

	if err := archiveWriter.Close(); err != nil {
		t.Fatalf("failed to close zip writer: %v", err)
	}

	body := bytes.NewBuffer(nil)
	formWriter := multipart.NewWriter(body)
	fileWriter, err := formWriter.CreateFormFile("archive", "skill.zip")
	if err != nil {
		t.Fatalf("failed to create form file: %v", err)
	}
	if _, err := fileWriter.Write(archiveBuffer.Bytes()); err != nil {
		t.Fatalf("failed to write archive payload: %v", err)
	}
	for key, value := range fields {
		if err := formWriter.WriteField(key, value); err != nil {
			t.Fatalf("failed to write field %s: %v", key, err)
		}
	}
	if err := formWriter.Close(); err != nil {
		t.Fatalf("failed to close multipart writer: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/ingestion/upload", body)
	req.Header.Set("Content-Type", formWriter.FormDataContentType())
	return req
}

func listAdminIngestionSkillsByOwner(t *testing.T, app *App, ownerID uint) []models.Skill {
	t.Helper()

	items, err := app.skillService.ListSkillsByOwner(context.Background(), ownerID)
	if err != nil {
		t.Fatalf("failed to list created skills: %v", err)
	}
	return items
}
