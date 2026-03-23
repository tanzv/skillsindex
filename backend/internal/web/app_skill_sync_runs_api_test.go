package web

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupSkillSyncRunsTestApp(t *testing.T) (*App, *gorm.DB, models.User, models.User, models.User, models.Skill, models.Skill) {
	t.Helper()

	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	if err := db.AutoMigrate(&models.User{}, &models.Skill{}, &models.Tag{}, &models.SkillTag{}, &models.SyncPolicy{}, &models.AsyncJob{}, &models.SyncJobRun{}, &models.SkillVersion{}, &models.AuditLog{}); err != nil {
		t.Fatalf("failed to migrate sqlite db: %v", err)
	}

	owner := models.User{Username: "sync-owner", PasswordHash: "hash", Role: models.RoleMember}
	member := models.User{Username: "sync-member", PasswordHash: "hash", Role: models.RoleMember}
	admin := models.User{Username: "sync-admin", PasswordHash: "hash", Role: models.RoleAdmin}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner user: %v", err)
	}
	if err := db.Create(&member).Error; err != nil {
		t.Fatalf("failed to create member user: %v", err)
	}
	if err := db.Create(&admin).Error; err != nil {
		t.Fatalf("failed to create admin user: %v", err)
	}

	skillA := models.Skill{
		OwnerID:    owner.ID,
		Name:       "Skill A",
		SourceType: models.SourceTypeManual,
		Visibility: models.VisibilityPrivate,
	}
	skillB := models.Skill{
		OwnerID:    owner.ID,
		Name:       "Skill B",
		SourceType: models.SourceTypeManual,
		Visibility: models.VisibilityPrivate,
	}
	if err := db.Create(&skillA).Error; err != nil {
		t.Fatalf("failed to create skill A: %v", err)
	}
	if err := db.Create(&skillB).Error; err != nil {
		t.Fatalf("failed to create skill B: %v", err)
	}

	app := &App{
		skillService:    services.NewSkillService(db),
		syncJobSvc:      services.NewSyncJobService(db),
		skillVersionSvc: services.NewSkillVersionService(db),
		auditService:    services.NewAuditService(db),
	}
	return app, db, owner, member, admin, skillA, skillB
}

func TestAPISkillSyncRunsUnauthorized(t *testing.T) {
	app, _, _, _, _, skillA, _ := setupSkillSyncRunsTestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/skills/1/sync-runs", nil)
	req = withURLParam(req, "skillID", strconv.FormatUint(uint64(skillA.ID), 10))
	recorder := httptest.NewRecorder()

	app.handleAPISkillSyncRuns(recorder, req)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusUnauthorized)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "unauthorized" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
}

func TestAPISkillSyncRunsSyncServiceUnavailable(t *testing.T) {
	app, _, owner, _, _, skillA, _ := setupSkillSyncRunsTestApp(t)
	app.syncJobSvc = nil

	req := httptest.NewRequest(http.MethodGet, "/api/v1/skills/1/sync-runs", nil)
	req = withCurrentUser(req, &owner)
	req = withURLParam(req, "skillID", strconv.FormatUint(uint64(skillA.ID), 10))
	recorder := httptest.NewRecorder()

	app.handleAPISkillSyncRuns(recorder, req)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusServiceUnavailable)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "service_unavailable" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
}

func TestAPISkillSyncRunsSkillServiceUnavailable(t *testing.T) {
	app, _, owner, _, _, skillA, _ := setupSkillSyncRunsTestApp(t)
	app.skillService = nil

	req := httptest.NewRequest(http.MethodGet, "/api/v1/skills/1/sync-runs", nil)
	req = withCurrentUser(req, &owner)
	req = withURLParam(req, "skillID", strconv.FormatUint(uint64(skillA.ID), 10))
	recorder := httptest.NewRecorder()

	app.handleAPISkillSyncRuns(recorder, req)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusServiceUnavailable)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "service_unavailable" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
}

