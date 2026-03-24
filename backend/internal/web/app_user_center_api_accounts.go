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
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "User center services are unavailable")
		return
	}

	accounts, err := a.authService.ListUsers(r.Context())
	if err != nil {
		writeAPIError(w, r, http.StatusInternalServerError, "list_failed", "Failed to load user center accounts")
		return
	}
	grants, err := a.oauthGrantService.ListGrantsByProviders(r.Context(), []models.OAuthProvider{models.OAuthProviderFeishuSync, models.OAuthProviderDingTalkSync})
	if err != nil {
		writeAPIError(w, r, http.StatusInternalServerError, "mapping_query_failed", "Failed to load user center account bindings")
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
		writeAPIError(w, r, http.StatusInternalServerError, "permission_query_failed", "Failed to load user center permission overrides")
		return
	}

	items := make([]apiUserCenterAccountItem, 0, len(accounts))
	for _, account := range accounts {
		permissions, permErr := a.resolveUserCenterPermissions(r.Context(), account)
		if permErr != nil {
			writeAPIError(w, r, http.StatusInternalServerError, "permission_query_failed", "Failed to resolve user center permissions")
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
