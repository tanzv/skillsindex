package web

import (
	"bytes"
	"errors"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestRequestHasJSONContentType(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/ingestion", nil)
	req.Header.Set("Content-Type", "application/json; charset=utf-8")

	if !requestHasJSONContentType(req) {
		t.Fatalf("expected JSON content type to be detected")
	}
}

func TestReadAdminManualIngestionInputFromJSON(t *testing.T) {
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/ingestion/manual",
		strings.NewReader(`{
			"name":"Manual Skill",
			"description":"Manual description",
			"content":"# Manual",
			"tags":"manual,api",
			"visibility":"public",
			"install_command":"codex skill install local/manual",
			"category":"development",
			"subcategory":"backend",
			"star_count":12,
			"quality_score":9.4
		}`),
	)
	req.Header.Set("Content-Type", "application/json")

	input, err := readAdminManualIngestionInput(req)
	if err != nil {
		t.Fatalf("expected no error, got=%v", err)
	}
	if input.Name != "Manual Skill" {
		t.Fatalf("unexpected name: %q", input.Name)
	}
	if input.StarCount != 12 {
		t.Fatalf("unexpected star count: %d", input.StarCount)
	}
	if input.QualityScore != 9.4 {
		t.Fatalf("unexpected quality score: %v", input.QualityScore)
	}
}

func TestReadAdminRepositoryIngestionInputFromForm(t *testing.T) {
	body := strings.NewReader("repo_url=https://github.com/acme/skill&repo_branch=main&repo_path=subdir&tags=repo,api&visibility=internal&install_command=codex+skill+install+repo&category=devops&subcategory=git-workflows&quality_score=8.7")
	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/ingestion/repository", body)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	input, err := readAdminRepositoryIngestionInput(req)
	if err != nil {
		t.Fatalf("expected no error, got=%v", err)
	}
	if input.RepoURL != "https://github.com/acme/skill" {
		t.Fatalf("unexpected repo url: %q", input.RepoURL)
	}
	if input.RepoBranch != "main" {
		t.Fatalf("unexpected repo branch: %q", input.RepoBranch)
	}
	if input.QualityScore != 8.7 {
		t.Fatalf("unexpected quality score: %v", input.QualityScore)
	}
}

func TestReadAdminSkillMPIngestionInputRejectsUnknownJSONField(t *testing.T) {
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/ingestion/skillmp",
		strings.NewReader(`{"skillmp_url":"https://skillmp.example/skills/demo","unknown":"field"}`),
	)
	req.Header.Set("Content-Type", "application/json")

	_, err := readAdminSkillMPIngestionInput(req)
	if err == nil {
		t.Fatalf("expected unknown field error")
	}
	if !strings.Contains(err.Error(), "invalid json payload") {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestReadAdminUploadIngestionInputFromMultipart(t *testing.T) {
	body := bytes.NewBuffer(nil)
	writer := multipart.NewWriter(body)

	fileWriter, err := writer.CreateFormFile("archive", "skill.zip")
	if err != nil {
		t.Fatalf("failed to create form file: %v", err)
	}
	if _, err := fileWriter.Write([]byte("zip-content")); err != nil {
		t.Fatalf("failed to write archive content: %v", err)
	}
	for key, value := range map[string]string{
		"tags":            "upload,api",
		"visibility":      "private",
		"install_command": "codex skill install upload",
		"category":        "tools",
		"subcategory":     "automation-tools",
		"quality_score":   "8.2",
	} {
		if err := writer.WriteField(key, value); err != nil {
			t.Fatalf("failed to write field %s: %v", key, err)
		}
	}
	if err := writer.Close(); err != nil {
		t.Fatalf("failed to close multipart writer: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/ingestion/upload", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	input, archive, header, err := readAdminUploadIngestionInput(req)
	if err != nil {
		t.Fatalf("expected no error, got=%v", err)
	}
	defer func() {
		_ = archive.Close()
	}()
	if header == nil || header.Filename != "skill.zip" {
		t.Fatalf("unexpected upload header: %#v", header)
	}
	if input.Visibility != "private" {
		t.Fatalf("unexpected visibility: %q", input.Visibility)
	}
	if input.QualityScore != 8.2 {
		t.Fatalf("unexpected quality score: %v", input.QualityScore)
	}
}

func TestAdminIngestionOperationHelpers(t *testing.T) {
	if got := adminIngestionOperationStatus(nil); got != http.StatusInternalServerError {
		t.Fatalf("unexpected nil status: %d", got)
	}
	if got := adminIngestionOperationMessage(nil, "fallback"); got != "fallback" {
		t.Fatalf("unexpected nil message: %q", got)
	}

	err := newAdminIngestionOperationError(http.StatusBadRequest, " invalid payload ")
	if got := adminIngestionOperationStatus(err); got != http.StatusBadRequest {
		t.Fatalf("unexpected operation status: %d", got)
	}
	if got := adminIngestionOperationMessage(err, "fallback"); got != "invalid payload" {
		t.Fatalf("unexpected operation message: %q", got)
	}
}

func TestClassifyAdminSkillCreateError(t *testing.T) {
	badRequestErr := classifyAdminSkillCreateError(errors.New("name is required"), "fallback")
	if got := adminIngestionOperationStatus(badRequestErr); got != http.StatusBadRequest {
		t.Fatalf("unexpected validation status: %d", got)
	}
	if got := adminIngestionOperationMessage(badRequestErr, "fallback"); got != "name is required" {
		t.Fatalf("unexpected validation message: %q", got)
	}

	internalErr := classifyAdminSkillCreateError(errors.New("database offline"), "fallback")
	if got := adminIngestionOperationStatus(internalErr); got != http.StatusInternalServerError {
		t.Fatalf("unexpected internal status: %d", got)
	}
	if got := adminIngestionOperationMessage(internalErr, "fallback"); got != "fallback" {
		t.Fatalf("unexpected internal message: %q", got)
	}
}
