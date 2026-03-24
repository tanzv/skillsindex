package web

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"skillsindex/internal/services"
)

type syncRunListCommonFilters struct {
	PolicyID       *uint
	JobID          *uint
	Status         string
	TriggerType    string
	IncludeErrored bool
	Limit          int
}

var errInvalidQueryUint = errors.New("invalid uint query value")

var errInvalidSyncRunTriggerType = errors.New("invalid sync run trigger type")

var errInvalidSyncRunPolicyID = errors.New("invalid sync run policy id")

var errInvalidSyncRunJobID = errors.New("invalid sync run job id")

func parseSyncRunListCommonFilters(r *http.Request) (syncRunListCommonFilters, error) {
	filters := syncRunListCommonFilters{
		Limit: parseSyncRunListLimit(r),
	}

	policyID, err := parseOptionalUintQuery(r, "policy_id")
	if err != nil {
		return syncRunListCommonFilters{}, errInvalidSyncRunPolicyID
	}
	jobID, err := parseOptionalUintQuery(r, "job_id")
	if err != nil {
		return syncRunListCommonFilters{}, errInvalidSyncRunJobID
	}
	triggerType, err := parseSyncRunTriggerTypeQuery(r)
	if err != nil {
		return syncRunListCommonFilters{}, err
	}

	filters.PolicyID = policyID
	filters.JobID = jobID
	filters.Status = parseSyncRunStatusQuery(r)
	filters.TriggerType = triggerType
	filters.IncludeErrored = parseBoolFlag(queryParamValue(r, "include_errored"), false)
	return filters, nil
}

func (filters syncRunListCommonFilters) listInput() services.ListSyncRunsInput {
	return services.ListSyncRunsInput{
		PolicyID:       filters.PolicyID,
		JobID:          filters.JobID,
		Status:         filters.Status,
		TriggerType:    filters.TriggerType,
		IncludeErrored: filters.IncludeErrored,
		Limit:          filters.Limit,
	}
}

func syncRunListFilterErrorCode(err error) string {
	switch {
	case errors.Is(err, errInvalidSyncRunPolicyID):
		return "invalid_policy_id"
	case errors.Is(err, errInvalidSyncRunJobID):
		return "invalid_job_id"
	case errors.Is(err, errInvalidSyncRunTriggerType):
		return "invalid_trigger_type"
	default:
		return "invalid_query_filter"
	}
}

func syncRunListFilterMessage(err error) string {
	switch {
	case errors.Is(err, errInvalidSyncRunPolicyID):
		return "Invalid policy id filter"
	case errors.Is(err, errInvalidSyncRunJobID):
		return "Invalid job id filter"
	case errors.Is(err, errInvalidSyncRunTriggerType):
		return "Invalid trigger type filter"
	default:
		return "Invalid sync run query filter"
	}
}

func parseOptionalUintQuery(r *http.Request, key string) (*uint, error) {
	raw := strings.TrimSpace(queryParamValue(r, key))
	if raw == "" {
		return nil, nil
	}
	value, err := strconv.ParseUint(raw, 10, 64)
	if err != nil || value == 0 {
		return nil, errInvalidQueryUint
	}
	parsed := uint(value)
	return &parsed, nil
}

func parseSyncRunTriggerTypeQuery(r *http.Request) (string, error) {
	value := strings.ToLower(strings.TrimSpace(queryParamValue(r, "trigger_type")))
	switch value {
	case "":
		return "", nil
	case services.SyncRunTriggerTypeManual:
		return services.SyncRunTriggerTypeManual, nil
	case "scheduled", "scheduler", "startup", "tick", "cron":
		return services.SyncRunTriggerTypeScheduled, nil
	case "retry", "replay":
		return services.SyncRunTriggerTypeRetry, nil
	default:
		return "", errInvalidSyncRunTriggerType
	}
}

func parseSyncRunStatusQuery(r *http.Request) string {
	return strings.TrimSpace(queryParamValue(r, "status"))
}

func parseSyncRunListLimit(r *http.Request) int {
	return parsePositiveInt(queryParamValue(r, "limit"), 80)
}

func queryParamValue(r *http.Request, key string) string {
	if r == nil || r.URL == nil {
		return ""
	}
	return r.URL.Query().Get(key)
}
