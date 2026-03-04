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

func setupIntegrationServiceTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open db: %v", err)
	}
	if err := db.AutoMigrate(
		&models.User{},
		&models.IntegrationConnector{},
		&models.WebhookDeliveryLog{},
	); err != nil {
		t.Fatalf("failed to migrate integration models: %v", err)
	}
	return db
}

func TestIntegrationServiceCreateAndListConnectors(t *testing.T) {
	db := setupIntegrationServiceTestDB(t)
	svc := NewIntegrationService(db)

	creator := models.User{Username: "ops-admin", PasswordHash: "hash", Role: models.RoleAdmin}
	if err := db.Create(&creator).Error; err != nil {
		t.Fatalf("failed to create creator: %v", err)
	}

	connector, err := svc.CreateConnector(context.Background(), CreateConnectorInput{
		Name:        "DingTalk Production",
		Provider:    "dingtalk",
		Description: "Production DingTalk connector",
		BaseURL:     "https://api.dingtalk.com",
		ConfigJSON:  `{"tenant":"prod"}`,
		Enabled:     true,
		CreatedBy:   creator.ID,
	})
	if err != nil {
		t.Fatalf("create connector failed: %v", err)
	}
	if connector.ID == 0 {
		t.Fatalf("expected connector id")
	}

	connectors, err := svc.ListConnectors(context.Background(), ListConnectorsInput{
		Provider: "dingtalk",
		Limit:    20,
	})
	if err != nil {
		t.Fatalf("list connectors failed: %v", err)
	}
	if len(connectors) != 1 {
		t.Fatalf("unexpected connector count: got=%d want=1", len(connectors))
	}
	if connectors[0].Name != "DingTalk Production" {
		t.Fatalf("unexpected connector name: %s", connectors[0].Name)
	}
}

func TestIntegrationServiceRecordAndListWebhookLogs(t *testing.T) {
	db := setupIntegrationServiceTestDB(t)
	svc := NewIntegrationService(db)

	creator := models.User{Username: "webhook-admin", PasswordHash: "hash", Role: models.RoleAdmin}
	if err := db.Create(&creator).Error; err != nil {
		t.Fatalf("failed to create creator: %v", err)
	}

	connector, err := svc.CreateConnector(context.Background(), CreateConnectorInput{
		Name:      "Webhook Gateway",
		Provider:  "webhook",
		BaseURL:   "https://hooks.example.com",
		Enabled:   true,
		CreatedBy: creator.ID,
	})
	if err != nil {
		t.Fatalf("create connector failed: %v", err)
	}

	deliveredAt := time.Now().UTC()
	if err := svc.RecordWebhookDelivery(context.Background(), RecordWebhookDeliveryInput{
		ConnectorID: connector.ID,
		EventType:   "skill.sync.completed",
		Endpoint:    "https://hooks.example.com/sync",
		StatusCode:  200,
		Outcome:     "success",
		RequestID:   "req-123",
		DeliveredAt: deliveredAt,
	}); err != nil {
		t.Fatalf("record webhook delivery failed: %v", err)
	}

	logs, err := svc.ListWebhookLogs(context.Background(), ListWebhookLogsInput{
		ConnectorID: &connector.ID,
		Limit:       10,
	})
	if err != nil {
		t.Fatalf("list webhook logs failed: %v", err)
	}
	if len(logs) != 1 {
		t.Fatalf("unexpected webhook log count: got=%d want=1", len(logs))
	}
	if logs[0].EventType != "skill.sync.completed" {
		t.Fatalf("unexpected event type: %s", logs[0].EventType)
	}
	if logs[0].Outcome != "success" {
		t.Fatalf("unexpected outcome: %s", logs[0].Outcome)
	}
}

func TestIntegrationServiceGetByProviderAndToggleEnabled(t *testing.T) {
	db := setupIntegrationServiceTestDB(t)
	svc := NewIntegrationService(db)

	creator := models.User{Username: "sso-admin", PasswordHash: "hash", Role: models.RoleAdmin}
	if err := db.Create(&creator).Error; err != nil {
		t.Fatalf("failed to create creator: %v", err)
	}

	created, err := svc.CreateConnector(context.Background(), CreateConnectorInput{
		Name:      "Corp SSO",
		Provider:  "corp-sso",
		BaseURL:   "https://idp.example.com",
		Enabled:   true,
		CreatedBy: creator.ID,
	})
	if err != nil {
		t.Fatalf("create connector failed: %v", err)
	}

	loadedByProvider, err := svc.GetConnectorByProvider(context.Background(), "corp-sso", false)
	if err != nil {
		t.Fatalf("get connector by provider failed: %v", err)
	}
	if loadedByProvider.ID != created.ID {
		t.Fatalf("unexpected connector id: got=%d want=%d", loadedByProvider.ID, created.ID)
	}

	updated, err := svc.SetConnectorEnabled(context.Background(), created.ID, false)
	if err != nil {
		t.Fatalf("disable connector failed: %v", err)
	}
	if updated.Enabled {
		t.Fatalf("expected connector to be disabled")
	}

	_, err = svc.GetConnectorByProvider(context.Background(), "corp-sso", false)
	if !errors.Is(err, ErrIntegrationConnectorNotFound) {
		t.Fatalf("expected ErrIntegrationConnectorNotFound when disabled, got=%v", err)
	}

	loadedDisabled, err := svc.GetConnectorByProvider(context.Background(), "corp-sso", true)
	if err != nil {
		t.Fatalf("get disabled connector with includeDisabled failed: %v", err)
	}
	if loadedDisabled.Enabled {
		t.Fatalf("expected loaded connector to remain disabled")
	}

	loadedByID, err := svc.GetConnectorByID(context.Background(), created.ID)
	if err != nil {
		t.Fatalf("get connector by id failed: %v", err)
	}
	if loadedByID.Provider != "corp-sso" {
		t.Fatalf("unexpected provider: %s", loadedByID.Provider)
	}
}
