package web

import (
	"net/http"
	"strings"

	"gopkg.in/yaml.v3"
)

func buildOpenAPISpec(serverURL string) map[string]any {
	if strings.TrimSpace(serverURL) == "" {
		serverURL = "http://127.0.0.1:8080"
	}

	return map[string]any{
		"openapi": "3.0.3",
		"info": map[string]any{
			"title":       "SkillsIndex OpenAPI",
			"description": "Public, session, and dashboard APIs for skill search, interactions, API keys, and DingTalk integration.",
			"version":     "1.0.0",
		},
		"servers": []map[string]any{
			{"url": serverURL},
		},
		"tags": []map[string]any{
			{"name": "skills", "description": "Skill marketplace search APIs"},
			{"name": "oauth", "description": "Session-based personal OAuth APIs"},
			{"name": "interaction", "description": "Session-based skill interaction APIs"},
			{"name": "moderation", "description": "Moderation report and governance APIs"},
			{"name": "dashboard", "description": "Dashboard account and API key management APIs"},
		},
		"paths":      openAPIPaths(),
		"components": openAPIComponents(),
	}
}

func apiKeySecurity() []map[string]any {
	return []map[string]any{
		{"ApiKeyQuery": []string{}},
		{"BearerAuth": []string{}},
	}
}

func sessionSecurity() []map[string]any {
	return []map[string]any{
		{"SessionCookie": []string{}},
	}
}

func queryParam(name string, schemaType string, required bool, description string) map[string]any {
	return map[string]any{
		"name":        name,
		"in":          "query",
		"required":    required,
		"description": description,
		"schema": map[string]any{
			"type": schemaType,
		},
	}
}

func pathParam(name string, description string) map[string]any {
	return map[string]any{
		"name":        name,
		"in":          "path",
		"required":    true,
		"description": description,
		"schema": map[string]any{
			"type": "integer",
		},
	}
}

func jsonResponse(description string, schemaName string) map[string]any {
	return map[string]any{
		"description": description,
		"content": map[string]any{
			"application/json": map[string]any{
				"schema": map[string]any{
					"$ref": "#/components/schemas/" + schemaName,
				},
			},
		},
	}
}

func formRequestBody(schemaName string, required bool) map[string]any {
	return map[string]any{
		"required": required,
		"content": map[string]any{
			"application/x-www-form-urlencoded": map[string]any{
				"schema": map[string]any{
					"$ref": "#/components/schemas/" + schemaName,
				},
			},
		},
	}
}

func jsonRequestBody(schemaName string, required bool) map[string]any {
	return map[string]any{
		"required": required,
		"content": map[string]any{
			"application/json": map[string]any{
				"schema": map[string]any{
					"$ref": "#/components/schemas/" + schemaName,
				},
			},
		},
	}
}

func redirectResponse(description string) map[string]any {
	return simpleResponse(description)
}

func simpleResponse(description string) map[string]any {
	return map[string]any{
		"description": description,
	}
}

func resolveServerURL(r *http.Request) string {
	proto := strings.TrimSpace(r.Header.Get("X-Forwarded-Proto"))
	if proto == "" {
		if r.TLS != nil {
			proto = "https"
		} else {
			proto = "http"
		}
	}
	host := strings.TrimSpace(r.Host)
	if host == "" {
		host = "127.0.0.1:8080"
	}
	return proto + "://" + host
}

func marshalOpenAPIYAML(spec map[string]any) ([]byte, error) {
	return yaml.Marshal(spec)
}
