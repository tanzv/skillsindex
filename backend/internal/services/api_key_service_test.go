package services

import (
	"context"
	"fmt"
	"strings"
	"testing"
	"time"

	"skillsindex/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupAPIKeyServiceTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open db: %v", err)
	}
	if err := db.AutoMigrate(&models.User{}, &models.APIKey{}); err != nil {
		t.Fatalf("failed to migrate models: %v", err)
	}
	return db
}

func TestAPIKeyServiceCreateValidateRevoke(t *testing.T) {
	db := setupAPIKeyServiceTestDB(t)
	ctx := context.Background()

	user := models.User{
		Username:     "member01",
		PasswordHash: "hash",
		Role:         models.RoleMember,
	}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}

	svc := NewAPIKeyService(db)
	created, plaintext, err := svc.Create(ctx, CreateAPIKeyInput{
		UserID: user.ID,
		Name:   "CLI Token",
	})
	if err != nil {
		t.Fatalf("create api key failed: %v", err)
	}
	if created.ID == 0 {
		t.Fatalf("expected created key id")
	}
	if plaintext == "" {
		t.Fatalf("expected plaintext key")
	}
	if created.KeyHash == "" {
		t.Fatalf("expected key hash")
	}

	keys, err := svc.ListByUser(ctx, user.ID)
	if err != nil {
		t.Fatalf("list api keys failed: %v", err)
	}
	if len(keys) != 1 {
		t.Fatalf("unexpected key count: got=%d want=1", len(keys))
	}
	if keys[0].Prefix == "" {
		t.Fatalf("expected non-empty prefix")
	}

	validated, ok, err := svc.Validate(ctx, plaintext)
	if err != nil {
		t.Fatalf("validate api key failed: %v", err)
	}
	if !ok {
		t.Fatalf("expected key to be valid")
	}
	if validated.UserID != user.ID {
		t.Fatalf("unexpected user id from validation: got=%d want=%d", validated.UserID, user.ID)
	}

	if err := svc.Revoke(ctx, created.ID, user.ID); err != nil {
		t.Fatalf("revoke api key failed: %v", err)
	}
	_, ok, err = svc.Validate(ctx, plaintext)
	if err != nil {
		t.Fatalf("validate revoked api key failed: %v", err)
	}
	if ok {
		t.Fatalf("expected revoked key to be invalid")
	}
}

func TestAPIKeyServiceListForAdminFilters(t *testing.T) {
	db := setupAPIKeyServiceTestDB(t)
	ctx := context.Background()

	userA := models.User{Username: "alice", PasswordHash: "hash", Role: models.RoleMember}
	userB := models.User{Username: "bob", PasswordHash: "hash", Role: models.RoleMember}
	if err := db.Create(&userA).Error; err != nil {
		t.Fatalf("failed to create userA: %v", err)
	}
	if err := db.Create(&userB).Error; err != nil {
		t.Fatalf("failed to create userB: %v", err)
	}

	svc := NewAPIKeyService(db)
	activeKey, _, err := svc.Create(ctx, CreateAPIKeyInput{UserID: userA.ID, Name: "active"})
	if err != nil {
		t.Fatalf("failed to create active key: %v", err)
	}
	revokedKey, _, err := svc.Create(ctx, CreateAPIKeyInput{UserID: userA.ID, Name: "revoked"})
	if err != nil {
		t.Fatalf("failed to create revoked key: %v", err)
	}
	expiredKey, _, err := svc.Create(ctx, CreateAPIKeyInput{UserID: userB.ID, Name: "expired"})
	if err != nil {
		t.Fatalf("failed to create expired key: %v", err)
	}

	if err := svc.Revoke(ctx, revokedKey.ID, userA.ID); err != nil {
		t.Fatalf("failed to revoke key: %v", err)
	}
	past := time.Now().UTC().Add(-2 * time.Hour)
	if err := db.WithContext(ctx).
		Model(&models.APIKey{}).
		Where("id = ?", expiredKey.ID).
		Update("expires_at", &past).Error; err != nil {
		t.Fatalf("failed to mark key expired: %v", err)
	}

	activeItems, err := svc.ListForAdmin(ctx, ListAPIKeysInput{Status: "active"})
	if err != nil {
		t.Fatalf("list active failed: %v", err)
	}
	if len(activeItems) != 1 || activeItems[0].ID != activeKey.ID {
		t.Fatalf("unexpected active list result")
	}

	revokedItems, err := svc.ListForAdmin(ctx, ListAPIKeysInput{Status: "revoked"})
	if err != nil {
		t.Fatalf("list revoked failed: %v", err)
	}
	if len(revokedItems) != 1 || revokedItems[0].ID != revokedKey.ID {
		t.Fatalf("unexpected revoked list result")
	}

	expiredItems, err := svc.ListForAdmin(ctx, ListAPIKeysInput{Status: "expired"})
	if err != nil {
		t.Fatalf("list expired failed: %v", err)
	}
	if len(expiredItems) != 1 || expiredItems[0].ID != expiredKey.ID {
		t.Fatalf("unexpected expired list result")
	}

	userFilteredItems, err := svc.ListForAdmin(ctx, ListAPIKeysInput{OwnerUsername: "ali", Status: "all"})
	if err != nil {
		t.Fatalf("list by owner filter failed: %v", err)
	}
	if len(userFilteredItems) != 2 {
		t.Fatalf("unexpected owner filter count: got=%d want=2", len(userFilteredItems))
	}
	for _, item := range userFilteredItems {
		if item.User.Username != "alice" {
			t.Fatalf("expected alice keys only, got=%s", item.User.Username)
		}
	}
}

