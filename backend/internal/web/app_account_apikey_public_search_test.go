package web

import (
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

func setupAccountAPIKeyPublicSearchTestApp(t *testing.T) (*App, models.User) {
	t.Helper()

	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	if err := db.AutoMigrate(
		&models.User{},
		&models.Organization{},
		&models.Skill{},
		&models.Tag{},
		&models.SkillTag{},
		&models.APIKey{},
	); err != nil {
		t.Fatalf("failed to migrate sqlite db: %v", err)
	}

	member := models.User{Username: "account-member", PasswordHash: "hash", Role: models.RoleMember}
	marketAdmin := models.User{Username: "market-admin", PasswordHash: "hash", Role: models.RoleAdmin}
	if err := db.Create(&member).Error; err != nil {
		t.Fatalf("failed to create member user: %v", err)
	}
	if err := db.Create(&marketAdmin).Error; err != nil {
		t.Fatalf("failed to create marketplace admin user: %v", err)
	}

	now := time.Now().UTC()
	skills := []models.Skill{
		{
			OwnerID:         marketAdmin.ID,
			Name:            "React Dashboard Builder",
			Description:     "Prototype-driven dashboard workflow",
			Content:         "React dashboard workflow for local OpenAPI search validation",
			CategorySlug:    "development",
			SubcategorySlug: "frontend",
			Visibility:      models.VisibilityPublic,
			SourceType:      models.SourceTypeManual,
			StarCount:       452,
			QualityScore:    9.4,
			UpdatedAt:       now,
		},
		{
			OwnerID:         marketAdmin.ID,
			Name:            "Ops Governance Toolkit",
			Description:     "Audit and compliance operations",
			Content:         "Incident governance and operational controls",
			CategorySlug:    "devops",
			SubcategorySlug: "monitoring",
			Visibility:      models.VisibilityPublic,
			SourceType:      models.SourceTypeRepository,
			StarCount:       188,
			QualityScore:    8.1,
			UpdatedAt:       now.Add(-12 * time.Hour),
		},
	}
	for _, skill := range skills {
		item := skill
		if err := db.Create(&item).Error; err != nil {
			t.Fatalf("failed to create public skill %q: %v", item.Name, err)
		}
	}

	app := &App{
		skillService:  services.NewSkillService(db),
		apiKeyService: services.NewAPIKeyService(db),
	}
	return app, member
}

func TestAccountAPIKeyCreatedViaSessionEndpointCanCallPublicSearch(t *testing.T) {
	app, member := setupAccountAPIKeyPublicSearchTestApp(t)

	createReq := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/account/apikeys",
		strings.NewReader(`{"name":"search-cli","purpose":"search validation","scopes":["skills.search.read"]}`),
	)
	createReq.Header.Set("Content-Type", "application/json")
	createReq = withCurrentUser(createReq, &member)
	createRecorder := httptest.NewRecorder()

	app.handleAPIAccountAPIKeysCreate(createRecorder, createReq)
	if createRecorder.Code != http.StatusCreated {
		t.Fatalf("unexpected create status code: got=%d want=%d", createRecorder.Code, http.StatusCreated)
	}
	createPayload := decodeBodyMap(t, createRecorder)
	token, ok := createPayload["plaintext_key"].(string)
	if !ok || !strings.HasPrefix(token, "sk_live_") {
		t.Fatalf("unexpected plaintext key: %#v", createPayload["plaintext_key"])
	}

	searchReq := httptest.NewRequest(http.MethodGet, "/api/v1/skills/search?q=react", nil)
	searchReq.Header.Set("Authorization", "Bearer "+token)
	searchRecorder := httptest.NewRecorder()
	searchHandler := app.requireAPIKey(http.HandlerFunc(app.handleAPISearch))

	searchHandler.ServeHTTP(searchRecorder, searchReq)
	if searchRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected search status code: got=%d want=%d body=%s", searchRecorder.Code, http.StatusOK, searchRecorder.Body.String())
	}
	body := searchRecorder.Body.String()
	if !strings.Contains(body, `"React Dashboard Builder"`) {
		t.Fatalf("missing expected search result payload: %s", body)
	}
}

func TestAccountAPIKeyDefaultScopesCanCallPublicAISearch(t *testing.T) {
	app, member := setupAccountAPIKeyPublicSearchTestApp(t)

	createReq := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/account/apikeys",
		strings.NewReader(`{"name":"default-cli","purpose":"default scope validation"}`),
	)
	createReq.Header.Set("Content-Type", "application/json")
	createReq = withCurrentUser(createReq, &member)
	createRecorder := httptest.NewRecorder()

	app.handleAPIAccountAPIKeysCreate(createRecorder, createReq)
	if createRecorder.Code != http.StatusCreated {
		t.Fatalf("unexpected create status code: got=%d want=%d", createRecorder.Code, http.StatusCreated)
	}
	createPayload := decodeBodyMap(t, createRecorder)
	token, ok := createPayload["plaintext_key"].(string)
	if !ok || !strings.HasPrefix(token, "sk_live_") {
		t.Fatalf("unexpected plaintext key: %#v", createPayload["plaintext_key"])
	}

	aiSearchReq := httptest.NewRequest(http.MethodGet, "/api/v1/skills/ai-search?q=dashboard", nil)
	aiSearchReq.Header.Set("Authorization", "Bearer "+token)
	aiSearchRecorder := httptest.NewRecorder()
	aiSearchHandler := app.requireAPIKey(http.HandlerFunc(app.handleAPIAISearch))

	aiSearchHandler.ServeHTTP(aiSearchRecorder, aiSearchReq)
	if aiSearchRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected ai search status code: got=%d want=%d body=%s", aiSearchRecorder.Code, http.StatusOK, aiSearchRecorder.Body.String())
	}
	body := aiSearchRecorder.Body.String()
	if !strings.Contains(body, `"React Dashboard Builder"`) {
		t.Fatalf("missing expected ai search result payload: %s", body)
	}
	if !strings.Contains(body, `"total":1`) {
		t.Fatalf("missing expected ai search total payload: %s", body)
	}
}
