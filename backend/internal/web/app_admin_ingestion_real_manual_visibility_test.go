package web

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/cookiejar"
	"net/http/httptest"
	"testing"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupAdminIngestionHTTPTestApp(t *testing.T) (*App, models.User, string) {
	t.Helper()

	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	if err := db.AutoMigrate(
		&models.User{},
		&models.UserSession{},
		&models.PasswordResetToken{},
		&models.SystemSetting{},
		&models.Organization{},
		&models.OrganizationMember{},
		&models.Skill{},
		&models.Tag{},
		&models.SkillTag{},
		&models.SkillVersion{},
		&models.AsyncJob{},
		&models.AuditLog{},
	); err != nil {
		t.Fatalf("failed to migrate sqlite db: %v", err)
	}

	authSvc := services.NewAuthService(db)
	userSessionSvc := services.NewUserSessionService(db)
	settingsSvc := services.NewSettingsService(db)
	password := "ManualHttp123!"
	user, err := authSvc.Register(context.Background(), "manual-http-owner", password)
	if err != nil {
		t.Fatalf("failed to register http ingestion user: %v", err)
	}

	app := &App{
		authService:     authSvc,
		sessionService:  services.NewSessionService("test-secret", false),
		userSessionSvc:  userSessionSvc,
		skillService:    services.NewSkillService(db),
		auditService:    services.NewAuditService(db),
		uploadService:   services.NewUploadService(),
		skillMPService:  services.NewSkillMPService("", ""),
		settingsService: settingsSvc,
		syncRuntimeDependencies: syncRuntimeDependencies{
			asyncJobSvc:       services.NewAsyncJobService(db),
			repositoryService: services.NewRepositorySyncService(),
		},
		storagePath: t.TempDir(),
		apiOnly:     true,
	}

	return app, user, password
}

func decodeHTTPJSONResponse[T any](t *testing.T, response *http.Response) T {
	t.Helper()

	defer response.Body.Close()
	var payload T
	if err := json.NewDecoder(response.Body).Decode(&payload); err != nil {
		t.Fatalf("failed to decode response body: %v", err)
	}
	return payload
}

func newHTTPJSONRequest(t *testing.T, method string, url string, body []byte) *http.Request {
	t.Helper()

	request, err := http.NewRequest(method, url, bytes.NewReader(body))
	if err != nil {
		t.Fatalf("failed to build request: %v", err)
	}
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Accept", "application/json")
	return request
}

