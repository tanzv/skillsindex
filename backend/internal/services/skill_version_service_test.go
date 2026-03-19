package services

import (
	"context"
	"testing"

	"skillsindex/internal/models"
)

func TestSkillVersionServiceCaptureAndRestore(t *testing.T) {
	db := setupSkillVersionServiceTestDB(t)
	skillSvc := NewSkillService(db)
	versionSvc := NewSkillVersionService(db)

	owner := models.User{Username: "version-owner", PasswordHash: "hash", Role: models.RoleMember}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}

	created, err := skillSvc.CreateSkill(context.Background(), CreateSkillInput{
		OwnerID:      owner.ID,
		Name:         "Original Skill Name",
		Description:  "Original description",
		Content:      "Original content",
		Tags:         []string{"original"},
		Visibility:   models.VisibilityPrivate,
		SourceType:   models.SourceTypeManual,
		CategorySlug: "development",
	})
	if err != nil {
		t.Fatalf("failed to create skill: %v", err)
	}

	if _, err := skillSvc.UpdateSyncedSkill(context.Background(), SyncUpdateInput{
		SkillID:    created.ID,
		OwnerID:    owner.ID,
		SourceType: models.SourceTypeRepository,
		SourceURL:  "https://example.com/repo.git",
		Meta: ExtractedSkill{
			Name:        "Updated Skill Name",
			Description: "Updated description",
			Content:     "Updated content",
			Tags:        []string{"updated", "repo"},
		},
	}); err != nil {
		t.Fatalf("failed to sync update skill: %v", err)
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

	var initialVersionID uint
	for _, item := range versions {
		if item.VersionNumber == 1 {
			initialVersionID = item.ID
			break
		}
	}
	if initialVersionID == 0 {
		t.Fatalf("expected to find initial version id")
	}

	actorID := &owner.ID
	restored, err := versionSvc.RestoreVersion(context.Background(), created.ID, initialVersionID, owner.ID, actorID)
	if err != nil {
		t.Fatalf("failed to restore version: %v", err)
	}
	if restored.Name != "Original Skill Name" {
		t.Fatalf("unexpected restored skill name: got=%s", restored.Name)
	}

	versionsAfterRestore, err := versionSvc.ListBySkill(context.Background(), ListSkillVersionsInput{
		SkillID: created.ID,
		Limit:   20,
	})
	if err != nil {
		t.Fatalf("failed to list versions after restore: %v", err)
	}
	if len(versionsAfterRestore) <= len(versions) {
		t.Fatalf("expected new version after restore")
	}
}

func TestSkillVersionServiceCompareVersions(t *testing.T) {
	db := setupSkillVersionServiceTestDB(t)
	skillSvc := NewSkillService(db)
	versionSvc := NewSkillVersionService(db)

	owner := models.User{Username: "version-compare-owner", PasswordHash: "hash", Role: models.RoleMember}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}

	created, err := skillSvc.CreateSkill(context.Background(), CreateSkillInput{
		OwnerID:      owner.ID,
		Name:         "Skill Alpha",
		Description:  "Description A",
		Content:      "line1\nline2",
		Tags:         []string{"alpha", "legacy"},
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
		SourceURL:    "https://example.com/alpha.git",
		SourceBranch: "main",
		SourcePath:   "/skills/alpha",
		Meta: ExtractedSkill{
			Name:        "Skill Alpha V2",
			Description: "Description B",
			Content:     "line1\nline3",
			Tags:        []string{"alpha", "modern"},
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

	var firstVersionID uint
	var secondVersionID uint
	for _, item := range versions {
		if item.VersionNumber == 1 {
			firstVersionID = item.ID
		}
		if item.VersionNumber == 2 {
			secondVersionID = item.ID
		}
	}
	if firstVersionID == 0 || secondVersionID == 0 {
		t.Fatalf("failed to resolve version ids: v1=%d v2=%d", firstVersionID, secondVersionID)
	}

	compareResult, err := versionSvc.CompareVersions(context.Background(), CompareSkillVersionsInput{
		SkillID:       created.ID,
		FromVersionID: firstVersionID,
		ToVersionID:   secondVersionID,
	})
	if err != nil {
		t.Fatalf("failed to compare versions: %v", err)
	}

	if !compareResult.ContentChanged {
		t.Fatalf("expected content to be changed")
	}
	if compareResult.BeforeDigest == "" || compareResult.AfterDigest == "" {
		t.Fatalf("expected digests to be generated")
	}
	if compareResult.BeforeDigest == compareResult.AfterDigest {
		t.Fatalf("expected digest to change between versions")
	}
	if len(compareResult.ChangedFields) == 0 {
		t.Fatalf("expected changed fields to be populated")
	}
	if len(compareResult.MetadataChanges) == 0 {
		t.Fatalf("expected metadata changes to be populated")
	}
	if compareResult.ChangeSummary == "" {
		t.Fatalf("expected compare summary to be populated")
	}
}

func TestSkillVersionServiceRollbackVersion(t *testing.T) {
	db := setupSkillVersionServiceTestDB(t)
	skillSvc := NewSkillService(db)
	versionSvc := NewSkillVersionService(db)

	owner := models.User{Username: "version-rollback-owner", PasswordHash: "hash", Role: models.RoleMember}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}

	created, err := skillSvc.CreateSkill(context.Background(), CreateSkillInput{
		OwnerID:      owner.ID,
		Name:         "Rollback Skill Original",
		Description:  "Description O",
		Content:      "original content",
		Tags:         []string{"original"},
		Visibility:   models.VisibilityPrivate,
		SourceType:   models.SourceTypeManual,
		CategorySlug: "development",
	})
	if err != nil {
		t.Fatalf("failed to create skill: %v", err)
	}

	if _, err := skillSvc.UpdateSyncedSkill(context.Background(), SyncUpdateInput{
		SkillID:    created.ID,
		OwnerID:    owner.ID,
		SourceType: models.SourceTypeRepository,
		SourceURL:  "https://example.com/rollback.git",
		Meta: ExtractedSkill{
			Name:        "Rollback Skill Updated",
			Description: "Description U",
			Content:     "updated content",
			Tags:        []string{"updated"},
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
	var firstVersionID uint
	for _, item := range versions {
		if item.VersionNumber == 1 {
			firstVersionID = item.ID
			break
		}
	}
	if firstVersionID == 0 {
		t.Fatalf("expected to find first version id")
	}

	actorID := &owner.ID
	restored, err := versionSvc.RollbackVersion(context.Background(), created.ID, firstVersionID, owner.ID, actorID)
	if err != nil {
		t.Fatalf("failed to rollback version: %v", err)
	}
	if restored.Name != "Rollback Skill Original" {
		t.Fatalf("unexpected restored name: got=%s", restored.Name)
	}

	versionsAfterRollback, err := versionSvc.ListBySkill(context.Background(), ListSkillVersionsInput{
		SkillID: created.ID,
		Limit:   20,
	})
	if err != nil {
		t.Fatalf("failed to list versions after rollback: %v", err)
	}
	if len(versionsAfterRollback) < 3 {
		t.Fatalf("expected at least 3 versions after rollback, got=%d", len(versionsAfterRollback))
	}
	latest := versionsAfterRollback[0]
	if latest.VersionNumber < 3 {
		t.Fatalf("expected latest version number >= 3, got=%d", latest.VersionNumber)
	}
	if latest.Trigger != "rollback" {
		t.Fatalf("expected rollback trigger, got=%s", latest.Trigger)
	}
}
