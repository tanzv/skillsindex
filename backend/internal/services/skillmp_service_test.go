package services

import (
	"context"
	"net/http"
	"net/http/httptest"
	"reflect"
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
  "content": "---\nname: skillmp-go-skill\ndescription: SkillMP inline frontmatter\n---\n\n# SkillMP Go Skill\n\nRead [guide](references/guide.md).\nUse superpowers:test-driven-development.",
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
	if meta.Analysis.EntryFile != "skillmp.json" {
		t.Fatalf("unexpected analysis entry file: %q", meta.Analysis.EntryFile)
	}
	if meta.Analysis.Mechanism != "skillmp_json" {
		t.Fatalf("unexpected analysis mechanism: %q", meta.Analysis.Mechanism)
	}
	expectedSources := []string{"skillmp.json", "skillmp.json.content", "skillmp.json.content.frontmatter"}
	if !reflect.DeepEqual(meta.Analysis.MetadataSources, expectedSources) {
		t.Fatalf("unexpected analysis metadata sources: got=%#v want=%#v", meta.Analysis.MetadataSources, expectedSources)
	}
	expectedPaths := []string{"references/guide.md"}
	if !reflect.DeepEqual(meta.Analysis.ReferencePaths, expectedPaths) {
		t.Fatalf("unexpected analysis reference paths: got=%#v want=%#v", meta.Analysis.ReferencePaths, expectedPaths)
	}
	expectedDependencies := []SourceDependency{
		{Kind: "file", Target: "references/guide.md"},
		{Kind: "skill", Target: "superpowers:test-driven-development"},
	}
	if !reflect.DeepEqual(meta.Analysis.Dependencies, expectedDependencies) {
		t.Fatalf("unexpected analysis dependencies: got=%#v want=%#v", meta.Analysis.Dependencies, expectedDependencies)
	}
}

func TestSkillMPFetchMarkdown(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/markdown")
		_, _ = w.Write([]byte(`---
name: skillmp-markdown-skill
description: Import from markdown endpoint.
---

# SkillMP Markdown Skill

Read [guide](references/guide.md).
Use superpowers:systematic-debugging before fixing issues.
`))
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
	if meta.Analysis.EntryFile != "SKILL.md" {
		t.Fatalf("unexpected analysis entry file: %q", meta.Analysis.EntryFile)
	}
	if meta.Analysis.Mechanism != "skillmp_markdown_frontmatter" {
		t.Fatalf("unexpected analysis mechanism: %q", meta.Analysis.Mechanism)
	}
	expectedSources := []string{"skillmp.markdown", "skillmp.markdown.frontmatter"}
	if !reflect.DeepEqual(meta.Analysis.MetadataSources, expectedSources) {
		t.Fatalf("unexpected analysis metadata sources: got=%#v want=%#v", meta.Analysis.MetadataSources, expectedSources)
	}
	expectedPaths := []string{"references/guide.md"}
	if !reflect.DeepEqual(meta.Analysis.ReferencePaths, expectedPaths) {
		t.Fatalf("unexpected analysis reference paths: got=%#v want=%#v", meta.Analysis.ReferencePaths, expectedPaths)
	}
	expectedDependencies := []SourceDependency{
		{Kind: "file", Target: "references/guide.md"},
		{Kind: "skill", Target: "superpowers:systematic-debugging"},
	}
	if !reflect.DeepEqual(meta.Analysis.Dependencies, expectedDependencies) {
		t.Fatalf("unexpected analysis dependencies: got=%#v want=%#v", meta.Analysis.Dependencies, expectedDependencies)
	}
}
