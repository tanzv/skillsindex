package web

import (
	"context"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strconv"
	"strings"
	"testing"

	"skillsindex/internal/models"
)

func newSkillOrganizationWebFormRequest(t *testing.T, path string, values url.Values) *http.Request {
	t.Helper()
	if values == nil {
		values = url.Values{}
	}
	values.Set(csrfTokenFormField, "csrf_demo")

	req := httptest.NewRequest(http.MethodPost, path, strings.NewReader(values.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.AddCookie(&http.Cookie{Name: csrfCookieName, Value: "csrf_demo"})
	return req
}

func TestSkillOrganizationWebBindUnauthorizedRedirectsToLogin(t *testing.T) {
	app, _, _, _, skill, _ := setupSkillOrganizationAPITestApp(t)
	router := app.Router()

	form := url.Values{}
	form.Set("organization_id", "1")
	req := newSkillOrganizationWebFormRequest(t, "/skills/"+strconv.FormatUint(uint64(skill.ID), 10)+"/organization-bind", form)
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	if got := recorder.Header().Get("Location"); got != "/login" {
		t.Fatalf("unexpected redirect location: got=%s want=/login", got)
	}
}

func TestSkillOrganizationWebBindInvalidPayloadRedirectsWithError(t *testing.T) {
	app, _, owner, _, skill, _ := setupSkillOrganizationAPITestApp(t)
	router := app.Router()

	req := newSkillOrganizationWebFormRequest(t, "/skills/"+strconv.FormatUint(uint64(skill.ID), 10)+"/organization-bind", url.Values{})
	req = withCurrentUser(req, &owner)
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	location := recorder.Header().Get("Location")
	wantPrefix := "/skills/" + strconv.FormatUint(uint64(skill.ID), 10) + "?err="
	if !strings.HasPrefix(location, wantPrefix) {
		t.Fatalf("unexpected redirect location: got=%s want_prefix=%s", location, wantPrefix)
	}
}

func TestSkillOrganizationWebBindSuccessUpdatesSkillAndWritesAudit(t *testing.T) {
	app, db, owner, _, skill, organization := setupSkillOrganizationAPITestApp(t)
	router := app.Router()

	if err := db.Create(&models.OrganizationMember{
		OrganizationID: organization.ID,
		UserID:         owner.ID,
		Role:           models.OrganizationRoleOwner,
	}).Error; err != nil {
		t.Fatalf("failed to create owner membership: %v", err)
	}

	form := url.Values{}
	form.Set("organization_id", strconv.FormatUint(uint64(organization.ID), 10))
	req := newSkillOrganizationWebFormRequest(t, "/skills/"+strconv.FormatUint(uint64(skill.ID), 10)+"/organization-bind", form)
	req = withCurrentUser(req, &owner)
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	location := recorder.Header().Get("Location")
	wantPrefix := "/skills/" + strconv.FormatUint(uint64(skill.ID), 10) + "?msg="
	if !strings.HasPrefix(location, wantPrefix) {
		t.Fatalf("unexpected redirect location: got=%s want_prefix=%s", location, wantPrefix)
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

func TestSkillOrganizationWebUnbindSuccessIdempotentRedirectsWithSuccess(t *testing.T) {
	app, _, owner, _, skill, _ := setupSkillOrganizationAPITestApp(t)
	router := app.Router()

	req := newSkillOrganizationWebFormRequest(t, "/skills/"+strconv.FormatUint(uint64(skill.ID), 10)+"/organization-unbind", url.Values{})
	req = withCurrentUser(req, &owner)
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	location := recorder.Header().Get("Location")
	wantPrefix := "/skills/" + strconv.FormatUint(uint64(skill.ID), 10) + "?msg="
	if !strings.HasPrefix(location, wantPrefix) {
		t.Fatalf("unexpected redirect location: got=%s want_prefix=%s", location, wantPrefix)
	}

	updated, err := app.skillService.GetSkillByID(context.Background(), skill.ID)
	if err != nil {
		t.Fatalf("failed to load updated skill: %v", err)
	}
	if updated.OrganizationID != nil {
		t.Fatalf("expected skill organization to be nil, got=%v", *updated.OrganizationID)
	}
}

func TestSkillOrganizationWebUnbindPermissionDeniedRedirectsWithError(t *testing.T) {
	app, db, owner, _, skill, organization := setupSkillOrganizationAPITestApp(t)
	router := app.Router()

	if err := db.Model(&models.Skill{}).
		Where("id = ?", skill.ID).
		Update("organization_id", organization.ID).Error; err != nil {
		t.Fatalf("failed to bind skill organization: %v", err)
	}

	req := newSkillOrganizationWebFormRequest(t, "/skills/"+strconv.FormatUint(uint64(skill.ID), 10)+"/organization-unbind", url.Values{})
	req = withCurrentUser(req, &owner)
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	location := recorder.Header().Get("Location")
	wantPrefix := "/skills/" + strconv.FormatUint(uint64(skill.ID), 10) + "?err="
	if !strings.HasPrefix(location, wantPrefix) {
		t.Fatalf("unexpected redirect location: got=%s want_prefix=%s", location, wantPrefix)
	}
}
