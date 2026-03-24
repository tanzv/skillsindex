package services

import (
	"fmt"
	"sort"
	"strings"

	"skillsindex/internal/models"

	"github.com/getkin/kin-openapi/openapi3"
)

func extractAPIOperations(specID uint, document *openapi3.T) ([]models.APIOperation, error) {
	if document == nil || document.Paths == nil {
		return nil, fmt.Errorf("openapi document paths are required")
	}

	pathMap := document.Paths.Map()
	paths := make([]string, 0, len(pathMap))
	for path := range pathMap {
		paths = append(paths, path)
	}
	sort.Strings(paths)

	seenOperationIDs := make(map[string]string, len(paths))
	operations := make([]models.APIOperation, 0, len(paths))
	for _, path := range paths {
		pathItem := pathMap[path]
		for _, candidate := range listPathItemOperations(pathItem) {
			operationID := strings.TrimSpace(candidate.Operation.OperationID)
			if operationID == "" {
				return nil, fmt.Errorf("openapi operation id is required for %s %s", candidate.Method, path)
			}
			if existing, exists := seenOperationIDs[operationID]; exists {
				return nil, fmt.Errorf("duplicate openapi operation id %s for %s and %s %s", operationID, existing, candidate.Method, path)
			}
			seenOperationIDs[operationID] = candidate.Method + " " + path

			operations = append(operations, models.APIOperation{
				SpecID:      specID,
				OperationID: operationID,
				Method:      candidate.Method,
				Path:        path,
				TagGroup:    resolveOperationTagGroup(candidate.Operation),
				Summary:     strings.TrimSpace(candidate.Operation.Summary),
				Deprecated:  candidate.Operation.Deprecated,
				Visibility:  resolveOperationVisibility(path),
			})
		}
	}

	return operations, nil
}

type openAPIOperationCandidate struct {
	Method    string
	Operation *openapi3.Operation
}

func listPathItemOperations(pathItem *openapi3.PathItem) []openAPIOperationCandidate {
	if pathItem == nil {
		return nil
	}

	candidates := []openAPIOperationCandidate{
		{Method: "GET", Operation: pathItem.Get},
		{Method: "POST", Operation: pathItem.Post},
		{Method: "PUT", Operation: pathItem.Put},
		{Method: "PATCH", Operation: pathItem.Patch},
		{Method: "DELETE", Operation: pathItem.Delete},
		{Method: "HEAD", Operation: pathItem.Head},
		{Method: "OPTIONS", Operation: pathItem.Options},
		{Method: "TRACE", Operation: pathItem.Trace},
	}

	filtered := make([]openAPIOperationCandidate, 0, len(candidates))
	for _, candidate := range candidates {
		if candidate.Operation == nil {
			continue
		}
		filtered = append(filtered, candidate)
	}
	return filtered
}

func resolveOperationTagGroup(operation *openapi3.Operation) string {
	if operation == nil || len(operation.Tags) == 0 {
		return ""
	}
	return strings.TrimSpace(operation.Tags[0])
}

func resolveOperationVisibility(path string) string {
	clean := strings.ToLower(strings.TrimSpace(path))
	switch {
	case strings.HasPrefix(clean, "/api/v1/admin/"):
		return "internal"
	case strings.HasPrefix(clean, "/api/v1/account/"):
		return "account"
	default:
		return "public"
	}
}
