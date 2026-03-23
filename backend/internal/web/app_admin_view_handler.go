package web

import (
	"errors"
	"net/http"
	"net/url"
	"strings"

	"github.com/go-chi/chi/v5"
)

func (a *App) handleAdmin(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	rawSection := firstNonEmpty(chi.URLParam(r, "section"), r.URL.Query().Get("section"))
	routeContext := resolveAdminRouteContext(
		rawSection,
		firstNonEmpty(chi.URLParam(r, "subsection"), r.URL.Query().Get("subsection")),
		firstNonEmpty(chi.URLParam(r, "detail"), r.URL.Query().Get("detail")),
		firstNonEmpty(chi.URLParam(r, "extra"), r.URL.Query().Get("extra")),
	)
	adminSection := routeContext.Section

	if clean := strings.ToLower(strings.TrimSpace(rawSection)); clean != "" && clean != "overview" && adminSection == "overview" {
		http.Redirect(w, r, "/admin", http.StatusSeeOther)
		return
	}
	if adminSection == "users" && !user.CanManageUsers() {
		http.Redirect(w, r, "/admin?err="+url.QueryEscape("Permission denied"), http.StatusSeeOther)
		return
	}
	if adminSection == "moderation" && !user.CanViewAllSkills() {
		http.Redirect(w, r, "/admin?err="+url.QueryEscape("Permission denied"), http.StatusSeeOther)
		return
	}
	if adminSection == "ops" && !user.CanViewAllSkills() {
		http.Redirect(w, r, "/admin?err="+url.QueryEscape("Permission denied"), http.StatusSeeOther)
		return
	}
	if adminSection == "access" && (routeContext.AccessMode == "accounts-list" || routeContext.AccessMode == "accounts-new" || routeContext.AccessMode == "roles-list" || routeContext.AccessMode == "roles-new") && !user.CanManageUsers() {
		http.Redirect(w, r, "/admin/access?err="+url.QueryEscape("Permission denied"), http.StatusSeeOther)
		return
	}

	view, status, err := a.buildAdminViewData(r, user, adminSection, routeContext)
	if err != nil {
		renderData := ViewData{
			Page:  adminPageName(adminSection),
			Title: "Admin Console",
			Error: "Failed to build admin view",
		}

		var buildErr *adminViewBuildError
		if errors.As(err, &buildErr) {
			renderData.Error = buildErr.Message
			if buildErr.Status > 0 {
				status = buildErr.Status
			}
		}

		a.renderWithStatus(w, r, status, renderData)
		return
	}

	a.render(w, r, view)
}
