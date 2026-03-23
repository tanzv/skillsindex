package web

import (
	"errors"
	"strings"
	"time"
)

var errInvalidTimeQuery = errors.New("invalid time query")

func parseOptionalAPITimeQuery(raw string) (*time.Time, error) {
	value := strings.TrimSpace(raw)
	if value == "" {
		return nil, nil
	}
	for _, layout := range []string{time.RFC3339, "2006-01-02"} {
		if parsed, err := time.Parse(layout, value); err == nil {
			normalized := parsed.UTC()
			return &normalized, nil
		}
	}
	return nil, errInvalidTimeQuery
}
