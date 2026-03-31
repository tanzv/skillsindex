package web

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"testing"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupRemoteSyncSkillMPTestApp(t *testing.T, skillURL string) (*App, models.User, models.Skill) {
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
		&models.SyncPolicy{},
		&models.AsyncJob{},
		&models.SkillVersion{},
		&models.SyncJobRun{},
		&models.AuditLog{},
	); err != nil {
		t.Fatalf("failed to migrate sqlite db for remote sync tests: %v", err)
	}

	skillSvc := services.NewSkillService(db)
	owner := models.User{Username: "remote-sync-owner", PasswordHash: "hash", Role: models.RoleMember}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner user: %v", err)
	}

	skill, err := skillSvc.CreateSkill(context.Background(), services.CreateSkillInput{
		OwnerID:      owner.ID,
		Name:         "Remote Sync Skill",
		Description:  "before sync",
		Content:      "content before",
		Tags:         []string{"skillmp"},
		Visibility:   models.VisibilityPrivate,
		SourceType:   models.SourceTypeSkillMP,
		SourceURL:    skillURL,
		CategorySlug: "development",
	})
	if err != nil {
		t.Fatalf("failed to create skill: %v", err)
	}

	app := &App{
		skillService: skillSvc,
		syncRuntimeDependencies: syncRuntimeDependencies{
			asyncJobSvc:       services.NewAsyncJobService(db),
			syncJobSvc:        services.NewSyncJobService(db),
			syncGovernanceSvc: services.NewSyncGovernanceService(services.NewAsyncJobService(db), services.NewSyncJobService(db), services.NewSkillVersionService(db), services.NewAuditService(db)),
		},
		skillMPService:  services.NewSkillMPService("", ""),
		skillVersionSvc: services.NewSkillVersionService(db),
		auditService:    services.NewAuditService(db),
	}
	return app, owner, skill
}

func setupRemoteSyncRepositoryTestApp(t *testing.T, repoURL string) (*App, models.User, models.Skill) {
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
		&models.SyncPolicy{},
		&models.AsyncJob{},
		&models.SkillVersion{},
		&models.SyncJobRun{},
		&models.AuditLog{},
	); err != nil {
		t.Fatalf("failed to migrate sqlite db for repository remote sync tests: %v", err)
	}

	skillSvc := services.NewSkillService(db)
	owner := models.User{Username: "remote-repo-owner", PasswordHash: "hash", Role: models.RoleMember}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner user: %v", err)
	}

	skill, err := skillSvc.CreateSkill(context.Background(), services.CreateSkillInput{
		OwnerID:      owner.ID,
		Name:         "Repository Remote Sync Skill",
		Description:  "before repository sync",
		Content:      "old repository content",
		Tags:         []string{"repository"},
		Visibility:   models.VisibilityPrivate,
		SourceType:   models.SourceTypeRepository,
		SourceURL:    repoURL,
		CategorySlug: "development",
	})
	if err != nil {
		t.Fatalf("failed to create repository skill: %v", err)
	}

	app := &App{
		skillService: skillSvc,
		syncRuntimeDependencies: syncRuntimeDependencies{
			repositoryService: services.NewRepositorySyncService(),
			asyncJobSvc:       services.NewAsyncJobService(db),
			syncJobSvc:        services.NewSyncJobService(db),
			syncGovernanceSvc: services.NewSyncGovernanceService(services.NewAsyncJobService(db), services.NewSyncJobService(db), services.NewSkillVersionService(db), services.NewAuditService(db)),
		},
		skillVersionSvc: services.NewSkillVersionService(db),
		auditService:    services.NewAuditService(db),
	}
	return app, owner, skill
}

