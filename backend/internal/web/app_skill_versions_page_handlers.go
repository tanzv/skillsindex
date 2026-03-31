package web

import (
	"net/http"
	"strings"
	"time"

	"skillsindex/internal/services"
)

func (a *App) handleSkillVersions(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	skillID, ok := parseSkillID(w, r)
	if !ok {
		return
	}
	skill, err := a.skillService.GetSkillByID(r.Context(), skillID)
	if err != nil {
		redirectDashboard(w, r, "", "Skill not found")
		return
	}
	if !user.CanManageSkill(skill.OwnerID) {
		redirectDashboard(w, r, "", "Permission denied")
		return
	}
	if a.skillVersionSvc == nil {
		redirectSkillDetail(w, r, skill.ID, "", "Version service unavailable")
		return
	}

	var capturedAfter *time.Time
	if raw := strings.TrimSpace(r.URL.Query().Get("from_time")); raw != "" {
		parsed := parseOpsTimeQuery(raw, time.Time{})
		if !parsed.IsZero() {
			capturedAfter = &parsed
		}
	}
	var capturedBefore *time.Time
	if raw := strings.TrimSpace(r.URL.Query().Get("to_time")); raw != "" {
		parsed := parseOpsTimeQuery(raw, time.Time{})
		if !parsed.IsZero() {
			capturedBefore = &parsed
		}
	}

	versions, err := a.skillVersionSvc.ListBySkill(r.Context(), services.ListSkillVersionsInput{
		SkillID:         skill.ID,
		Trigger:         strings.TrimSpace(r.URL.Query().Get("trigger")),
		CapturedAfter:   capturedAfter,
		CapturedBefore:  capturedBefore,
		IncludeArchived: parseBoolFlag(r.URL.Query().Get("include_archived"), false),
		Limit:           120,
	})
	if err != nil {
		redirectSkillDetail(w, r, skill.ID, "", "Failed to load version history")
		return
	}

	a.render(w, r, ViewData{
		Page:          "skill_versions",
		Title:         "Skill Version History",
		Skill:         &skill,
		SkillVersions: versions,
		TagFilter:     strings.TrimSpace(r.URL.Query().Get("trigger")),
		Message:       strings.TrimSpace(r.URL.Query().Get("msg")),
		Error:         strings.TrimSpace(r.URL.Query().Get("err")),
	})
}

func (a *App) handleSkillVersionDetail(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	skillID, ok := parseSkillID(w, r)
	if !ok {
		return
	}
	versionID, ok := parseVersionID(w, r)
	if !ok {
		return
	}
	skill, err := a.skillService.GetSkillByID(r.Context(), skillID)
	if err != nil {
		redirectDashboard(w, r, "", "Skill not found")
		return
	}
	if !user.CanManageSkill(skill.OwnerID) {
		redirectDashboard(w, r, "", "Permission denied")
		return
	}
	if a.skillVersionSvc == nil {
		redirectSkillDetail(w, r, skill.ID, "", "Version service unavailable")
		return
	}

	version, err := a.skillVersionSvc.GetByID(r.Context(), skill.ID, versionID)
	if err != nil {
		redirectSkillDetail(w, r, skill.ID, "", "Skill version not found")
		return
	}
	versions, err := a.skillVersionSvc.ListBySkill(r.Context(), services.ListSkillVersionsInput{
		SkillID: skill.ID,
		Limit:   120,
	})
	if err != nil {
		redirectSkillDetail(w, r, skill.ID, "", "Failed to load version history")
		return
	}

	a.render(w, r, ViewData{
		Page:               "skill_version_detail",
		Title:              "Skill Version Detail",
		Skill:              &skill,
		SkillVersions:      versions,
		SkillVersionDetail: &version,
		Message:            strings.TrimSpace(r.URL.Query().Get("msg")),
		Error:              strings.TrimSpace(r.URL.Query().Get("err")),
	})
}

func (a *App) handleSkillVersionCompare(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	skillID, ok := parseSkillID(w, r)
	if !ok {
		return
	}
	skill, err := a.skillService.GetSkillByID(r.Context(), skillID)
	if err != nil {
		redirectDashboard(w, r, "", "Skill not found")
		return
	}
	if !user.CanManageSkill(skill.OwnerID) {
		redirectDashboard(w, r, "", "Permission denied")
		return
	}
	if a.skillVersionSvc == nil {
		redirectSkillDetail(w, r, skill.ID, "", "Version service unavailable")
		return
	}

	fromID, toID, ok := parseVersionCompareIDs(r)
	if !ok {
		seedVersions, listErr := a.skillVersionSvc.ListBySkill(r.Context(), services.ListSkillVersionsInput{
			SkillID: skill.ID,
			Limit:   2,
		})
		if listErr != nil || len(seedVersions) < 2 {
			redirectSkillDetail(w, r, skill.ID, "", "Need at least two versions to compare")
			return
		}
		fromID = seedVersions[1].ID
		toID = seedVersions[0].ID
	}

	compareResult, err := a.skillVersionSvc.CompareVersions(r.Context(), services.CompareSkillVersionsInput{
		SkillID:       skill.ID,
		FromVersionID: fromID,
		ToVersionID:   toID,
	})
	if err != nil {
		redirectSkillDetail(w, r, skill.ID, "", "Failed to compare versions")
		return
	}
	versions, err := a.skillVersionSvc.ListBySkill(r.Context(), services.ListSkillVersionsInput{
		SkillID: skill.ID,
		Limit:   120,
	})
	if err != nil {
		redirectSkillDetail(w, r, skill.ID, "", "Failed to load version history")
		return
	}

	a.render(w, r, ViewData{
		Page:                "skill_version_compare",
		Title:               "Skill Version Compare",
		Skill:               &skill,
		SkillVersions:       versions,
		SkillVersionCompare: &compareResult,
		Message:             strings.TrimSpace(r.URL.Query().Get("msg")),
		Error:               strings.TrimSpace(r.URL.Query().Get("err")),
	})
}
