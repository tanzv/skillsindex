package services

import (
	"context"
	"encoding/json"
	"fmt"
	"testing"

	"skillsindex/internal/models"
)

func TestSkillVersionServiceCapturePersistsChangeDetails(t *testing.T) {
	db := setupSkillVersionServiceTestDB(t)
	skillSvc := NewSkillService(db)
	versionSvc := NewSkillVersionService(db)

	owner := models.User{Username: "version-change-owner", PasswordHash: "hash", Role: models.RoleMember}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}

	created, err := skillSvc.CreateSkill(context.Background(), CreateSkillInput{
		OwnerID:      owner.ID,
		Name:         "Persisted Change Skill",
		Description:  "Description V1",
		Content:      "content-v1",
		Tags:         []string{"alpha"},
		Visibility:   models.VisibilityPrivate,
		SourceType:   models.SourceTypeManual,
		CategorySlug: "development",
	})
	if err != nil {
		t.Fatalf("failed to create skill: %v", err)
	}

	if _, err := skillSvc.UpdateSyncedSkill(context.Background(), SyncUpdateInput{
		SkillID:      created.ID,
		OwnerID:      owner.ID,
		SourceType:   models.SourceTypeRepository,
		SourceURL:    "https://example.com/persist.git",
		SourceBranch: "main",
		Meta: ExtractedSkill{
			Name:        "Persisted Change Skill V2",
			Description: "Description V2",
			Content:     "content-v2",
			Tags:        []string{"alpha", "beta"},
		},
	}); err != nil {
		t.Fatalf("failed to update synced skill: %v", err)
	}

	versions, err := versionSvc.ListBySkill(context.Background(), ListSkillVersionsInput{
		SkillID: created.ID,
		Limit:   20,
	})
	if err != nil {
		t.Fatalf("failed to list versions: %v", err)
	}
	if len(versions) < 2 {
		t.Fatalf("expected at least 2 versions, got=%d", len(versions))
	}

	latest := versions[0]
	if latest.BeforeDigest == "" || latest.AfterDigest == "" {
		t.Fatalf("expected digest fields to be persisted, got before=%q after=%q", latest.BeforeDigest, latest.AfterDigest)
	}
	if latest.ChangeSummary == "" {
		t.Fatalf("expected change summary to be persisted")
	}
	if latest.RiskLevel == "" {
		t.Fatalf("expected risk level to be persisted")
	}

	var changedFields []string
	if err := json.Unmarshal([]byte(latest.ChangedFieldsJSON), &changedFields); err != nil {
		t.Fatalf("failed to parse changed fields json: %v", err)
	}
	if len(changedFields) == 0 {
		t.Fatalf("expected changed fields to be persisted")
	}
}

func TestSkillVersionServiceRetentionArchivesOldSnapshots(t *testing.T) {
	db := setupSkillVersionServiceTestDB(t)
	skillSvc := NewSkillService(db)
	versionSvc := NewSkillVersionService(db)
	versionSvc.retentionLimit = 5

	owner := models.User{Username: "version-retention-owner", PasswordHash: "hash", Role: models.RoleMember}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}

	created, err := skillSvc.CreateSkill(context.Background(), CreateSkillInput{
		OwnerID:      owner.ID,
		Name:         "Retention Skill",
		Description:  "Retention Description",
		Content:      "retention-content-0",
		Tags:         []string{"retention"},
		Visibility:   models.VisibilityPrivate,
		SourceType:   models.SourceTypeManual,
		CategorySlug: "development",
	})
	if err != nil {
		t.Fatalf("failed to create skill: %v", err)
	}

	for i := 1; i <= 8; i++ {
		updates := map[string]any{
			"name":        fmt.Sprintf("Retention Skill %d", i),
			"description": fmt.Sprintf("Retention Description %d", i),
			"content":     fmt.Sprintf("retention-content-%d", i),
		}
		if err := db.Model(&models.Skill{}).Where("id = ?", created.ID).Updates(updates).Error; err != nil {
			t.Fatalf("failed to seed skill change: %v", err)
		}
		if err := versionSvc.Capture(context.Background(), created.ID, "sync", nil); err != nil {
			t.Fatalf("failed to capture version %d: %v", i, err)
		}
	}

	activeVersions, err := versionSvc.ListBySkill(context.Background(), ListSkillVersionsInput{
		SkillID: created.ID,
		Limit:   200,
	})
	if err != nil {
		t.Fatalf("failed to list active versions: %v", err)
	}
	if len(activeVersions) != 5 {
		t.Fatalf("expected 5 active versions after retention archive, got=%d", len(activeVersions))
	}

	allVersions, err := versionSvc.ListBySkill(context.Background(), ListSkillVersionsInput{
		SkillID:         created.ID,
		IncludeArchived: true,
		Limit:           200,
	})
	if err != nil {
		t.Fatalf("failed to list all versions: %v", err)
	}
	if len(allVersions) != 9 {
		t.Fatalf("expected 9 total versions including archived, got=%d", len(allVersions))
	}

	var archivedCount int
	for _, item := range allVersions {
		if item.ArchivedAt != nil {
			archivedCount++
			if item.ArchiveReason != "retention_limit" {
				t.Fatalf("unexpected archive reason: %s", item.ArchiveReason)
			}
		}
	}
	if archivedCount == 0 {
		t.Fatalf("expected archived versions to exist after retention enforcement")
	}
}
