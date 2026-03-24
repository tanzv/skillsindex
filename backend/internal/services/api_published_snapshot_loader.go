package services

import (
	"encoding/json"
	"fmt"
	"os"

	"skillsindex/internal/models"

	"gopkg.in/yaml.v3"
)

func loadPublishedSnapshotMap(spec models.APISpec) (map[string]any, []byte, error) {
	raw, err := os.ReadFile(spec.BundlePath)
	if err != nil {
		sourcePath, allowedRoots, sourceErr := resolveAPISpecSourcePath(spec.SourcePath)
		if sourceErr != nil {
			return nil, nil, fmt.Errorf("failed to read published openapi snapshot: %w", err)
		}
		document, bundleRaw, loadErr := loadOpenAPIDocument(sourcePath, allowedRoots)
		if loadErr != nil {
			return nil, nil, fmt.Errorf("failed to read published openapi snapshot: %w; fallback source load failed: %v", err, loadErr)
		}
		raw = bundleRaw
		if document == nil {
			return nil, nil, fmt.Errorf("published openapi snapshot is empty")
		}
	}

	var specMap map[string]any
	if err := yaml.Unmarshal(raw, &specMap); err != nil {
		document, loadErr := loadOpenAPIDocumentFromPublishedSpec(spec)
		if loadErr != nil {
			return nil, nil, fmt.Errorf("failed to decode published openapi snapshot: %w; fallback source load failed: %v", err, loadErr)
		}
		jsonRaw, marshalErr := json.Marshal(document)
		if marshalErr != nil {
			return nil, nil, fmt.Errorf("failed to marshal published openapi snapshot: %w", marshalErr)
		}
		if err := json.Unmarshal(jsonRaw, &specMap); err != nil {
			return nil, nil, fmt.Errorf("failed to normalize published openapi snapshot: %w", err)
		}
		raw, err = yaml.Marshal(specMap)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to marshal published openapi snapshot yaml: %w", err)
		}
	}
	return specMap, raw, nil
}