func TestAPISkillSyncRunsForbiddenForNonOwnerMember(t *testing.T) {
	app, _, _, member, _, skillA, _ := setupSkillSyncRunsTestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/skills/1/sync-runs", nil)
	req = withCurrentUser(req, &member)
	req = withURLParam(req, "skillID", strconv.FormatUint(uint64(skillA.ID), 10))
	recorder := httptest.NewRecorder()

	app.handleAPISkillSyncRuns(recorder, req)

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusForbidden)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "permission_denied" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
}

func TestAPISkillSyncRunsSkillNotFound(t *testing.T) {
	app, _, _, _, admin, _, _ := setupSkillSyncRunsTestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/skills/99999/sync-runs", nil)
	req = withCurrentUser(req, &admin)
	req = withURLParam(req, "skillID", "99999")
	recorder := httptest.NewRecorder()

	app.handleAPISkillSyncRuns(recorder, req)

	if recorder.Code != http.StatusNotFound {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusNotFound)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "skill_not_found" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
}

func TestAPISkillSyncRunsSuccessFiltersByTargetSkill(t *testing.T) {
	app, _, owner, _, _, skillA, skillB := setupSkillSyncRunsTestApp(t)

	now := time.Now().UTC()
	ownerID := owner.ID
	targetSkillAID := skillA.ID
	targetSkillBID := skillB.ID

	_, err := app.syncJobSvc.RecordRun(context.Background(), services.RecordSyncRunInput{
		Trigger:       "manual",
		Scope:         "owned",
		TargetSkillID: &targetSkillAID,
		OwnerUserID:   &ownerID,
		Candidates:    1,
		Synced:        1,
		StartedAt:     now.Add(-3 * time.Second),
		FinishedAt:    now.Add(-2 * time.Second),
	})
	if err != nil {
		t.Fatalf("failed to create first target run: %v", err)
	}
	_, err = app.syncJobSvc.RecordRun(context.Background(), services.RecordSyncRunInput{
		Trigger:       "scheduled",
		Scope:         "owned",
		TargetSkillID: &targetSkillAID,
		OwnerUserID:   &ownerID,
		Candidates:    2,
		Synced:        2,
		StartedAt:     now.Add(-2 * time.Second),
		FinishedAt:    now.Add(-1 * time.Second),
	})
	if err != nil {
		t.Fatalf("failed to create second target run: %v", err)
	}
	_, err = app.syncJobSvc.RecordRun(context.Background(), services.RecordSyncRunInput{
		Trigger:       "manual",
		Scope:         "owned",
		TargetSkillID: &targetSkillBID,
		OwnerUserID:   &ownerID,
		Candidates:    3,
		Synced:        3,
		StartedAt:     now.Add(-1 * time.Second),
		FinishedAt:    now,
	})
	if err != nil {
		t.Fatalf("failed to create other target run: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/skills/1/sync-runs?limit=10", nil)
	req = withCurrentUser(req, &owner)
	req = withURLParam(req, "skillID", strconv.FormatUint(uint64(skillA.ID), 10))
	recorder := httptest.NewRecorder()

	app.handleAPISkillSyncRuns(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	total, _ := payload["total"].(float64)
	if int(total) != 2 {
		t.Fatalf("unexpected total: got=%v want=2 payload=%#v", total, payload)
	}
	items, ok := payload["items"].([]any)
	if !ok {
		t.Fatalf("missing items payload: %#v", payload)
	}
	if len(items) != 2 {
		t.Fatalf("unexpected item count: got=%d want=2", len(items))
	}
	for _, raw := range items {
		item, ok := raw.(map[string]any)
		if !ok {
			t.Fatalf("unexpected item payload type: %#v", raw)
		}
		targetID, _ := item["target_skill_id"].(float64)
		if targetID == 0 {
			targetID, _ = item["TargetSkillID"].(float64)
		}
		if uint(targetID) != skillA.ID {
			t.Fatalf("unexpected target skill id in item: got=%v want=%d item=%#v", targetID, skillA.ID, item)
		}
	}
}
