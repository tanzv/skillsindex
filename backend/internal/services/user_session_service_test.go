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

func setupUserSessionServiceTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	database, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	if err := database.AutoMigrate(&models.User{}, &models.UserSession{}); err != nil {
		t.Fatalf("failed to migrate sqlite db: %v", err)
	}
	return database
}

func TestUserSessionServiceCreateValidateAndRevoke(t *testing.T) {
	database := setupUserSessionServiceTestDB(t)
	authSvc := NewAuthService(database)
	sessionSvc := NewUserSessionService(database)

	user, err := authSvc.Register(context.Background(), "session-user", "Session123!")
	if err != nil {
		t.Fatalf("failed to create user: %v", err)
	}

	expiresAt := time.Now().UTC().Add(time.Hour)
	created, err := sessionSvc.CreateSession(context.Background(), CreateUserSessionInput{
		UserID:     user.ID,
		SessionID:  "session-id-1",
		UserAgent:  "unit-test-agent",
		IssuedIP:   "127.0.0.1",
		ExpiresAt:  expiresAt,
		LastSeenAt: time.Now().UTC(),
	})
	if err != nil {
		t.Fatalf("failed to create session: %v", err)
	}
	if created.SessionID != "session-id-1" {
		t.Fatalf("unexpected session id: %s", created.SessionID)
	}

	valid, err := sessionSvc.ValidateSession(context.Background(), user.ID, "session-id-1", time.Now().UTC())
	if err != nil {
		t.Fatalf("validate session failed: %v", err)
	}
	if !valid {
		t.Fatalf("expected session to be valid")
	}

	if err := sessionSvc.RevokeSession(context.Background(), user.ID, "session-id-1"); err != nil {
		t.Fatalf("failed to revoke session: %v", err)
	}
	valid, err = sessionSvc.ValidateSession(context.Background(), user.ID, "session-id-1", time.Now().UTC())
	if err != nil {
		t.Fatalf("validate revoked session failed: %v", err)
	}
	if valid {
		t.Fatalf("expected revoked session to be invalid")
	}
}

func TestUserSessionServiceRevokeOtherSessions(t *testing.T) {
	database := setupUserSessionServiceTestDB(t)
	authSvc := NewAuthService(database)
	sessionSvc := NewUserSessionService(database)

	user, err := authSvc.Register(context.Background(), "session-user-2", "Session123!")
	if err != nil {
		t.Fatalf("failed to create user: %v", err)
	}

	_, err = sessionSvc.CreateSession(context.Background(), CreateUserSessionInput{
		UserID:     user.ID,
		SessionID:  "current-session",
		ExpiresAt:  time.Now().UTC().Add(time.Hour),
		LastSeenAt: time.Now().UTC(),
	})
	if err != nil {
		t.Fatalf("failed to create current session: %v", err)
	}
	_, err = sessionSvc.CreateSession(context.Background(), CreateUserSessionInput{
		UserID:     user.ID,
		SessionID:  "other-session",
		ExpiresAt:  time.Now().UTC().Add(time.Hour),
		LastSeenAt: time.Now().UTC(),
	})
	if err != nil {
		t.Fatalf("failed to create other session: %v", err)
	}

	revoked, err := sessionSvc.RevokeOtherSessions(context.Background(), user.ID, "current-session")
	if err != nil {
		t.Fatalf("failed to revoke other sessions: %v", err)
	}
	if revoked != 1 {
		t.Fatalf("unexpected revoked count: got=%d want=1", revoked)
	}

	validCurrent, err := sessionSvc.ValidateSession(context.Background(), user.ID, "current-session", time.Now().UTC())
	if err != nil {
		t.Fatalf("validate current session failed: %v", err)
	}
	if !validCurrent {
		t.Fatalf("expected current session to remain valid")
	}
	validOther, err := sessionSvc.ValidateSession(context.Background(), user.ID, "other-session", time.Now().UTC())
	if err != nil {
		t.Fatalf("validate other session failed: %v", err)
	}
	if validOther {
		t.Fatalf("expected other session to be revoked")
	}
}
