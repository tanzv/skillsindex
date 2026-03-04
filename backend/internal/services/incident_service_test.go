package services

import (
	"context"
	"fmt"
	"testing"

	"skillsindex/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupIncidentServiceTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open db: %v", err)
	}
	if err := db.AutoMigrate(
		&models.User{},
		&models.Incident{},
	); err != nil {
		t.Fatalf("failed to migrate incident models: %v", err)
	}
	return db
}

func TestIncidentServiceCreateAndListIncidents(t *testing.T) {
	db := setupIncidentServiceTestDB(t)
	svc := NewIncidentService(db)

	creator := models.User{Username: "incident-admin", PasswordHash: "hash", Role: models.RoleAdmin}
	owner := models.User{Username: "oncall", PasswordHash: "hash", Role: models.RoleMember}
	if err := db.Create(&creator).Error; err != nil {
		t.Fatalf("failed to create creator: %v", err)
	}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}

	incident, err := svc.CreateIncident(context.Background(), CreateIncidentInput{
		Title:       "Repository sync failure spike",
		Summary:     "Repository sync failures increased in the last hour.",
		Severity:    models.IncidentSeverityHigh,
		Source:      "scheduler",
		Impact:      "Sync delay for repository-backed skills",
		OwnerUserID: &owner.ID,
		CreatedBy:   creator.ID,
	})
	if err != nil {
		t.Fatalf("create incident failed: %v", err)
	}
	if incident.ID == 0 {
		t.Fatalf("expected incident id")
	}

	items, err := svc.ListIncidents(context.Background(), ListIncidentsInput{
		Limit: 20,
	})
	if err != nil {
		t.Fatalf("list incidents failed: %v", err)
	}
	if len(items) != 1 {
		t.Fatalf("unexpected incident count: got=%d want=1", len(items))
	}
	if items[0].Title != "Repository sync failure spike" {
		t.Fatalf("unexpected incident title: %s", items[0].Title)
	}
}

func TestIncidentServiceResponseAndPostmortemUpdates(t *testing.T) {
	db := setupIncidentServiceTestDB(t)
	svc := NewIncidentService(db)

	creator := models.User{Username: "incident-owner", PasswordHash: "hash", Role: models.RoleAdmin}
	if err := db.Create(&creator).Error; err != nil {
		t.Fatalf("failed to create creator: %v", err)
	}

	incident, err := svc.CreateIncident(context.Background(), CreateIncidentInput{
		Title:     "Webhook retries exhausted",
		Summary:   "Webhook delivery retries exceeded threshold.",
		Severity:  models.IncidentSeverityMedium,
		Source:    "webhook-gateway",
		Impact:    "Integration notifications delayed",
		CreatedBy: creator.ID,
	})
	if err != nil {
		t.Fatalf("create incident failed: %v", err)
	}

	updated, err := svc.UpdateResponse(context.Background(), UpdateIncidentResponseInput{
		IncidentID:    incident.ID,
		Status:        models.IncidentStatusMitigated,
		ResponseNotes: "Scaled worker replicas and restarted webhook queue.",
		Impact:        "Notification lag reduced to under 2 minutes.",
	})
	if err != nil {
		t.Fatalf("update response failed: %v", err)
	}
	if updated.Status != models.IncidentStatusMitigated {
		t.Fatalf("unexpected status after response: %s", updated.Status)
	}
	if updated.ResponseNotes == "" {
		t.Fatalf("expected response notes to be saved")
	}

	updated, err = svc.UpdatePostmortem(context.Background(), UpdateIncidentPostmortemInput{
		IncidentID: incident.ID,
		Postmortem: "Root cause was missing backpressure guard in webhook dispatcher.",
		Status:     models.IncidentStatusResolved,
	})
	if err != nil {
		t.Fatalf("update postmortem failed: %v", err)
	}
	if updated.Postmortem == "" {
		t.Fatalf("expected postmortem to be saved")
	}
	if updated.Status != models.IncidentStatusResolved {
		t.Fatalf("unexpected status after postmortem: %s", updated.Status)
	}
	if updated.ResolvedAt == nil {
		t.Fatalf("expected resolved_at to be set for resolved incident")
	}
}
