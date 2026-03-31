package web

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"skillsindex/internal/services"
)

func TestHandleAPIAdminIngestionSkillMPCreate(t *testing.T) {
	app, owner := setupAdminIngestionAPITestApp(t)
	skillServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"name":"SkillMP API Skill","description":"Imported from SkillMP","content":"# SkillMP API Skill","tags":["skillmp","api"]}`))
	}))
	defer skillServer.Close()

	app.skillMPService = services.NewSkillMPService(skillServer.URL, "")

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/ingestion/skillmp",
		strings.NewReader(fmt.Sprintf(`{"skillmp_url":%q,"tags":"skillmp,api","visibility":"public","install_command":"codex skill install skillmp:api-skill"}`, skillServer.URL)),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &owner)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminIngestionSkillMP(recorder, req)

	assertAdminIngestionCreated(t, recorder, "SkillMP skill imported", "skillmp", owner.Username)
}

func TestHandleAPIAdminIngestionSkillMPInvalidPayload(t *testing.T) {
	app, owner := setupAdminIngestionAPITestApp(t)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/ingestion/skillmp",
		strings.NewReader(`{"skillmp_url":`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-admin-ingestion-skillmp-invalid-payload")
	req = withCurrentUser(req, &owner)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminIngestionSkillMP(recorder, req)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}

	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_payload" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["request_id"] != "req-admin-ingestion-skillmp-invalid-payload" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}
