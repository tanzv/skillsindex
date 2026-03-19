package web

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"skillsindex/internal/services"
)

type apiSkillRatingRequest struct {
	Score int `json:"score"`
}

type apiSkillCommentRequest struct {
	Content string `json:"content"`
}

func (a *App) handleAPISkillFavorite(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.interaction == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}
	if !user.CanAccessDashboard() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	skillID, ok := parseSkillID(w, r)
	if !ok {
		return
	}
	if _, err := a.skillService.GetMarketplaceVisibleSkillByID(r.Context(), skillID, user.ID); err != nil {
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "skill_not_found"})
		return
	}

	favorite, present, err := readOptionalBoolField(r, "favorite")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}
	if !present {
		current, currentErr := a.interaction.IsFavorite(r.Context(), skillID, user.ID)
		if currentErr != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "favorite_query_failed", "message": currentErr.Error()})
			return
		}
		favorite = !current
	}
	favorited, setErr := a.interaction.SetFavorite(r.Context(), skillID, user.ID, favorite)
	if setErr != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "favorite_update_failed", "message": setErr.Error()})
		return
	}

	stats, _ := a.interaction.GetStats(r.Context(), skillID)
	writeJSON(w, http.StatusOK, map[string]any{
		"ok":        true,
		"favorited": favorited,
		"stats": map[string]any{
			"favorite_count": stats.FavoriteCount,
			"rating_count":   stats.RatingCount,
			"rating_average": stats.RatingAverage,
			"comment_count":  stats.CommentCount,
		},
	})
}

func (a *App) handleAPISkillRating(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.interaction == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}
	if !user.CanAccessDashboard() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	skillID, ok := parseSkillID(w, r)
	if !ok {
		return
	}
	if _, err := a.skillService.GetMarketplaceVisibleSkillByID(r.Context(), skillID, user.ID); err != nil {
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "skill_not_found"})
		return
	}

	var input apiSkillRatingRequest
	if err := decodeJSONOrForm(r, &input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}
	if input.Score < 1 || input.Score > 5 {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_score"})
		return
	}
	if err := a.interaction.UpsertRating(r.Context(), skillID, user.ID, input.Score); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "rating_update_failed", "message": err.Error()})
		return
	}

	stats, _ := a.interaction.GetStats(r.Context(), skillID)
	writeJSON(w, http.StatusOK, map[string]any{
		"ok":    true,
		"score": input.Score,
		"stats": map[string]any{
			"favorite_count": stats.FavoriteCount,
			"rating_count":   stats.RatingCount,
			"rating_average": stats.RatingAverage,
			"comment_count":  stats.CommentCount,
		},
	})
}

func (a *App) handleAPISkillCommentCreate(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.interaction == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}
	if !user.CanAccessDashboard() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	skillID, ok := parseSkillID(w, r)
	if !ok {
		return
	}
	if _, err := a.skillService.GetMarketplaceVisibleSkillByID(r.Context(), skillID, user.ID); err != nil {
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "skill_not_found"})
		return
	}

	var input apiSkillCommentRequest
	if err := decodeJSONOrForm(r, &input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}
	created, err := a.interaction.CreateComment(r.Context(), services.CreateSkillCommentInput{
		SkillID: skillID,
		UserID:  user.ID,
		Content: strings.TrimSpace(input.Content),
	})
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "comment_create_failed", "message": err.Error()})
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"ok": true,
		"comment": map[string]any{
			"id":         created.ID,
			"skill_id":   created.SkillID,
			"user_id":    created.UserID,
			"content":    created.Content,
			"created_at": created.CreatedAt,
		},
	})
}

func (a *App) handleAPISkillCommentDelete(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.interaction == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}
	if !user.CanAccessDashboard() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	skillID, ok := parseSkillID(w, r)
	if !ok {
		return
	}
	if _, err := a.skillService.GetMarketplaceVisibleSkillByID(r.Context(), skillID, user.ID); err != nil {
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "skill_not_found"})
		return
	}
	commentID, ok := parseCommentID(w, r)
	if !ok {
		return
	}

	deleteErr := a.interaction.DeleteComment(r.Context(), commentID, *user)
	if deleteErr != nil {
		switch {
		case errors.Is(deleteErr, services.ErrCommentNotFound):
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "comment_not_found"})
		case errors.Is(deleteErr, services.ErrCommentPermissionDenied):
			writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		default:
			writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "comment_delete_failed", "message": deleteErr.Error()})
		}
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"ok": true, "comment_id": commentID})
}

func readOptionalBoolField(r *http.Request, key string) (bool, bool, error) {
	contentType := strings.ToLower(strings.TrimSpace(r.Header.Get("Content-Type")))
	if strings.Contains(contentType, "application/json") {
		payload := make(map[string]any)
		decoder := jsonDecoder(r)
		if err := decoder.Decode(&payload); err != nil {
			return false, false, err
		}
		value, ok := payload[key]
		if !ok {
			return false, false, nil
		}
		parsed, matched := parseBoolSettingValue(value)
		if !matched {
			return false, false, errors.New("invalid bool value")
		}
		return parsed, true, nil
	}
	if err := r.ParseForm(); err != nil {
		return false, false, err
	}
	raw := strings.TrimSpace(r.FormValue(key))
	if raw == "" {
		return false, false, nil
	}
	parsed, matched := parseBoolSettingValue(raw)
	if !matched {
		return false, false, errors.New("invalid bool value")
	}
	return parsed, true, nil
}

func jsonDecoder(r *http.Request) *json.Decoder {
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	return decoder
}
