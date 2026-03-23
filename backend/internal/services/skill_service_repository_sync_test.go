package services

import (
	"context"
	"testing"
	"time"

	"skillsindex/internal/models"
)

func TestListRepositorySkillsForSync(t *testing.T) {
	db := setupSkillServiceTestDB(t)
	svc := NewSkillService(db)

	ownerA := models.User{Username: "owner-a", PasswordHash: "hash"}
	ownerB := models.User{Username: "owner-b", PasswordHash: "hash"}
	if err := db.Create(&ownerA).Error; err != nil {
		t.Fatalf("failed to create ownerA: %v", err)
	}
	if err := db.Create(&ownerB).Error; err != nil {
		t.Fatalf("failed to create ownerB: %v", err)
	}

	now := time.Now().UTC()
	oldSync := now.Add(-3 * time.Hour)
	recentSync := now.Add(-5 * time.Minute)

	skills := []models.Skill{
		{
			OwnerID:      ownerA.ID,
			Name:         "repo-null-sync",
			SourceType:   models.SourceTypeRepository,
			SourceURL:    "https://example.com/repo-null",
			LastSyncedAt: nil,
		},
		{
			OwnerID:      ownerA.ID,
			Name:         "repo-old-sync",
			SourceType:   models.SourceTypeRepository,
			SourceURL:    "https://example.com/repo-old",
			LastSyncedAt: &oldSync,
		},
		{
			OwnerID:      ownerA.ID,
			Name:         "repo-recent-sync",
			SourceType:   models.SourceTypeRepository,
			SourceURL:    "https://example.com/repo-recent",
			LastSyncedAt: &recentSync,
		},
		{
			OwnerID:    ownerA.ID,
			Name:       "repo-empty-url",
			SourceType: models.SourceTypeRepository,
			SourceURL:  "   ",
		},
		{
			OwnerID:    ownerA.ID,
			Name:       "manual-skill",
			SourceType: models.SourceTypeManual,
			SourceURL:  "https://example.com/manual",
		},
		{
			OwnerID:      ownerB.ID,
			Name:         "repo-owner-b",
			SourceType:   models.SourceTypeRepository,
			SourceURL:    "https://example.com/repo-owner-b",
			LastSyncedAt: &oldSync,
		},
	}
	for _, skill := range skills {
		if err := db.Create(&skill).Error; err != nil {
			t.Fatalf("failed to create skill %q: %v", skill.Name, err)
		}
	}

	dueBefore := now.Add(-30 * time.Minute)
	items, err := svc.ListRepositorySkillsForSync(context.Background(), nil, &dueBefore, 20)
	if err != nil {
		t.Fatalf("failed to list due repository skills: %v", err)
	}
	if len(items) != 3 {
		t.Fatalf("unexpected due item count: got=%d want=3", len(items))
	}
	names := map[string]bool{}
	for _, item := range items {
		names[item.Name] = true
	}
	if !names["repo-null-sync"] || !names["repo-old-sync"] || !names["repo-owner-b"] {
		t.Fatalf("unexpected due result names: %#v", names)
	}

	itemsByOwner, err := svc.ListRepositorySkillsForSync(context.Background(), &ownerA.ID, nil, 20)
	if err != nil {
		t.Fatalf("failed to list repository skills by owner: %v", err)
	}
	if len(itemsByOwner) != 3 {
		t.Fatalf("unexpected owner repository count: got=%d want=3", len(itemsByOwner))
	}
}

func TestUpdateSyncedSkillWithRunContextCapturesVersionRunID(t *testing.T) {
	db := setupSkillServiceTestDB(t)
	if err := db.AutoMigrate(&models.SyncJobRun{}); err != nil {
		t.Fatalf("failed to migrate sync job run model: %v", err)
	}
	svc := NewSkillService(db)
	versionSvc := NewSkillVersionService(db)

	owner := models.User{Username: "run-context-owner", PasswordHash: "hash"}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}

	created, err := svc.CreateSkill(context.Background(), CreateSkillInput{
		OwnerID:      owner.ID,
		Name:         "Run Context Skill",
		Description:  "before sync",
		Content:      "before content",
		Tags:         []string{"sync"},
		Visibility:   models.VisibilityPrivate,
		SourceType:   models.SourceTypeRepository,
		CategorySlug: "development",
	})
	if err != nil {
		t.Fatalf("failed to create skill: %v", err)
	}

	run := models.SyncJobRun{
		Trigger:       SyncRunTriggerTypeManual,
		TriggerType:   SyncRunTriggerTypeManual,
		Scope:         "single",
		Status:        SyncRunStatusRunning,
		TargetSkillID: &created.ID,
		OwnerUserID:   &owner.ID,
		StartedAt:     time.Now().UTC(),
		FinishedAt:    time.Now().UTC(),
	}
	if err := db.Create(&run).Error; err != nil {
		t.Fatalf("failed to create sync run: %v", err)
	}

	actorID := owner.ID
	_, err = svc.UpdateSyncedSkillWithRunContext(context.Background(), SyncUpdateInput{
		SkillID:      created.ID,
		OwnerID:      owner.ID,
		SourceType:   models.SourceTypeRepository,
		SourceURL:    "https://example.com/repo.git",
		SourceBranch: "main",
		SourcePath:   "/skills/run-context",
		Meta: ExtractedSkill{
			Name:        "Run Context Skill Updated",
			Description: "after sync",
			Content:     "after content",
			Tags:        []string{"sync", "updated"},
		},
	}, &actorID, &run.ID)
	if err != nil {
		t.Fatalf("failed to update synced skill with run context: %v", err)
	}

	versions, err := versionSvc.ListBySkill(context.Background(), ListSkillVersionsInput{
		SkillID: created.ID,
		Limit:   10,
	})
	if err != nil {
		t.Fatalf("failed to list versions: %v", err)
	}
	if len(versions) < 2 {
		t.Fatalf("expected updated sync to append new version, got=%d", len(versions))
	}
	if versions[0].RunID == nil || *versions[0].RunID != run.ID {
		t.Fatalf("expected latest version to link run id")
	}
}
