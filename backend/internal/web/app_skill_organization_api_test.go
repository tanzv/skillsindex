package web

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupSkillOrganizationAPITestApp(t *testing.T) (*App, *gorm.DB, models.User, models.User, models.Skill, models.Organization) {
	t.Helper()

	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	if err := db.AutoMigrate(
		&models.User{},
		&models.Organization{},
		&models.OrganizationMember{},
		&models.Skill{},
		&models.Tag{},
		&models.SkillTag{},
		&models.SkillVersion{},
		&models.AuditLog{},
	); err != nil {
		t.Fatalf("failed to migrate sqlite db: %v", err)
	}

	owner := models.User{Username: "org-skill-owner", PasswordHash: "hash", Role: models.RoleMember}
	stranger := models.User{Username: "org-skill-stranger", PasswordHash: "hash", Role: models.RoleMember}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}
	if err := db.Create(&stranger).Error; err != nil {
		t.Fatalf("failed to create stranger: %v", err)
	}

	skill := models.Skill{
		OwnerID:    owner.ID,
		Name:       "Organization Skill",
		Visibility: models.VisibilityPrivate,
		SourceType: models.SourceTypeManual,
	}
	if err := db.Create(&skill).Error; err != nil {
		t.Fatalf("failed to create skill: %v", err)
	}

	organization := models.Organization{Name: "Acme", Slug: "acme"}
	if err := db.Create(&organization).Error; err != nil {
		t.Fatalf("failed to create organization: %v", err)
	}

	app := &App{
		skillService:    services.NewSkillService(db),
		organizationSvc: services.NewOrganizationService(db),
		auditService:    services.NewAuditService(db),
	}
	return app, db, owner, stranger, skill, organization
}

func TestAPISkillOrganizationBindUnauthorized(t *testing.T) {
	app, _, _, _, skill, _ := setupSkillOrganizationAPITestApp(t)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/skills/1/organization-bind", strings.NewReader(`{"organization_id":1}`))
	req.Header.Set("Content-Type", "application/json")
	req = withURLParam(req, "skillID", strconv.FormatUint(uint64(skill.ID), 10))
	recorder := httptest.NewRecorder()

	app.handleAPISkillOrganizationBind(recorder, req)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusUnauthorized)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "unauthorized" {
		t.Fatalf("unexpected payload: %#v", payload)
	}
}

func TestAPISkillOrganizationBindInvalidPayload(t *testing.T) {
	app, _, owner, _, skill, _ := setupSkillOrganizationAPITestApp(t)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/skills/1/organization-bind", strings.NewReader(`{}`))
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &owner)
	req = withURLParam(req, "skillID", strconv.FormatUint(uint64(skill.ID), 10))
	recorder := httptest.NewRecorder()

	app.handleAPISkillOrganizationBind(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_payload" {
		t.Fatalf("unexpected payload: %#v", payload)
	}
}

func TestAPISkillOrganizationBindOrganizationNotFound(t *testing.T) {
	app, _, owner, _, skill, _ := setupSkillOrganizationAPITestApp(t)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/skills/1/organization-bind", strings.NewReader(`{"organization_id":99999}`))
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &owner)
	req = withURLParam(req, "skillID", strconv.FormatUint(uint64(skill.ID), 10))
	recorder := httptest.NewRecorder()

	app.handleAPISkillOrganizationBind(recorder, req)

	if recorder.Code != http.StatusNotFound {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusNotFound)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "organization_not_found" {
		t.Fatalf("unexpected payload: %#v", payload)
	}
}

func TestAPISkillOrganizationBindForbiddenForOrganizationPermissionDenied(t *testing.T) {
	app, _, owner, _, skill, organization := setupSkillOrganizationAPITestApp(t)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/skills/1/organization-bind",
		strings.NewReader(`{"organization_id":`+strconv.FormatUint(uint64(organization.ID), 10)+`} `),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &owner)
	req = withURLParam(req, "skillID", strconv.FormatUint(uint64(skill.ID), 10))
	recorder := httptest.NewRecorder()

	app.handleAPISkillOrganizationBind(recorder, req)

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusForbidden)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "permission_denied" {
		t.Fatalf("unexpected payload: %#v", payload)
	}
}

func TestAPISkillOrganizationBindSuccess(t *testing.T) {
	app, db, owner, _, skill, organization := setupSkillOrganizationAPITestApp(t)

	if err := db.Create(&models.OrganizationMember{
		OrganizationID: organization.ID,
		UserID:         owner.ID,
		Role:           models.OrganizationRoleOwner,
	}).Error; err != nil {
		t.Fatalf("failed to create owner membership: %v", err)
	}

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/skills/1/organization-bind",
		strings.NewReader(`{"organization_id":`+strconv.FormatUint(uint64(organization.ID), 10)+`} `),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &owner)
	req = withURLParam(req, "skillID", strconv.FormatUint(uint64(skill.ID), 10))
	recorder := httptest.NewRecorder()

	app.handleAPISkillOrganizationBind(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	if okValue, _ := payload["ok"].(bool); !okValue {
		t.Fatalf("expected ok=true, payload=%#v", payload)
	}
	if uint(payload["organization_id"].(float64)) != organization.ID {
		t.Fatalf("unexpected organization id payload: %#v", payload)
	}

	updated, err := app.skillService.GetSkillByID(context.Background(), skill.ID)
	if err != nil {
		t.Fatalf("failed to load updated skill: %v", err)
	}
	if updated.OrganizationID == nil || *updated.OrganizationID != organization.ID {
		t.Fatalf("expected skill organization id=%d, got=%v", organization.ID, updated.OrganizationID)
	}

	var auditCount int64
	if err := db.Model(&models.AuditLog{}).
		Where("action = ? AND target_type = ? AND target_id = ?", "skill_organization_bind", "skill", skill.ID).
		Count(&auditCount).Error; err != nil {
		t.Fatalf("failed to count audit logs: %v", err)
	}
	if auditCount == 0 {
		t.Fatalf("expected bind audit log")
	}
}

func TestAPISkillOrganizationUnbindSuccessIdempotent(t *testing.T) {
	app, _, owner, _, skill, _ := setupSkillOrganizationAPITestApp(t)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/skills/1/organization-unbind", nil)
	req = withCurrentUser(req, &owner)
	req = withURLParam(req, "skillID", strconv.FormatUint(uint64(skill.ID), 10))
	recorder := httptest.NewRecorder()

	app.handleAPISkillOrganizationUnbind(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	if _, exists := payload["organization_id"]; !exists {
		t.Fatalf("missing organization_id field: %#v", payload)
	}
	if payload["organization_id"] != nil {
		t.Fatalf("expected organization_id=nil, payload=%#v", payload)
	}
}

func TestAPISkillOrganizationUnbindForbiddenForOrganizationPermissionDenied(t *testing.T) {
	app, db, owner, _, skill, organization := setupSkillOrganizationAPITestApp(t)

	if err := db.Model(&models.Skill{}).
		Where("id = ?", skill.ID).
		Update("organization_id", organization.ID).Error; err != nil {
		t.Fatalf("failed to bind skill organization: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/api/v1/skills/1/organization-unbind", nil)
	req = withCurrentUser(req, &owner)
	req = withURLParam(req, "skillID", strconv.FormatUint(uint64(skill.ID), 10))
	recorder := httptest.NewRecorder()

	app.handleAPISkillOrganizationUnbind(recorder, req)

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusForbidden)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "permission_denied" {
		t.Fatalf("unexpected payload: %#v", payload)
	}
}
