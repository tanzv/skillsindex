package web

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHandleAPIAdminIngestionUploadCreate(t *testing.T) {
	app, owner := setupAdminIngestionAPITestApp(t)

	req := buildUploadRequest(t, map[string]string{
		"tags":            "archive,api",
		"visibility":      "private",
		"install_command": "codex skill install archive/api",
	})
	req = withCurrentUser(req, &owner)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminIngestionUpload(recorder, req)

	assertAdminIngestionCreated(t, recorder, "Archive skill imported", "upload", owner.Username)
}

func TestHandleAPIAdminIngestionUploadUnauthorized(t *testing.T) {
	app, _ := setupAdminIngestionAPITestApp(t)

	req := buildUploadRequest(t, map[string]string{
		"tags":            "archive,api",
		"visibility":      "private",
		"install_command": "codex skill install archive/api",
	})
	req.Header.Set("X-Request-ID", "req-admin-ingestion-upload-unauthorized")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminIngestionUpload(recorder, req)
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
	if payload["request_id"] != "req-admin-ingestion-upload-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}
