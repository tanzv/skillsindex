package web

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strconv"
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
		skillService:   skillSvc,
		skillMPService: services.NewSkillMPService("", ""),
		syncJobSvc:     services.NewSyncJobService(db),
		auditService:   services.NewAuditService(db),
	}
	return app, owner, skill
}

func TestHandleRemoteSyncSkillMPSuccessCreatesSyncRun(t *testing.T) {
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
}

func TestHandleRemoteSyncSkillMPFailureCreatesSyncRunWithErrorSummary(t *testing.T) {
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
}
