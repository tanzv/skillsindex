package web

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"skillsindex/internal/services"

	"github.com/go-chi/chi/v5"
)

func (a *App) handleAPIKeyCreate(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if a.apiKeyService == nil {
		redirectDashboard(w, r, "", "API key service unavailable")
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectDashboard(w, r, "", "Invalid form payload")
		return
	}

	created, plaintext, err := a.apiKeyService.Create(r.Context(), services.CreateAPIKeyInput{
		UserID:        user.ID,
		Name:          r.FormValue("name"),
		Purpose:       r.FormValue("purpose"),
		CreatedBy:     user.ID,
		ExpiresInDays: parsePositiveInt(r.FormValue("expires_in_days"), 0),
		Scopes:        []string{r.FormValue("scopes")},
	})
	if err != nil {
		redirectDashboard(w, r, "", err.Error())
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_key_create",
		TargetType: "api_key",
		TargetID:   created.ID,
		Summary:    "Created account API key",
		Details: auditDetailsJSON(map[string]string{
			"name":      created.Name,
			"purpose":   created.Purpose,
			"prefix":    created.Prefix,
			"createdBy": strconv.FormatUint(uint64(user.ID), 10),
		}),
	})

	setAPIKeyFlashCookie(w, plaintext, a.cookieSecure)
	redirectDashboardWithNewKey(
		w,
		r,
		"API key created",
		plaintext,
		r.FormValue("api_key_owner"),
		r.FormValue("api_key_status"),
	)
}

func (a *App) handleAPIKeyRevoke(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if a.apiKeyService == nil {
		redirectDashboard(w, r, "", "API key service unavailable")
		return
	}
	raw := chi.URLParam(r, "keyID")
	value, err := strconv.ParseUint(raw, 10, 64)
	if err != nil || value == 0 {
		http.NotFound(w, r)
		return
	}
	keyID := uint(value)

	key, err := a.apiKeyService.GetByID(r.Context(), keyID)
	if err != nil {
		redirectDashboard(w, r, "", "API key not found")
		return
	}
	if !user.CanManageAPIKeys(key.UserID) {
		redirectDashboard(w, r, "", "Permission denied")
		return
	}
	if err := a.apiKeyService.Revoke(r.Context(), key.ID, key.UserID); err != nil {
		redirectDashboard(w, r, "", "Failed to revoke API key")
		return
	}
	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_key_revoke",
		TargetType: "api_key",
		TargetID:   key.ID,
		Summary:    "Revoked account API key",
		Details: auditDetailsJSON(map[string]string{
			"name":   key.Name,
			"prefix": key.Prefix,
		}),
	})
	redirectDashboardWithFilters(
		w,
		r,
		"API key revoked",
		"",
		r.FormValue("api_key_owner"),
		r.FormValue("api_key_status"),
	)
}

func (a *App) handleAPIKeyRotate(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if a.apiKeyService == nil {
		redirectDashboard(w, r, "", "API key service unavailable")
		return
	}
	raw := chi.URLParam(r, "keyID")
	value, err := strconv.ParseUint(raw, 10, 64)
	if err != nil || value == 0 {
		http.NotFound(w, r)
		return
	}
	keyID := uint(value)

	key, err := a.apiKeyService.GetByID(r.Context(), keyID)
	if err != nil {
		redirectDashboard(w, r, "", "API key not found")
		return
	}
	if !user.CanManageAPIKeys(key.UserID) {
		redirectDashboard(w, r, "", "Permission denied")
		return
	}

	rotated, plaintext, err := a.apiKeyService.Rotate(r.Context(), key.ID, key.UserID)
	if err != nil {
		redirectDashboard(w, r, "", "Failed to rotate API key")
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_key_rotate",
		TargetType: "api_key",
		TargetID:   rotated.ID,
		Summary:    "Rotated account API key",
		Details: auditDetailsJSON(map[string]string{
			"name":       rotated.Name,
			"new_prefix": rotated.Prefix,
		}),
	})

	setAPIKeyFlashCookie(w, plaintext, a.cookieSecure)
	redirectDashboardWithNewKey(
		w,
		r,
		"API key rotated",
		plaintext,
		r.FormValue("api_key_owner"),
		r.FormValue("api_key_status"),
	)
}

