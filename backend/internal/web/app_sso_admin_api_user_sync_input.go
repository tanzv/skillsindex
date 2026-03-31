package web

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

func readAPIAdminSSOUsersSyncInput(r *http.Request) (apiAdminSSOUsersSyncInput, error) {
	input := apiAdminSSOUsersSyncInput{}
	contentType := strings.ToLower(strings.TrimSpace(r.Header.Get("Content-Type")))
	if strings.Contains(contentType, "application/json") {
		var payload struct {
			Provider            string          `json:"provider"`
			DisabledExternalIDs json.RawMessage `json:"disabled_external_ids"`
			ForceSignOut        *bool           `json:"force_sign_out"`
		}
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&payload); err != nil {
			return input, fmt.Errorf("invalid json payload: %w", err)
		}
		externalIDs, err := decodeAPIAdminSSODisabledExternalIDs(payload.DisabledExternalIDs)
		if err != nil {
			return input, err
		}
		input.Provider = normalizeSSOProvider(payload.Provider)
		input.DisabledExternalIDs = externalIDs
		input.ForceSignOut = payload.ForceSignOut
		return input, nil
	}

	if err := r.ParseForm(); err != nil {
		return input, fmt.Errorf("invalid form payload: %w", err)
	}
	input.Provider = normalizeSSOProvider(r.FormValue("provider"))
	input.DisabledExternalIDs = parseSSOExternalIDList(r.FormValue("disabled_external_ids"))
	if raw := strings.TrimSpace(r.FormValue("force_sign_out")); raw != "" {
		parsed := parseBoolFlag(raw, false)
		input.ForceSignOut = &parsed
	}
	return input, nil
}

func decodeAPIAdminSSODisabledExternalIDs(raw json.RawMessage) ([]string, error) {
	clean := strings.TrimSpace(string(raw))
	if clean == "" || clean == "null" {
		return []string{}, nil
	}
	if strings.HasPrefix(clean, "[") {
		var values []string
		if err := json.Unmarshal(raw, &values); err != nil {
			return nil, fmt.Errorf("invalid disabled_external_ids")
		}
		return parseSSOExternalIDList(strings.Join(values, ",")), nil
	}
	var value string
	if err := json.Unmarshal(raw, &value); err != nil {
		return nil, fmt.Errorf("invalid disabled_external_ids")
	}
	return parseSSOExternalIDList(value), nil
}
