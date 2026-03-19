package services

import (
	"fmt"
	"strings"

	"skillsindex/internal/models"
)

const (
	// APIKeyScopeAll grants all API key protected abilities.
	APIKeyScopeAll = "*"
	// APIKeyScopeSkillsRead grants all skills read endpoints.
	APIKeyScopeSkillsRead = "skills.read"
	// APIKeyScopeSkillsSearchRead grants keyword skill search endpoint.
	APIKeyScopeSkillsSearchRead = "skills.search.read"
	// APIKeyScopeSkillsAISearchRead grants AI semantic search endpoint.
	APIKeyScopeSkillsAISearchRead = "skills.ai_search.read"
)

var (
	defaultAPIKeyScopes = []string{
		APIKeyScopeSkillsSearchRead,
		APIKeyScopeSkillsAISearchRead,
	}
	supportedAPIKeyScopeOrder = []string{
		APIKeyScopeSkillsSearchRead,
		APIKeyScopeSkillsAISearchRead,
		APIKeyScopeSkillsRead,
		"skills:*",
		APIKeyScopeAll,
	}
	supportedAPIKeyScopes = map[string]struct{}{
		APIKeyScopeAll:                {},
		APIKeyScopeSkillsRead:         {},
		APIKeyScopeSkillsSearchRead:   {},
		APIKeyScopeSkillsAISearchRead: {},
		"skills:*":                    {},
	}
)

// CreateAPIKeyInput defines creation options for one account-scoped API key.
type CreateAPIKeyInput struct {
	UserID        uint
	Name          string
	Purpose       string
	CreatedBy     uint
	ExpiresInDays int
	Scopes        []string
}

// DefaultAPIKeyScopes returns the default scopes applied to new keys.
func DefaultAPIKeyScopes() []string {
	return append([]string{}, defaultAPIKeyScopes...)
}

// SupportedAPIKeyScopes returns the ordered list of allowed scope values.
func SupportedAPIKeyScopes() []string {
	return append([]string{}, supportedAPIKeyScopeOrder...)
}

func normalizeAPIKeyStatus(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "active":
		return "active"
	case "revoked":
		return "revoked"
	case "expired":
		return "expired"
	default:
		return "all"
	}
}

// NormalizeAPIKeyScopes validates, deduplicates, and canonicalizes scope names.
func NormalizeAPIKeyScopes(scopes []string) ([]string, error) {
	joined := strings.Join(scopes, ",")
	candidates := strings.FieldsFunc(joined, func(r rune) bool {
		return r == ',' || r == ';' || r == '\n' || r == '\r' || r == '\t' || r == ' '
	})
	result := make([]string, 0, len(candidates))
	seen := make(map[string]struct{}, len(candidates))
	for _, candidate := range candidates {
		scope := strings.ToLower(strings.TrimSpace(candidate))
		if scope == "" {
			continue
		}
		if _, ok := supportedAPIKeyScopes[scope]; !ok {
			return nil, fmt.Errorf("invalid scope: %s", scope)
		}
		if _, exists := seen[scope]; exists {
			continue
		}
		seen[scope] = struct{}{}
		result = append(result, scope)
	}
	return result, nil
}

// APIKeyScopes returns parsed scope list from one stored key.
func APIKeyScopes(key models.APIKey) []string {
	scopes, err := NormalizeAPIKeyScopes([]string{key.Scopes})
	if err != nil {
		return []string{}
	}
	return scopes
}

// APIKeyHasScope checks whether one key can access one required scope.
func APIKeyHasScope(key models.APIKey, requiredScope string) bool {
	required := strings.ToLower(strings.TrimSpace(requiredScope))
	if required == "" {
		return true
	}
	scopeList := APIKeyScopes(key)
	if len(scopeList) == 0 {
		return false
	}
	set := make(map[string]struct{}, len(scopeList))
	for _, scope := range scopeList {
		set[scope] = struct{}{}
	}
	if _, ok := set[APIKeyScopeAll]; ok {
		return true
	}
	if _, ok := set[required]; ok {
		return true
	}
	if strings.HasPrefix(required, "skills.") {
		if _, ok := set["skills:*"]; ok {
			return true
		}
		if _, ok := set[APIKeyScopeSkillsRead]; ok {
			return true
		}
	}
	parts := strings.Split(required, ".")
	for i := len(parts) - 1; i >= 1; i-- {
		wildcard := strings.Join(parts[:i], ".") + ".*"
		if _, ok := set[wildcard]; ok {
			return true
		}
	}
	return false
}
