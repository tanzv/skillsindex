package web

import (
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"github.com/go-chi/chi/v5"
)

type apiPublicSkillDetailStats struct {
	FavoriteCount int64   `json:"favorite_count"`
	RatingCount   int64   `json:"rating_count"`
	RatingAverage float64 `json:"rating_average"`
	CommentCount  int64   `json:"comment_count"`
}

type apiPublicSkillDetailViewerState struct {
	CanInteract bool `json:"can_interact"`
	Favorited   bool `json:"favorited"`
	Rated       bool `json:"rated"`
	Rating      int  `json:"rating"`
}

type apiPublicSkillDetailComment struct {
	ID          uint      `json:"id"`
	SkillID     uint      `json:"skill_id"`
	UserID      uint      `json:"user_id"`
	Username    string    `json:"username"`
	DisplayName string    `json:"display_name"`
	Content     string    `json:"content"`
	CreatedAt   time.Time `json:"created_at"`
	CanDelete   bool      `json:"can_delete"`
}

func parseSkillIDParam(r *http.Request) (uint, bool) {
	rawSkillID := strings.TrimSpace(chi.URLParam(r, "skillID"))
	parsedSkillID, parseErr := strconv.ParseUint(rawSkillID, 10, 64)
	if parseErr != nil || parsedSkillID == 0 {
		return 0, false
	}
	return uint(parsedSkillID), true
}

func resolveCurrentViewer(r *http.Request, authService *services.AuthService) *models.User {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		return nil
	}

	viewer := *currentUser
	if authService == nil {
		return &viewer
	}

	loadedViewer, loadErr := authService.GetUserByID(r.Context(), currentUser.ID)
	if loadErr == nil {
		viewer = loadedViewer
	}
	return &viewer
}

func toAPIPublicSkillComment(comment models.SkillComment, viewer *models.User) apiPublicSkillDetailComment {
	commentUser := comment.User
	canDelete := false
	if viewer != nil {
		canDelete = viewer.CanDeleteComment(comment.UserID)
	}
	return apiPublicSkillDetailComment{
		ID:          comment.ID,
		SkillID:     comment.SkillID,
		UserID:      comment.UserID,
		Username:    commentUser.Username,
		DisplayName: commentUser.DisplayName,
		Content:     comment.Content,
		CreatedAt:   comment.CreatedAt,
		CanDelete:   canDelete,
	}
}

func (a *App) handleAPIPublicSkillDetail(w http.ResponseWriter, r *http.Request) {
	if !a.ensureMarketplaceAccess(w, r) {
		return
	}
	if a.skillService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{
			"error":   "service_unavailable",
			"message": "Skill service unavailable",
		})
		return
	}

	skillID, ok := parseSkillIDParam(r)
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]any{
			"error": "skill_not_found",
		})
		return
	}

	viewer := resolveCurrentViewer(r, a.authService)
	viewerID := uint(0)
	if viewer != nil {
		viewerID = viewer.ID
	}

	skill, loadErr := a.skillService.GetVisibleSkillByID(r.Context(), skillID, viewerID)
	if loadErr != nil {
		statusCode := http.StatusInternalServerError
		errorCode := "detail_query_failed"
		errorMessage := "Failed to load skill detail"

		if errors.Is(loadErr, services.ErrSkillNotFound) {
			statusCode = http.StatusNotFound
			errorCode = "skill_not_found"
			errorMessage = "Skill detail not found"
		}

		writeJSON(w, statusCode, map[string]any{
			"error":   errorCode,
			"message": errorMessage,
		})
		return
	}

	apiItems := resultToAPIItems([]models.Skill{skill})
	detailSkill := apiSkillResponse{}
	if len(apiItems) > 0 {
		detailSkill = apiItems[0]
	}

	stats := apiPublicSkillDetailStats{}
	viewerState := apiPublicSkillDetailViewerState{}
	if viewer != nil {
		viewerState.CanInteract = viewer.CanAccessDashboard()
	}
	comments := make([]apiPublicSkillDetailComment, 0)

	if a.interaction != nil {
		loadedStats, statsErr := a.interaction.GetStats(r.Context(), skill.ID)
		if statsErr == nil {
			stats = apiPublicSkillDetailStats{
				FavoriteCount: loadedStats.FavoriteCount,
				RatingCount:   loadedStats.RatingCount,
				RatingAverage: loadedStats.RatingAverage,
				CommentCount:  loadedStats.CommentCount,
			}
		}

		loadedComments, commentsErr := a.interaction.ListComments(r.Context(), skill.ID, 80)
		if commentsErr == nil {
			comments = make([]apiPublicSkillDetailComment, 0, len(loadedComments))
			for _, item := range loadedComments {
				comments = append(comments, toAPIPublicSkillComment(item, viewer))
			}
		}

		if viewer != nil && viewerState.CanInteract {
			favorited, favoriteErr := a.interaction.IsFavorite(r.Context(), skill.ID, viewer.ID)
			if favoriteErr == nil {
				viewerState.Favorited = favorited
			}

			rating, rated, ratingErr := a.interaction.GetUserRating(r.Context(), skill.ID, viewer.ID)
			if ratingErr == nil {
				viewerState.Rated = rated
				viewerState.Rating = rating
			}
		}
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"skill":          detailSkill,
		"stats":          stats,
		"viewer_state":   viewerState,
		"comments":       comments,
		"comments_limit": 80,
	})
}
