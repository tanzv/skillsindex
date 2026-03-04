package services

import (
	"context"
	"fmt"
	"testing"

	"skillsindex/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupModerationServiceTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open db: %v", err)
	}
	if err := db.AutoMigrate(
		&models.User{},
		&models.Skill{},
		&models.SkillComment{},
		&models.ModerationCase{},
	); err != nil {
		t.Fatalf("failed to migrate db: %v", err)
	}
	return db
}

func TestCreateModerationCaseForSkillAndComment(t *testing.T) {
	db := setupModerationServiceTestDB(t)
	svc := NewModerationService(db)

	owner := models.User{Username: "owner-mod", PasswordHash: "hash", Role: models.RoleMember}
	reporter := models.User{Username: "reporter-mod", PasswordHash: "hash", Role: models.RoleMember}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}
	if err := db.Create(&reporter).Error; err != nil {
		t.Fatalf("failed to create reporter: %v", err)
	}
	skill := models.Skill{
		OwnerID:     owner.ID,
		Name:        "Moderation Skill",
		Visibility:  models.VisibilityPublic,
		SourceType:  models.SourceTypeManual,
		Description: "skill for moderation",
	}
	if err := db.Create(&skill).Error; err != nil {
		t.Fatalf("failed to create skill: %v", err)
	}
	comment := models.SkillComment{
		SkillID: skill.ID,
		UserID:  reporter.ID,
		Content: "suspicious content",
	}
	if err := db.Create(&comment).Error; err != nil {
		t.Fatalf("failed to create comment: %v", err)
	}

	createdSkillCase, err := svc.CreateCase(context.Background(), CreateModerationCaseInput{
		ReporterUserID: &reporter.ID,
		TargetType:     models.ModerationTargetSkill,
		SkillID:        &skill.ID,
		ReasonCode:     "spam",
		ReasonDetail:   "contains promo links",
	})
	if err != nil {
		t.Fatalf("failed to create skill moderation case: %v", err)
	}
	if createdSkillCase.TargetType != models.ModerationTargetSkill {
		t.Fatalf("unexpected target type: %s", createdSkillCase.TargetType)
	}
	if createdSkillCase.Status != models.ModerationStatusOpen {
		t.Fatalf("unexpected status: %s", createdSkillCase.Status)
	}

	createdCommentCase, err := svc.CreateCase(context.Background(), CreateModerationCaseInput{
		ReporterUserID: &reporter.ID,
		TargetType:     models.ModerationTargetComment,
		SkillID:        &skill.ID,
		CommentID:      &comment.ID,
		ReasonCode:     "abuse",
		ReasonDetail:   "offensive language",
	})
	if err != nil {
		t.Fatalf("failed to create comment moderation case: %v", err)
	}
	if createdCommentCase.CommentID == nil || *createdCommentCase.CommentID != comment.ID {
		t.Fatalf("unexpected comment id on case")
	}
}

func TestResolveAndRejectModerationCase(t *testing.T) {
	db := setupModerationServiceTestDB(t)
	svc := NewModerationService(db)

	owner := models.User{Username: "owner-mod-resolve", PasswordHash: "hash", Role: models.RoleMember}
	resolver := models.User{Username: "resolver-mod-resolve", PasswordHash: "hash", Role: models.RoleAdmin}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}
	if err := db.Create(&resolver).Error; err != nil {
		t.Fatalf("failed to create resolver: %v", err)
	}
	skill := models.Skill{
		OwnerID:     owner.ID,
		Name:        "Moderation Resolve Skill",
		Visibility:  models.VisibilityPublic,
		SourceType:  models.SourceTypeManual,
		Description: "skill for moderation resolve",
	}
	if err := db.Create(&skill).Error; err != nil {
		t.Fatalf("failed to create skill: %v", err)
	}

	created, err := svc.CreateCase(context.Background(), CreateModerationCaseInput{
		ReporterUserID: &owner.ID,
		TargetType:     models.ModerationTargetSkill,
		SkillID:        &skill.ID,
		ReasonCode:     "security",
		ReasonDetail:   "unsafe command",
	})
	if err != nil {
		t.Fatalf("failed to create case: %v", err)
	}

	resolved, err := svc.ResolveCase(context.Background(), created.ID, ResolveModerationCaseInput{
		ResolverUserID: resolver.ID,
		Action:         models.ModerationActionHidden,
		ResolutionNote: "hidden after review",
	})
	if err != nil {
		t.Fatalf("failed to resolve case: %v", err)
	}
	if resolved.Status != models.ModerationStatusResolved {
		t.Fatalf("unexpected resolved status: %s", resolved.Status)
	}
	if resolved.Action != models.ModerationActionHidden {
		t.Fatalf("unexpected resolved action: %s", resolved.Action)
	}
	if resolved.ResolverUserID == nil || *resolved.ResolverUserID != resolver.ID {
		t.Fatalf("unexpected resolver id")
	}
	var updatedSkill models.Skill
	if err := db.First(&updatedSkill, skill.ID).Error; err != nil {
		t.Fatalf("failed to load updated skill: %v", err)
	}
	if updatedSkill.Visibility != models.VisibilityPrivate {
		t.Fatalf("expected skill visibility to become private after hidden action")
	}

	if _, err := svc.RejectCase(context.Background(), created.ID, RejectModerationCaseInput{
		ResolverUserID: resolver.ID,
		RejectionNote:  "already resolved",
	}); err == nil {
		t.Fatalf("expected reject on resolved case to fail")
	}
}

