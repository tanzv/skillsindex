package services

import (
	"context"
	"errors"
	"strings"
	"testing"

	"skillsindex/internal/models"
)

func TestAPIKeyServiceUpdateScopesSuccess(t *testing.T) {
	db := setupAPIKeyServiceTestDB(t)
	ctx := context.Background()

	user := models.User{
		Username:     "update-scopes-user",
		PasswordHash: "hash",
		Role:         models.RoleMember,
	}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}

	svc := NewAPIKeyService(db)
	created, plaintext, err := svc.Create(ctx, CreateAPIKeyInput{
		UserID: user.ID,
		Name:   "Update Scope Token",
		Scopes: []string{APIKeyScopeSkillsSearchRead},
	})
	if err != nil {
		t.Fatalf("failed to create key: %v", err)
	}

	updated, err := svc.UpdateScopes(ctx, created.ID, user.ID, []string{APIKeyScopeSkillsAISearchRead})
	if err != nil {
		t.Fatalf("failed to update scopes: %v", err)
	}
	if !APIKeyHasScope(updated, APIKeyScopeSkillsAISearchRead) {
		t.Fatalf("updated key should have ai search scope")
	}
	if APIKeyHasScope(updated, APIKeyScopeSkillsSearchRead) {
		t.Fatalf("updated key should not keep old search scope")
	}

	validated, ok, err := svc.Validate(ctx, plaintext)
	if err != nil {
		t.Fatalf("failed to validate key: %v", err)
	}
	if !ok {
		t.Fatalf("key should remain valid after scope update")
	}
	if !APIKeyHasScope(validated, APIKeyScopeSkillsAISearchRead) {
		t.Fatalf("validated key should have new ai search scope")
	}
	if APIKeyHasScope(validated, APIKeyScopeSkillsSearchRead) {
		t.Fatalf("validated key should not have old search scope")
	}
}

func TestAPIKeyServiceUpdateScopesRejectsEmpty(t *testing.T) {
	db := setupAPIKeyServiceTestDB(t)
	ctx := context.Background()

	user := models.User{
		Username:     "empty-scopes-user",
		PasswordHash: "hash",
		Role:         models.RoleMember,
	}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}

	svc := NewAPIKeyService(db)
	created, _, err := svc.Create(ctx, CreateAPIKeyInput{
		UserID: user.ID,
		Name:   "Empty Scope Token",
		Scopes: []string{APIKeyScopeSkillsSearchRead},
	})
	if err != nil {
		t.Fatalf("failed to create key: %v", err)
	}

	_, err = svc.UpdateScopes(ctx, created.ID, user.ID, []string{})
	if !errors.Is(err, ErrAPIKeyScopesRequired) {
		t.Fatalf("expected ErrAPIKeyScopesRequired, got=%v", err)
	}
}

func TestAPIKeyServiceUpdateScopesRejectsInvalidScope(t *testing.T) {
	db := setupAPIKeyServiceTestDB(t)
	ctx := context.Background()

	user := models.User{
		Username:     "invalid-update-scopes-user",
		PasswordHash: "hash",
		Role:         models.RoleMember,
	}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}

	svc := NewAPIKeyService(db)
	created, _, err := svc.Create(ctx, CreateAPIKeyInput{
		UserID: user.ID,
		Name:   "Invalid Update Scope Token",
		Scopes: []string{APIKeyScopeSkillsSearchRead},
	})
	if err != nil {
		t.Fatalf("failed to create key: %v", err)
	}

	_, err = svc.UpdateScopes(ctx, created.ID, user.ID, []string{"invalid.scope"})
	if err == nil {
		t.Fatalf("expected update to fail for invalid scope")
	}
	if !strings.Contains(strings.ToLower(err.Error()), "invalid scope") {
		t.Fatalf("unexpected error for invalid scope: %v", err)
	}
}
