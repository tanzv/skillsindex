package web

func openAPIPathsAdminOpsDashboardJobs() map[string]any {
	return map[string]any{
		"/api/v1/admin/jobs": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "List async orchestration jobs",
				"description": "Session endpoint to query asynchronous ingestion and sync jobs.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					queryParam("owner_id", "integer", false, "Owner user id filter"),
					queryParam("status", "string", false, "Status filter"),
					queryParam("job_type", "string", false, "Job type filter"),
					queryParam("limit", "integer", false, "Maximum job records"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Async job records", "AsyncJobsResponse"),
					"400": jsonResponse("Invalid owner filter", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"500": jsonResponse("Job query failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/jobs/{jobID}": map[string]any{
			"get": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Get async orchestration job detail",
				"description": "Session endpoint to query one asynchronous job detail by id.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("jobID", "Async job ID"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Async job detail", "AsyncJobDetailResponse"),
					"400": jsonResponse("Invalid job id", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Job not found", "ErrorResponse"),
					"500": jsonResponse("Job query failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/jobs/{jobID}/retry": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Retry async orchestration job",
				"description": "Session endpoint to retry one failed or canceled async job.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("jobID", "Async job ID"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Async job detail", "AsyncJobDetailResponse"),
					"400": jsonResponse("Invalid transition or id", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Job not found", "ErrorResponse"),
					"500": jsonResponse("Retry failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
		"/api/v1/admin/jobs/{jobID}/cancel": map[string]any{
			"post": map[string]any{
				"tags":        []string{"dashboard"},
				"summary":     "Cancel async orchestration job",
				"description": "Session endpoint to cancel one pending or running async job.",
				"security":    sessionSecurity(),
				"parameters": []map[string]any{
					pathParam("jobID", "Async job ID"),
				},
				"responses": map[string]any{
					"200": jsonResponse("Async job detail", "AsyncJobDetailResponse"),
					"400": jsonResponse("Invalid transition or id", "ErrorResponse"),
					"401": jsonResponse("Unauthorized", "ErrorResponse"),
					"403": jsonResponse("Permission denied", "ErrorResponse"),
					"404": jsonResponse("Job not found", "ErrorResponse"),
					"500": jsonResponse("Cancel failed", "ErrorResponse"),
					"503": jsonResponse("Service unavailable", "ErrorResponse"),
				},
			},
		},
	}
}
