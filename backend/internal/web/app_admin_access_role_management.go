package web

import (
	"context"

	"skillsindex/internal/models"
)

func (a *App) updateManagedUserRole(ctx context.Context, targetUserID uint, role models.UserRole) (models.User, error) {
	targetUser, err := a.findManagedAccountByID(ctx, targetUserID)
	if err != nil {
		return models.User{}, err
	}
	if err := a.authService.SetUserRole(ctx, targetUserID, role); err != nil {
		return targetUser, err
	}
	return targetUser, nil
}
