package services

import (
	"context"
	"testing"

	"skillsindex/internal/models"
)

func TestAPIKeyServiceCreateSetsPurposeAndCreator(t *testing.T) {
	db := setupAPIKeyServiceTestDB(t)
	ctx := context.Background()

	user := models.User{
		Username:     "metadata-user",
		PasswordHash: "hash",
		Role:         models.RoleMember,
	}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}

	svc := NewAPIKeyService(db)
	created, _, err := svc.Create(ctx, CreateAPIKeyInput{
		UserID:    user.ID,
		Name:      "Metadata Token",
		Purpose:   "ci-pipeline",
		CreatedBy: user.ID,
	})
	if err != nil {
		t.Fatalf("failed to create key: %v", err)
	}
	if created.Purpose != "ci-pipeline" {
		t.Fatalf("unexpected purpose: got=%q want=%q", created.Purpose, "ci-pipeline")
	}
	if created.CreatedBy != user.ID {
		t.Fatalf("unexpected created_by: got=%d want=%d", created.CreatedBy, user.ID)
	}
}

func TestAPIKeyServiceRotateSetsLastRotatedAt(t *testing.T) {
	db := setupAPIKeyServiceTestDB(t)
	ctx := context.Background()

	user := models.User{
		Username:     "rotate-metadata-user",
		PasswordHash: "hash",
		Role:         models.RoleMember,
	}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}

	svc := NewAPIKeyService(db)
	created, _, err := svc.Create(ctx, CreateAPIKeyInput{
		UserID:  user.ID,
		Name:    "Rotate Metadata Token",
		Purpose: "runtime-client",
	})
	if err != nil {
		t.Fatalf("failed to create key: %v", err)
	}

	rotated, _, err := svc.Rotate(ctx, created.ID, user.ID)
	if err != nil {
		t.Fatalf("failed to rotate key: %v", err)
	}
	if rotated.LastRotatedAt == nil {
		t.Fatalf("expected last_rotated_at to be set")
	}
	if rotated.Purpose != "runtime-client" {
		t.Fatalf("expected purpose to be preserved after rotate")
	}
	if rotated.CreatedBy != created.CreatedBy {
		t.Fatalf("expected created_by to be preserved after rotate")
	}
}
