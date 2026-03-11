package web

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func listAdminJobsPayload(t *testing.T, app *App, user models.User) map[string]any {
	t.Helper()

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/jobs", nil)
	req = withCurrentUser(req, &user)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminJobs(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected jobs status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}
	return decodeBodyMap(t, recorder)
}

func assertLatestImportJob(
	t *testing.T,
	payload map[string]any,
	wantJobType models.AsyncJobType,
	wantStatus models.AsyncJobStatus,
	wantOwnerID uint,
) map[string]any {
	t.Helper()

	items, ok := payload["items"].([]any)
	if !ok || len(items) == 0 {
		t.Fatalf("missing job items payload: %#v", payload)
	}
	item, ok := items[0].(map[string]any)
	if !ok {
		t.Fatalf("unexpected first job item payload: %#v", items[0])
	}

	if got, _ := item["job_type"].(string); got != string(wantJobType) {
		t.Fatalf("unexpected job_type: got=%q want=%q item=%#v", got, string(wantJobType), item)
	}
	if got, _ := item["status"].(string); got != string(wantStatus) {
		t.Fatalf("unexpected status: got=%q want=%q item=%#v", got, string(wantStatus), item)
	}
	if got, ok := item["owner_user_id"].(float64); !ok || uint(got) != wantOwnerID {
		t.Fatalf("unexpected owner_user_id: %#v", item["owner_user_id"])
	}
	if got, ok := item["actor_user_id"].(float64); !ok || uint(got) != wantOwnerID {
		t.Fatalf("unexpected actor_user_id: %#v", item["actor_user_id"])
	}
	return item
}

func TestImportJobManualLifecycleRecorded(t *testing.T) {
	app, owner := setupAdminIngestionAPITestApp(t)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/ingestion/manual",
		strings.NewReader(`{"name":"Manual Job Skill","description":"manual","content":"# Manual Job Skill","tags":"manual,job","visibility":"private"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &owner)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminIngestionManual(recorder, req)
	if recorder.Code != http.StatusCreated {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusCreated, recorder.Body.String())
	}

	payload := listAdminJobsPayload(t, app, owner)
	item := assertLatestImportJob(t, payload, models.AsyncJobTypeImportManual, models.AsyncJobStatusSucceeded, owner.ID)
	if item["error_code"] != "" || item["error_message"] != "" {
		t.Fatalf("expected success job to clear error fields: %#v", item)
	}
}

func TestImportJobUploadLifecycleRecorded(t *testing.T) {
	app, owner := setupAdminIngestionAPITestApp(t)

	req := buildUploadRequest(t, map[string]string{
		"tags":       "upload,job",
		"visibility": "private",
	})
	req = withCurrentUser(req, &owner)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminIngestionUpload(recorder, req)
	if recorder.Code != http.StatusCreated {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusCreated, recorder.Body.String())
	}

	payload := listAdminJobsPayload(t, app, owner)
	assertLatestImportJob(t, payload, models.AsyncJobTypeImportUpload, models.AsyncJobStatusSucceeded, owner.ID)
}

func TestImportJobRepositoryFailureRecorded(t *testing.T) {
	app, owner := setupAdminIngestionAPITestApp(t)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/ingestion/repository",
		strings.NewReader(`{"repo_url":"/definitely-missing-repository-path","visibility":"private"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &owner)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminIngestionRepository(recorder, req)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusBadRequest, recorder.Body.String())
	}

	payload := listAdminJobsPayload(t, app, owner)
	item := assertLatestImportJob(t, payload, models.AsyncJobTypeImportRepository, models.AsyncJobStatusFailed, owner.ID)
	if StringValue(item["error_message"]) == "" {
		t.Fatalf("expected repository failure to keep error_message: %#v", item)
	}
}

func TestImportJobSkillMPFailureRecorded(t *testing.T) {
	app, owner := setupAdminIngestionAPITestApp(t)
	skillServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		http.Error(w, "upstream failed", http.StatusBadGateway)
	}))
	defer skillServer.Close()

	app.skillMPService = services.NewSkillMPService(skillServer.URL, "")

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/ingestion/skillmp",
		strings.NewReader(fmt.Sprintf(`{"skillmp_url":%q,"visibility":"private"}`, skillServer.URL)),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &owner)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminIngestionSkillMP(recorder, req)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusBadRequest, recorder.Body.String())
	}

	payload := listAdminJobsPayload(t, app, owner)
	item := assertLatestImportJob(t, payload, models.AsyncJobTypeImportSkillMP, models.AsyncJobStatusFailed, owner.ID)
	if StringValue(item["error_message"]) == "" {
		t.Fatalf("expected skillmp failure to keep error_message: %#v", item)
	}
}

func StringValue(value any) string {
	switch typed := value.(type) {
	case string:
		return typed
	default:
		return ""
	}
}
