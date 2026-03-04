package web

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func TestHandleAPIPublicSkillDetailIncludesInteractionAggregation(t *testing.T) {
	app, user, skill, interactionSvc := setupInteractionAPITestApp(t)

	if _, err := interactionSvc.SetFavorite(context.Background(), skill.ID, user.ID, true); err != nil {
		t.Fatalf("failed to set favorite: %v", err)
	}
	if err := interactionSvc.UpsertRating(context.Background(), skill.ID, user.ID, 5); err != nil {
		t.Fatalf("failed to upsert rating: %v", err)
	}
	if _, err := interactionSvc.CreateComment(context.Background(), services.CreateSkillCommentInput{
		SkillID: skill.ID,
		UserID:  user.ID,
		Content: "This skill is stable in CI flows.",
	}); err != nil {
		t.Fatalf("failed to create comment: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/skills/"+strconv.FormatUint(uint64(skill.ID), 10), nil)
	req = withCurrentUser(req, &user)
	req = withURLParams(req, map[string]string{
		"skillID": strconv.FormatUint(uint64(skill.ID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleAPIPublicSkillDetail(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	body := recorder.Body.String()
	if !strings.Contains(body, `"skill"`) {
		t.Fatalf("missing skill payload: %s", body)
	}
	if !strings.Contains(body, `"favorite_count":1`) {
		t.Fatalf("missing favorite count: %s", body)
	}
	if !strings.Contains(body, `"rating_count":1`) {
		t.Fatalf("missing rating count: %s", body)
	}
	if !strings.Contains(body, `"comment_count":1`) {
		t.Fatalf("missing comment count: %s", body)
	}
	if !strings.Contains(body, `"favorited":true`) {
		t.Fatalf("missing viewer favorite state: %s", body)
	}
	if !strings.Contains(body, `"rated":true`) || !strings.Contains(body, `"rating":5`) {
		t.Fatalf("missing viewer rating state: %s", body)
	}
	if !strings.Contains(body, `"can_interact":true`) {
		t.Fatalf("missing viewer interaction capability: %s", body)
	}
	if !strings.Contains(body, `"comments_limit":80`) {
		t.Fatalf("missing comment limit: %s", body)
	}
}

func TestHandleAPIPublicSkillDetailAnonymousViewerIsReadOnly(t *testing.T) {
	app, _, skill, interactionSvc := setupInteractionAPITestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/skills/"+strconv.FormatUint(uint64(skill.ID), 10), nil)
	req = withURLParams(req, map[string]string{
		"skillID": strconv.FormatUint(uint64(skill.ID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleAPIPublicSkillDetail(recorder, req)

	if recorder.Code != http.StatusNotFound {
		t.Fatalf("expected private skill to be hidden for anonymous viewer, got=%d", recorder.Code)
	}

	publicSkill, err := app.skillService.CreateSkill(context.Background(), services.CreateSkillInput{
		OwnerID:      skill.OwnerID,
		Name:         "Public Skill",
		Description:  "Visible to anonymous users",
		Content:      "public-content",
		Visibility:   models.VisibilityPublic,
		SourceType:   models.SourceTypeManual,
		CategorySlug: "development",
	})
	if err != nil {
		t.Fatalf("failed to create public skill: %v", err)
	}
	if _, err := interactionSvc.CreateComment(context.Background(), services.CreateSkillCommentInput{
		SkillID: publicSkill.ID,
		UserID:  skill.OwnerID,
		Content: "Public comment entry",
	}); err != nil {
		t.Fatalf("failed to create public comment: %v", err)
	}

	req = httptest.NewRequest(http.MethodGet, "/api/v1/public/skills/"+strconv.FormatUint(uint64(publicSkill.ID), 10), nil)
	req = withURLParams(req, map[string]string{
		"skillID": strconv.FormatUint(uint64(publicSkill.ID), 10),
	})
	recorder = httptest.NewRecorder()

	app.handleAPIPublicSkillDetail(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code for public skill: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	body := recorder.Body.String()
	if !strings.Contains(body, `"can_interact":false`) {
		t.Fatalf("anonymous viewer should not interact: %s", body)
	}
	if !strings.Contains(body, `"favorited":false`) {
		t.Fatalf("anonymous viewer favorite state should be false: %s", body)
	}
	if !strings.Contains(body, `"rated":false`) {
		t.Fatalf("anonymous viewer rated state should be false: %s", body)
	}
}
