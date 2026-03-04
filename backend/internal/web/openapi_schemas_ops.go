package web

func openAPISchemasOps() map[string]any {
	return map[string]any{
		"OpsReleaseGateCheckItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"code":     map[string]any{"type": "string"},
				"severity": map[string]any{"type": "string"},
				"message":  map[string]any{"type": "string"},
				"passed":   map[string]any{"type": "boolean"},
			},
		},
		"OpsReleaseGateSnapshot": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"generated_at": map[string]any{"type": "string", "format": "date-time"},
				"passed":       map[string]any{"type": "boolean"},
				"checks": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/OpsReleaseGateCheckItem"},
				},
			},
		},
		"AdminOpsReleaseGatesResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"item": map[string]any{"$ref": "#/components/schemas/OpsReleaseGateSnapshot"},
			},
		},
		"OpsRecoveryDrillRecordItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"logged_at":     map[string]any{"type": "string", "format": "date-time"},
				"actor_user_id": map[string]any{"type": "integer"},
				"rpo_hours":     map[string]any{"type": "number"},
				"rto_hours":     map[string]any{"type": "number"},
				"passed":        map[string]any{"type": "boolean"},
				"note":          map[string]any{"type": "string"},
			},
		},
		"AdminOpsRecoveryDrillsResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"items": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/OpsRecoveryDrillRecordItem"},
				},
				"total": map[string]any{"type": "integer"},
			},
		},
		"OpsRecoveryDrillRunRequest": map[string]any{
			"type":     "object",
			"required": []string{"rpo_hours", "rto_hours"},
			"properties": map[string]any{
				"rpo_hours":   map[string]any{"type": "number"},
				"rto_hours":   map[string]any{"type": "number"},
				"note":        map[string]any{"type": "string"},
				"occurred_at": map[string]any{"type": "string"},
			},
		},
		"AdminOpsRecoveryDrillRunResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"item": map[string]any{"$ref": "#/components/schemas/OpsRecoveryDrillRecordItem"},
			},
		},
		"OpsReleaseItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"released_at":   map[string]any{"type": "string", "format": "date-time"},
				"actor_user_id": map[string]any{"type": "integer"},
				"version":       map[string]any{"type": "string"},
				"environment":   map[string]any{"type": "string"},
				"change_ticket": map[string]any{"type": "string"},
				"status":        map[string]any{"type": "string"},
				"note":          map[string]any{"type": "string"},
			},
		},
		"AdminOpsReleasesResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"items": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/OpsReleaseItem"},
				},
				"total": map[string]any{"type": "integer"},
			},
		},
		"OpsReleaseCreateRequest": map[string]any{
			"type":     "object",
			"required": []string{"version", "environment"},
			"properties": map[string]any{
				"version":       map[string]any{"type": "string"},
				"environment":   map[string]any{"type": "string"},
				"change_ticket": map[string]any{"type": "string"},
				"status":        map[string]any{"type": "string"},
				"note":          map[string]any{"type": "string"},
				"released_at":   map[string]any{"type": "string"},
			},
		},
		"AdminOpsReleaseCreateResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"item": map[string]any{"$ref": "#/components/schemas/OpsReleaseItem"},
			},
		},
		"OpsChangeApprovalItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"occurred_at":   map[string]any{"type": "string", "format": "date-time"},
				"actor_user_id": map[string]any{"type": "integer"},
				"ticket_id":     map[string]any{"type": "string"},
				"reviewer":      map[string]any{"type": "string"},
				"status":        map[string]any{"type": "string"},
				"note":          map[string]any{"type": "string"},
			},
		},
		"AdminOpsChangeApprovalsResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"items": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/OpsChangeApprovalItem"},
				},
				"total": map[string]any{"type": "integer"},
			},
		},
		"OpsChangeApprovalCreateRequest": map[string]any{
			"type":     "object",
			"required": []string{"ticket_id"},
			"properties": map[string]any{
				"ticket_id":   map[string]any{"type": "string"},
				"reviewer":    map[string]any{"type": "string"},
				"status":      map[string]any{"type": "string"},
				"note":        map[string]any{"type": "string"},
				"occurred_at": map[string]any{"type": "string"},
			},
		},
		"AdminOpsChangeApprovalCreateResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"item": map[string]any{"$ref": "#/components/schemas/OpsChangeApprovalItem"},
			},
		},
		"OpsBackupPlanItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"logged_at":      map[string]any{"type": "string", "format": "date-time"},
				"actor_user_id":  map[string]any{"type": "integer"},
				"plan_key":       map[string]any{"type": "string"},
				"backup_type":    map[string]any{"type": "string"},
				"schedule":       map[string]any{"type": "string"},
				"retention_days": map[string]any{"type": "integer"},
				"enabled":        map[string]any{"type": "boolean"},
				"note":           map[string]any{"type": "string"},
			},
		},
		"AdminOpsBackupPlansResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"items": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/OpsBackupPlanItem"},
				},
				"total": map[string]any{"type": "integer"},
			},
		},
		"OpsBackupPlanUpsertRequest": map[string]any{
			"type":     "object",
			"required": []string{"plan_key", "backup_type", "schedule", "retention_days"},
			"properties": map[string]any{
				"plan_key":       map[string]any{"type": "string"},
				"backup_type":    map[string]any{"type": "string"},
				"schedule":       map[string]any{"type": "string"},
				"retention_days": map[string]any{"type": "integer"},
				"enabled":        map[string]any{"type": "boolean"},
				"note":           map[string]any{"type": "string"},
				"occurred_at":    map[string]any{"type": "string"},
			},
		},
		"AdminOpsBackupPlanUpsertResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"item": map[string]any{"$ref": "#/components/schemas/OpsBackupPlanItem"},
			},
		},
		"OpsBackupRunItem": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"logged_at":        map[string]any{"type": "string", "format": "date-time"},
				"actor_user_id":    map[string]any{"type": "integer"},
				"plan_key":         map[string]any{"type": "string"},
				"status":           map[string]any{"type": "string"},
				"size_mb":          map[string]any{"type": "number"},
				"duration_minutes": map[string]any{"type": "number"},
				"note":             map[string]any{"type": "string"},
			},
		},
		"AdminOpsBackupRunsResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"items": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/components/schemas/OpsBackupRunItem"},
				},
				"total": map[string]any{"type": "integer"},
			},
		},
		"OpsBackupRunCreateRequest": map[string]any{
			"type":     "object",
			"required": []string{"plan_key"},
			"properties": map[string]any{
				"plan_key":         map[string]any{"type": "string"},
				"status":           map[string]any{"type": "string"},
				"size_mb":          map[string]any{"type": "number"},
				"duration_minutes": map[string]any{"type": "number"},
				"note":             map[string]any{"type": "string"},
				"occurred_at":      map[string]any{"type": "string"},
			},
		},
		"AdminOpsBackupRunCreateResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"item": map[string]any{"$ref": "#/components/schemas/OpsBackupRunItem"},
			},
		},
	}
}
