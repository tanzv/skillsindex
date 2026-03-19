package web

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) handleAPIAdminOverview(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}

	counts, err := a.skillService.CountDashboardSkills(r.Context(), user.ID, user.CanViewAllSkills())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "count_failed", "message": err.Error()})
		return
	}

	orgCount := 0
	if a.organizationSvc != nil {
		orgs, orgErr := a.organizationSvc.ListOrganizations(r.Context(), *user)
		if orgErr == nil {
			orgCount = len(orgs)
		}
	}

	accountCount := int64(0)
	if user.CanManageUsers() {
		accounts, accountErr := a.authService.ListUsers(r.Context())
		if accountErr == nil {
			accountCount = int64(len(accounts))
		}
	}

	var payload apiAdminOverviewResponse
	payload.User.ID = user.ID
	payload.User.Username = user.Username
	payload.User.Role = string(user.EffectiveRole())
	payload.Counts.Total = counts.Total
	payload.Counts.Public = counts.Public
	payload.Counts.Private = counts.Private
	payload.Counts.Syncable = counts.Syncable
	payload.Counts.OrgCount = orgCount
	payload.Counts.AccountCount = int(accountCount)
	payload.Capabilities.CanManageUsers = user.CanManageUsers()
	payload.Capabilities.CanViewAll = user.CanViewAllSkills()

	writeJSON(w, http.StatusOK, payload)
}

func (a *App) handleAPIAdminSkills(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}

	var (
		skills []models.Skill
		err    error
	)
	if user.CanViewAllSkills() {
		skills, err = a.skillService.ListAllSkills(r.Context())
	} else {
		skills, err = a.skillService.ListSkillsByOwner(r.Context(), user.ID)
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "list_failed", "message": err.Error()})
		return
	}

	filtered := filterAdminAPISkills(
		skills,
		r.URL.Query().Get("q"),
		r.URL.Query().Get("source"),
		r.URL.Query().Get("visibility"),
		r.URL.Query().Get("owner"),
	)

	page := parsePositiveInt(r.URL.Query().Get("page"), 1)
	if page < 1 {
		page = 1
	}
	limit := parsePositiveInt(r.URL.Query().Get("limit"), 20)
	if limit > 200 {
		limit = 200
	}
	start := (page - 1) * limit
	if start > len(filtered) {
		start = len(filtered)
	}
	end := start + limit
	if end > len(filtered) {
		end = len(filtered)
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"items": resultToAPIAdminSkillItems(filtered[start:end]),
		"page":  page,
		"limit": limit,
		"total": len(filtered),
	})
}

func (a *App) handleAPIAdminAPIKeys(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.apiKeyService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	statusFilter := normalizeAPIAdminAPIKeyStatus(r.URL.Query().Get("status"))
	ownerFilter := strings.TrimSpace(r.URL.Query().Get("owner"))
	limit := parsePositiveInt(r.URL.Query().Get("limit"), 200)
	if limit > 1000 {
		limit = 1000
	}

	var (
		keys []models.APIKey
		err  error
	)
	if user.CanManageUsers() {
		keys, err = a.apiKeyService.ListForAdmin(r.Context(), services.ListAPIKeysInput{
			OwnerUsername: ownerFilter,
			Status:        statusFilter,
			Limit:         limit,
		})
	} else {
		if ownerFilter != "" &&
			!strings.EqualFold(ownerFilter, user.Username) &&
			ownerFilter != strconv.FormatUint(uint64(user.ID), 10) {
			writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
			return
		}
		keys, err = a.apiKeyService.ListByUser(r.Context(), user.ID)
		if err == nil {
			keys = filterAPIAdminAPIKeysByStatus(keys, statusFilter)
			if limit > 0 && len(keys) > limit {
				keys = keys[:limit]
			}
		}
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "list_failed", "message": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"items": resultToAPIAdminAPIKeyItems(keys),
		"total": len(keys),
	})
}

func (a *App) handleAPIAdminAPIKeysCreate(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.apiKeyService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	input, err := readAPIKeyCreateInput(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}

	ownerUserID := user.ID
	if input.OwnerUserID != nil {
		ownerUserID = *input.OwnerUserID
	}
	if ownerUserID != user.ID && !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}

	ownerUsername := user.Username
	if a.authService != nil {
		ownerUser, ownerErr := a.authService.GetUserByID(r.Context(), ownerUserID)
		if ownerErr != nil {
			if errors.Is(ownerErr, services.ErrUserNotFound) {
				writeJSON(w, http.StatusNotFound, map[string]any{"error": "user_not_found"})
				return
			}
			writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "owner_query_failed", "message": ownerErr.Error()})
			return
		}
		ownerUsername = ownerUser.Username
	}

	created, plaintext, createErr := a.apiKeyService.Create(r.Context(), services.CreateAPIKeyInput{
		UserID:        ownerUserID,
		Name:          input.Name,
		Purpose:       input.Purpose,
		CreatedBy:     user.ID,
		ExpiresInDays: input.ExpiresInDays,
		Scopes:        input.Scopes,
	})
	if createErr != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "create_failed", "message": createErr.Error()})
		return
	}

	created.User = models.User{ID: ownerUserID, Username: ownerUsername}
	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_admin_api_key_create",
		TargetType: "api_key",
		TargetID:   created.ID,
		Summary:    "Created API key through admin json api",
		Details: auditDetailsJSON(map[string]string{
			"name":      created.Name,
			"purpose":   created.Purpose,
			"prefix":    created.Prefix,
			"ownerID":   strconv.FormatUint(uint64(created.UserID), 10),
			"createdBy": strconv.FormatUint(uint64(user.ID), 10),
		}),
	})

	writeJSON(w, http.StatusCreated, map[string]any{
		"item":          resultToAPIAdminAPIKeyItem(created),
		"plaintext_key": plaintext,
	})
}
