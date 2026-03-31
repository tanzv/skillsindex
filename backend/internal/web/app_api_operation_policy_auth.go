package web

import (
	"net/http"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) authorizePublishedOperation(w http.ResponseWriter, r *http.Request) bool {
	if a == nil || a.apiContractRuntimeSvc == nil {
		return true
	}

	match, ok := a.apiContractRuntimeSvc.MatchRequest(r.Method, r.URL.Path)
	if !ok {
		return true
	}
	if !match.Policy.Enabled {
		writeAPIError(w, r, http.StatusForbidden, "api_operation_disabled", "API operation is disabled")
		return false
	}

	switch match.Policy.AuthMode {
	case models.APIAuthModePublic:
		return true
	case models.APIAuthModeSession:
		user := currentUserFromContext(r.Context())
		if user == nil {
			writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
			return false
		}
		if !userSatisfiesOperationRoles(*user, match.Policy.RequiredRoles) {
			writeAPIError(w, r, http.StatusForbidden, "api_operation_role_denied", "Permission denied")
			return false
		}
		return true
	case models.APIAuthModeAPIKey:
		return a.authorizeOperationAPIKey(w, r, match.Policy.RequiredScopes)
	default:
		return true
	}
}

func (a *App) authorizeOperationAPIKey(w http.ResponseWriter, r *http.Request, requiredScopes []string) bool {
	apiKey := strings.TrimSpace(r.URL.Query().Get("api_key"))
	if apiKey == "" {
		authHeader := strings.TrimSpace(r.Header.Get("Authorization"))
		if strings.HasPrefix(strings.ToLower(authHeader), "bearer ") {
			apiKey = strings.TrimSpace(authHeader[7:])
		}
	}
	if apiKey == "" {
		writeAPIError(w, r, http.StatusUnauthorized, "api_key_invalid", "Invalid API key")
		return false
	}

	if _, ok := a.apiKeys[apiKey]; ok {
		if len(requiredScopes) > 0 {
			writeAPIError(w, r, http.StatusForbidden, "api_key_scope_denied", "API key scope denied")
			return false
		}
		return true
	}

	if a.apiKeyService == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "api_key_invalid", "Invalid API key")
		return false
	}

	key, valid, err := a.apiKeyService.Validate(r.Context(), apiKey)
	if err != nil || !valid {
		writeAPIError(w, r, http.StatusUnauthorized, "api_key_invalid", "Invalid API key")
		return false
	}
	for _, scope := range requiredScopes {
		if !services.APIKeyHasScope(key, scope) {
			writeAPIError(w, r, http.StatusForbidden, "api_key_scope_denied", "API key scope denied")
			return false
		}
	}
	return true
}

func userSatisfiesOperationRoles(user models.User, requiredRoles []string) bool {
	if len(requiredRoles) == 0 {
		return true
	}

	currentRank := userRolePolicyRank(user.EffectiveRole())
	for _, requiredRole := range requiredRoles {
		if currentRank >= userRolePolicyRank(models.UserRole(requiredRole)) {
			return true
		}
	}
	return false
}

func userRolePolicyRank(role models.UserRole) int {
	switch role {
	case models.RoleSuperAdmin:
		return 4
	case models.RoleAdmin:
		return 3
	case models.RoleMember:
		return 2
	case models.RoleViewer:
		return 1
	default:
		return 0
	}
}
