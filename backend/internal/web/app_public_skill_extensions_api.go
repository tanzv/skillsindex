package web

import (
	"encoding/json"
	"fmt"
	"net/http"
	"path"
	"strconv"
	"strings"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

type apiPublicSkillCompareResponse struct {
	LeftSkill  apiSkillResponse `json:"left_skill"`
	RightSkill apiSkillResponse `json:"right_skill"`
}

type apiPublicSkillResourceFile struct {
	Name        string `json:"name"`
	DisplayName string `json:"display_name"`
	SizeBytes   int    `json:"size_bytes"`
	SizeLabel   string `json:"size_label"`
	Language    string `json:"language"`
}

type apiPublicSkillResourcesResponse struct {
	SkillID        uint                         `json:"skill_id"`
	SourceType     string                       `json:"source_type"`
	SourceURL      string                       `json:"source_url"`
	RepoURL        string                       `json:"repo_url"`
	SourceBranch   string                       `json:"source_branch"`
	SourcePath     string                       `json:"source_path"`
	InstallCommand string                       `json:"install_command"`
	UpdatedAt      time.Time                    `json:"updated_at"`
	FileCount      int                          `json:"file_count"`
	Files          []apiPublicSkillResourceFile `json:"files"`
}

type apiPublicSkillVersionItem struct {
	ID               uint       `json:"id"`
	SkillID          uint       `json:"skill_id"`
	VersionNumber    int        `json:"version_number"`
	Trigger          string     `json:"trigger"`
	ChangeSummary    string     `json:"change_summary"`
	RiskLevel        string     `json:"risk_level"`
	CapturedAt       time.Time  `json:"captured_at"`
	ArchivedAt       *time.Time `json:"archived_at,omitempty"`
	ArchiveReason    string     `json:"archive_reason,omitempty"`
	ActorUsername    string     `json:"actor_username"`
	ActorDisplayName string     `json:"actor_display_name"`
	Tags             []string   `json:"tags"`
	ChangedFields    []string   `json:"changed_fields"`
}

type apiPublicSkillVersionsResponse struct {
	Items []apiPublicSkillVersionItem `json:"items"`
	Total int                         `json:"total"`
}

func parseCompareSkillIDs(r *http.Request) (uint, uint, bool) {
	query := r.URL.Query()
	left, leftErr := strconv.ParseUint(strings.TrimSpace(query.Get("left")), 10, 64)
	right, rightErr := strconv.ParseUint(strings.TrimSpace(query.Get("right")), 10, 64)
	if leftErr != nil || rightErr != nil || left == 0 || right == 0 {
		return 0, 0, false
	}
	return uint(left), uint(right), true
}

func inferPublicSkillResourceFileName(skill models.Skill) string {
	sourcePath := strings.TrimSpace(skill.SourcePath)
	if sourcePath != "" {
		return sourcePath
	}
	content := strings.ToLower(strings.TrimSpace(skill.Content))
	if looksLikeSQLContent(content) {
		return "QUERY.sql"
	}
	return "SKILL.md"
}

func looksLikeSQLContent(content string) bool {
	if content == "" {
		return false
	}
	return strings.Contains(content, "select ") ||
		strings.Contains(content, "insert ") ||
		strings.Contains(content, "update ") ||
		strings.Contains(content, "delete ")
}

func inferPublicSkillResourceLanguage(skill models.Skill, fileName string) string {
	switch strings.ToLower(path.Ext(fileName)) {
	case ".sql":
		return "SQL"
	case ".md":
		return "Markdown"
	default:
		if looksLikeSQLContent(strings.ToLower(strings.TrimSpace(skill.Content))) {
			return "SQL"
		}
		return "Markdown"
	}
}

func formatPublicSkillResourceSizeLabel(content string) string {
	sizeBytes := len(strings.TrimSpace(content))
	return services.FormatSourceFileSizeLabel(int64(sizeBytes))
}

func buildFallbackPublicSkillResourceFiles(skill models.Skill) []apiPublicSkillResourceFile {
	fileName := inferPublicSkillResourceFileName(skill)
	return []apiPublicSkillResourceFile{
		{
			Name:        fileName,
			DisplayName: fileName,
			SizeBytes:   len(strings.TrimSpace(skill.Content)),
			SizeLabel:   formatPublicSkillResourceSizeLabel(skill.Content),
			Language:    inferPublicSkillResourceLanguage(skill, fileName),
		},
	}
}

func buildPublicSkillResourcesResponse(skill models.Skill, files []apiPublicSkillResourceFile) apiPublicSkillResourcesResponse {
	if len(files) == 0 {
		files = buildFallbackPublicSkillResourceFiles(skill)
	}
	return apiPublicSkillResourcesResponse{
		SkillID:        skill.ID,
		SourceType:     string(skill.SourceType),
		SourceURL:      skill.SourceURL,
		RepoURL:        skill.RepoURL,
		SourceBranch:   skill.SourceBranch,
		SourcePath:     skill.SourcePath,
		InstallCommand: skill.InstallCommand,
		UpdatedAt:      skill.UpdatedAt,
		FileCount:      len(files),
		Files:          files,
	}
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

func (a *App) handleAPIPublicSkillCompare(w http.ResponseWriter, r *http.Request) {
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

	leftSkillID, rightSkillID, ok := parseCompareSkillIDs(r)
	if !ok {
		writeJSON(w, http.StatusBadRequest, map[string]any{
			"error":   "invalid_compare_query",
			"message": "Both left and right skill identifiers are required",
		})
		return
	}

	viewer := resolveCurrentViewer(r, a.authService)
	viewerID := uint(0)
	if viewer != nil {
		viewerID = viewer.ID
	}

	leftSkill, err := a.skillService.GetMarketplaceVisibleSkillByID(r.Context(), leftSkillID, viewerID)
	if err != nil {
		writeMarketplaceSkillLookupError(w, err, "left")
		return
	}
	rightSkill, err := a.skillService.GetMarketplaceVisibleSkillByID(r.Context(), rightSkillID, viewerID)
	if err != nil {
		writeMarketplaceSkillLookupError(w, err, "right")
		return
	}

	presentationTaxonomy := a.marketplacePresentationTaxonomy(r.Context())
	items := resultToAPIItemsWithTaxonomy([]models.Skill{leftSkill, rightSkill}, presentationTaxonomy)
	writeJSON(w, http.StatusOK, apiPublicSkillCompareResponse{
		LeftSkill:  items[0],
		RightSkill: items[1],
	})
}

func writeMarketplaceSkillLookupError(w http.ResponseWriter, err error, side string) {
	statusCode := http.StatusInternalServerError
	errorCode := "detail_query_failed"
	message := fmt.Sprintf("Failed to load %s skill", side)
	if err == services.ErrSkillNotFound {
		statusCode = http.StatusNotFound
		errorCode = "skill_not_found"
		message = fmt.Sprintf("%s skill not found", side)
	}
	writeJSON(w, statusCode, map[string]any{
		"error":   errorCode,
		"message": message,
	})
}

func (a *App) handleAPIPublicSkillResources(w http.ResponseWriter, r *http.Request) {
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
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "skill_not_found"})
		return
	}

	viewer := resolveCurrentViewer(r, a.authService)
	viewerID := uint(0)
	if viewer != nil {
		viewerID = viewer.ID
	}

	skill, err := a.skillService.GetMarketplaceVisibleSkillByID(r.Context(), skillID, viewerID)
	if err != nil {
		writeMarketplaceSkillLookupError(w, err, "resource")
		return
	}

	writeJSON(w, http.StatusOK, buildPublicSkillResourcesResponse(skill, a.resolvePublicSkillResourceFiles(r, skill)))
}

func (a *App) handleAPIPublicSkillVersions(w http.ResponseWriter, r *http.Request) {
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
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "skill_not_found"})
		return
	}

	viewer := resolveCurrentViewer(r, a.authService)
	viewerID := uint(0)
	if viewer != nil {
		viewerID = viewer.ID
	}

	items, err := a.skillService.ListMarketplaceVisibleSkillVersions(r.Context(), skillID, viewerID, 20)
	if err != nil {
		writeMarketplaceSkillLookupError(w, err, "version")
		return
	}

	writeJSON(w, http.StatusOK, apiPublicSkillVersionsResponse{
		Items: toAPIPublicSkillVersionItems(items),
		Total: len(items),
	})
}
