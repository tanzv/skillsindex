package web

import (
	"context"
	"testing"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func createSyncPolicyForTest(
	t *testing.T,
	app *App,
	input services.CreateSyncPolicyInput,
) models.SyncPolicy {
	t.Helper()

	item, err := app.syncPolicyRecordSvc.Create(context.Background(), input)
	if err != nil {
		t.Fatalf("failed to create sync policy: %v", err)
	}
	return item
}
