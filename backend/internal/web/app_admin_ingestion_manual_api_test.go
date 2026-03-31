package web

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func TestHandleAPIAdminIngestionManualCreate(t *testing.T) {
	app, owner := setupAdminIngestionAPITestApp(t)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/ingestion/manual",
		strings.NewReader(`{"name":"Manual API Skill","description":"Manual import","content":"# Manual API Skill","tags":"manual,api","visibility":"public","install_command":"codex skill install local/manual"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &owner)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminIngestionManual(recorder, req)

	assertAdminIngestionCreated(t, recorder, "Manual skill created", "manual", owner.Username)

	items := listAdminIngestionSkillsByOwner(t, app, owner.ID)
	if len(items) != 1 {
		t.Fatalf("expected one created skill, got=%d", len(items))
	}
}

func TestHandleAPIAdminIngestionManualPublicSkillIsVisibleAcrossPublicAPIs(t *testing.T) {
	app, owner := setupAdminIngestionAPITestApp(t)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/ingestion/manual",
		strings.NewReader(`{"name":"Manual Public Visibility Skill","description":"Manual import exposed to public marketplace","content":"# Manual Public Visibility Skill\n\nThis manual skill verifies public ingestion coverage.","tags":"manual,visibility","visibility":"public","install_command":"npx skillsindex install manual-public-visibility"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &owner)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminIngestionManual(recorder, req)

	assertAdminIngestionCreated(t, recorder, "Manual skill created", "manual", owner.Username)
	createdPayload := decodeBodyMap(t, recorder)
	item, ok := createdPayload["item"].(map[string]any)
	if !ok {
		t.Fatalf("missing created item payload: %#v", createdPayload)
	}
	idValue, ok := item["id"].(float64)
	if !ok || int(idValue) <= 0 {
		t.Fatalf("unexpected created item id: %#v", item["id"])
	}
	skillID := uint(idValue)

	marketplaceReq := httptest.NewRequest(
		http.MethodGet,
		"/api/v1/public/marketplace?q=Manual%20Public",
		nil,
	)
	marketplaceRecorder := httptest.NewRecorder()
	app.handleAPIPublicMarketplace(marketplaceRecorder, marketplaceReq)

	if marketplaceRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected marketplace status code: got=%d want=%d body=%s", marketplaceRecorder.Code, http.StatusOK, marketplaceRecorder.Body.String())
	}
	marketplaceBody := marketplaceRecorder.Body.String()
	if !strings.Contains(marketplaceBody, `"matching_skills":1`) {
		t.Fatalf("expected one public marketplace match: %s", marketplaceBody)
	}
	if !strings.Contains(marketplaceBody, `"name":"Manual Public Visibility Skill"`) {
		t.Fatalf("expected created skill in public marketplace payload: %s", marketplaceBody)
	}

	detailReq := httptest.NewRequest(
		http.MethodGet,
		fmt.Sprintf("/api/v1/public/skills/%d", skillID),
		nil,
	)
	detailReq = withURLParams(detailReq, map[string]string{
		"skillID": fmt.Sprintf("%d", skillID),
	})
	detailRecorder := httptest.NewRecorder()
	app.handleAPIPublicSkillDetail(detailRecorder, detailReq)

	if detailRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected detail status code: got=%d want=%d body=%s", detailRecorder.Code, http.StatusOK, detailRecorder.Body.String())
	}
	detailBody := detailRecorder.Body.String()
	if !strings.Contains(detailBody, `"name":"Manual Public Visibility Skill"`) {
		t.Fatalf("expected created skill in public detail payload: %s", detailBody)
	}
	if !strings.Contains(detailBody, `"source_type":"manual"`) {
		t.Fatalf("expected manual source type in public detail payload: %s", detailBody)
	}

	resourcesReq := httptest.NewRequest(
		http.MethodGet,
		fmt.Sprintf("/api/v1/public/skills/%d/resources", skillID),
		nil,
	)
	resourcesReq = withURLParams(resourcesReq, map[string]string{
		"skillID": fmt.Sprintf("%d", skillID),
	})
	resourcesRecorder := httptest.NewRecorder()
	app.handleAPIPublicSkillResources(resourcesRecorder, resourcesReq)

	if resourcesRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected resources status code: got=%d want=%d body=%s", resourcesRecorder.Code, http.StatusOK, resourcesRecorder.Body.String())
	}
	resourcesBody := resourcesRecorder.Body.String()
	if !strings.Contains(resourcesBody, `"source_type":"manual"`) {
		t.Fatalf("expected manual source type in resources payload: %s", resourcesBody)
	}
	if !strings.Contains(resourcesBody, `"entry_file":"SKILL.md"`) {
		t.Fatalf("expected fallback entry file in resources payload: %s", resourcesBody)
	}
	if !strings.Contains(resourcesBody, `"mechanism":"fallback"`) {
		t.Fatalf("expected fallback mechanism in resources payload: %s", resourcesBody)
	}
	if !strings.Contains(resourcesBody, `"metadata_sources":["SKILL.md"]`) {
		t.Fatalf("expected fallback metadata sources in resources payload: %s", resourcesBody)
	}
	if !strings.Contains(resourcesBody, `"file_count":1`) {
		t.Fatalf("expected one fallback resource file in resources payload: %s", resourcesBody)
	}
	if !strings.Contains(resourcesBody, `"name":"SKILL.md"`) {
		t.Fatalf("expected fallback resource file in resources payload: %s", resourcesBody)
	}
	if !strings.Contains(resourcesBody, `"install_command":"npx skillsindex install manual-public-visibility"`) {
		t.Fatalf("expected install command in resources payload: %s", resourcesBody)
	}

	contentReq := httptest.NewRequest(
		http.MethodGet,
		fmt.Sprintf("/api/v1/public/skills/%d/resources/content?path=SKILL.md", skillID),
		nil,
	)
	contentReq = withURLParams(contentReq, map[string]string{
		"skillID": fmt.Sprintf("%d", skillID),
	})
	contentRecorder := httptest.NewRecorder()
	app.handleAPIPublicSkillResourceContent(contentRecorder, contentReq)

	if contentRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected resource content status code: got=%d want=%d body=%s", contentRecorder.Code, http.StatusOK, contentRecorder.Body.String())
	}
	if !strings.Contains(contentRecorder.Body.String(), "verifies public ingestion coverage") {
		t.Fatalf("expected manual content in resource content payload: %s", contentRecorder.Body.String())
	}
}

