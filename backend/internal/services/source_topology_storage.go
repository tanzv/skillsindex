package services

import (
	"encoding/json"
	"fmt"
	"strings"
)

// SerializeSourceTopology stores topology snapshots in JSON for persistence.
func SerializeSourceTopology(snapshot SourceTopologySnapshot) (string, error) {
	if isEmptySourceTopology(snapshot) {
		return "", nil
	}

	payload, err := json.Marshal(snapshot)
	if err != nil {
		return "", fmt.Errorf("failed to serialize source topology: %w", err)
	}
	return string(payload), nil
}

// DeserializeSourceTopology restores one topology snapshot from persisted JSON.
func DeserializeSourceTopology(raw string) (SourceTopologySnapshot, error) {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return SourceTopologySnapshot{}, nil
	}

	var snapshot SourceTopologySnapshot
	if err := json.Unmarshal([]byte(trimmed), &snapshot); err != nil {
		return SourceTopologySnapshot{}, fmt.Errorf("failed to deserialize source topology: %w", err)
	}
	return snapshot, nil
}

func isEmptySourceTopology(snapshot SourceTopologySnapshot) bool {
	return strings.TrimSpace(snapshot.EntryFile) == "" &&
		strings.TrimSpace(snapshot.Mechanism) == "" &&
		len(snapshot.MetadataSources) == 0 &&
		len(snapshot.ReferencePaths) == 0 &&
		len(snapshot.Dependencies) == 0
}
