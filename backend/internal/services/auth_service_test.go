package services

import (
	"context"
	"errors"
	"fmt"
	"testing"
	"time"

	"skillsindex/internal/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupAuthServiceTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open db: %v", err)
	}
	if err := db.AutoMigrate(&models.User{}, &models.PasswordResetToken{}); err != nil {
		t.Fatalf("failed to migrate user model: %v", err)
	}
	return db
}

func TestEnsureDefaultAccountCreatesUser(t *testing.T) {
	db := setupAuthServiceTestDB(t)
	svc := NewAuthService(db)

	user, err := svc.EnsureDefaultAccount(context.Background(), "admin", "Admin123456!", models.RoleSuperAdmin)
	if err != nil {
		t.Fatalf("ensure default account failed: %v", err)
	}

	if user.Username != "admin" {
		t.Fatalf("unexpected username: %s", user.Username)
	}
	if user.Role != models.RoleSuperAdmin {
		t.Fatalf("unexpected role: %s", user.Role)
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte("Admin123456!")); err != nil {
		t.Fatalf("password hash mismatch: %v", err)
	}
}

func TestEnsureDefaultAccountUpdatesExistingUser(t *testing.T) {
	db := setupAuthServiceTestDB(t)
	oldHash, err := bcrypt.GenerateFromPassword([]byte("OldPass123!"), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("failed to generate old hash: %v", err)
	}

	existing := models.User{
		Username:     "admin",
		PasswordHash: string(oldHash),
		Role:         models.RoleMember,
	}
	if err := db.Create(&existing).Error; err != nil {
		t.Fatalf("failed to create existing user: %v", err)
	}

	svc := NewAuthService(db)
	updated, err := svc.EnsureDefaultAccount(context.Background(), "admin", "NewPass123!", models.RoleSuperAdmin)
	if err != nil {
		t.Fatalf("ensure default account failed: %v", err)
	}

	if updated.Role != models.RoleSuperAdmin {
		t.Fatalf("unexpected role after update: %s", updated.Role)
	}
	if err := bcrypt.CompareHashAndPassword([]byte(updated.PasswordHash), []byte("NewPass123!")); err != nil {
		t.Fatalf("password hash mismatch after update: %v", err)
	}
}

func TestSetUserRolePreventsRemovingLastSuperAdmin(t *testing.T) {
	db := setupAuthServiceTestDB(t)
	svc := NewAuthService(db)

	superAdmin, err := svc.EnsureDefaultAccount(context.Background(), "admin", "Admin123456!", models.RoleSuperAdmin)
	if err != nil {
		t.Fatalf("failed to create super admin: %v", err)
	}
	member, err := svc.Register(context.Background(), "member", "Member123!")
	if err != nil {
		t.Fatalf("failed to create member: %v", err)
	}

	err = svc.SetUserRole(context.Background(), superAdmin.ID, models.RoleMember)
	if !errors.Is(err, ErrLastSuperAdmin) {
		t.Fatalf("expected ErrLastSuperAdmin, got: %v", err)
	}

	if err := svc.SetUserRole(context.Background(), member.ID, models.RoleSuperAdmin); err != nil {
		t.Fatalf("failed to promote member: %v", err)
	}
	if err := svc.SetUserRole(context.Background(), superAdmin.ID, models.RoleAdmin); err != nil {
		t.Fatalf("failed to demote first super admin with backup present: %v", err)
	}
}

func TestCreateOAuthUserAllocatesUniqueUsername(t *testing.T) {
	db := setupAuthServiceTestDB(t)
	svc := NewAuthService(db)

	first, err := svc.CreateOAuthUser(context.Background(), "OAuth User", models.RoleMember)
	if err != nil {
		t.Fatalf("failed to create first oauth user: %v", err)
	}
	if first.Username != "oauthuser" {
		t.Fatalf("unexpected first username: %s", first.Username)
	}
	if first.PasswordHash == "" {
		t.Fatalf("expected password hash")
	}

	second, err := svc.CreateOAuthUser(context.Background(), "OAuth User", models.RoleMember)
	if err != nil {
		t.Fatalf("failed to create second oauth user: %v", err)
	}
	if second.Username == first.Username {
		t.Fatalf("expected unique username for second oauth user")
	}
}

