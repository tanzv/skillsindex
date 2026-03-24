package web

import (
	"context"
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"github.com/go-chi/chi/v5"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupSkillVersionHandlersTestApp(t *testing.T) (*App, *gorm.DB, models.User, models.User, models.Skill) {
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
		&models.SyncJobRun{},
		&models.SkillVersion{},
		&models.AuditLog{},
	); err != nil {
		t.Fatalf("failed to migrate sqlite db for skill version handlers: %v", err)
	}

	skillSvc := services.NewSkillService(db)
	versionSvc := services.NewSkillVersionService(db)
	owner := models.User{Username: "version-handler-owner", PasswordHash: "hash", Role: models.RoleMember}
	admin := models.User{Username: "version-handler-admin", PasswordHash: "hash", Role: models.RoleAdmin}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}
	if err := db.Create(&admin).Error; err != nil {
		t.Fatalf("failed to create admin: %v", err)
	}

	created, err := skillSvc.CreateSkill(context.Background(), services.CreateSkillInput{
		OwnerID:      owner.ID,
		Name:         "Handler Skill Original",
		Description:  "Original description",
		Content:      "content-v1",
		Tags:         []string{"alpha"},
		Visibility:   models.VisibilityPrivate,
		SourceType:   models.SourceTypeManual,
		CategorySlug: "development",
	})
	if err != nil {
		t.Fatalf("failed to create skill: %v", err)
	}
	if _, err := skillSvc.UpdateSyncedSkill(context.Background(), services.SyncUpdateInput{
		SkillID:      created.ID,
		OwnerID:      owner.ID,
		SourceType:   models.SourceTypeRepository,
		SourceURL:    "https://example.com/handler.git",
		SourceBranch: "main",
		Meta: services.ExtractedSkill{
			Name:        "Handler Skill Updated",
			Description: "Updated description",
			Content:     "content-v2",
			Tags:        []string{"alpha", "beta"},
		},
	}); err != nil {
		t.Fatalf("failed to update synced skill: %v", err)
	}

	tmpl := template.Must(template.New("layout").Parse(
		`{{define "layout"}}` +
			`{{.Page}}|` +
			`{{if .Skill}}{{.Skill.Name}}{{end}}|` +
			`{{if .SkillVersionDetail}}detail-{{.SkillVersionDetail.VersionNumber}};diff-summary={{.SkillVersionDetail.ChangeSummary}};diff-risk={{.SkillVersionDetail.RiskLevel}};diff-before={{.SkillVersionDetail.BeforeDigest}};diff-after={{.SkillVersionDetail.AfterDigest}};diff-fields={{.SkillVersionDetail.ChangedFieldsJSON}}{{end}}|` +
			`{{if .SkillVersionCompare}}{{.SkillVersionCompare.ChangeSummary}}{{end}}|` +
			`{{if .Message}}{{.Message}}{{end}}|` +
			`{{if .Error}}{{.Error}}{{end}}` +
			`{{end}}`,
	))
	app := &App{
		skillService:      skillSvc,
		syncJobSvc:        services.NewSyncJobService(db),
		skillVersionSvc:   versionSvc,
		auditService:      services.NewAuditService(db),
		templates:         tmpl,
		allowRegistration: true,
	}
	return app, db, owner, admin, created
}

func withURLParams(req *http.Request, params map[string]string) *http.Request {
	routeCtx := chi.NewRouteContext()
	for key, value := range params {
		routeCtx.URLParams.Add(key, value)
	}
	ctx := context.WithValue(req.Context(), chi.RouteCtxKey, routeCtx)
	return req.WithContext(ctx)
}

func loadSkillVersionIDs(t *testing.T, app *App, skillID uint) (uint, uint) {
	t.Helper()
	versions, err := app.skillVersionSvc.ListBySkill(context.Background(), services.ListSkillVersionsInput{
		SkillID: skillID,
		Limit:   20,
	})
	if err != nil {
		t.Fatalf("failed to list skill versions: %v", err)
	}
	var firstVersionID uint
	var secondVersionID uint
	for _, item := range versions {
		if item.VersionNumber == 1 {
			firstVersionID = item.ID
		}
		if item.VersionNumber == 2 {
			secondVersionID = item.ID
		}
	}
	if firstVersionID == 0 || secondVersionID == 0 {
		t.Fatalf("failed to resolve version IDs: first=%d second=%d", firstVersionID, secondVersionID)
	}
	return firstVersionID, secondVersionID
}

