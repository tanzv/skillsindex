package web

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupInteractionAPITestApp(t *testing.T) (*App, models.User, models.Skill, *services.SkillInteractionService) {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	if err := db.AutoMigrate(
		&models.User{},
		&models.Skill{},
		&models.Tag{},
		&models.SkillTag{},
		&models.SkillVersion{},
		&models.SkillFavorite{},
		&models.SkillRating{},
		&models.SkillComment{},
		&models.SystemSetting{},
	); err != nil {
		t.Fatalf("failed to migrate sqlite db: %v", err)
	}

	skillSvc := services.NewSkillService(db)
	interactionSvc := services.NewSkillInteractionService(db)
	user := models.User{
		Username: "interaction-user",
		Role:     models.RoleMember,
	}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}
	skill, err := skillSvc.CreateSkill(context.Background(), services.CreateSkillInput{
		OwnerID:      user.ID,
		Name:         "Interaction Skill",
		Description:  "Test interaction endpoints",
		Content:      "skill-content",
		Visibility:   models.VisibilityPrivate,
		SourceType:   models.SourceTypeManual,
		CategorySlug: "development",
	})
	if err != nil {
		t.Fatalf("failed to create skill: %v", err)
	}

	app := &App{
		skillService:    skillSvc,
		interaction:     interactionSvc,
		settingsService: services.NewSettingsService(db),
	}
	return app, user, skill, interactionSvc
}

func TestHandleAPISkillFavoriteSuccess(t *testing.T) {
	app, user, skill, interactionSvc := setupInteractionAPITestApp(t)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/skills/"+strconv.FormatUint(uint64(skill.ID), 10)+"/favorite",
		strings.NewReader(`{"favorite": true}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &user)
	req = withURLParams(req, map[string]string{
		"skillID": strconv.FormatUint(uint64(skill.ID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleAPISkillFavorite(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	if !strings.Contains(recorder.Body.String(), `"favorited":true`) {
		t.Fatalf("expected favorite response payload, got=%s", recorder.Body.String())
	}
	isFavorite, err := interactionSvc.IsFavorite(context.Background(), skill.ID, user.ID)
	if err != nil {
		t.Fatalf("failed to load favorite state: %v", err)
	}
	if !isFavorite {
		t.Fatalf("expected favorite state to be true")
	}
}

func TestHandleAPISkillRatingInvalidScore(t *testing.T) {
	app, user, skill, _ := setupInteractionAPITestApp(t)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/skills/"+strconv.FormatUint(uint64(skill.ID), 10)+"/rating",
		strings.NewReader(`{"score": 8}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-rating-invalid-score")
	req = withCurrentUser(req, &user)
	req = withURLParams(req, map[string]string{
		"skillID": strconv.FormatUint(uint64(skill.ID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleAPISkillRating(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_score" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Score must be between 1 and 5" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-rating-invalid-score" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestHandleAPISkillFavoriteUnauthorized(t *testing.T) {
	app, _, skill, _ := setupInteractionAPITestApp(t)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/skills/"+strconv.FormatUint(uint64(skill.ID), 10)+"/favorite",
		strings.NewReader(`{"favorite": true}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-favorite-unauthorized")
	req = withURLParams(req, map[string]string{
		"skillID": strconv.FormatUint(uint64(skill.ID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleAPISkillFavorite(recorder, req)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusUnauthorized)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "unauthorized" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Authentication required" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-favorite-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestHandleAPISkillCommentCreateAndDelete(t *testing.T) {
	app, user, skill, interactionSvc := setupInteractionAPITestApp(t)

	createReq := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/skills/"+strconv.FormatUint(uint64(skill.ID), 10)+"/comments",
		strings.NewReader(`{"content":"This skill is useful."}`),
	)
	createReq.Header.Set("Content-Type", "application/json")
	createReq = withCurrentUser(createReq, &user)
	createReq = withURLParams(createReq, map[string]string{
		"skillID": strconv.FormatUint(uint64(skill.ID), 10),
	})
	createRecorder := httptest.NewRecorder()

	app.handleAPISkillCommentCreate(createRecorder, createReq)

	if createRecorder.Code != http.StatusCreated {
		t.Fatalf("unexpected status code: got=%d want=%d", createRecorder.Code, http.StatusCreated)
	}
	var createPayload map[string]any
	if err := json.Unmarshal(createRecorder.Body.Bytes(), &createPayload); err != nil {
		t.Fatalf("failed to decode create payload: %v", err)
	}
	commentObj, ok := createPayload["comment"].(map[string]any)
	if !ok {
		t.Fatalf("missing comment payload: %#v", createPayload)
	}
	commentIDValue, ok := commentObj["id"].(float64)
	if !ok || commentIDValue <= 0 {
		t.Fatalf("invalid comment id payload: %#v", commentObj)
	}
	commentID := uint(commentIDValue)

	deleteReq := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/skills/"+strconv.FormatUint(uint64(skill.ID), 10)+"/comments/"+strconv.FormatUint(uint64(commentID), 10)+"/delete",
		nil,
	)
	deleteReq = withCurrentUser(deleteReq, &user)
	deleteReq = withURLParams(deleteReq, map[string]string{
		"skillID":   strconv.FormatUint(uint64(skill.ID), 10),
		"commentID": strconv.FormatUint(uint64(commentID), 10),
	})
	deleteRecorder := httptest.NewRecorder()

	app.handleAPISkillCommentDelete(deleteRecorder, deleteReq)

	if deleteRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", deleteRecorder.Code, http.StatusOK)
	}
	comments, err := interactionSvc.ListComments(context.Background(), skill.ID, 20)
	if err != nil {
		t.Fatalf("failed to list comments: %v", err)
	}
	if len(comments) != 0 {
		t.Fatalf("expected no comments after delete, got=%d", len(comments))
	}
}
