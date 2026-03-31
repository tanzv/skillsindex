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

func TestHandleAPIPublicSkillDetailIncludesRelatedSkills(t *testing.T) {
	app, user, skill, _ := setupInteractionAPITestApp(t)

	relatedPrimary, err := app.skillService.CreateSkill(context.Background(), services.CreateSkillInput{
		OwnerID:         user.ID,
		Name:            "CI Release Guard",
		Description:     "Protect CI release promotion with shared automation checks.",
		Content:         "release automation ci guard",
		Visibility:      models.VisibilityPublic,
		SourceType:      models.SourceTypeRepository,
		RecordOrigin:    models.RecordOriginImported,
		CategorySlug:    "development",
		SubcategorySlug: "automation",
		StarCount:       420,
		QualityScore:    9.5,
	})
	if err != nil {
		t.Fatalf("failed to create related primary skill: %v", err)
	}
	if err := app.skillService.ReplaceSkillTags(context.Background(), relatedPrimary.ID, []string{"ci", "automation", "release"}); err != nil {
		t.Fatalf("failed to tag related primary skill: %v", err)
	}

	relatedSecondary, err := app.skillService.CreateSkill(context.Background(), services.CreateSkillInput{
		OwnerID:         user.ID,
		Name:            "Automation Runbook",
		Description:     "General automation operations companion.",
		Content:         "automation operations",
		Visibility:      models.VisibilityPublic,
		SourceType:      models.SourceTypeManual,
		RecordOrigin:    models.RecordOriginImported,
		CategorySlug:    "development",
		SubcategorySlug: "automation",
		StarCount:       200,
		QualityScore:    8.8,
	})
	if err != nil {
		t.Fatalf("failed to create related secondary skill: %v", err)
	}
	if err := app.skillService.ReplaceSkillTags(context.Background(), relatedSecondary.ID, []string{"automation"}); err != nil {
		t.Fatalf("failed to tag related secondary skill: %v", err)
	}

	unrelated, err := app.skillService.CreateSkill(context.Background(), services.CreateSkillInput{
		OwnerID:         user.ID,
		Name:            "Finance Digest",
		Description:     "Budget reporting helper.",
		Content:         "finance reporting budget",
		Visibility:      models.VisibilityPublic,
		SourceType:      models.SourceTypeManual,
		RecordOrigin:    models.RecordOriginImported,
		CategorySlug:    "business",
		SubcategorySlug: "finance",
		StarCount:       900,
		QualityScore:    9.8,
	})
	if err != nil {
		t.Fatalf("failed to create unrelated skill: %v", err)
	}
	if err := app.skillService.ReplaceSkillTags(context.Background(), unrelated.ID, []string{"finance"}); err != nil {
		t.Fatalf("failed to tag unrelated skill: %v", err)
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

	var payload struct {
		Skill struct {
			CategoryGroup         string `json:"category_group"`
			CategoryGroupLabel    string `json:"category_group_label"`
			SubcategoryGroup      string `json:"subcategory_group"`
			SubcategoryGroupLabel string `json:"subcategory_group_label"`
		} `json:"skill"`
		RelatedSkills []struct {
			ID                 uint   `json:"id"`
			Name               string `json:"name"`
			CategoryGroup      string `json:"category_group"`
			SubcategoryGroup   string `json:"subcategory_group"`
			CategoryGroupLabel string `json:"category_group_label"`
		} `json:"related_skills"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("failed to decode response payload: %v", err)
	}
	if len(payload.RelatedSkills) < 2 {
		t.Fatalf("expected at least two related skills, got=%d", len(payload.RelatedSkills))
	}
	if payload.Skill.CategoryGroup == "" || payload.Skill.SubcategoryGroup == "" {
		t.Fatalf("expected grouped fields in detail skill payload: %+v", payload.Skill)
	}
	if payload.Skill.CategoryGroupLabel == "" || payload.Skill.SubcategoryGroupLabel == "" {
		t.Fatalf("expected grouped labels in detail skill payload: %+v", payload.Skill)
	}
	if payload.RelatedSkills[0].ID != relatedPrimary.ID {
		t.Fatalf("expected most related skill first: got=%d want=%d", payload.RelatedSkills[0].ID, relatedPrimary.ID)
	}
	if payload.RelatedSkills[0].CategoryGroup == "" || payload.RelatedSkills[0].SubcategoryGroup == "" {
		t.Fatalf("expected grouped fields in related skill payload: %+v", payload.RelatedSkills[0])
	}
	if payload.RelatedSkills[0].CategoryGroupLabel == "" {
		t.Fatalf("expected grouped labels in related skill payload: %+v", payload.RelatedSkills[0])
	}
	for _, item := range payload.RelatedSkills {
		if item.ID == skill.ID {
			t.Fatalf("current skill must not appear in related skills payload")
		}
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

func TestHandleAPIPublicSkillDetailRequiresAuthenticationWhenMarketplaceIsPrivate(t *testing.T) {
	app, user, skill, _ := setupInteractionAPITestApp(t)
	if err := app.settingsService.SetBool(context.Background(), services.SettingMarketplacePublicAccess, false); err != nil {
		t.Fatalf("failed to seed marketplace access setting: %v", err)
	}

	publicSkill, err := app.skillService.CreateSkill(context.Background(), services.CreateSkillInput{
		OwnerID:      user.ID,
		Name:         "Marketplace Restricted Skill",
		Description:  "Visible only when the marketplace is public or the viewer is authenticated.",
		Content:      "restricted-content",
		Visibility:   models.VisibilityPublic,
		SourceType:   models.SourceTypeManual,
		CategorySlug: "development",
	})
	if err != nil {
		t.Fatalf("failed to create public skill: %v", err)
	}

	anonymousReq := httptest.NewRequest(http.MethodGet, "/api/v1/public/skills/"+strconv.FormatUint(uint64(publicSkill.ID), 10), nil)
	anonymousReq = withURLParams(anonymousReq, map[string]string{
		"skillID": strconv.FormatUint(uint64(publicSkill.ID), 10),
	})
	anonymousRecorder := httptest.NewRecorder()

	app.handleAPIPublicSkillDetail(anonymousRecorder, anonymousReq)

	if anonymousRecorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected anonymous status code: got=%d want=%d", anonymousRecorder.Code, http.StatusUnauthorized)
	}
	if !strings.Contains(anonymousRecorder.Body.String(), `"error":"unauthorized"`) {
		t.Fatalf("missing unauthorized payload: %s", anonymousRecorder.Body.String())
	}

	authenticatedReq := httptest.NewRequest(http.MethodGet, "/api/v1/public/skills/"+strconv.FormatUint(uint64(skill.ID), 10), nil)
	authenticatedReq = withCurrentUser(authenticatedReq, &user)
	authenticatedReq = withURLParams(authenticatedReq, map[string]string{
		"skillID": strconv.FormatUint(uint64(skill.ID), 10),
	})
	authenticatedRecorder := httptest.NewRecorder()

	app.handleAPIPublicSkillDetail(authenticatedRecorder, authenticatedReq)

	if authenticatedRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected authenticated status code: got=%d want=%d", authenticatedRecorder.Code, http.StatusOK)
	}
}

func TestHandleAPIPublicSkillDetailHidesSeedRecords(t *testing.T) {
	app, user, _, _ := setupInteractionAPITestApp(t)

	seedSkill, err := app.skillService.CreateSkill(context.Background(), services.CreateSkillInput{
		OwnerID:      user.ID,
		Name:         "Seed Detail Skill",
		Description:  "Seed detail should not be exposed on public detail routes.",
		Content:      "seed-detail-content",
		Visibility:   models.VisibilityPublic,
		SourceType:   models.SourceTypeManual,
		RecordOrigin: models.RecordOriginSeed,
		CategorySlug: "development",
	})
	if err != nil {
		t.Fatalf("failed to create seed skill: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/skills/"+strconv.FormatUint(uint64(seedSkill.ID), 10), nil)
	req = withURLParams(req, map[string]string{
		"skillID": strconv.FormatUint(uint64(seedSkill.ID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleAPIPublicSkillDetail(recorder, req)

	if recorder.Code != http.StatusNotFound {
		t.Fatalf("seed skill should be hidden from public detail routes: got=%d want=%d", recorder.Code, http.StatusNotFound)
	}
}

func TestHandleAPIPublicSkillDetailServiceUnavailable(t *testing.T) {
	app, _, skill, _ := setupInteractionAPITestApp(t)
	app.skillService = nil

	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/skills/"+strconv.FormatUint(uint64(skill.ID), 10), nil)
	req.Header.Set("X-Request-ID", "req-public-skill-detail-service-unavailable")
	req = withURLParams(req, map[string]string{
		"skillID": strconv.FormatUint(uint64(skill.ID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleAPIPublicSkillDetail(recorder, req)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusServiceUnavailable)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "service_unavailable" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Skill service unavailable" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-public-skill-detail-service-unavailable" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestHandleAPIPublicSkillDetailInvalidSkillIDIncludesRequestID(t *testing.T) {
	app, _, _, _ := setupInteractionAPITestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/skills/invalid", nil)
	req.Header.Set("X-Request-ID", "req-public-skill-detail-invalid-skill")
	req = withURLParams(req, map[string]string{
		"skillID": "invalid",
	})
	recorder := httptest.NewRecorder()

	app.handleAPIPublicSkillDetail(recorder, req)

	if recorder.Code != http.StatusNotFound {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusNotFound)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "skill_not_found" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Skill not found" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-public-skill-detail-invalid-skill" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestHandleAPIPublicSkillDetailQueryFailureHidesInternalError(t *testing.T) {
	app, _, skill, _ := setupInteractionAPITestApp(t)
	database, err := gorm.Open(sqlite.Open(fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to resolve backing database: %v", err)
	}
	if err := database.Migrator().DropTable(&models.Skill{}); err != nil {
		t.Fatalf("failed to drop skills table: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/skills/"+strconv.FormatUint(uint64(skill.ID), 10), nil)
	req.Header.Set("X-Request-ID", "req-public-skill-detail-query-failed")
	req = withURLParams(req, map[string]string{
		"skillID": strconv.FormatUint(uint64(skill.ID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleAPIPublicSkillDetail(recorder, req)

	if recorder.Code != http.StatusInternalServerError {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusInternalServerError)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "detail_query_failed" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Failed to load skill detail" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-public-skill-detail-query-failed" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}