func TestListModerationCasesByStatus(t *testing.T) {
	db := setupModerationServiceTestDB(t)
	svc := NewModerationService(db)

	owner := models.User{Username: "owner-mod-list", PasswordHash: "hash", Role: models.RoleMember}
	resolver := models.User{Username: "resolver-mod-list", PasswordHash: "hash", Role: models.RoleAdmin}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}
	if err := db.Create(&resolver).Error; err != nil {
		t.Fatalf("failed to create resolver: %v", err)
	}
	skill := models.Skill{
		OwnerID:     owner.ID,
		Name:        "Moderation List Skill",
		Visibility:  models.VisibilityPublic,
		SourceType:  models.SourceTypeManual,
		Description: "skill for moderation list",
	}
	if err := db.Create(&skill).Error; err != nil {
		t.Fatalf("failed to create skill: %v", err)
	}

	openCase, err := svc.CreateCase(context.Background(), CreateModerationCaseInput{
		ReporterUserID: &owner.ID,
		TargetType:     models.ModerationTargetSkill,
		SkillID:        &skill.ID,
		ReasonCode:     "spam",
		ReasonDetail:   "open case",
	})
	if err != nil {
		t.Fatalf("failed to create open case: %v", err)
	}
	closedCase, err := svc.CreateCase(context.Background(), CreateModerationCaseInput{
		ReporterUserID: &owner.ID,
		TargetType:     models.ModerationTargetSkill,
		SkillID:        &skill.ID,
		ReasonCode:     "abuse",
		ReasonDetail:   "to be resolved",
	})
	if err != nil {
		t.Fatalf("failed to create closed case: %v", err)
	}
	if _, err := svc.ResolveCase(context.Background(), closedCase.ID, ResolveModerationCaseInput{
		ResolverUserID: resolver.ID,
		Action:         models.ModerationActionFlagged,
		ResolutionNote: "flagged",
	}); err != nil {
		t.Fatalf("failed to resolve case: %v", err)
	}

	openCases, err := svc.ListCases(context.Background(), ListModerationCasesInput{
		Status: models.ModerationStatusOpen,
		Limit:  20,
	})
	if err != nil {
		t.Fatalf("failed to list open cases: %v", err)
	}
	if len(openCases) != 1 || openCases[0].ID != openCase.ID {
		t.Fatalf("unexpected open case list result")
	}

	resolvedCases, err := svc.ListCases(context.Background(), ListModerationCasesInput{
		Status: models.ModerationStatusResolved,
		Limit:  20,
	})
	if err != nil {
		t.Fatalf("failed to list resolved cases: %v", err)
	}
	if len(resolvedCases) != 1 || resolvedCases[0].ID != closedCase.ID {
		t.Fatalf("unexpected resolved case list result")
	}
}

