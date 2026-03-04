package services

import (
	"context"
	"errors"
	"fmt"
	"testing"
	"time"

	"skillsindex/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupOAuthGrantServiceTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open db: %v", err)
	}
	if err := db.AutoMigrate(&models.User{}, &models.OAuthGrant{}); err != nil {
		t.Fatalf("failed to migrate db: %v", err)
	}
	return db
}

func TestOAuthGrantUpsertAndGet(t *testing.T) {
	db := setupOAuthGrantServiceTestDB(t)
	svc := NewOAuthGrantService(db)

	user := models.User{
		Username:     "oauth-user",
		PasswordHash: "hash",
		Role:         models.RoleMember,
	}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}

	input := UpsertOAuthGrantInput{
		UserID:           user.ID,
		Provider:         models.OAuthProviderDingTalk,
		ExternalUserID:   "union-123",
		AccessToken:      "access-token-1",
		RefreshToken:     "refresh-token-1",
		Scope:            "openid",
		ExpiresAt:        time.Now().UTC().Add(1 * time.Hour),
		RefreshExpiresAt: time.Now().UTC().Add(24 * time.Hour),
	}

	grant, err := svc.UpsertGrant(context.Background(), input)
	if err != nil {
		t.Fatalf("upsert grant failed: %v", err)
	}
	if grant.ExternalUserID != "union-123" {
		t.Fatalf("unexpected external user id: %s", grant.ExternalUserID)
	}

	loaded, err := svc.GetGrantByUserProvider(context.Background(), user.ID, models.OAuthProviderDingTalk)
	if err != nil {
		t.Fatalf("get grant failed: %v", err)
	}
	if loaded.AccessToken != "access-token-1" {
		t.Fatalf("unexpected access token: %s", loaded.AccessToken)
	}
}

func TestOAuthGrantFindUserByExternalID(t *testing.T) {
	db := setupOAuthGrantServiceTestDB(t)
	svc := NewOAuthGrantService(db)

	user := models.User{
		Username:     "oauth-user-find",
		PasswordHash: "hash",
		Role:         models.RoleMember,
	}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}
	if _, err := svc.UpsertGrant(context.Background(), UpsertOAuthGrantInput{
		UserID:         user.ID,
		Provider:       models.OAuthProviderDingTalk,
		ExternalUserID: "union-find-1",
		AccessToken:    "token-find-1",
		ExpiresAt:      time.Now().UTC().Add(30 * time.Minute),
	}); err != nil {
		t.Fatalf("failed to create grant: %v", err)
	}

	found, err := svc.FindUserByExternalID(context.Background(), models.OAuthProviderDingTalk, "union-find-1")
	if err != nil {
		t.Fatalf("find user by external id failed: %v", err)
	}
	if found.ID != user.ID {
		t.Fatalf("unexpected user id: got=%d want=%d", found.ID, user.ID)
	}
}

func TestOAuthGrantRevoke(t *testing.T) {
	db := setupOAuthGrantServiceTestDB(t)
	svc := NewOAuthGrantService(db)

	user := models.User{
		Username:     "oauth-user-revoke",
		PasswordHash: "hash",
		Role:         models.RoleMember,
	}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}
	if _, err := svc.UpsertGrant(context.Background(), UpsertOAuthGrantInput{
		UserID:         user.ID,
		Provider:       models.OAuthProviderDingTalk,
		ExternalUserID: "union-revoke-1",
		AccessToken:    "token-revoke-1",
		ExpiresAt:      time.Now().UTC().Add(30 * time.Minute),
	}); err != nil {
		t.Fatalf("failed to create grant: %v", err)
	}

	if err := svc.RevokeGrant(context.Background(), user.ID, models.OAuthProviderDingTalk); err != nil {
		t.Fatalf("revoke grant failed: %v", err)
	}

	_, err := svc.GetGrantByUserProvider(context.Background(), user.ID, models.OAuthProviderDingTalk)
	if !errors.Is(err, ErrOAuthGrantNotFound) {
		t.Fatalf("expected ErrOAuthGrantNotFound after revoke, got: %v", err)
	}
}