func TestManualIngestionAPIOverHTTPFlowsIntoPublicMarketplaceResources(t *testing.T) {
	app, _, password := setupAdminIngestionHTTPTestApp(t)
	server := httptest.NewServer(app.Router())
	defer server.Close()

	jar, err := cookiejar.New(nil)
	if err != nil {
		t.Fatalf("failed to create cookie jar: %v", err)
	}
	client := &http.Client{Jar: jar}

	csrfResponse, err := client.Get(server.URL + "/api/v1/auth/csrf")
	if err != nil {
		t.Fatalf("failed to request csrf token: %v", err)
	}
	if csrfResponse.StatusCode != http.StatusOK {
		t.Fatalf("unexpected csrf status code: got=%d want=%d", csrfResponse.StatusCode, http.StatusOK)
	}
	var csrfPayload struct {
		CSRFToken string `json:"csrf_token"`
	}
	csrfPayload = decodeHTTPJSONResponse[struct {
		CSRFToken string `json:"csrf_token"`
	}](t, csrfResponse)
	if csrfPayload.CSRFToken == "" {
		t.Fatalf("expected csrf token payload")
	}

	loginRequest := newHTTPJSONRequest(
		t,
		http.MethodPost,
		server.URL+"/api/v1/auth/login",
		[]byte(`{"username":"manual-http-owner","password":"`+password+`"}`),
	)
	loginRequest.Header.Set("X-CSRF-Token", csrfPayload.CSRFToken)
	loginResponse, err := client.Do(loginRequest)
	if err != nil {
		t.Fatalf("failed to login over http: %v", err)
	}
	if loginResponse.StatusCode != http.StatusOK {
		t.Fatalf("unexpected login status code: got=%d want=%d", loginResponse.StatusCode, http.StatusOK)
	}
	loginPayload := decodeHTTPJSONResponse[map[string]any](t, loginResponse)
	if ok, _ := loginPayload["ok"].(bool); !ok {
		t.Fatalf("expected login ok payload: %#v", loginPayload)
	}

	importRequest := newHTTPJSONRequest(
		t,
		http.MethodPost,
		server.URL+"/api/v1/admin/ingestion/manual",
		[]byte(`{"name":"HTTP Manual Visibility Skill","description":"HTTP ingestion verifies public visibility","content":"# HTTP Manual Visibility Skill\n\nHTTP ingestion keeps public APIs in sync.","tags":"manual,http","visibility":"public","install_command":"npx skillsindex install http-manual-visibility"}`),
	)
	importRequest.Header.Set("X-CSRF-Token", csrfPayload.CSRFToken)
	importResponse, err := client.Do(importRequest)
	if err != nil {
		t.Fatalf("failed to import manual skill over http: %v", err)
	}
	if importResponse.StatusCode != http.StatusCreated {
		t.Fatalf("unexpected import status code: got=%d want=%d", importResponse.StatusCode, http.StatusCreated)
	}
	var importPayload struct {
		Status string `json:"status"`
		Item   struct {
			ID         uint   `json:"id"`
			Name       string `json:"name"`
			SourceType string `json:"source_type"`
			Visibility string `json:"visibility"`
		} `json:"item"`
	}
	importPayload = decodeHTTPJSONResponse[struct {
		Status string `json:"status"`
		Item   struct {
			ID         uint   `json:"id"`
			Name       string `json:"name"`
			SourceType string `json:"source_type"`
			Visibility string `json:"visibility"`
		} `json:"item"`
	}](t, importResponse)
	if importPayload.Status != "created" {
		t.Fatalf("unexpected import status payload: %#v", importPayload)
	}
	if importPayload.Item.ID == 0 {
		t.Fatalf("expected imported item id: %#v", importPayload)
	}
	if importPayload.Item.Name != "HTTP Manual Visibility Skill" {
		t.Fatalf("unexpected imported skill name: %#v", importPayload)
	}
	if importPayload.Item.SourceType != "manual" || importPayload.Item.Visibility != "public" {
		t.Fatalf("unexpected imported skill metadata: %#v", importPayload)
	}

	marketplaceResponse, err := client.Get(server.URL + "/api/v1/public/marketplace?q=HTTP%20Manual")
	if err != nil {
		t.Fatalf("failed to query public marketplace: %v", err)
	}
	if marketplaceResponse.StatusCode != http.StatusOK {
		t.Fatalf("unexpected marketplace status code: got=%d want=%d", marketplaceResponse.StatusCode, http.StatusOK)
	}
	marketplacePayload := decodeHTTPJSONResponse[map[string]any](t, marketplaceResponse)
	stats, ok := marketplacePayload["stats"].(map[string]any)
	if !ok {
		t.Fatalf("missing marketplace stats payload: %#v", marketplacePayload)
	}
	if stats["matching_skills"] != float64(1) {
		t.Fatalf("unexpected matching skills payload: %#v", stats)
	}

	detailResponse, err := client.Get(fmt.Sprintf("%s/api/v1/public/skills/%d", server.URL, importPayload.Item.ID))
	if err != nil {
		t.Fatalf("failed to query public detail: %v", err)
	}
	if detailResponse.StatusCode != http.StatusOK {
		t.Fatalf("unexpected detail status code: got=%d want=%d", detailResponse.StatusCode, http.StatusOK)
	}
	var detailPayload struct {
		Skill struct {
			ID         uint   `json:"id"`
			Name       string `json:"name"`
			SourceType string `json:"source_type"`
		} `json:"skill"`
	}
	detailPayload = decodeHTTPJSONResponse[struct {
		Skill struct {
			ID         uint   `json:"id"`
			Name       string `json:"name"`
			SourceType string `json:"source_type"`
		} `json:"skill"`
	}](t, detailResponse)
	if detailPayload.Skill.ID != importPayload.Item.ID {
		t.Fatalf("unexpected detail skill id: %#v", detailPayload)
	}
	if detailPayload.Skill.Name != "HTTP Manual Visibility Skill" || detailPayload.Skill.SourceType != "manual" {
		t.Fatalf("unexpected detail skill payload: %#v", detailPayload)
	}

	resourcesResponse, err := client.Get(fmt.Sprintf("%s/api/v1/public/skills/%d/resources", server.URL, importPayload.Item.ID))
	if err != nil {
		t.Fatalf("failed to query public resources: %v", err)
	}
	if resourcesResponse.StatusCode != http.StatusOK {
		t.Fatalf("unexpected resources status code: got=%d want=%d", resourcesResponse.StatusCode, http.StatusOK)
	}
	var resourcesPayload struct {
		SourceType      string   `json:"source_type"`
		EntryFile       string   `json:"entry_file"`
		Mechanism       string   `json:"mechanism"`
		MetadataSources []string `json:"metadata_sources"`
		FileCount       int      `json:"file_count"`
		InstallCommand  string   `json:"install_command"`
	}
	resourcesPayload = decodeHTTPJSONResponse[struct {
		SourceType      string   `json:"source_type"`
		EntryFile       string   `json:"entry_file"`
		Mechanism       string   `json:"mechanism"`
		MetadataSources []string `json:"metadata_sources"`
		FileCount       int      `json:"file_count"`
		InstallCommand  string   `json:"install_command"`
	}](t, resourcesResponse)
	if resourcesPayload.SourceType != "manual" {
		t.Fatalf("unexpected resources source type: %#v", resourcesPayload)
	}
	if resourcesPayload.EntryFile != "SKILL.md" || resourcesPayload.Mechanism != "fallback" {
		t.Fatalf("unexpected resources topology payload: %#v", resourcesPayload)
	}
	if len(resourcesPayload.MetadataSources) != 1 || resourcesPayload.MetadataSources[0] != "SKILL.md" {
		t.Fatalf("unexpected resources metadata sources: %#v", resourcesPayload)
	}
	if resourcesPayload.FileCount != 1 {
		t.Fatalf("unexpected resources file count: %#v", resourcesPayload)
	}
	if resourcesPayload.InstallCommand != "npx skillsindex install http-manual-visibility" {
		t.Fatalf("unexpected resources install command: %#v", resourcesPayload)
	}

	contentResponse, err := client.Get(fmt.Sprintf("%s/api/v1/public/skills/%d/resource-file?path=SKILL.md", server.URL, importPayload.Item.ID))
	if err != nil {
		t.Fatalf("failed to query public resource content: %v", err)
	}
	if contentResponse.StatusCode != http.StatusOK {
		t.Fatalf("unexpected resource content status code: got=%d want=%d", contentResponse.StatusCode, http.StatusOK)
	}
	var contentPayload struct {
		Content string `json:"content"`
	}
	contentPayload = decodeHTTPJSONResponse[struct {
		Content string `json:"content"`
	}](t, contentResponse)
	if contentPayload.Content == "" {
		t.Fatalf("expected resource content payload")
	}
	if !bytes.Contains([]byte(contentPayload.Content), []byte("HTTP ingestion keeps public APIs in sync.")) {
		t.Fatalf("unexpected resource content payload: %#v", contentPayload)
	}
}
