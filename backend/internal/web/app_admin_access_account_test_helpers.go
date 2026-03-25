package web

import (
	"context"
	"testing"

	"skillsindex/internal/models"
)

func createAdminAccessAPIUser(t *testing.T, app *App, username string, role models.UserRole) models.User {
	t.Helper()

	user, err := app.authService.Register(context.Background(), username, "Password123!")
	if err != nil {
		t.Fatalf("failed to register user %s: %v", username, err)
	}
	if role != models.RoleMember {
		if err := app.authService.SetUserRole(context.Background(), user.ID, role); err != nil {
			t.Fatalf("failed to assign role %s to user %s: %v", role, username, err)
		}
	}

	updated, err := app.authService.GetUserByID(context.Background(), user.ID)
	if err != nil {
		t.Fatalf("failed to reload user %s: %v", username, err)
	}
	return updated
}
