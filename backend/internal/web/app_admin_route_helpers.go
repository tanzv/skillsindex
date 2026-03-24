package web

import (
	"context"
	"net/http"
	"strconv"
	"strings"

	"skillsindex/internal/models"

	"github.com/go-chi/chi/v5"
)

func (a *App) loadCategoryCards(ctx context.Context, focusCategory string) ([]CategoryCard, error) {
	byCategory, err := a.skillService.CountPublicCategorySkills(ctx)
	if err != nil {
		return nil, err
	}
	categoryCounts := make(map[string]int64, len(byCategory))
	for _, item := range byCategory {
		categoryCounts[item.CategorySlug] = item.Count
	}

	subCounts, err := a.skillService.CountPublicSubcategorySkills(ctx, focusCategory)
	if err != nil {
		return nil, err
	}

	definitions := a.marketplaceCatalogCategories(ctx)
	cards := make([]CategoryCard, 0, len(definitions))
	for _, item := range definitions {
		card := CategoryCard{
			Slug:        item.Slug,
			Name:        item.Name,
			Description: item.Description,
			Count:       categoryCounts[item.Slug],
		}
		for _, sub := range item.Subcategories {
			card.Subcategories = append(card.Subcategories, SubcategoryCard{
				Slug:  sub.Slug,
				Name:  sub.Name,
				Count: subCounts[sub.Slug],
			})
		}
		cards = append(cards, card)
	}
	return cards, nil
}

func findCategoryCard(cards []CategoryCard, slug string) *CategoryCard {
	for i := range cards {
		if cards[i].Slug == slug {
			return &cards[i]
		}
	}
	return nil
}

func parseSkillID(w http.ResponseWriter, r *http.Request) (uint, bool) {
	raw := chi.URLParam(r, "skillID")
	value, err := strconv.ParseUint(raw, 10, 64)
	if err != nil || value == 0 {
		http.NotFound(w, r)
		return 0, false
	}
	return uint(value), true
}

func parseIncidentID(w http.ResponseWriter, r *http.Request) (uint, bool) {
	raw := chi.URLParam(r, "incidentID")
	value, err := strconv.ParseUint(raw, 10, 64)
	if err != nil || value == 0 {
		http.NotFound(w, r)
		return 0, false
	}
	return uint(value), true
}

func parseVersionID(w http.ResponseWriter, r *http.Request) (uint, bool) {
	raw := chi.URLParam(r, "versionID")
	value, err := strconv.ParseUint(raw, 10, 64)
	if err != nil || value == 0 {
		http.NotFound(w, r)
		return 0, false
	}
	return uint(value), true
}

func parseVersionCompareIDs(r *http.Request) (uint, uint, bool) {
	if r == nil {
		return 0, 0, false
	}
	fromRaw := strings.TrimSpace(r.URL.Query().Get("from"))
	toRaw := strings.TrimSpace(r.URL.Query().Get("to"))
	if fromRaw == "" || toRaw == "" {
		return 0, 0, false
	}

	fromValue, fromErr := strconv.ParseUint(fromRaw, 10, 64)
	toValue, toErr := strconv.ParseUint(toRaw, 10, 64)
	if fromErr != nil || toErr != nil || fromValue == 0 || toValue == 0 {
		return 0, 0, false
	}
	return uint(fromValue), uint(toValue), true
}

func parseUserID(w http.ResponseWriter, r *http.Request) (uint, bool) {
	raw := chi.URLParam(r, "userID")
	value, err := strconv.ParseUint(raw, 10, 64)
	if err != nil || value == 0 {
		http.NotFound(w, r)
		return 0, false
	}
	return uint(value), true
}

func parseCommentID(w http.ResponseWriter, r *http.Request) (uint, bool) {
	raw := chi.URLParam(r, "commentID")
	value, err := strconv.ParseUint(raw, 10, 64)
	if err != nil || value == 0 {
		http.NotFound(w, r)
		return 0, false
	}
	return uint(value), true
}

