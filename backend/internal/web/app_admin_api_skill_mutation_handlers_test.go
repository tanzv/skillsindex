package web

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func TestAPIAdminSkillVisibilityUpdateSuccess(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	owner := createAdminAccessAPIUser(t, app, "skill-visibility-owner", models.RoleMember)
	created, err := app.skillService.CreateSkill(context.Background(), services.CreateSkillInput{
		OwnerID:      owner.ID,
		Name:         "Visibility Skill",
		Description:  "desc",
		Content:      "content",
		Visibility:   models.VisibilityPrivate,
		SourceType:   models.SourceTypeManual,
		CategorySlug: "development",
	})
	if err != nil {
		t.Fatalf("failed to create skill: %v", err)
	}

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/skills/"+strconv.FormatUint(uint64(created.ID), 10)+"/visibility",
		strings.NewReader(`{"visibility":"public"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &owner)
	req = withURLParam(req, "skillID", strconv.FormatUint(uint64(created.ID), 10))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSkillVisibilityUpdate(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}

	updated, err := app.skillService.GetSkillByID(context.Background(), created.ID)
	if err != nil {
		t.Fatalf("failed to load updated skill: %v", err)
	}
	if updated.Visibility != models.VisibilityPublic {
		t.Fatalf("expected visibility to be public, got=%s", updated.Visibility)
	}

	payload := decodeBodyMap(t, recorder)
	if ok, _ := payload["ok"].(bool); !ok {
		t.Fatalf("expected ok response: %#v", payload)
	}
	if visibility, _ := payload["visibility"].(string); visibility != string(models.VisibilityPublic) {
		t.Fatalf("unexpected visibility payload: %#v", payload)
	}
}

func TestAPIAdminSkillDeleteSuccess(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	owner := createAdminAccessAPIUser(t, app, "skill-delete-owner", models.RoleMember)
	created, err := app.skillService.CreateSkill(context.Background(), services.CreateSkillInput{
		OwnerID:      owner.ID,
		Name:         "Delete Skill",
		Description:  "desc",
		Content:      "content",
		Visibility:   models.VisibilityPrivate,
		SourceType:   models.SourceTypeManual,
		CategorySlug: "development",
	})
	if err != nil {
		t.Fatalf("failed to create skill: %v", err)
	}

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/skills/"+strconv.FormatUint(uint64(created.ID), 10)+"/delete",
		nil,
	)
	req = withCurrentUser(req, &owner)
	req = withURLParam(req, "skillID", strconv.FormatUint(uint64(created.ID), 10))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSkillDelete(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}

	if _, err := app.skillService.GetSkillByID(context.Background(), created.ID); err == nil {
		t.Fatalf("expected deleted skill to be missing")
	}

	payload := decodeBodyMap(t, recorder)
	if ok, _ := payload["ok"].(bool); !ok {
		t.Fatalf("expected ok response: %#v", payload)
	}
}

func TestAPIAdminSkillSyncRepositorySuccess(t *testing.T) {
	repoPath := createRemoteSyncRepositoryFixture(t)
	app, owner, skill := setupRemoteSyncRepositoryTestApp(t, repoPath)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/skills/"+strconv.FormatUint(uint64(skill.ID), 10)+"/sync",
		nil,
	)
	req = withCurrentUser(req, &owner)
	req = withURLParam(req, "skillID", strconv.FormatUint(uint64(skill.ID), 10))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSkillSync(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}

	updated, err := app.skillService.GetSkillByID(context.Background(), skill.ID)
	if err != nil {
		t.Fatalf("failed to load updated skill: %v", err)
	}
	if updated.Name != "Repo Skill" {
		t.Fatalf("unexpected updated skill name: got=%s", updated.Name)
	}

	payload := decodeBodyMap(t, recorder)
	if ok, _ := payload["ok"].(bool); !ok {
		t.Fatalf("expected ok response: %#v", payload)
	}
}
