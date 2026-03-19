package services

import (
	"context"
	"testing"
	"time"

	"skillsindex/internal/models"
)

func TestSkillVersionServiceListBySkillFilters(t *testing.T) {
	db := setupSkillVersionServiceTestDB(t)
	skillSvc := NewSkillService(db)
	versionSvc := NewSkillVersionService(db)

	owner := models.User{Username: "version-filter-owner", PasswordHash: "hash", Role: models.RoleMember}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}

	created, err := skillSvc.CreateSkill(context.Background(), CreateSkillInput{
		OwnerID:      owner.ID,
		Name:         "Filter Skill",
		Description:  "Filter Description A",
		Content:      "Filter Content A",
		Tags:         []string{"filter", "v1"},
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
		SourceURL:    "https://example.com/filter.git",
		SourceBranch: "main",
		Meta: ExtractedSkill{
			Name:        "Filter Skill Updated",
			Description: "Filter Description B",
			Content:     "Filter Content B",
			Tags:        []string{"filter", "v2"},
		},
	}); err != nil {
		t.Fatalf("failed to update skill: %v", err)
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

	var createVersionID uint
	var syncVersionID uint
	for _, item := range versions {
		switch item.Trigger {
		case "create":
			createVersionID = item.ID
		case "sync":
			syncVersionID = item.ID
		}
	}
	if createVersionID == 0 || syncVersionID == 0 {
		t.Fatalf("expected both create and sync versions, got create=%d sync=%d", createVersionID, syncVersionID)
	}

	base := time.Date(2026, time.January, 20, 8, 0, 0, 0, time.UTC)
	if err := db.Model(&models.SkillVersion{}).Where("id = ?", createVersionID).Update("captured_at", base).Error; err != nil {
		t.Fatalf("failed to update create captured_at: %v", err)
	}
	if err := db.Model(&models.SkillVersion{}).Where("id = ?", syncVersionID).Update("captured_at", base.Add(2*time.Hour)).Error; err != nil {
		t.Fatalf("failed to update sync captured_at: %v", err)
	}

	syncOnly, err := versionSvc.ListBySkill(context.Background(), ListSkillVersionsInput{
		SkillID: created.ID,
		Trigger: "sync",
		Limit:   20,
	})
	if err != nil {
		t.Fatalf("failed to list sync-only versions: %v", err)
	}
	if len(syncOnly) != 1 {
		t.Fatalf("expected exactly one sync version, got=%d", len(syncOnly))
	}
	if syncOnly[0].Trigger != "sync" {
		t.Fatalf("unexpected trigger in sync-only list: %s", syncOnly[0].Trigger)
	}

	from := base.Add(90 * time.Minute)
	to := base.Add(3 * time.Hour)
	windowed, err := versionSvc.ListBySkill(context.Background(), ListSkillVersionsInput{
		SkillID:        created.ID,
		CapturedAfter:  &from,
		CapturedBefore: &to,
		Limit:          20,
	})
	if err != nil {
		t.Fatalf("failed to list windowed versions: %v", err)
	}
	if len(windowed) != 1 {
		t.Fatalf("expected one version in time window, got=%d", len(windowed))
	}
	if windowed[0].ID != syncVersionID {
		t.Fatalf("unexpected version in time window: got=%d want=%d", windowed[0].ID, syncVersionID)
	}
}
