package web

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func parseCompareSkillIDs(r *http.Request) (uint, uint, bool) {
	query := r.URL.Query()
	left, leftErr := strconv.ParseUint(strings.TrimSpace(query.Get("left")), 10, 64)
	right, rightErr := strconv.ParseUint(strings.TrimSpace(query.Get("right")), 10, 64)
	if leftErr != nil || rightErr != nil || left == 0 || right == 0 {
		return 0, 0, false
	}
	return uint(left), uint(right), true
}

func resolveMarketplaceViewerID(r *http.Request, authService *services.AuthService) uint {
	viewer := resolveCurrentViewer(r, authService)
	if viewer == nil {
		return 0
	}
	return viewer.ID
}

func writeMarketplaceSkillLookupError(w http.ResponseWriter, r *http.Request, err error, side string) {
	statusCode := http.StatusInternalServerError
	errorCode := "detail_query_failed"
	message := fmt.Sprintf("Failed to load %s skill", side)
	if err == services.ErrSkillNotFound {
		statusCode = http.StatusNotFound
		errorCode = "skill_not_found"
		message = fmt.Sprintf("%s skill not found", side)
	}
	writeAPIError(w, r, statusCode, errorCode, message)
}

func parseStringArray(raw string) []string {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return []string{}
	}
	var items []string
	if err := json.Unmarshal([]byte(trimmed), &items); err != nil {
		return []string{}
	}
	return items
}

func toAPIPublicSkillVersionItems(items []models.SkillVersion) []apiPublicSkillVersionItem {
	response := make([]apiPublicSkillVersionItem, 0, len(items))
	for _, item := range items {
		actorUsername := ""
		actorDisplayName := ""
		if item.ActorUser != nil {
			actorUsername = item.ActorUser.Username
			actorDisplayName = item.ActorUser.DisplayName
		}
		response = append(response, apiPublicSkillVersionItem{
			ID:               item.ID,
			SkillID:          item.SkillID,
			VersionNumber:    item.VersionNumber,
			Trigger:          item.Trigger,
			ChangeSummary:    item.ChangeSummary,
			RiskLevel:        item.RiskLevel,
			CapturedAt:       item.CapturedAt,
			ArchivedAt:       item.ArchivedAt,
			ArchiveReason:    item.ArchiveReason,
			ActorUsername:    actorUsername,
			ActorDisplayName: actorDisplayName,
			Tags:             parseStringArray(item.TagsJSON),
			ChangedFields:    parseStringArray(item.ChangedFieldsJSON),
		})
	}
	return response
}
