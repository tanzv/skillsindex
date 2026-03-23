package services

import (
	"context"
	"fmt"
	"testing"
	"time"

	"skillsindex/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupAuditServiceTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
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
		RequestID:   "req-audit-001",
		Result:      "success",
		Reason:      "visibility policy approved",
		SourceIP:    "192.168.10.20",
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
	if logs[0].ActorUserID == nil || *logs[0].ActorUserID != user.ID {
		t.Fatalf("unexpected actor id: got=%v want=%d", logs[0].ActorUserID, user.ID)
	}
	if logs[0].RequestID != "req-audit-001" {
		t.Fatalf("unexpected request id: got=%q want=%q", logs[0].RequestID, "req-audit-001")
	}
	if logs[0].Result != "success" {
		t.Fatalf("unexpected result: got=%q want=%q", logs[0].Result, "success")
	}
	if logs[0].Reason != "visibility policy approved" {
		t.Fatalf("unexpected reason: got=%q want=%q", logs[0].Reason, "visibility policy approved")
	}
	if logs[0].SourceIP != "192.168.10.20" {
		t.Fatalf("unexpected source ip: got=%q want=%q", logs[0].SourceIP, "192.168.10.20")
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
	if logs[0].ActorUserID == nil || *logs[0].ActorUserID != userA.ID {
		t.Fatalf("unexpected actor id in filtered log: got=%v want=%d", logs[0].ActorUserID, userA.ID)
	}
}

func TestAuditServiceRecordAllowsAnonymousActor(t *testing.T) {
	db := setupAuditServiceTestDB(t)
	svc := NewAuditService(db)

	err := svc.Record(context.Background(), RecordAuditInput{
		Action:     "password_reset_request",
		TargetType: "password_reset",
		Result:     "accepted",
		Reason:     "request accepted without actor",
		SourceIP:   "203.0.113.20",
		Summary:    "Accepted password reset request",
	})
	if err != nil {
		t.Fatalf("record anonymous audit failed: %v", err)
	}

	logs, err := svc.ListRecent(context.Background(), ListAuditInput{Limit: 10})
	if err != nil {
		t.Fatalf("list recent logs failed: %v", err)
	}
	if len(logs) != 1 {
		t.Fatalf("unexpected log count: got=%d want=1", len(logs))
	}
	if logs[0].ActorUserID != nil {
		t.Fatalf("expected nil actor user id for anonymous audit, got=%v", *logs[0].ActorUserID)
	}
	if logs[0].Result != "accepted" {
		t.Fatalf("unexpected result: got=%q want=%q", logs[0].Result, "accepted")
	}
}

func TestAuditServiceListByTargetRespectsCreatedAtWindow(t *testing.T) {
	db := setupAuditServiceTestDB(t)
	svc := NewAuditService(db)

	if err := svc.Record(context.Background(), RecordAuditInput{
		Action:     "skill_sync_old",
		TargetType: "skill",
		TargetID:   7,
		Summary:    "Old skill audit",
	}); err != nil {
		t.Fatalf("failed to record old audit: %v", err)
	}
	if err := svc.Record(context.Background(), RecordAuditInput{
		Action:     "skill_sync_recent",
		TargetType: "skill",
		TargetID:   7,
		Summary:    "Recent skill audit",
	}); err != nil {
		t.Fatalf("failed to record recent audit: %v", err)
	}

	var logs []models.AuditLog
	if err := db.Order("id ASC").Find(&logs).Error; err != nil {
		t.Fatalf("failed to query audit logs: %v", err)
	}
	if len(logs) != 2 {
		t.Fatalf("unexpected audit log count: got=%d want=2", len(logs))
	}

	base := time.Now().UTC()
	oldTime := base.Add(-2 * time.Hour)
	recentTime := base.Add(-30 * time.Second)
	if err := db.Model(&models.AuditLog{}).Where("id = ?", logs[0].ID).Update("created_at", oldTime).Error; err != nil {
		t.Fatalf("failed to update old audit timestamp: %v", err)
	}
	if err := db.Model(&models.AuditLog{}).Where("id = ?", logs[1].ID).Update("created_at", recentTime).Error; err != nil {
		t.Fatalf("failed to update recent audit timestamp: %v", err)
	}

	windowStart := base.Add(-5 * time.Minute)
	windowEnd := base.Add(5 * time.Minute)
	filtered, err := svc.ListByTarget(context.Background(), ListAuditByTargetInput{
		TargetType:    "skill",
		TargetID:      7,
		CreatedAfter:  &windowStart,
		CreatedBefore: &windowEnd,
		Limit:         10,
	})
	if err != nil {
		t.Fatalf("failed to list filtered audit logs: %v", err)
	}
	if len(filtered) != 1 {
		t.Fatalf("unexpected filtered audit count: got=%d want=1", len(filtered))
	}
	if filtered[0].Action != "skill_sync_recent" {
		t.Fatalf("unexpected filtered audit action: got=%s want=%s", filtered[0].Action, "skill_sync_recent")
	}
}