func TestSetUserStatusAndPasswordReset(t *testing.T) {
	db := setupAuthServiceTestDB(t)
	svc := NewAuthService(db)

	user, err := svc.Register(context.Background(), "status-user", "Status123!")
	if err != nil {
		t.Fatalf("failed to register user: %v", err)
	}

	if err := svc.SetUserStatus(context.Background(), user.ID, models.UserStatusDisabled); err != nil {
		t.Fatalf("failed to disable user: %v", err)
	}
	_, err = svc.Authenticate(context.Background(), "status-user", "Status123!")
	if !errors.Is(err, ErrInvalidCredentials) {
		t.Fatalf("expected invalid credentials for disabled user, got: %v", err)
	}

	if err := svc.AdminResetPassword(context.Background(), user.ID, "Reset123!"); err != nil {
		t.Fatalf("failed to reset password: %v", err)
	}
	if err := svc.SetUserStatus(context.Background(), user.ID, models.UserStatusActive); err != nil {
		t.Fatalf("failed to re-enable user: %v", err)
	}
	if err := svc.ForceSignOutUser(context.Background(), user.ID); err != nil {
		t.Fatalf("failed to force signout user: %v", err)
	}
	_, err = svc.Authenticate(context.Background(), "status-user", "Reset123!")
	if err != nil {
		t.Fatalf("expected authentication with reset password, got: %v", err)
	}
}

func TestGetUserByUsername(t *testing.T) {
	db := setupAuthServiceTestDB(t)
	svc := NewAuthService(db)

	created, err := svc.Register(context.Background(), "lookup-user", "Lookup123!")
	if err != nil {
		t.Fatalf("failed to register user: %v", err)
	}

	loaded, err := svc.GetUserByUsername(context.Background(), " Lookup-User ")
	if err != nil {
		t.Fatalf("failed to get user by username: %v", err)
	}
	if loaded.ID != created.ID {
		t.Fatalf("unexpected loaded user id: got=%d want=%d", loaded.ID, created.ID)
	}
}

func TestUpdateProfile(t *testing.T) {
	db := setupAuthServiceTestDB(t)
	svc := NewAuthService(db)

	user, err := svc.Register(context.Background(), "profile-user", "Profile123!")
	if err != nil {
		t.Fatalf("failed to register user: %v", err)
	}

	updated, err := svc.UpdateProfile(context.Background(), user.ID, UpdateUserProfileInput{
		DisplayName: "Profile User",
		AvatarURL:   "https://example.com/avatar.png",
		Bio:         "Profile bio content",
	})
	if err != nil {
		t.Fatalf("failed to update profile: %v", err)
	}
	if updated.DisplayName != "Profile User" {
		t.Fatalf("unexpected display name: %s", updated.DisplayName)
	}
	if updated.AvatarURL != "https://example.com/avatar.png" {
		t.Fatalf("unexpected avatar url: %s", updated.AvatarURL)
	}
	if updated.Bio != "Profile bio content" {
		t.Fatalf("unexpected bio: %s", updated.Bio)
	}
}

func TestUpdateProfileValidation(t *testing.T) {
	db := setupAuthServiceTestDB(t)
	svc := NewAuthService(db)

	user, err := svc.Register(context.Background(), "profile-invalid", "Profile123!")
	if err != nil {
		t.Fatalf("failed to register user: %v", err)
	}

	_, err = svc.UpdateProfile(context.Background(), user.ID, UpdateUserProfileInput{
		DisplayName: "Invalid\nName",
	})
	if err == nil {
		t.Fatalf("expected display name validation error")
	}

	_, err = svc.UpdateProfile(context.Background(), user.ID, UpdateUserProfileInput{
		AvatarURL: "not-a-url",
	})
	if err == nil {
		t.Fatalf("expected avatar url validation error")
	}
}

func TestChangePassword(t *testing.T) {
	db := setupAuthServiceTestDB(t)
	svc := NewAuthService(db)

	user, err := svc.Register(context.Background(), "password-user", "Password123!")
	if err != nil {
		t.Fatalf("failed to register user: %v", err)
	}

	if err := svc.ChangePassword(context.Background(), user.ID, "Password123!", "NewPassword123!"); err != nil {
		t.Fatalf("failed to change password: %v", err)
	}
	if _, err := svc.Authenticate(context.Background(), "password-user", "Password123!"); !errors.Is(err, ErrInvalidCredentials) {
		t.Fatalf("expected old password invalid credentials, got: %v", err)
	}
	if _, err := svc.Authenticate(context.Background(), "password-user", "NewPassword123!"); err != nil {
		t.Fatalf("expected new password to authenticate, got: %v", err)
	}
}

