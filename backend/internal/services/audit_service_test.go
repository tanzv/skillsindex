package services

import (
	"context"
	"testing"

	"skillsindex/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupAuditServiceTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open db: %v", err)
	}
	if err := db.AutoMigrate(&models.User{}, &models.AuditLog{}); err != nil {
		t.Fatalf("failed to migrate db: %v", err)
	}
	return db
}

func TestAuditServiceRecordAndList(t *testing.T) {
	db := setupAuditServiceTestDB(t)
	svc := NewAuditService(db)

	user := models.User{
		Username:     "auditor",
		PasswordHash: "hash",
		Role:         models.RoleAdmin,
	}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}

	err := svc.Record(context.Background(), RecordAuditInput{
		ActorUserID: user.ID,
		Action:      "skill_visibility_update",
		TargetType:  "skill",
		TargetID:    11,
		Summary:     "Visibility changed to public",
		Details:     `{"visibility":"public"}`,
	})
	if err != nil {
		t.Fatalf("record audit failed: %v", err)
	}

	logs, err := svc.ListRecent(context.Background(), ListAuditInput{
		Limit: 10,
	})
	if err != nil {
		t.Fatalf("list recent logs failed: %v", err)
	}
	if len(logs) != 1 {
		t.Fatalf("unexpected log count: got=%d want=1", len(logs))
	}
	if logs[0].Action != "skill_visibility_update" {
		t.Fatalf("unexpected action: %s", logs[0].Action)
	}
	if logs[0].ActorUserID != user.ID {
		t.Fatalf("unexpected actor id: got=%d want=%d", logs[0].ActorUserID, user.ID)
	}
}

func TestAuditServiceListByActor(t *testing.T) {
	db := setupAuditServiceTestDB(t)
	svc := NewAuditService(db)

	userA := models.User{Username: "usera", PasswordHash: "hash", Role: models.RoleMember}
	userB := models.User{Username: "userb", PasswordHash: "hash", Role: models.RoleMember}
	if err := db.Create(&userA).Error; err != nil {
		t.Fatalf("failed to create userA: %v", err)
	}
	if err := db.Create(&userB).Error; err != nil {
		t.Fatalf("failed to create userB: %v", err)
	}

	if err := svc.Record(context.Background(), RecordAuditInput{
		ActorUserID: userA.ID,
		Action:      "skill_create",
		TargetType:  "skill",
		TargetID:    1,
		Summary:     "A created skill",
	}); err != nil {
		t.Fatalf("failed to record userA log: %v", err)
	}
	if err := svc.Record(context.Background(), RecordAuditInput{
		ActorUserID: userB.ID,
		Action:      "skill_delete",
		TargetType:  "skill",
		TargetID:    2,
		Summary:     "B deleted skill",
	}); err != nil {
		t.Fatalf("failed to record userB log: %v", err)
	}

	logs, err := svc.ListRecent(context.Background(), ListAuditInput{
		ActorUserID: userA.ID,
		Limit:       10,
	})
	if err != nil {
		t.Fatalf("failed to list logs by actor: %v", err)
	}
	if len(logs) != 1 {
		t.Fatalf("unexpected log count for actor filter: got=%d want=1", len(logs))
	}
	if logs[0].ActorUserID != userA.ID {
		t.Fatalf("unexpected actor id in filtered log: got=%d want=%d", logs[0].ActorUserID, userA.ID)
	}
}
