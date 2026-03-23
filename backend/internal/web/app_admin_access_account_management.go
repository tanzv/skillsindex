package web

import (
	"context"

	"skillsindex/internal/models"
)

func (a *App) findManagedAccountByID(ctx context.Context, targetUserID uint) (models.User, error) {
	return a.authService.GetUserByID(ctx, targetUserID)
}

func (a *App) createManagedAccount(
	ctx context.Context,
	username string,
	password string,
	role models.UserRole,
) (models.User, bool, error) {
	createdUser, err := a.authService.Register(ctx, username, password)
	if err != nil {
		return models.User{}, false, err
	}
	if role == models.RoleMember {
		return createdUser, false, nil
	}
	if err := a.authService.SetUserRole(ctx, createdUser.ID, role); err != nil {
		return createdUser, true, err
	}
	createdUser.Role = role
	return createdUser, true, nil
}

func (a *App) updateManagedAccountStatus(ctx context.Context, targetUserID uint, status models.UserStatus) error {
	if err := a.authService.SetUserStatus(ctx, targetUserID, status); err != nil {
		return err
	}
	if status == models.UserStatusDisabled {
		_ = a.authService.ForceSignOutUser(ctx, targetUserID)
	}
	return nil
}

func (a *App) forceSignOutManagedAccount(ctx context.Context, targetUserID uint) error {
	return a.authService.ForceSignOutUser(ctx, targetUserID)
}

func (a *App) resetManagedAccountPassword(ctx context.Context, targetUserID uint, password string) error {
	if err := a.authService.AdminResetPassword(ctx, targetUserID, password); err != nil {
		return err
	}
	_ = a.authService.ForceSignOutUser(ctx, targetUserID)
	return nil
}
