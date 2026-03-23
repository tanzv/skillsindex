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
)

func TestAPISkillVersionsUnauthorized(t *testing.T) {
	app, _, _, _, skill := setupSkillVersionHandlersTestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/skills/1/versions", nil)
	req = withURLParams(req, map[string]string{
		"skillID": strconv.FormatUint(uint64(skill.ID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleAPISkillVersions(recorder, req)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusUnauthorized)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "unauthorized" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
}

func TestAPISkillVersionsForbidden(t *testing.T) {
	app, db, _, _, skill := setupSkillVersionHandlersTestApp(t)
	viewer := models.User{Username: "version-api-viewer", PasswordHash: "hash", Role: models.RoleMember}
	if err := db.Create(&viewer).Error; err != nil {
		t.Fatalf("failed to create viewer: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/skills/1/versions", nil)
	req = withCurrentUser(req, &viewer)
	req = withURLParams(req, map[string]string{
		"skillID": strconv.FormatUint(uint64(skill.ID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleAPISkillVersions(recorder, req)

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusForbidden)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "permission_denied" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
}

func TestAPISkillVersionsRejectsInvalidSkillID(t *testing.T) {
	app, _, owner, _, _ := setupSkillVersionHandlersTestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/skills/invalid/versions", nil)
	req = withCurrentUser(req, &owner)
	req = withURLParams(req, map[string]string{
		"skillID": "invalid",
	})
	recorder := httptest.NewRecorder()

	app.handleAPISkillVersions(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_skill_id" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
}

func TestAPISkillVersionsListIncludesRunSummary(t *testing.T) {
	app, _, owner, _, skill := setupSkillVersionHandlersTestApp(t)
	run, err := app.syncJobSvc.RecordRun(context.Background(), services.RecordSyncRunInput{
		Trigger:       "manual",
		TriggerType:   services.SyncRunTriggerTypeManual,
		Scope:         "single",
		Status:        services.SyncRunStatusSucceeded,
		TargetSkillID: &skill.ID,
		OwnerUserID:   &owner.ID,
		ActorUserID:   &owner.ID,
		Candidates:    1,
		Synced:        1,
		StartedAt:     time.Now().UTC().Add(-2 * time.Second),
		FinishedAt:    time.Now().UTC(),
	})
	if err != nil {
		t.Fatalf("failed to create run: %v", err)
	}
	if err := app.skillVersionSvc.CaptureWithRunContext(context.Background(), skill.ID, "sync", &owner.ID, &run.ID); err != nil {
		t.Fatalf("failed to create version with run context: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/skills/1/versions?trigger=sync&limit=10", nil)
	req = withCurrentUser(req, &owner)
	req = withURLParams(req, map[string]string{
		"skillID": strconv.FormatUint(uint64(skill.ID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleAPISkillVersions(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	total, _ := payload["total"].(float64)
	if int(total) < 1 {
		t.Fatalf("expected at least one version item: %#v", payload)
	}
	items, ok := payload["items"].([]any)
	if !ok || len(items) == 0 {
		t.Fatalf("unexpected items payload: %#v", payload)
	}
	item, ok := items[0].(map[string]any)
	if !ok {
		t.Fatalf("unexpected item payload: %#v", items[0])
	}
	if trigger, _ := item["trigger"].(string); trigger != "sync" {
		t.Fatalf("unexpected trigger: %#v", item)
	}
	runPayload, ok := item["run"].(map[string]any)
	if !ok {
		t.Fatalf("expected run summary in item: %#v", item)
	}
	if runID, _ := runPayload["id"].(float64); uint(runID) != run.ID {
		t.Fatalf("unexpected run id in summary: %#v", runPayload)
	}
}

func TestAPISkillVersionsListFiltersByCapturedWindow(t *testing.T) {
	app, db, owner, _, skill := setupSkillVersionHandlersTestApp(t)

	versions, err := app.skillVersionSvc.ListBySkill(context.Background(), services.ListSkillVersionsInput{
		SkillID: skill.ID,
		Limit:   10,
	})
	if err != nil {
		t.Fatalf("failed to list versions: %v", err)
	}
	if len(versions) < 2 {
		t.Fatalf("expected at least two versions, got=%d", len(versions))
	}

	base := time.Date(2026, time.March, 22, 9, 0, 0, 0, time.UTC)
	olderVersion := versions[len(versions)-1]
	newerVersion := versions[0]
	if err := db.Model(&models.SkillVersion{}).Where("id = ?", olderVersion.ID).Update("captured_at", base).Error; err != nil {
		t.Fatalf("failed to update older captured_at: %v", err)
	}
	if err := db.Model(&models.SkillVersion{}).Where("id = ?", newerVersion.ID).Update("captured_at", base.Add(2*time.Hour)).Error; err != nil {
		t.Fatalf("failed to update newer captured_at: %v", err)
	}

	req := httptest.NewRequest(
		http.MethodGet,
		fmt.Sprintf(
			"/api/v1/skills/%d/versions?from_time=%s&to_time=%s&limit=10",
			skill.ID,
			base.Add(90*time.Minute).Format(time.RFC3339),
			base.Add(3*time.Hour).Format(time.RFC3339),
		),
		nil,
	)
	req = withCurrentUser(req, &owner)
	req = withURLParams(req, map[string]string{
		"skillID": strconv.FormatUint(uint64(skill.ID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleAPISkillVersions(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	total, _ := payload["total"].(float64)
	if int(total) != 1 {
		t.Fatalf("unexpected total: got=%v want=1 payload=%#v", total, payload)
	}
	items, ok := payload["items"].([]any)
	if !ok || len(items) != 1 {
		t.Fatalf("unexpected items payload: %#v", payload)
	}
	item, ok := items[0].(map[string]any)
	if !ok {
		t.Fatalf("unexpected item payload: %#v", items[0])
	}
	itemID, _ := item["id"].(float64)
	if uint(itemID) != newerVersion.ID {
		t.Fatalf("unexpected version id: got=%v want=%d item=%#v", itemID, newerVersion.ID, item)
	}
}

func TestAPISkillVersionsRejectsInvalidTimeFilters(t *testing.T) {
	app, _, owner, _, skill := setupSkillVersionHandlersTestApp(t)

	cases := []struct {
		name   string
		query  string
		errKey string
	}{
		{name: "invalid from", query: "from_time=not-a-time", errKey: "invalid_from_time"},
		{name: "invalid to", query: "to_time=not-a-time", errKey: "invalid_to_time"},
		{
			name:   "invalid range",
			query:  "from_time=2026-03-23T10:00:00Z&to_time=2026-03-22T10:00:00Z",
			errKey: "invalid_time_range",
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/api/v1/skills/1/versions?"+tc.query, nil)
			req = withCurrentUser(req, &owner)
			req = withURLParams(req, map[string]string{
				"skillID": strconv.FormatUint(uint64(skill.ID), 10),
			})
			recorder := httptest.NewRecorder()

			app.handleAPISkillVersions(recorder, req)

			if recorder.Code != http.StatusBadRequest {
				t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
			}
			payload := decodeBodyMap(t, recorder)
			if payload["error"] != tc.errKey {
				t.Fatalf("unexpected error payload: %#v", payload)
			}
		})
	}
}

func TestAPISkillVersionDetailIncludesRunSummary(t *testing.T) {
	app, _, owner, _, skill := setupSkillVersionHandlersTestApp(t)
	run, err := app.syncJobSvc.RecordRun(context.Background(), services.RecordSyncRunInput{
		Trigger:        "manual",
		TriggerType:    services.SyncRunTriggerTypeManual,
		Scope:          "single",
		Status:         services.SyncRunStatusFailed,
		TargetSkillID:  &skill.ID,
		OwnerUserID:    &owner.ID,
		ActorUserID:    &owner.ID,
		Candidates:     1,
		Failed:         1,
		ErrorCode:      "sync_failed",
		ErrorMessage:   "sync failed",
		SourceRevision: "rev-detail",
		StartedAt:      time.Now().UTC().Add(-2 * time.Second),
		FinishedAt:     time.Now().UTC(),
	})
	if err != nil {
		t.Fatalf("failed to create run: %v", err)
	}
	if err := app.skillVersionSvc.CaptureWithRunContext(context.Background(), skill.ID, "sync", &owner.ID, &run.ID); err != nil {
		t.Fatalf("failed to create version with run context: %v", err)
	}

	versions, err := app.skillVersionSvc.ListBySkill(context.Background(), services.ListSkillVersionsInput{
		SkillID: skill.ID,
		Limit:   1,
		Trigger: "sync",
	})
	if err != nil {
		t.Fatalf("failed to list versions: %v", err)
	}
	if len(versions) != 1 {
		t.Fatalf("expected one latest sync version, got=%d", len(versions))
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/skills/1/versions/1", nil)
	req = withCurrentUser(req, &owner)
	req = withURLParams(req, map[string]string{
		"skillID":   strconv.FormatUint(uint64(skill.ID), 10),
		"versionID": strconv.FormatUint(uint64(versions[0].ID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleAPISkillVersionDetail(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	item, ok := payload["item"].(map[string]any)
	if !ok {
		t.Fatalf("missing item payload: %#v", payload)
	}
	runPayload, ok := item["run"].(map[string]any)
	if !ok {
		t.Fatalf("expected run summary in detail payload: %#v", item)
	}
	if sourceRevision, _ := runPayload["source_revision"].(string); sourceRevision != "rev-detail" {
		t.Fatalf("unexpected run summary source revision: %#v", runPayload)
	}
	if actorUsername, _ := item["actor_username"].(string); actorUsername == "" {
		t.Fatalf("expected actor username in detail payload: %#v", item)
	}
}

func TestAPISkillVersionDetailVersionNotFound(t *testing.T) {
	app, _, owner, _, skill := setupSkillVersionHandlersTestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/skills/1/versions/999999", nil)
	req = withCurrentUser(req, &owner)
	req = withURLParams(req, map[string]string{
		"skillID":   strconv.FormatUint(uint64(skill.ID), 10),
		"versionID": "999999",
	})
	recorder := httptest.NewRecorder()

	app.handleAPISkillVersionDetail(recorder, req)

	if recorder.Code != http.StatusNotFound {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusNotFound)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "version_not_found" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
}

func TestAPISkillVersionDetailRejectsInvalidVersionID(t *testing.T) {
	app, _, owner, _, skill := setupSkillVersionHandlersTestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/skills/1/versions/invalid", nil)
	req = withCurrentUser(req, &owner)
	req = withURLParams(req, map[string]string{
		"skillID":   strconv.FormatUint(uint64(skill.ID), 10),
		"versionID": "invalid",
	})
	recorder := httptest.NewRecorder()

	app.handleAPISkillVersionDetail(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_version_id" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
}
