package web

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"

	"skillsindex/internal/models"
)

func TestHandleAPISkillVersionRestoreCreatesAudit(t *testing.T) {
	app, db, owner, _, skill := setupSkillVersionHandlersTestApp(t)
	versionID, _ := loadSkillVersionIDs(t, app, skill.ID)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/skills/"+strconv.FormatUint(uint64(skill.ID), 10)+"/versions/"+strconv.FormatUint(uint64(versionID), 10)+"/restore",
		nil,
	)
	req = withCurrentUser(req, &owner)
	req = withURLParams(req, map[string]string{
		"skillID":   strconv.FormatUint(uint64(skill.ID), 10),
		"versionID": strconv.FormatUint(uint64(versionID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleAPISkillVersionRestore(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	if !strings.Contains(recorder.Body.String(), `"ok":true`) {
		t.Fatalf("unexpected response body: %s", recorder.Body.String())
	}

	var auditCount int64
	if err := db.Model(&models.AuditLog{}).
		Where("action = ? AND target_type = ? AND target_id = ?", "skill_restore_version", "skill", skill.ID).
		Count(&auditCount).Error; err != nil {
		t.Fatalf("failed to count restore audit logs: %v", err)
	}
	if auditCount == 0 {
		t.Fatalf("expected restore audit log to be created")
	}
}

func TestHandleAPISkillVersionMutationsServiceUnavailable(t *testing.T) {
	cases := []struct {
		name    string
		setup   func(*testing.T) (*App, models.User, models.Skill)
		handler func(*App, http.ResponseWriter, *http.Request)
		path    string
	}{
		{
			name: "rollback missing version service",
			setup: func(t *testing.T) (*App, models.User, models.Skill) {
				app, _, owner, _, skill := setupSkillVersionHandlersTestApp(t)
				app.skillVersionSvc = nil
				return app, owner, skill
			},
			handler: func(app *App, w http.ResponseWriter, r *http.Request) {
				app.handleAPISkillVersionRollback(w, r)
			},
			path: "/api/v1/skills/1/versions/1/rollback",
		},
		{
			name: "restore missing skill service",
			setup: func(t *testing.T) (*App, models.User, models.Skill) {
				app, _, owner, _, skill := setupSkillVersionHandlersTestApp(t)
				app.skillService = nil
				return app, owner, skill
			},
			handler: func(app *App, w http.ResponseWriter, r *http.Request) {
				app.handleAPISkillVersionRestore(w, r)
			},
			path: "/api/v1/skills/1/versions/1/restore",
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			app, owner, skill := tc.setup(t)
			req := httptest.NewRequest(http.MethodPost, tc.path, nil)
			req = withCurrentUser(req, &owner)
			req = withURLParams(req, map[string]string{
				"skillID":   strconv.FormatUint(uint64(skill.ID), 10),
				"versionID": "1",
			})
			recorder := httptest.NewRecorder()

			tc.handler(app, recorder, req)

			if recorder.Code != http.StatusServiceUnavailable {
				t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusServiceUnavailable)
			}
			payload := decodeBodyMap(t, recorder)
			if payload["error"] != "service_unavailable" {
				t.Fatalf("unexpected error payload: %#v", payload)
			}
		})
	}
}

func TestHandleAPISkillVersionMutationsRejectInvalidIDs(t *testing.T) {
	cases := []struct {
		name      string
		setup     func(*testing.T) (*App, models.User, models.Skill)
		handler   func(*App, http.ResponseWriter, *http.Request)
		path      string
		skillID   string
		versionID string
		wantError string
	}{
		{
			name: "rollback invalid skill id",
			setup: func(t *testing.T) (*App, models.User, models.Skill) {
				app, _, owner, _, skill := setupSkillVersionHandlersTestApp(t)
				return app, owner, skill
			},
			handler: func(app *App, w http.ResponseWriter, r *http.Request) {
				app.handleAPISkillVersionRollback(w, r)
			},
			path:      "/api/v1/skills/invalid/versions/1/rollback",
			skillID:   "invalid",
			versionID: "1",
			wantError: "invalid_skill_id",
		},
		{
			name: "rollback invalid version id",
			setup: func(t *testing.T) (*App, models.User, models.Skill) {
				app, _, owner, _, skill := setupSkillVersionHandlersTestApp(t)
				return app, owner, skill
			},
			handler: func(app *App, w http.ResponseWriter, r *http.Request) {
				app.handleAPISkillVersionRollback(w, r)
			},
			path:      "/api/v1/skills/1/versions/invalid/rollback",
			skillID:   "1",
			versionID: "invalid",
			wantError: "invalid_version_id",
		},
		{
			name: "restore invalid skill id",
			setup: func(t *testing.T) (*App, models.User, models.Skill) {
				app, _, owner, _, skill := setupSkillVersionHandlersTestApp(t)
				return app, owner, skill
			},
			handler: func(app *App, w http.ResponseWriter, r *http.Request) {
				app.handleAPISkillVersionRestore(w, r)
			},
			path:      "/api/v1/skills/invalid/versions/1/restore",
			skillID:   "invalid",
			versionID: "1",
			wantError: "invalid_skill_id",
		},
		{
			name: "restore invalid version id",
			setup: func(t *testing.T) (*App, models.User, models.Skill) {
				app, _, owner, _, skill := setupSkillVersionHandlersTestApp(t)
				return app, owner, skill
			},
			handler: func(app *App, w http.ResponseWriter, r *http.Request) {
				app.handleAPISkillVersionRestore(w, r)
			},
			path:      "/api/v1/skills/1/versions/invalid/restore",
			skillID:   "1",
			versionID: "invalid",
			wantError: "invalid_version_id",
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			app, owner, skill := tc.setup(t)
			req := httptest.NewRequest(http.MethodPost, tc.path, nil)
			req = withCurrentUser(req, &owner)
			req = withURLParams(req, map[string]string{
				"skillID": func() string {
					if tc.skillID == "1" {
						return strconv.FormatUint(uint64(skill.ID), 10)
					}
					return tc.skillID
				}(),
				"versionID": tc.versionID,
			})
			recorder := httptest.NewRecorder()

			tc.handler(app, recorder, req)

			if recorder.Code != http.StatusBadRequest {
				t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
			}
			payload := decodeBodyMap(t, recorder)
			if payload["error"] != tc.wantError {
				t.Fatalf("unexpected error payload: %#v", payload)
			}
		})
	}
}

func TestHandleAPISkillVersionRestoreReturnsVersionNotFound(t *testing.T) {
	app, _, owner, _, skill := setupSkillVersionHandlersTestApp(t)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/skills/"+strconv.FormatUint(uint64(skill.ID), 10)+"/versions/999999/restore",
		nil,
	)
	req = withCurrentUser(req, &owner)
	req = withURLParams(req, map[string]string{
		"skillID":   strconv.FormatUint(uint64(skill.ID), 10),
		"versionID": "999999",
	})
	recorder := httptest.NewRecorder()

	app.handleAPISkillVersionRestore(recorder, req)

	if recorder.Code != http.StatusNotFound {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusNotFound)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "version_not_found" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
}

func TestHandleAPISkillVersionRestoreChangesSkillState(t *testing.T) {
	app, _, owner, _, skill := setupSkillVersionHandlersTestApp(t)
	versionID, _ := loadSkillVersionIDs(t, app, skill.ID)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/skills/"+strconv.FormatUint(uint64(skill.ID), 10)+"/versions/"+strconv.FormatUint(uint64(versionID), 10)+"/restore",
		nil,
	)
	req = withCurrentUser(req, &owner)
	req = withURLParams(req, map[string]string{
		"skillID":   strconv.FormatUint(uint64(skill.ID), 10),
		"versionID": strconv.FormatUint(uint64(versionID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleAPISkillVersionRestore(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	updated, err := app.skillService.GetSkillByID(context.Background(), skill.ID)
	if err != nil {
		t.Fatalf("failed to load restored skill: %v", err)
	}
	if updated.Name != "Handler Skill Original" {
		t.Fatalf("unexpected skill name after restore: got=%s", updated.Name)
	}
}
