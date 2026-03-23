package web

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func parseModerationTargetTypeValue(raw string) (models.ModerationTargetType, bool) {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case string(models.ModerationTargetSkill):
		return models.ModerationTargetSkill, true
	case string(models.ModerationTargetComment):
		return models.ModerationTargetComment, true
	default:
		return "", false
	}
}

func parseModerationStatusValue(raw string) (models.ModerationCaseStatus, bool) {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case string(models.ModerationStatusOpen):
		return models.ModerationStatusOpen, true
	case string(models.ModerationStatusResolved):
		return models.ModerationStatusResolved, true
	case string(models.ModerationStatusRejected):
		return models.ModerationStatusRejected, true
	default:
		return "", false
	}
}

func parseModerationActionValue(raw string) models.ModerationAction {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case string(models.ModerationActionFlagged):
		return models.ModerationActionFlagged
	case string(models.ModerationActionHidden):
		return models.ModerationActionHidden
	case string(models.ModerationActionDeleted):
		return models.ModerationActionDeleted
	default:
		return models.ModerationActionNone
	}
}

func writeModerationServiceError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, services.ErrModerationCaseNotFound):
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "moderation_case_not_found"})
	case errors.Is(err, services.ErrModerationCaseClosed):
		writeJSON(w, http.StatusConflict, map[string]any{"error": "moderation_case_closed"})
	default:
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "moderation_operation_failed", "message": err.Error()})
	}
}

func toUintString(value uint) string {
	return strings.TrimSpace(strconv.FormatUint(uint64(value), 10))
}