func (a *App) handleSkillFavorite(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if a.interaction == nil {
		http.Error(w, "interaction service unavailable", http.StatusServiceUnavailable)
		return
	}
	skillID, ok := parseSkillID(w, r)
	if !ok {
		return
	}
	if !user.CanAccessDashboard() {
		redirectSkillDetail(w, r, skillID, "", "Permission denied")
		return
	}
	if _, err := a.skillService.GetVisibleSkillByID(r.Context(), skillID, user.ID); err != nil {
		redirectSkillDetail(w, r, skillID, "", "Skill not found")
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectSkillDetail(w, r, skillID, "", "Invalid form payload")
		return
	}

	action := strings.ToLower(strings.TrimSpace(r.FormValue("favorite")))
	var favorite bool
	switch action {
	case "1", "true", "on":
		favorite = true
	case "0", "false", "off":
		favorite = false
	default:
		current, currentErr := a.interaction.IsFavorite(r.Context(), skillID, user.ID)
		if currentErr != nil {
			redirectSkillDetail(w, r, skillID, "", "Failed to toggle favorite")
			return
		}
		favorite = !current
	}
	favorited, err := a.interaction.SetFavorite(r.Context(), skillID, user.ID, favorite)
	if err != nil {
		redirectSkillDetail(w, r, skillID, "", "Failed to update favorite")
		return
	}

	if favorited {
		redirectSkillDetail(w, r, skillID, "Added to favorites", "")
		return
	}
	redirectSkillDetail(w, r, skillID, "Removed from favorites", "")
}

func (a *App) handleSkillRating(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if a.interaction == nil {
		http.Error(w, "interaction service unavailable", http.StatusServiceUnavailable)
		return
	}
	skillID, ok := parseSkillID(w, r)
	if !ok {
		return
	}
	if !user.CanAccessDashboard() {
		redirectSkillDetail(w, r, skillID, "", "Permission denied")
		return
	}
	if _, err := a.skillService.GetVisibleSkillByID(r.Context(), skillID, user.ID); err != nil {
		redirectSkillDetail(w, r, skillID, "", "Skill not found")
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectSkillDetail(w, r, skillID, "", "Invalid form payload")
		return
	}
	score := parsePositiveInt(r.FormValue("score"), 0)
	if score < 1 || score > 5 {
		redirectSkillDetail(w, r, skillID, "", "Score must be between 1 and 5")
		return
	}
	if err := a.interaction.UpsertRating(r.Context(), skillID, user.ID, score); err != nil {
		redirectSkillDetail(w, r, skillID, "", "Failed to submit rating")
		return
	}
	redirectSkillDetail(w, r, skillID, "Rating saved", "")
}

func (a *App) handleSkillCommentCreate(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if a.interaction == nil {
		http.Error(w, "interaction service unavailable", http.StatusServiceUnavailable)
		return
	}
	skillID, ok := parseSkillID(w, r)
	if !ok {
		return
	}
	if !user.CanAccessDashboard() {
		redirectSkillDetail(w, r, skillID, "", "Permission denied")
		return
	}
	if _, err := a.skillService.GetVisibleSkillByID(r.Context(), skillID, user.ID); err != nil {
		redirectSkillDetail(w, r, skillID, "", "Skill not found")
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectSkillDetail(w, r, skillID, "", "Invalid form payload")
		return
	}

	content := strings.TrimSpace(r.FormValue("content"))
	if _, err := a.interaction.CreateComment(r.Context(), services.CreateSkillCommentInput{
		SkillID: skillID,
		UserID:  user.ID,
		Content: content,
	}); err != nil {
		redirectSkillDetail(w, r, skillID, "", err.Error())
		return
	}
	redirectSkillDetail(w, r, skillID, "Comment posted", "")
}

func (a *App) handleSkillCommentDelete(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if a.interaction == nil {
		http.Error(w, "interaction service unavailable", http.StatusServiceUnavailable)
		return
	}
	skillID, ok := parseSkillID(w, r)
	if !ok {
		return
	}
	if !user.CanAccessDashboard() {
		redirectSkillDetail(w, r, skillID, "", "Permission denied")
		return
	}
	commentID, ok := parseCommentID(w, r)
	if !ok {
		return
	}
	if err := a.interaction.DeleteComment(r.Context(), commentID, *user); err != nil {
		switch {
		case errors.Is(err, services.ErrCommentPermissionDenied):
			redirectSkillDetail(w, r, skillID, "", "Permission denied")
		case errors.Is(err, services.ErrCommentNotFound):
			redirectSkillDetail(w, r, skillID, "", "Comment not found")
		default:
			redirectSkillDetail(w, r, skillID, "", "Failed to delete comment")
		}
		return
	}
	redirectSkillDetail(w, r, skillID, "Comment deleted", "")
}
