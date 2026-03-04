package services

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"testing"
	"time"

	"skillsindex/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupSkillVersionServiceTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", strings.ReplaceAll(t.Name(), "/", "_"))
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open db: %v", err)
	}
	if err := db.AutoMigrate(
		&models.User{},
		&models.Skill{},
		&models.Tag{},
		&models.SkillTag{},
		&models.SkillVersion{},
	); err != nil {
		t.Fatalf("failed to migrate skill version models: %v", err)
	}
	return db
}

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

	var actorID *uint
	actorID = &owner.ID
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