func TestAPIKeyServiceCreateWithScopesAndScopeChecks(t *testing.T) {
	db := setupAPIKeyServiceTestDB(t)
	ctx := context.Background()

	user := models.User{
		Username:     "scope-user",
		PasswordHash: "hash",
		Role:         models.RoleMember,
	}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}

	svc := NewAPIKeyService(db)
	key, plaintext, err := svc.Create(ctx, CreateAPIKeyInput{
		UserID: user.ID,
		Name:   "Scoped Token",
		Scopes: []string{APIKeyScopeSkillsSearchRead},
	})
	if err != nil {
		t.Fatalf("create api key failed: %v", err)
	}
	if plaintext == "" {
		t.Fatalf("expected plaintext token")
	}

	validated, ok, err := svc.Validate(ctx, plaintext)
	if err != nil {
		t.Fatalf("validate api key failed: %v", err)
	}
	if !ok {
		t.Fatalf("expected key to be valid")
	}
	if !APIKeyHasScope(validated, APIKeyScopeSkillsSearchRead) {
		t.Fatalf("expected key to have search scope")
	}
	if APIKeyHasScope(validated, APIKeyScopeSkillsAISearchRead) {
		t.Fatalf("key should not have ai search scope")
	}
	if strings.TrimSpace(key.Scopes) == "" {
		t.Fatalf("expected persisted scopes")
	}
}

func TestAPIKeyServiceRotate(t *testing.T) {
	db := setupAPIKeyServiceTestDB(t)
	ctx := context.Background()

	user := models.User{
		Username:     "rotate-user",
		PasswordHash: "hash",
		Role:         models.RoleMember,
	}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}

	svc := NewAPIKeyService(db)
	created, oldPlaintext, err := svc.Create(ctx, CreateAPIKeyInput{
		UserID: user.ID,
		Name:   "Rotate Token",
		Scopes: []string{APIKeyScopeSkillsSearchRead},
	})
	if err != nil {
		t.Fatalf("failed to create key: %v", err)
	}
	if oldPlaintext == "" {
		t.Fatalf("expected old plaintext")
	}

	rotated, newPlaintext, err := svc.Rotate(ctx, created.ID, user.ID)
	if err != nil {
		t.Fatalf("failed to rotate key: %v", err)
	}
	if rotated.ID == created.ID {
		t.Fatalf("expected rotated key to have new id")
	}
	if newPlaintext == "" {
		t.Fatalf("expected new plaintext")
	}
	if oldPlaintext == newPlaintext {
		t.Fatalf("expected new token to differ from old token")
	}

	_, oldValid, err := svc.Validate(ctx, oldPlaintext)
	if err != nil {
		t.Fatalf("validate old token failed: %v", err)
	}
	if oldValid {
		t.Fatalf("old token should be invalid after rotation")
	}

	validated, newValid, err := svc.Validate(ctx, newPlaintext)
	if err != nil {
		t.Fatalf("validate new token failed: %v", err)
	}
	if !newValid {
		t.Fatalf("new token should be valid")
	}
	if !APIKeyHasScope(validated, APIKeyScopeSkillsSearchRead) {
		t.Fatalf("rotated key should preserve scopes")
	}
}

func TestAPIKeyServiceCreateRejectsInvalidScope(t *testing.T) {
	db := setupAPIKeyServiceTestDB(t)
	ctx := context.Background()

	user := models.User{
		Username:     "invalid-scope-user",
		PasswordHash: "hash",
		Role:         models.RoleMember,
	}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}

	svc := NewAPIKeyService(db)
	_, _, err := svc.Create(ctx, CreateAPIKeyInput{
		UserID: user.ID,
		Scopes: []string{"unknown.scope"},
	})
	if err == nil {
		t.Fatalf("expected create to fail for invalid scope")
	}
}
