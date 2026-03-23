package services

import (
	"context"
	"testing"

	"skillsindex/internal/models"
)

func seedDraftSpec(t *testing.T, dbPathRegistry *APISpecRegistryService, slug string) models.APISpec {
	t.Helper()

	result, err := dbPathRegistry.ImportDraft(context.Background(), ImportAPISpecDraftInput{
		Name:        "SkillsIndex API",
		Slug:        slug,
		SourcePath:  "../../api/openapi/root.yaml",
		ActorUserID: 9,
	})
	if err != nil {
		t.Fatalf("failed to seed draft spec: %v", err)
	}
	return result.Spec
}

func assertCurrentSpecCount(t *testing.T, registry *APISpecRegistryService, want int) {
	t.Helper()

	var count int64
	if err := registry.db.Model(&models.APISpec{}).Where("is_current = ?", true).Count(&count).Error; err != nil {
		t.Fatalf("failed to count current specs: %v", err)
	}
	if int(count) != want {
		t.Fatalf("unexpected current spec count: got=%d want=%d", count, want)
	}
}

func TestAPIPublishServicePublishMarksOnlyOneCurrentSpec(t *testing.T) {
	db := setupAPISpecRegistryTestDB(t)
	registry := NewAPISpecRegistryService(db, t.TempDir())
	publisher := NewAPIPublishService(db)

	first := seedDraftSpec(t, registry, "skillsindex-api-v1")
	second := seedDraftSpec(t, registry, "skillsindex-api-v2")

	if _, err := publisher.Publish(context.Background(), PublishAPISpecInput{SpecID: first.ID, ActorUserID: 9}); err != nil {
		t.Fatalf("first publish failed: %v", err)
	}
	current, err := publisher.Publish(context.Background(), PublishAPISpecInput{SpecID: second.ID, ActorUserID: 9})
	if err != nil {
		t.Fatalf("second publish failed: %v", err)
	}
	if !current.IsCurrent {
		t.Fatalf("expected latest spec to be current")
	}
	assertCurrentSpecCount(t, registry, 1)
}
