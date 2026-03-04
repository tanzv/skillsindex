package web

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupIntegrationsAPITestApp(t *testing.T) (*App, models.User, models.User) {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	if err := db.AutoMigrate(&models.User{}, &models.IntegrationConnector{}, &models.WebhookDeliveryLog{}); err != nil {
		t.Fatalf("failed to migrate sqlite db: %v", err)
	}

	admin := models.User{Username: "admin-integrations", Role: models.RoleAdmin}
	member := models.User{Username: "member-integrations", Role: models.RoleMember}
	if err := db.Create(&admin).Error; err != nil {
		t.Fatalf("failed to create admin: %v", err)
	}
	if err := db.Create(&member).Error; err != nil {
		t.Fatalf("failed to create member: %v", err)
	}

	integrationSvc := services.NewIntegrationService(db)
	connector, err := integrationSvc.CreateConnector(context.Background(), services.CreateConnectorInput{
		Name:        "Slack Alerts",
		Provider:    "slack",
		Description: "Notifications to Slack",
		BaseURL:     "https://hooks.slack.com",
		Enabled:     true,
		CreatedBy:   admin.ID,
	})
	if err != nil {
		t.Fatalf("failed to create connector: %v", err)
	}
	if err := integrationSvc.RecordWebhookDelivery(context.Background(), services.RecordWebhookDeliveryInput{
		ConnectorID: connector.ID,
		EventType:   "sync.completed",
		Endpoint:    "https://hooks.slack.com/services/demo",
		StatusCode:  200,
		Outcome:     "success",
		DeliveredAt: time.Now().UTC(),
	}); err != nil {
		t.Fatalf("failed to create webhook log: %v", err)
	}

	app := &App{integrationSvc: integrationSvc}
	return app, admin, member
}

func TestHandleAPIAdminIntegrationsSuccess(t *testing.T) {
	app, admin, _ := setupIntegrationsAPITestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/integrations?limit=20", nil)
	req = withCurrentUser(req, &admin)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminIntegrations(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	body := recorder.Body.String()
	if !strings.Contains(body, `"total":1`) {
		t.Fatalf("unexpected connector payload: %s", body)
	}
	if !strings.Contains(body, `"webhook_total":1`) {
		t.Fatalf("unexpected webhook payload: %s", body)
	}
}

func TestHandleAPIAdminIntegrationsPermissionDenied(t *testing.T) {
	app, _, member := setupIntegrationsAPITestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/integrations", nil)
	req = withCurrentUser(req, &member)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminIntegrations(recorder, req)

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusForbidden)
	}
	if !strings.Contains(recorder.Body.String(), `"error":"permission_denied"`) {
		t.Fatalf("unexpected permission payload: %s", recorder.Body.String())
	}
}