func TestHandleSkillVersionDetailSuccess(t *testing.T) {
	app, _, owner, _, skill := setupSkillVersionHandlersTestApp(t)
	_, versionID := loadSkillVersionIDs(t, app, skill.ID)

	req := httptest.NewRequest(http.MethodGet, "/skills/"+strconv.FormatUint(uint64(skill.ID), 10)+"/versions/"+strconv.FormatUint(uint64(versionID), 10), nil)
	req = withCurrentUser(req, &owner)
	req = withURLParams(req, map[string]string{
		"skillID":   strconv.FormatUint(uint64(skill.ID), 10),
		"versionID": strconv.FormatUint(uint64(versionID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleSkillVersionDetail(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	body := recorder.Body.String()
	if !strings.Contains(body, "skill_version_detail") {
		t.Fatalf("expected detail page marker in body, got=%s", body)
	}
	if !strings.Contains(body, "diff-summary=Changed ") {
		t.Fatalf("expected persisted summary in detail body, got=%s", body)
	}
	if !strings.Contains(body, "diff-risk=") || strings.Contains(body, "diff-risk=;") {
		t.Fatalf("expected persisted risk level in detail body, got=%s", body)
	}
	if !strings.Contains(body, "diff-before=") || strings.Contains(body, "diff-before=;") {
		t.Fatalf("expected persisted before digest in detail body, got=%s", body)
	}
	if !strings.Contains(body, "diff-after=") || strings.Contains(body, "diff-after=;") {
		t.Fatalf("expected persisted after digest in detail body, got=%s", body)
	}
	if !strings.Contains(body, "&#34;content&#34;") {
		t.Fatalf("expected changed fields json in detail body, got=%s", body)
	}
}

func TestHandleSkillVersionCompareSuccess(t *testing.T) {
	app, _, owner, _, skill := setupSkillVersionHandlersTestApp(t)
	fromVersionID, toVersionID := loadSkillVersionIDs(t, app, skill.ID)

	req := httptest.NewRequest(
		http.MethodGet,
		"/skills/"+strconv.FormatUint(uint64(skill.ID), 10)+"/versions/compare?from="+strconv.FormatUint(uint64(fromVersionID), 10)+"&to="+strconv.FormatUint(uint64(toVersionID), 10),
		nil,
	)
	req = withCurrentUser(req, &owner)
	req = withURLParams(req, map[string]string{
		"skillID": strconv.FormatUint(uint64(skill.ID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleSkillVersionCompare(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	body := recorder.Body.String()
	if !strings.Contains(body, "skill_version_compare") {
		t.Fatalf("expected compare page marker in body, got=%s", body)
	}
}

func TestHandleRollbackSkillVersionCreatesAudit(t *testing.T) {
	app, db, owner, _, skill := setupSkillVersionHandlersTestApp(t)
	versionID, _ := loadSkillVersionIDs(t, app, skill.ID)

	req := httptest.NewRequest(
		http.MethodPost,
		"/skills/"+strconv.FormatUint(uint64(skill.ID), 10)+"/versions/"+strconv.FormatUint(uint64(versionID), 10)+"/rollback",
		nil,
	)
	req = withCurrentUser(req, &owner)
	req = withURLParams(req, map[string]string{
		"skillID":   strconv.FormatUint(uint64(skill.ID), 10),
		"versionID": strconv.FormatUint(uint64(versionID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleRollbackSkillVersion(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	location := recorder.Header().Get("Location")
	if !strings.Contains(location, "/skills/"+strconv.FormatUint(uint64(skill.ID), 10)) {
		t.Fatalf("unexpected rollback redirect location: %s", location)
	}

	updated, err := app.skillService.GetSkillByID(context.Background(), skill.ID)
	if err != nil {
		t.Fatalf("failed to load updated skill: %v", err)
	}
	if updated.Name != "Handler Skill Original" {
		t.Fatalf("unexpected skill name after rollback: got=%s", updated.Name)
	}

	versions, err := app.skillVersionSvc.ListBySkill(context.Background(), services.ListSkillVersionsInput{
		SkillID: skill.ID,
		Limit:   20,
	})
	if err != nil {
		t.Fatalf("failed to load versions after rollback: %v", err)
	}
	if len(versions) < 3 {
		t.Fatalf("expected rollback to append new version, got=%d", len(versions))
	}
	if versions[0].Trigger != "rollback" {
		t.Fatalf("expected latest trigger rollback, got=%s", versions[0].Trigger)
	}

	var auditCount int64
	if err := db.Model(&models.AuditLog{}).
		Where("action = ? AND target_type = ? AND target_id = ?", "skill_rollback_version", "skill", skill.ID).
		Count(&auditCount).Error; err != nil {
		t.Fatalf("failed to count rollback audit logs: %v", err)
	}
	if auditCount == 0 {
		t.Fatalf("expected rollback audit log to be created")
	}

	var latestAudit models.AuditLog
	if err := db.Where("action = ? AND target_type = ? AND target_id = ?", "skill_rollback_version", "skill", skill.ID).
		Order("id DESC").
		First(&latestAudit).Error; err != nil {
		t.Fatalf("failed to load latest rollback audit log: %v", err)
	}
	var details map[string]string
	if err := json.Unmarshal([]byte(latestAudit.Details), &details); err != nil {
		t.Fatalf("failed to decode rollback audit details json: %v", err)
	}
	requiredDetailKeys := []string{
		"skill_id",
		"version_id",
		"target_version_number",
		"rollback_snapshot_version",
		"rollback_trigger",
		"rollback_before_digest",
		"rollback_after_digest",
		"rollback_risk_level",
		"rollback_change_summary",
	}
	for _, key := range requiredDetailKeys {
		if strings.TrimSpace(details[key]) == "" {
			t.Fatalf("missing rollback audit detail key %s in payload: %#v", key, details)
		}
	}
}

func TestHandleAPISkillVersionRollbackCreatesAudit(t *testing.T) {
	app, db, owner, _, skill := setupSkillVersionHandlersTestApp(t)
	versionID, _ := loadSkillVersionIDs(t, app, skill.ID)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/skills/"+strconv.FormatUint(uint64(skill.ID), 10)+"/versions/"+strconv.FormatUint(uint64(versionID), 10)+"/rollback",
		nil,
	)
	req = withCurrentUser(req, &owner)
	req = withURLParams(req, map[string]string{
		"skillID":   strconv.FormatUint(uint64(skill.ID), 10),
		"versionID": strconv.FormatUint(uint64(versionID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleAPISkillVersionRollback(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	if !strings.Contains(recorder.Body.String(), `"ok":true`) {
		t.Fatalf("unexpected response body: %s", recorder.Body.String())
	}

	var auditCount int64
	if err := db.Model(&models.AuditLog{}).
		Where("action = ? AND target_type = ? AND target_id = ?", "skill_rollback_version", "skill", skill.ID).
		Count(&auditCount).Error; err != nil {
		t.Fatalf("failed to count rollback audit logs: %v", err)
	}
	if auditCount == 0 {
		t.Fatalf("expected rollback audit log to be created")
	}
}

func TestHandleAPISkillVersionRollbackUnauthorized(t *testing.T) {
	app, _, _, _, skill := setupSkillVersionHandlersTestApp(t)
	versionID, _ := loadSkillVersionIDs(t, app, skill.ID)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/skills/"+strconv.FormatUint(uint64(skill.ID), 10)+"/versions/"+strconv.FormatUint(uint64(versionID), 10)+"/rollback",
		nil,
	)
	req.Header.Set("X-Request-ID", "req-skill-version-rollback-unauthorized")
	req = withURLParams(req, map[string]string{
		"skillID":   strconv.FormatUint(uint64(skill.ID), 10),
		"versionID": strconv.FormatUint(uint64(versionID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleAPISkillVersionRollback(recorder, req)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusUnauthorized)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "unauthorized" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Authentication required" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-skill-version-rollback-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}
