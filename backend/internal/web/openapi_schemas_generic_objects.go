package web

func openAPISchemasGenericObjects() map[string]any {
	return map[string]any{
		"SuccessResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"ok": map[string]any{"type": "boolean"},
			},
		},
		"ObjectRequest": map[string]any{
			"type":                 "object",
			"additionalProperties": true,
		},
		"ObjectResponse": map[string]any{
			"type":                 "object",
			"additionalProperties": true,
		},
		"ErrorResponse": map[string]any{
			"type": "object",
			"properties": map[string]any{
				"error":      map[string]any{"type": "string"},
				"message":    map[string]any{"type": "string"},
				"request_id": map[string]any{"type": "string"},
			},
		},
	}
}