func TestHandleRemoteSyncSkillMPSuccessCreatesGovernedRunAndVersion(t *testing.T) {
	skillServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"name":"SkillMP Updated","description":"updated","content":"new content","tags":["skillmp","go"]}`))
	}))
	defer skillServer.Close()

	app, owner, skill := setupRemoteSyncSkillMPTestApp(t, skillServer.URL)

	req := httptest.NewRequest(http.MethodPost, "/skills/"+strconv.FormatUint(uint64(skill.ID), 10)+"/sync", nil)
	req = withCurrentUser(req, &owner)
	req = withURLParam(req, "skillID", strconv.FormatUint(uint64(skill.ID), 10))
	recorder := httptest.NewRecorder()

	app.handleRemoteSync(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}

	targetSkillID := skill.ID
	runs, err := app.syncJobSvc.ListRuns(context.Background(), services.ListSyncRunsInput{
		TargetSkillID: &targetSkillID,
		Limit:         10,
	})
	if err != nil {
		t.Fatalf("failed to list sync runs: %v", err)
	}
	if len(runs) != 1 {
		t.Fatalf("expected exactly one sync run, got=%d", len(runs))
	}
	if runs[0].Synced != 1 {
		t.Fatalf("expected synced=1, got=%d", runs[0].Synced)
	}
	if runs[0].OwnerUserID == nil || *runs[0].OwnerUserID != owner.ID {
		t.Fatalf("unexpected owner user id in sync run")
	}
	if runs[0].ActorUserID == nil || *runs[0].ActorUserID != owner.ID {
		t.Fatalf("unexpected actor user id in sync run")
	}
	if runs[0].TargetSkillID == nil || *runs[0].TargetSkillID != skill.ID {
		t.Fatalf("unexpected target skill id in sync run")
	}
	if runs[0].Status != services.SyncRunStatusSucceeded {
		t.Fatalf("unexpected sync run status: %s", runs[0].Status)
	}
	if runs[0].JobID == nil {
		t.Fatalf("expected sync run to link async job")
	}

	jobs, err := app.asyncJobSvc.List(context.Background(), services.ListAsyncJobsInput{Limit: 10})
	if err != nil {
		t.Fatalf("failed to list async jobs: %v", err)
	}
	if len(jobs) != 1 {
		t.Fatalf("expected exactly one async job, got=%d", len(jobs))
	}
	if jobs[0].Status != models.AsyncJobStatusSucceeded {
		t.Fatalf("unexpected async job status: %s", jobs[0].Status)
	}
	if jobs[0].SyncRunID == nil || *jobs[0].SyncRunID != runs[0].ID {
		t.Fatalf("expected async job to point at sync run")
	}

	versions, err := app.skillVersionSvc.ListBySkill(context.Background(), services.ListSkillVersionsInput{
		SkillID: skill.ID,
		Limit:   10,
	})
	if err != nil {
		t.Fatalf("failed to list skill versions: %v", err)
	}
	if len(versions) < 2 {
		t.Fatalf("expected sync to append one version, got=%d", len(versions))
	}
	if versions[0].RunID == nil || *versions[0].RunID != runs[0].ID {
		t.Fatalf("expected latest version to link run id")
	}
}

func TestHandleRemoteSyncSkillMPFailureCreatesGovernedRunWithErrorSummary(t *testing.T) {
	skillServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		http.Error(w, "upstream failed", http.StatusBadGateway)
	}))
	defer skillServer.Close()

	app, owner, skill := setupRemoteSyncSkillMPTestApp(t, skillServer.URL)

	req := httptest.NewRequest(http.MethodPost, "/skills/"+strconv.FormatUint(uint64(skill.ID), 10)+"/sync", nil)
	req = withCurrentUser(req, &owner)
	req = withURLParam(req, "skillID", strconv.FormatUint(uint64(skill.ID), 10))
	recorder := httptest.NewRecorder()

	app.handleRemoteSync(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}

	targetSkillID := skill.ID
	runs, err := app.syncJobSvc.ListRuns(context.Background(), services.ListSyncRunsInput{
		TargetSkillID: &targetSkillID,
		Limit:         10,
	})
	if err != nil {
		t.Fatalf("failed to list sync runs: %v", err)
	}
	if len(runs) != 1 {
		t.Fatalf("expected exactly one sync run, got=%d", len(runs))
	}
	if runs[0].Failed < 1 {
		t.Fatalf("expected failed>=1, got=%d", runs[0].Failed)
	}
	if runs[0].ErrorSummary == "" {
		t.Fatalf("expected non-empty error summary")
	}
	if runs[0].TargetSkillID == nil || *runs[0].TargetSkillID != skill.ID {
		t.Fatalf("unexpected target skill id in sync run")
	}
	if runs[0].Status != services.SyncRunStatusFailed {
		t.Fatalf("unexpected failed sync run status: %s", runs[0].Status)
	}

	jobs, err := app.asyncJobSvc.List(context.Background(), services.ListAsyncJobsInput{Limit: 10})
	if err != nil {
		t.Fatalf("failed to list async jobs: %v", err)
	}
	if len(jobs) != 1 {
		t.Fatalf("expected one async job, got=%d", len(jobs))
	}
	if jobs[0].Status != models.AsyncJobStatusFailed {
		t.Fatalf("unexpected async job status: %s", jobs[0].Status)
	}
}

func TestHandleRemoteSyncRepositorySuccessCreatesGovernedRunAndVersion(t *testing.T) {
	repoPath := createRemoteSyncRepositoryFixture(t)
	app, owner, skill := setupRemoteSyncRepositoryTestApp(t, repoPath)

	req := httptest.NewRequest(http.MethodPost, "/skills/"+strconv.FormatUint(uint64(skill.ID), 10)+"/sync", nil)
	req = withCurrentUser(req, &owner)
	req = withURLParam(req, "skillID", strconv.FormatUint(uint64(skill.ID), 10))
	recorder := httptest.NewRecorder()

	app.handleRemoteSync(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}

	updated, err := app.skillService.GetSkillByID(context.Background(), skill.ID)
	if err != nil {
		t.Fatalf("failed to load updated skill: %v", err)
	}
	if updated.Name != "Repo Skill" {
		t.Fatalf("unexpected updated skill name: %s", updated.Name)
	}

	targetSkillID := skill.ID
	runs, err := app.syncJobSvc.ListRuns(context.Background(), services.ListSyncRunsInput{
		TargetSkillID: &targetSkillID,
		Limit:         10,
	})
	if err != nil {
		t.Fatalf("failed to list sync runs: %v", err)
	}
	if len(runs) != 1 {
		t.Fatalf("expected one sync run, got=%d", len(runs))
	}
	if runs[0].Status != services.SyncRunStatusSucceeded {
		t.Fatalf("unexpected sync run status: %s", runs[0].Status)
	}

	versions, err := app.skillVersionSvc.ListBySkill(context.Background(), services.ListSkillVersionsInput{
		SkillID: skill.ID,
		Limit:   10,
	})
	if err != nil {
		t.Fatalf("failed to list skill versions: %v", err)
	}
	if len(versions) < 2 {
		t.Fatalf("expected repository sync to append one version, got=%d", len(versions))
	}
	if versions[0].RunID == nil || *versions[0].RunID != runs[0].ID {
		t.Fatalf("expected latest version to link sync run")
	}
}

func createRemoteSyncRepositoryFixture(t *testing.T) string {
	t.Helper()
	tmp := t.TempDir()
	repoPath := filepath.Join(tmp, "repo")
	if err := os.MkdirAll(repoPath, 0o755); err != nil {
		t.Fatalf("failed to create repo path: %v", err)
	}
	runGitInRepositoryFixture(t, repoPath, "init")
	runGitInRepositoryFixture(t, repoPath, "config", "user.name", "test")
	runGitInRepositoryFixture(t, repoPath, "config", "user.email", "test@example.com")

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
	runGitInRepositoryFixture(t, repoPath, "add", "skill.json", "README.md")
	runGitInRepositoryFixture(t, repoPath, "commit", "-m", "init")
	return repoPath
}

func runGitInRepositoryFixture(t *testing.T, repoPath string, args ...string) {
	t.Helper()
	cmd := exec.Command("git", args...)
	cmd.Dir = repoPath
	output, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("git %s failed: %v: %s", strings.Join(args, " "), err, strings.TrimSpace(string(output)))
	}
}
