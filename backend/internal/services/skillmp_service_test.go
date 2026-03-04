package services

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestSkillMPFetchJSON(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if got := r.Header.Get("Authorization"); got != "Bearer token-123" {
			t.Fatalf("unexpected authorization header: %s", got)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{
  "name": "SkillMP Go Skill",
  "description": "Imported from SkillMP",
  "content": "# SkillMP Go Skill\n\ncontent",
  "tags": ["Go", "Platform"]
}`))
	}))
	defer srv.Close()

	svc := NewSkillMPService("", "")
	meta, sourceURL, err := svc.FetchSkill(context.Background(), SkillMPFetchInput{
		URL:   srv.URL + "/api/v1/skills/1",
		Token: "token-123",
	})
	if err != nil {
		t.Fatalf("fetch failed: %v", err)
	}
	if sourceURL == "" {
		t.Fatalf("expected source URL")
	}
	if meta.Name != "SkillMP Go Skill" {
		t.Fatalf("unexpected name: %s", meta.Name)
	}
	if meta.Description != "Imported from SkillMP" {
		t.Fatalf("unexpected description: %s", meta.Description)
	}
	if len(meta.Tags) != 2 || meta.Tags[0] != "go" || meta.Tags[1] != "platform" {
		t.Fatalf("unexpected tags: %#v", meta.Tags)
	}
}

func TestSkillMPFetchMarkdown(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/markdown")
		_, _ = w.Write([]byte("# SkillMP Markdown Skill\n\nImport from markdown endpoint."))
	}))
	defer srv.Close()

	svc := NewSkillMPService("", "")
	meta, _, err := svc.FetchSkill(context.Background(), SkillMPFetchInput{URL: srv.URL + "/skill.md"})
	if err != nil {
		t.Fatalf("fetch failed: %v", err)
	}
	if meta.Name != "SkillMP Markdown Skill" {
		t.Fatalf("unexpected name: %s", meta.Name)
	}
	if meta.Content == "" {
		t.Fatalf("expected content")
	}
}
