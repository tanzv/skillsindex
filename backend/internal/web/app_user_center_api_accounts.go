package web

import (
	"net/http"
	"sort"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) handleAPIUserCenterAccounts(w http.ResponseWriter, r *http.Request) {
	actor, ok := a.requireUserCenterPermission(w, r, userCenterPermissionAccountsRead)
	if !ok {
		return
	}
	if a.authService == nil || a.oauthGrantService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	accounts, err := a.authService.ListUsers(r.Context())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "list_failed", "message": err.Error()})
		return
	}
	grants, err := a.oauthGrantService.ListGrantsByProviders(r.Context(), []models.OAuthProvider{models.OAuthProviderFeishuSync, models.OAuthProviderDingTalkSync})
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "mapping_query_failed", "message": err.Error()})
		return
	}

	bindingsByUser := map[uint][]apiUserCenterBindingItem{}
	for _, grant := range grants {
		provider := userCenterProviderLabel(grant.Provider)
		if provider == "" {
			continue
		}
		bindingsByUser[grant.UserID] = append(bindingsByUser[grant.UserID], apiUserCenterBindingItem{
			Provider:       provider,
			ExternalUserID: grant.ExternalUserID,
			ExpiresAt:      grant.ExpiresAt.UTC(),
		})
	}

	overrides, err := a.loadUserCenterPermissionOverrides(r.Context())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "permission_query_failed", "message": err.Error()})
		return
	}

	items := make([]apiUserCenterAccountItem, 0, len(accounts))
	for _, account := range accounts {
		permissions, permErr := a.resolveUserCenterPermissions(r.Context(), account)
		if permErr != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "permission_query_failed", "message": permErr.Error()})
			return
		}
		source := "default"
		if _, exists := overrides[account.ID]; exists {
			source = "override"
		}
		bindings := bindingsByUser[account.ID]
		sort.Slice(bindings, func(i int, j int) bool {
			if bindings[i].Provider == bindings[j].Provider {
				return bindings[i].ExternalUserID < bindings[j].ExternalUserID
			}
			return bindings[i].Provider < bindings[j].Provider
		})
		items = append(items, apiUserCenterAccountItem{
			ID:            account.ID,
			Username:      account.Username,
			DisplayName:   account.DisplayName,
			AvatarURL:     account.AvatarURL,
			Role:          string(account.EffectiveRole()),
			Status:        userStatusValue(account),
			Permissions:   permissions,
			BindingSource: source,
			Bindings:      bindings,
			CreatedAt:     account.CreatedAt,
			UpdatedAt:     account.UpdatedAt,
		})
	}

	a.recordAudit(r.Context(), actor, services.RecordAuditInput{
		Action:     "api_user_center_accounts_list",
		TargetType: "user",
		TargetID:   0,
		Summary:    "Listed user center accounts",
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"items":                 items,
		"total":                 len(items),
		"available_permissions": userCenterAllPermissions,
	})
}