func TestResolveCommentModerationHiddenUpdatesCommentContent(t *testing.T) {
	db := setupModerationServiceTestDB(t)
	svc := NewModerationService(db)

	owner := models.User{Username: "owner-comment-hidden", PasswordHash: "hash", Role: models.RoleMember}
	reporter := models.User{Username: "reporter-comment-hidden", PasswordHash: "hash", Role: models.RoleMember}
	resolver := models.User{Username: "resolver-comment-hidden", PasswordHash: "hash", Role: models.RoleAdmin}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}
	if err := db.Create(&reporter).Error; err != nil {
		t.Fatalf("failed to create reporter: %v", err)
	}
	if err := db.Create(&resolver).Error; err != nil {
		t.Fatalf("failed to create resolver: %v", err)
	}
	skill := models.Skill{
		OwnerID:     owner.ID,
		Name:        "Comment Hidden Skill",
		Visibility:  models.VisibilityPublic,
		SourceType:  models.SourceTypeManual,
		Description: "skill for comment hidden action",
	}
	if err := db.Create(&skill).Error; err != nil {
		t.Fatalf("failed to create skill: %v", err)
	}
	comment := models.SkillComment{
		SkillID: skill.ID,
		UserID:  reporter.ID,
		Content: "abusive content",
	}
	if err := db.Create(&comment).Error; err != nil {
		t.Fatalf("failed to create comment: %v", err)
	}

	created, err := svc.CreateCase(context.Background(), CreateModerationCaseInput{
		ReporterUserID: &reporter.ID,
		TargetType:     models.ModerationTargetComment,
		SkillID:        &skill.ID,
		CommentID:      &comment.ID,
		ReasonCode:     "abuse",
		ReasonDetail:   "needs hiding",
	})
	if err != nil {
		t.Fatalf("failed to create moderation case: %v", err)
	}

	_, err = svc.ResolveCase(context.Background(), created.ID, ResolveModerationCaseInput{
		ResolverUserID: resolver.ID,
		Action:         models.ModerationActionHidden,
		ResolutionNote: "hidden content",
	})
	if err != nil {
		t.Fatalf("failed to resolve moderation case: %v", err)
	}

	var updatedComment models.SkillComment
	if err := db.First(&updatedComment, comment.ID).Error; err != nil {
		t.Fatalf("failed to load updated comment: %v", err)
	}
	if updatedComment.Content != moderatedHiddenCommentContent {
		t.Fatalf("unexpected hidden comment content: %s", updatedComment.Content)
	}
}

func TestResolveCommentModerationDeletedRemovesComment(t *testing.T) {
	db := setupModerationServiceTestDB(t)
	svc := NewModerationService(db)

	owner := models.User{Username: "owner-comment-deleted", PasswordHash: "hash", Role: models.RoleMember}
	reporter := models.User{Username: "reporter-comment-deleted", PasswordHash: "hash", Role: models.RoleMember}
	resolver := models.User{Username: "resolver-comment-deleted", PasswordHash: "hash", Role: models.RoleAdmin}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}
	if err := db.Create(&reporter).Error; err != nil {
		t.Fatalf("failed to create reporter: %v", err)
	}
	if err := db.Create(&resolver).Error; err != nil {
		t.Fatalf("failed to create resolver: %v", err)
	}
	skill := models.Skill{
		OwnerID:     owner.ID,
		Name:        "Comment Deleted Skill",
		Visibility:  models.VisibilityPublic,
		SourceType:  models.SourceTypeManual,
		Description: "skill for comment deleted action",
	}
	if err := db.Create(&skill).Error; err != nil {
		t.Fatalf("failed to create skill: %v", err)
	}
	comment := models.SkillComment{
		SkillID: skill.ID,
		UserID:  reporter.ID,
		Content: "to be deleted",
	}
	if err := db.Create(&comment).Error; err != nil {
		t.Fatalf("failed to create comment: %v", err)
	}

	created, err := svc.CreateCase(context.Background(), CreateModerationCaseInput{
		ReporterUserID: &reporter.ID,
		TargetType:     models.ModerationTargetComment,
		SkillID:        &skill.ID,
		CommentID:      &comment.ID,
		ReasonCode:     "spam",
		ReasonDetail:   "remove comment",
	})
	if err != nil {
		t.Fatalf("failed to create moderation case: %v", err)
	}

	_, err = svc.ResolveCase(context.Background(), created.ID, ResolveModerationCaseInput{
		ResolverUserID: resolver.ID,
		Action:         models.ModerationActionDeleted,
		ResolutionNote: "deleted content",
	})
	if err != nil {
		t.Fatalf("failed to resolve moderation case: %v", err)
	}

	var remaining int64
	if err := db.Model(&models.SkillComment{}).
		Where("id = ?", comment.ID).
		Count(&remaining).Error; err != nil {
		t.Fatalf("failed to count comment rows: %v", err)
	}
	if remaining != 0 {
		t.Fatalf("expected comment to be deleted, remaining=%d", remaining)
	}
}