func TestChangePasswordValidation(t *testing.T) {
	db := setupAuthServiceTestDB(t)
	svc := NewAuthService(db)

	user, err := svc.Register(context.Background(), "password-invalid", "Password123!")
	if err != nil {
		t.Fatalf("failed to register user: %v", err)
	}

	if err := svc.ChangePassword(context.Background(), user.ID, "wrong-current", "NewPassword123!"); err == nil {
		t.Fatalf("expected invalid current password error")
	}

	if err := svc.ChangePassword(context.Background(), user.ID, "Password123!", "short"); err == nil {
		t.Fatalf("expected password policy error")
	}
}

func TestRequestAndConfirmPasswordReset(t *testing.T) {
	db := setupAuthServiceTestDB(t)
	svc := NewAuthService(db)

	user, err := svc.Register(context.Background(), "reset-user", "Reset123!")
	if err != nil {
		t.Fatalf("failed to register user: %v", err)
	}

	token, err := svc.RequestPasswordReset(context.Background(), user.Username, "127.0.0.1")
	if err != nil {
		t.Fatalf("failed to request password reset: %v", err)
	}
	if token == "" {
		t.Fatalf("expected non-empty reset token")
	}

	updatedUser, err := svc.ConfirmPasswordReset(context.Background(), token, "Reset234!")
	if err != nil {
		t.Fatalf("failed to confirm password reset: %v", err)
	}
	if updatedUser.ID != user.ID {
		t.Fatalf("unexpected updated user id: got=%d want=%d", updatedUser.ID, user.ID)
	}
	if _, err := svc.Authenticate(context.Background(), "reset-user", "Reset123!"); !errors.Is(err, ErrInvalidCredentials) {
		t.Fatalf("expected old password invalid credentials, got: %v", err)
	}
	if _, err := svc.Authenticate(context.Background(), "reset-user", "Reset234!"); err != nil {
		t.Fatalf("expected new password to authenticate, got: %v", err)
	}
}

func TestConfirmPasswordResetRejectsExpiredToken(t *testing.T) {
	db := setupAuthServiceTestDB(t)
	svc := NewAuthService(db)

	user, err := svc.Register(context.Background(), "expired-reset", "Reset123!")
	if err != nil {
		t.Fatalf("failed to register user: %v", err)
	}

	token, err := svc.RequestPasswordReset(context.Background(), user.Username, "127.0.0.1")
	if err != nil {
		t.Fatalf("failed to request password reset: %v", err)
	}

	hash := hashPasswordResetToken(token)
	if err := db.Model(&models.PasswordResetToken{}).
		Where("token_hash = ?", hash).
		Update("expires_at", time.Now().UTC().Add(-time.Minute)).
		Error; err != nil {
		t.Fatalf("failed to expire token: %v", err)
	}

	if _, err := svc.ConfirmPasswordReset(context.Background(), token, "Reset234!"); !errors.Is(err, ErrPasswordResetTokenExpired) {
		t.Fatalf("expected ErrPasswordResetTokenExpired, got: %v", err)
	}
}

func TestConfirmPasswordResetRejectsUsedToken(t *testing.T) {
	db := setupAuthServiceTestDB(t)
	svc := NewAuthService(db)

	user, err := svc.Register(context.Background(), "used-reset", "Reset123!")
	if err != nil {
		t.Fatalf("failed to register user: %v", err)
	}

	token, err := svc.RequestPasswordReset(context.Background(), user.Username, "127.0.0.1")
	if err != nil {
		t.Fatalf("failed to request password reset: %v", err)
	}
	if _, err := svc.ConfirmPasswordReset(context.Background(), token, "Reset234!"); err != nil {
		t.Fatalf("failed first reset confirmation: %v", err)
	}

	if _, err := svc.ConfirmPasswordReset(context.Background(), token, "Reset345!"); !errors.Is(err, ErrPasswordResetTokenUsed) {
		t.Fatalf("expected ErrPasswordResetTokenUsed, got: %v", err)
	}
}
