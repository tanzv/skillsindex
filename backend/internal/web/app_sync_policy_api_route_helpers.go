package web

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"github.com/go-chi/chi/v5"
)

var errSyncPolicyAliasAmbiguous = errors.New("sync policy alias is ambiguous")

func parseOptionalBoolQuery(r *http.Request, key string) (bool, bool, error) {
	raw := strings.TrimSpace(r.URL.Query().Get(key))
	if raw == "" {
		return false, false, nil
	}
	value, matched := parseBoolSettingValue(raw)
	if !matched {
		return false, false, fmt.Errorf("invalid %s", key)
	}
	return value, true, nil
}

func parseOptionalSyncPolicySourceTypeQuery(r *http.Request, key string) (models.SyncPolicySourceType, error) {
	raw := strings.TrimSpace(r.URL.Query().Get(key))
	if raw == "" {
		return "", nil
	}
	value := models.SyncPolicySourceType(strings.ToLower(raw))
	switch value {
	case models.SyncPolicySourceRepository, models.SyncPolicySourceSkillMP:
		return value, nil
	default:
		return "", fmt.Errorf("invalid %s", key)
	}
}

func (a *App) resolveSyncPolicyRouteID(r *http.Request) (uint, error) {
	raw := strings.TrimSpace(chi.URLParam(r, "policyID"))
	if raw == "" {
		return 0, services.ErrSyncPolicyNotFound
	}
	if value, err := strconv.ParseUint(raw, 10, 64); err == nil && value > 0 {
		return uint(value), nil
	}
	if !isRepositorySyncPolicyAlias(raw) {
		return 0, services.ErrSyncPolicyNotFound
	}
	item, err := a.syncPolicyRecordSvc.GetRepositoryMirror(r.Context(), false)
	if err != nil {
		if errors.Is(err, services.ErrSyncPolicyNotFound) {
			return 0, services.ErrSyncPolicyNotFound
		}
		return 0, err
	}
	return item.ID, nil
}

func isRepositorySyncPolicyAlias(raw string) bool {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "repository", "default", "repository-default":
		return true
	default:
		return false
	}
}
