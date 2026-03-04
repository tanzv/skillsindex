package web

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"skillsindex/internal/services"
)

func TestAPIAdminAPIKeysCreateIncludesPurposeAndCreator(t *testing.T) {
	app, svc, superAdmin, member, _ := setupAdminAPIKeyAPITestApp(t)
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/apikeys",
		strings.NewReader(fmt.Sprintf(`{"name":"delegated","purpose":"ci-bot","owner_user_id":%d}`, member.ID)),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &superAdmin)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAPIKeysCreate(recorder, req)
	if recorder.Code != http.StatusCreated {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusCreated)
	}
	payload := decodeBodyMap(t, recorder)
	item, ok := payload["item"].(map[string]any)
	if !ok {
		t.Fatalf("missing item payload: %#v", payload)
	}
	if got, _ := item["purpose"].(string); got != "ci-bot" {
		t.Fatalf("unexpected purpose: %#v", item["purpose"])
	}
	if got, ok := item["created_by"].(float64); !ok || uint(got) != superAdmin.ID {
		t.Fatalf("unexpected created_by: %#v", item["created_by"])
	}

	token, _ := payload["plaintext_key"].(string)
	key, valid, err := svc.Validate(context.Background(), token)
	if err != nil {
		t.Fatalf("validate key failed: %v", err)
	}
	if !valid {
		t.Fatalf("created key should be valid")
	}
	if key.Purpose != "ci-bot" || key.CreatedBy != superAdmin.ID {
		t.Fatalf("persisted metadata mismatch: purpose=%q created_by=%d", key.Purpose, key.CreatedBy)
	}
}

func TestAPIAdminAPIKeyRotateIncludesLastRotatedAt(t *testing.T) {
	app, svc, _, member, _ := setupAdminAPIKeyAPITestApp(t)
	created, _, err := svc.Create(context.Background(), services.CreateAPIKeyInput{
		UserID:  member.ID,
		Name:    "rotate-meta",
		Purpose: "runtime-client",
	})
	if err != nil {
		t.Fatalf("failed to create key: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, fmt.Sprintf("/api/v1/admin/apikeys/%d/rotate", created.ID), nil)
	req = withCurrentUser(req, &member)
	req = withRouteParam(req, "keyID", fmt.Sprintf("%d", created.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAPIKeyRotate(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	item, ok := payload["item"].(map[string]any)
	if !ok {
		t.Fatalf("missing item payload: %#v", payload)
	}
	if got, _ := item["purpose"].(string); got != "runtime-client" {
		t.Fatalf("unexpected purpose after rotate: %#v", item["purpose"])
	}
	if got, ok := item["last_rotated_at"].(string); !ok || strings.TrimSpace(got) == "" {
		t.Fatalf("expected non-empty last_rotated_at, got=%#v", item["last_rotated_at"])
	}
}
