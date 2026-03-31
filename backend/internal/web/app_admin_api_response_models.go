package web

import (
	"strconv"
	"strings"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

type apiAdminSkillItem struct {
	apiSkillResponse
	OwnerID        uint                   `json:"owner_id"`
	OwnerUsername  string                 `json:"owner_username"`
	Visibility     string                 `json:"visibility"`
	OrganizationID *uint                  `json:"organization_id,omitempty"`
	SourceAnalysis apiAdminSourceAnalysis `json:"source_analysis"`
	CreatedAt      time.Time              `json:"created_at"`
	LastSyncedAt   *time.Time             `json:"last_synced_at,omitempty"`
}

type apiAdminSourceAnalysis struct {
	EntryFile       string                      `json:"entry_file"`
	Mechanism       string                      `json:"mechanism"`
	MetadataSources []string                    `json:"metadata_sources"`
	ReferencePaths  []string                    `json:"reference_paths"`
	Dependencies    []services.SourceDependency `json:"dependencies"`
}

type apiAdminOverviewResponse struct {
	User struct {
		ID       uint   `json:"id"`
		Username string `json:"username"`
		Role     string `json:"role"`
	} `json:"user"`
	Counts struct {
		Total        int64 `json:"total"`
		Public       int64 `json:"public"`
		Private      int64 `json:"private"`
		Syncable     int64 `json:"syncable"`
		OrgCount     int   `json:"org_count"`
		AccountCount int   `json:"account_count,omitempty"`
	} `json:"counts"`
	Capabilities struct {
		CanManageUsers bool `json:"can_manage_users"`
		CanViewAll     bool `json:"can_view_all"`
	} `json:"capabilities"`
}

type apiAdminAccountItem struct {
	ID             uint       `json:"id"`
	Username       string     `json:"username"`
	Role           string     `json:"role"`
	Status         string     `json:"status"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
	ForceLogoutAt  *time.Time `json:"force_logout_at,omitempty"`
	LastSeenAt     *time.Time `json:"last_seen_at,omitempty"`
	ActiveSessions int        `json:"active_session_count"`
}

type apiOrganizationItem struct {
	ID        uint      `json:"id"`
	Name      string    `json:"name"`
	Slug      string    `json:"slug"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type apiOrganizationMemberItem struct {
	OrganizationID uint      `json:"organization_id"`
	UserID         uint      `json:"user_id"`
	Username       string    `json:"username"`
	UserRole       string    `json:"user_role"`
	UserStatus     string    `json:"user_status"`
	Role           string    `json:"role"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func resultToAPIAdminSkillItems(items []models.Skill) []apiAdminSkillItem {
	base := resultToAPIItems(items)
	result := make([]apiAdminSkillItem, 0, len(items))
	for idx, skill := range items {
		result = append(result, apiAdminSkillItem{
			apiSkillResponse: base[idx],
			OwnerID:          skill.OwnerID,
			OwnerUsername:    skill.Owner.Username,
			Visibility:       string(skill.Visibility),
			OrganizationID:   skill.OrganizationID,
			SourceAnalysis:   resultToAPIAdminSourceAnalysis(skill),
			CreatedAt:        skill.CreatedAt,
			LastSyncedAt:     skill.LastSyncedAt,
		})
	}
	return result
}

func resultToAPIAdminSourceAnalysis(skill models.Skill) apiAdminSourceAnalysis {
	analysis, err := services.DeserializeSourceTopology(skill.SourceAnalysisJSON)
	if err != nil {
		return apiAdminSourceAnalysis{}
	}
	return apiAdminSourceAnalysis{
		EntryFile:       analysis.EntryFile,
		Mechanism:       analysis.Mechanism,
		MetadataSources: analysis.MetadataSources,
		ReferencePaths:  analysis.ReferencePaths,
		Dependencies:    analysis.Dependencies,
	}
}

func filterAdminAPISkills(
	items []models.Skill,
	query string,
	source string,
	visibility string,
	owner string,
) []models.Skill {
	q := strings.ToLower(strings.TrimSpace(query))
	sourceFilter := strings.ToLower(strings.TrimSpace(source))
	visibilityFilter := strings.ToLower(strings.TrimSpace(visibility))
	ownerFilter := strings.ToLower(strings.TrimSpace(owner))

	filtered := make([]models.Skill, 0, len(items))
	for _, item := range items {
		if q != "" {
			haystack := strings.ToLower(
				item.Name + " " + item.Description + " " + item.CategorySlug + " " + item.SubcategorySlug + " " + item.Owner.Username,
			)
			if !strings.Contains(haystack, q) {
				continue
			}
		}
		if sourceFilter != "" && sourceFilter != "all" && strings.ToLower(string(item.SourceType)) != sourceFilter {
			continue
		}
		if visibilityFilter != "" && visibilityFilter != "all" && strings.ToLower(string(item.Visibility)) != visibilityFilter {
			continue
		}
		if ownerFilter != "" && ownerFilter != "all" {
			if strings.ToLower(item.Owner.Username) != ownerFilter && strconv.FormatUint(uint64(item.OwnerID), 10) != ownerFilter {
				continue
			}
		}
		filtered = append(filtered, item)
	}
	return filtered
}
