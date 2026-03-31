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
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if a.interaction == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Skill interaction service is unavailable")
		return
	}
	if !user.CanAccessDashboard() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}
	skillID, ok := parseSkillID(w, r)
	if !ok {
		return
	}
	if _, err := a.skillService.GetMarketplaceVisibleSkillByID(r.Context(), skillID, user.ID); err != nil {
		writeAPIError(w, r, http.StatusNotFound, "skill_not_found", "Skill not found")
		return
	}

	favorite, present, err := readOptionalBoolField(r, "favorite")
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid request payload")
		return
	}
	if !present {
		current, currentErr := a.interaction.IsFavorite(r.Context(), skillID, user.ID)
		if currentErr != nil {
			writeAPIError(w, r, http.StatusInternalServerError, "favorite_query_failed", "Failed to load favorite state")
			return
		}
		favorite = !current
	}
	favorited, setErr := a.interaction.SetFavorite(r.Context(), skillID, user.ID, favorite)
	if setErr != nil {
		writeAPIError(w, r, http.StatusInternalServerError, "favorite_update_failed", "Failed to update favorite state")
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
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if a.interaction == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Skill interaction service is unavailable")
		return
	}
	if !user.CanAccessDashboard() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}
	skillID, ok := parseSkillID(w, r)
	if !ok {
		return
	}
	if _, err := a.skillService.GetMarketplaceVisibleSkillByID(r.Context(), skillID, user.ID); err != nil {
		writeAPIError(w, r, http.StatusNotFound, "skill_not_found", "Skill not found")
		return
	}

	var input apiSkillRatingRequest
	if err := decodeJSONOrForm(r, &input); err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid request payload")
		return
	}
	if input.Score < 1 || input.Score > 5 {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_score", "Score must be between 1 and 5")
		return
	}
	if err := a.interaction.UpsertRating(r.Context(), skillID, user.ID, input.Score); err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "rating_update_failed", err, "Failed to update rating")
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
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if a.interaction == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Skill interaction service is unavailable")
		return
	}
	if !user.CanAccessDashboard() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}
	skillID, ok := parseSkillID(w, r)
	if !ok {
		return
	}
	if _, err := a.skillService.GetMarketplaceVisibleSkillByID(r.Context(), skillID, user.ID); err != nil {
		writeAPIError(w, r, http.StatusNotFound, "skill_not_found", "Skill not found")
		return
	}

	var input apiSkillCommentRequest
	if err := decodeJSONOrForm(r, &input); err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid request payload")
		return
	}
	created, err := a.interaction.CreateComment(r.Context(), services.CreateSkillCommentInput{
		SkillID: skillID,
		UserID:  user.ID,
		Content: strings.TrimSpace(input.Content),
	})
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "comment_create_failed", err, "Failed to create comment")
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
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if a.interaction == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Skill interaction service is unavailable")
		return
	}
	if !user.CanAccessDashboard() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}
	skillID, ok := parseSkillID(w, r)
	if !ok {
		return
	}
	if _, err := a.skillService.GetMarketplaceVisibleSkillByID(r.Context(), skillID, user.ID); err != nil {
		writeAPIError(w, r, http.StatusNotFound, "skill_not_found", "Skill not found")
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
			writeAPIError(w, r, http.StatusNotFound, "comment_not_found", "Comment not found")
		case errors.Is(deleteErr, services.ErrCommentPermissionDenied):
			writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		default:
			writeAPIError(w, r, http.StatusInternalServerError, "comment_delete_failed", "Failed to delete comment")
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
