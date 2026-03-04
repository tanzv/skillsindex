package web

func openAPISchemasAdminMetrics() map[string]any {
	return map[string]any{
		"AdminOverviewResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"user": map[string]any{
					"type": "object",
					"properties": map[string]any{
						"id":       map[string]any{"type": "integer"},
						"username": map[string]any{"type": "string"},
						"role":     map[string]any{"type": "string"},
					},
				},
				"counts": map[string]any{
					"type": "object",
					"properties": map[string]any{
						"total":         map[string]any{"type": "integer"},
						"public":        map[string]any{"type": "integer"},
						"private":       map[string]any{"type": "integer"},
						"syncable":      map[string]any{"type": "integer"},
						"org_count":     map[string]any{"type": "integer"},
						"account_count": map[string]any{"type": "integer"},
					},
				},
				"capabilities": map[string]any{
					"type": "object",
					"properties": map[string]any{
						"can_manage_users": map[string]any{"type": "boolean"},
						"can_view_all":     map[string]any{"type": "boolean"},
					},
				},
			},
		},
		"AdminSkillItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"id":              map[string]any{"type": "integer"},
				"name":            map[string]any{"type": "string"},
				"description":     map[string]any{"type": "string"},
				"content":         map[string]any{"type": "string"},
				"category":        map[string]any{"type": "string"},
				"subcategory":     map[string]any{"type": "string"},
				"tags":            map[string]any{"type": "array", "items": map[string]any{"type": "string"}},
				"source_type":     map[string]any{"type": "string"},
				"source_url":      map[string]any{"type": "string"},
				"star_count":      map[string]any{"type": "integer"},
				"quality_score":   map[string]any{"type": "number"},
				"install_command": map[string]any{"type": "string"},
				"updated_at":      map[string]any{"type": "string", "format": "date-time"},
				"owner_id":        map[string]any{"type": "integer"},
				"owner_username":  map[string]any{"type": "string"},
				"visibility":      map[string]any{"type": "string"},
				"organization_id": map[string]any{"type": "integer"},
				"created_at":      map[string]any{"type": "string", "format": "date-time"},
				"last_synced_at":  map[string]any{"type": "string", "format": "date-time"},
			},
		},
		"AdminSkillsResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"items": map[string]any{"type": "array", "items": map[string]any{"$ref": "#/components/schemas/AdminSkillItem"}},
				"page":  map[string]any{"type": "integer"},
				"limit": map[string]any{"type": "integer"},
				"total": map[string]any{"type": "integer"},
			},
		},
		"AdminIntegrationConnectorItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"id":          map[string]any{"type": "integer"},
				"name":        map[string]any{"type": "string"},
				"provider":    map[string]any{"type": "string"},
				"description": map[string]any{"type": "string"},
				"base_url":    map[string]any{"type": "string"},
				"config_json": map[string]any{"type": "string"},
				"enabled":     map[string]any{"type": "boolean"},
				"created_by":  map[string]any{"type": "integer"},
				"created_at":  map[string]any{"type": "string", "format": "date-time"},
				"updated_at":  map[string]any{"type": "string", "format": "date-time"},
			},
		},
		"AdminWebhookLogItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"id":            map[string]any{"type": "integer"},
				"connector_id":  map[string]any{"type": "integer"},
				"event_type":    map[string]any{"type": "string"},
				"endpoint":      map[string]any{"type": "string"},
				"status_code":   map[string]any{"type": "integer"},
				"outcome":       map[string]any{"type": "string"},
				"request_id":    map[string]any{"type": "string"},
				"error_message": map[string]any{"type": "string"},
				"delivered_at":  map[string]any{"type": "string", "format": "date-time"},
			},
		},
		"AdminIntegrationsResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"items": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/AdminIntegrationConnectorItem"},
				},
				"total": map[string]any{"type": "integer"},
				"webhook_logs": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/AdminWebhookLogItem"},
				},
				"webhook_total": map[string]any{"type": "integer"},
			},
		},
		"SyncJobRunItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"id":            map[string]any{"type": "integer"},
				"trigger":       map[string]any{"type": "string"},
				"scope":         map[string]any{"type": "string"},
				"status":        map[string]any{"type": "string"},
				"target_skill_id": map[string]any{"type": "integer"},
				"owner_user_id": map[string]any{"type": "integer"},
				"actor_user_id": map[string]any{"type": "integer"},
				"candidates":    map[string]any{"type": "integer"},
				"synced":        map[string]any{"type": "integer"},
				"failed":        map[string]any{"type": "integer"},
				"error_summary": map[string]any{"type": "string"},
				"started_at":    map[string]any{"type": "string", "format": "date-time"},
				"finished_at":   map[string]any{"type": "string", "format": "date-time"},
				"duration_ms":   map[string]any{"type": "integer"},
			},
		},
		"AsyncJobItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"id":                  map[string]any{"type": "integer"},
				"job_type":            map[string]any{"type": "string"},
				"status":              map[string]any{"type": "string"},
				"owner_user_id":       map[string]any{"type": "integer"},
				"actor_user_id":       map[string]any{"type": "integer"},
				"canceled_by_user_id": map[string]any{"type": "integer"},
				"target_skill_id":     map[string]any{"type": "integer"},
				"attempt":             map[string]any{"type": "integer"},
				"max_attempts":        map[string]any{"type": "integer"},
				"started_at":          map[string]any{"type": "string", "format": "date-time"},
				"finished_at":         map[string]any{"type": "string", "format": "date-time"},
				"error_code":          map[string]any{"type": "string"},
				"error_message":       map[string]any{"type": "string"},
				"payload_digest":      map[string]any{"type": "string"},
				"created_at":          map[string]any{"type": "string", "format": "date-time"},
				"updated_at":          map[string]any{"type": "string", "format": "date-time"},
			},
		},
		"AsyncJobsResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"items": map[string]any{"type": "array", "items": map[string]any{"$ref": "#/components/schemas/AsyncJobItem"}},
				"total": map[string]any{"type": "integer"},
			},
		},
		"AsyncJobDetailResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"item": map[string]any{"$ref": "#/components/schemas/AsyncJobItem"},
			},
		},
		"SyncJobsResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"items": map[string]any{"type": "array", "items": map[string]any{"$ref": "#/components/schemas/SyncJobRunItem"}},
				"total": map[string]any{"type": "integer"},
			},
		},
		"SyncJobDetailResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"item": map[string]any{"$ref": "#/components/schemas/SyncJobRunItem"},
			},
		},
		"RepositorySyncPolicyResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"enabled":    map[string]any{"type": "boolean"},
				"interval":   map[string]any{"type": "string"},
				"timeout":    map[string]any{"type": "string"},
				"batch_size": map[string]any{"type": "integer"},
			},
		},
		"OpsMetricsItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"generated_at":             map[string]any{"type": "string", "format": "date-time"},
				"request_qps":              map[string]any{"type": "number"},
				"latency_p50_ms":           map[string]any{"type": "number"},
				"latency_p95_ms":           map[string]any{"type": "number"},
				"latency_p99_ms":           map[string]any{"type": "number"},
				"error_rate_4xx":           map[string]any{"type": "number"},
				"error_rate_5xx":           map[string]any{"type": "number"},
				"sync_success_rate":        map[string]any{"type": "number"},
				"audit_write_failure_rate": map[string]any{"type": "number"},
				"total_audit_logs_24h":     map[string]any{"type": "integer"},
				"total_sync_runs_24h":      map[string]any{"type": "integer"},
				"failed_sync_runs_24h":     map[string]any{"type": "integer"},
				"retention_days":           map[string]any{"type": "integer"},
			},
		},
		"OpsAlertItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"code":      map[string]any{"type": "string"},
				"severity":  map[string]any{"type": "string"},
				"message":   map[string]any{"type": "string"},
				"triggered": map[string]any{"type": "boolean"},
			},
		},
		"AdminOpsMetricsResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"item": map[string]any{"$ref": "#/components/schemas/OpsMetricsItem"},
			},
		},
		"AdminOpsAlertsResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"items": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/OpsAlertItem"},
				},
				"total": map[string]any{"type": "integer"},
			},
		},
	}
}