func parseRoleValue(raw string) (models.UserRole, bool) {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case string(models.RoleViewer):
		return models.RoleViewer, true
	case string(models.RoleMember):
		return models.RoleMember, true
	case string(models.RoleAdmin):
		return models.RoleAdmin, true
	case string(models.RoleSuperAdmin):
		return models.RoleSuperAdmin, true
	default:
		return "", false
	}
}

func roleTranslationKey(role models.UserRole) string {
	switch models.NormalizeUserRole(string(role)) {
	case models.RoleViewer:
		return "role.viewer"
	case models.RoleAdmin:
		return "role.admin"
	case models.RoleSuperAdmin:
		return "role.super_admin"
	default:
		return "role.member"
	}
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		clean := strings.TrimSpace(value)
		if clean != "" {
			return clean
		}
	}
	return ""
}

func normalizeAdminSection(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "overview":
		return "overview"
	case "access", "accounts", "roles":
		return "access"
	case "ingestion":
		return "ingestion"
	case "records":
		return "records"
	case "integrations", "integration", "connectors", "webhooks":
		return "integrations"
	case "incidents":
		return "incidents"
	case "ops", "operations":
		return "ops"
	case "moderation", "reports":
		return "moderation"
	case "apikeys":
		return "apikeys"
	case "users":
		return "users"
	case "audit":
		return "audit"
	default:
		return "overview"
	}
}

func resolveAdminRouteContext(section string, subsection string, detail string, extra string) adminRouteContext {
	rawSection := strings.ToLower(strings.TrimSpace(section))
	sub := strings.ToLower(strings.TrimSpace(subsection))
	det := strings.ToLower(strings.TrimSpace(detail))
	ext := strings.ToLower(strings.TrimSpace(extra))

	ctx := adminRouteContext{
		Section: normalizeAdminSection(rawSection),
	}

	switch ctx.Section {
	case "access":
		ctx.AccessMode = "overview"
		switch rawSection {
		case "accounts":
			if sub == "new" || det == "new" || ext == "new" {
				ctx.AccessMode = "accounts-new"
			} else {
				ctx.AccessMode = "accounts-list"
			}
		case "roles":
			if sub == "new" || det == "new" || ext == "new" {
				ctx.AccessMode = "roles-new"
			} else {
				ctx.AccessMode = "roles-list"
			}
		default:
			switch sub {
			case "accounts":
				if det == "new" || ext == "new" {
					ctx.AccessMode = "accounts-new"
				} else {
					ctx.AccessMode = "accounts-list"
				}
			case "roles":
				if det == "new" || ext == "new" {
					ctx.AccessMode = "roles-new"
				} else {
					ctx.AccessMode = "roles-list"
				}
			}
		}
	case "ingestion":
		ctx.IngestionSource = "manual"
		switch sub {
		case "manual", "upload", "repository", "skillmp":
			ctx.IngestionSource = sub
		}
	case "records":
		ctx.RecordsMode = "overview"
		switch sub {
		case "imports", "sync-jobs", "exports":
			ctx.RecordsMode = sub
		}
	case "integrations":
		ctx.IntegrationsMode = "overview"
		switch {
		case rawSection == "connectors" || sub == "list":
			ctx.IntegrationsMode = "list"
		case sub == "new":
			ctx.IntegrationsMode = "new"
		case rawSection == "webhooks":
			ctx.IntegrationsMode = "webhooks"
		case sub == "webhooks" && (det == "logs" || det == ""):
			ctx.IntegrationsMode = "webhooks"
		}
	case "incidents":
		ctx.IncidentsMode = "overview"
		if sub == "list" {
			ctx.IncidentsMode = "list"
			break
		}
		if sub != "" && sub != "list" {
			if det == "response" || ext == "response" {
				ctx.IncidentsMode = "response"
				ctx.IncidentID = sub
				break
			}
			if det == "postmortem" || ext == "postmortem" {
				ctx.IncidentsMode = "postmortem"
				ctx.IncidentID = sub
				break
			}
		}
	case "ops":
		ctx.OpsMode = "metrics"
		switch sub {
		case "metrics", "alerts", "audit-export", "release-gates", "recovery-drills", "releases", "change-approvals", "backup-plans", "backup-runs":
			ctx.OpsMode = sub
		}
	}

	return ctx
}
