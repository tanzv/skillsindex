package web

func openAPIPathsAdminOps() map[string]any {
	paths := map[string]any{}
	mergeOpenAPIPathMap(paths, openAPIPathsAdminOpsDashboard())
	mergeOpenAPIPathMap(paths, openAPIPathsAdminOpsRuntime())
	return paths
}

func openAPIPathsAdminOpsDashboard() map[string]any {
	paths := map[string]any{}
	mergeOpenAPIPathMap(paths, openAPIPathsAdminOpsDashboardCore())
	mergeOpenAPIPathMap(paths, openAPIPathsAdminOpsDashboardJobs())
	mergeOpenAPIPathMap(paths, openAPIPathsAdminOpsDashboardSync())
	mergeOpenAPIPathMap(paths, openAPIPathsAdminOpsDashboardSettings())
	return paths
}

func openAPISyncRunListQueryParams() []map[string]any {
	params := []map[string]any{
		queryParam("owner_id", "integer", false, "Owner user id filter"),
		queryParam("target_skill_id", "integer", false, "Target skill id filter"),
	}
	return append(params, openAPISharedSyncRunListQueryParams()...)
}

func openAPISkillSyncRunListQueryParams() []map[string]any {
	params := []map[string]any{
		pathParam("skillID", "Skill ID"),
	}
	return append(params, openAPISharedSyncRunListQueryParams()...)
}

func openAPISharedSyncRunListQueryParams() []map[string]any {
	return []map[string]any{
		queryParam("policy_id", "integer", false, "Sync policy id filter"),
		queryParam("job_id", "integer", false, "Async job id filter"),
		queryParam("status", "string", false, "Run status filter"),
		queryParam("trigger_type", "string", false, "Run trigger type filter"),
		queryParam("include_errored", "boolean", false, "Include runs with error code or summary"),
		queryParam("limit", "integer", false, "Maximum run records"),
	}
}
