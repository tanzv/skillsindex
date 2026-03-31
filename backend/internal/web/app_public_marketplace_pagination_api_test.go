package web

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHandleAPIPublicMarketplaceClampsOutOfRangePageToLastPage(t *testing.T) {
	app, _, admin := setupPublicMarketplaceAPITestApp(t)
	seedPublicMarketplaceScopeSkills(t, app, admin, 28, "development", "backend")

	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/marketplace?category=development&page=99&page_size=10", nil)
	req.Header.Set("Accept", "application/json")
	recorder := httptest.NewRecorder()

	app.handleAPIPublicMarketplace(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}

	var payload struct {
		Pagination struct {
			Page       int `json:"page"`
			PageSize   int `json:"page_size"`
			TotalItems int `json:"total_items"`
			TotalPages int `json:"total_pages"`
			PrevPage   int `json:"prev_page"`
			NextPage   int `json:"next_page"`
		} `json:"pagination"`
		Items []struct {
			Name string `json:"name"`
		} `json:"items"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("failed to decode marketplace payload: %v body=%s", err, recorder.Body.String())
	}

	if payload.Pagination.Page != 3 {
		t.Fatalf("expected out-of-range request to clamp to last page, got=%d", payload.Pagination.Page)
	}
	if payload.Pagination.PageSize != 10 || payload.Pagination.TotalItems != 29 || payload.Pagination.TotalPages != 3 {
		t.Fatalf("expected stable pagination metadata, got=%+v", payload.Pagination)
	}
	if payload.Pagination.PrevPage != 2 || payload.Pagination.NextPage != 0 {
		t.Fatalf("expected clamped navigation metadata, got=%+v", payload.Pagination)
	}
	if len(payload.Items) != 9 {
		t.Fatalf("expected final slice on clamped page, got=%d", len(payload.Items))
	}
}