func TestHandleAPIAdminIngestionManualUnauthorized(t *testing.T) {
	app, _ := setupAdminIngestionAPITestApp(t)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/ingestion/manual",
		strings.NewReader(`{"name":"Manual API Skill"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-admin-ingestion-manual-unauthorized")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminIngestionManual(recorder, req)
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
	if payload["request_id"] != "req-admin-ingestion-manual-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestHandleAPIAdminIngestionManualConflictWhenDuplicateJobActive(t *testing.T) {
	app, owner := setupAdminIngestionAPITestApp(t)
	now := time.Now().UTC()
	payloadDigest := buildAdminIngestionJobPayloadDigest(
		models.AsyncJobTypeImportManual,
		fmt.Sprintf("%d", owner.ID),
		"Manual API Skill",
		"Manual import",
		"# Manual API Skill",
		"manual,api",
		"public",
		"codex skill install local/manual",
		"",
		"",
		"0",
		"8.000",
	)
	if _, _, err := app.asyncJobSvc.CreateOrGetActive(context.Background(), services.CreateAsyncJobInput{
		JobType:       models.AsyncJobTypeImportManual,
		OwnerUserID:   &owner.ID,
		ActorUserID:   &owner.ID,
		MaxAttempts:   3,
		PayloadDigest: payloadDigest,
	}, now); err != nil {
		t.Fatalf("failed to create existing active job: %v", err)
	}

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/ingestion/manual",
		strings.NewReader(`{"name":"Manual API Skill","description":"Manual import","content":"# Manual API Skill","tags":"manual,api","visibility":"public","install_command":"codex skill install local/manual"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &owner)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminIngestionManual(recorder, req)
	if recorder.Code != http.StatusConflict {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusConflict, recorder.Body.String())
	}

	payload := decodeBodyMap(t, recorder)
	if got, _ := payload["error"].(string); got != "job_conflict" {
		t.Fatalf("unexpected error code: got=%q payload=%#v", got, payload)
	}
}
