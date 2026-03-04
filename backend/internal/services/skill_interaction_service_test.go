package services

import (
	"context"
	"errors"
	"fmt"
	"testing"

	"skillsindex/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupSkillInteractionServiceTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open db: %v", err)
	}
	if err := db.AutoMigrate(
		&models.User{},
		&models.Skill{},
		&models.SkillFavorite{},
		&models.SkillRating{},
		&models.SkillComment{},
	); err != nil {
		t.Fatalf("failed to migrate models: %v", err)
	}
	return db
}

func TestSkillInteractionLifecycle(t *testing.T) {
	db := setupSkillInteractionServiceTestDB(t)
	ctx := context.Background()

	owner := models.User{Username: "owner1", PasswordHash: "hash", Role: models.RoleMember}
	member := models.User{Username: "member1", PasswordHash: "hash", Role: models.RoleMember}
	admin := models.User{Username: "admin1", PasswordHash: "hash", Role: models.RoleAdmin}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}
	if err := db.Create(&member).Error; err != nil {
		t.Fatalf("failed to create member: %v", err)
	}
	if err := db.Create(&admin).Error; err != nil {
		t.Fatalf("failed to create admin: %v", err)
	}

	skill := models.Skill{
		OwnerID:      owner.ID,
		Name:         "Skill A",
		Description:  "desc",
		Content:      "content",
		Visibility:   models.VisibilityPublic,
		SourceType:   models.SourceTypeManual,
		CategorySlug: "development",
	}
	if err := db.Create(&skill).Error; err != nil {
		t.Fatalf("failed to create skill: %v", err)
	}

	svc := NewSkillInteractionService(db)

	favorited, err := svc.SetFavorite(ctx, skill.ID, member.ID, true)
	if err != nil {
		t.Fatalf("set favorite failed: %v", err)
	}
	if !favorited {
		t.Fatalf("expected favorite status true")
	}

	if err := svc.UpsertRating(ctx, skill.ID, member.ID, 5); err != nil {
		t.Fatalf("upsert rating failed: %v", err)
	}
	if err := svc.UpsertRating(ctx, skill.ID, owner.ID, 4); err != nil {
		t.Fatalf("upsert rating failed: %v", err)
	}

	comment, err := svc.CreateComment(ctx, CreateSkillCommentInput{
		SkillID: skill.ID,
		UserID:  owner.ID,
		Content: "Very useful workflow.",
	})
	if err != nil {
		t.Fatalf("create comment failed: %v", err)
	}
	if comment.ID == 0 {
		t.Fatalf("expected comment id")
	}

	stats, err := svc.GetStats(ctx, skill.ID)
	if err != nil {
		t.Fatalf("get stats failed: %v", err)
	}
	if stats.FavoriteCount != 1 {
		t.Fatalf("unexpected favorite count: got=%d want=1", stats.FavoriteCount)
	}
	if stats.RatingCount != 2 {
		t.Fatalf("unexpected rating count: got=%d want=2", stats.RatingCount)
	}
	if stats.CommentCount != 1 {
		t.Fatalf("unexpected comment count: got=%d want=1", stats.CommentCount)
	}

	userRating, rated, err := svc.GetUserRating(ctx, skill.ID, member.ID)
	if err != nil {
		t.Fatalf("get user rating failed: %v", err)
	}
	if !rated || userRating != 5 {
		t.Fatalf("unexpected user rating: rated=%v value=%d", rated, userRating)
	}

	comments, err := svc.ListComments(ctx, skill.ID, 20)
	if err != nil {
		t.Fatalf("list comments failed: %v", err)
	}
	if len(comments) != 1 {
		t.Fatalf("unexpected comments count: got=%d want=1", len(comments))
	}
	if comments[0].User.Username != owner.Username {
		t.Fatalf("unexpected comment author: got=%s want=%s", comments[0].User.Username, owner.Username)
	}

	err = svc.DeleteComment(ctx, comment.ID, member)
	if !errors.Is(err, ErrCommentPermissionDenied) {
		t.Fatalf("expected permission denied for member deleting others comment, got=%v", err)
	}

	if err := svc.DeleteComment(ctx, comment.ID, admin); err != nil {
		t.Fatalf("admin delete comment failed: %v", err)
	}
}
