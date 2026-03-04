package web

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"github.com/go-chi/chi/v5"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupAPIKeyRotateTestApp(t *testing.T) (*App, *services.APIKeyService, models.User, models.User) {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	if err := db.AutoMigrate(&models.User{}, &models.APIKey{}); err != nil {
		t.Fatalf("failed to migrate sqlite db: %v", err)
	}

	owner := models.User{Username: "owner", PasswordHash: "hash", Role: models.RoleMember}
	other := models.User{Username: "other", PasswordHash: "hash", Role: models.RoleMember}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}
	if err := db.Create(&other).Error; err != nil {
		t.Fatalf("failed to create other: %v", err)
	}

	svc := services.NewAPIKeyService(db)
	app := &App{
		apiKeyService: svc,
		cookieSecure:  false,
	}
	return app, svc, owner, other
}

func withRouteParam(req *http.Request, key, value string) *http.Request {
	routeCtx := chi.NewRouteContext()
	routeCtx.URLParams.Add(key, value)
	ctx := context.WithValue(req.Context(), chi.RouteCtxKey, routeCtx)
	return req.WithContext(ctx)
}

func TestHandleAPIKeyRotateSuccess(t *testing.T) {
	app, svc, owner, _ := setupAPIKeyRotateTestApp(t)
	key, plaintext, err := svc.Create(context.Background(), services.CreateAPIKeyInput{
		UserID: owner.ID,
		Name:   "rotate-me",
	})
	if err != nil {
		t.Fatalf("failed to create api key: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, fmt.Sprintf("/admin/apikeys/%d/rotate?section=apikeys", key.ID), nil)
	req = withCurrentUser(req, &owner)
	req = withRouteParam(req, "keyID", fmt.Sprintf("%d", key.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIKeyRotate(recorder, req)
	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	if !strings.Contains(recorder.Header().Get("Location"), "msg=API+key+rotated") {
		t.Fatalf("unexpected redirect location: %s", recorder.Header().Get("Location"))
	}

	_, oldValid, err := svc.Validate(context.Background(), plaintext)
	if err != nil {
		t.Fatalf("validate old token failed: %v", err)
	}
	if oldValid {
		t.Fatalf("old token should be invalid after rotation")
	}
}

func TestHandleAPIKeyRotatePermissionDenied(t *testing.T) {
	app, svc, owner, other := setupAPIKeyRotateTestApp(t)
	key, _, err := svc.Create(context.Background(), services.CreateAPIKeyInput{
		UserID: owner.ID,
		Name:   "rotate-me",
	})
	if err != nil {
		t.Fatalf("failed to create api key: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, fmt.Sprintf("/admin/apikeys/%d/rotate?section=apikeys", key.ID), nil)
	req = withCurrentUser(req, &other)
	req = withRouteParam(req, "keyID", fmt.Sprintf("%d", key.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIKeyRotate(recorder, req)
	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	if !strings.Contains(recorder.Header().Get("Location"), "err=Permission+denied") {
		t.Fatalf("unexpected redirect location: %s", recorder.Header().Get("Location"))
	}
}
