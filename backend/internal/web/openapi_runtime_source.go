package web

import (
	"context"
	"errors"
	"fmt"
	"os"

	"skillsindex/internal/services"

	"gopkg.in/yaml.v3"
)

func loadCurrentOpenAPISpec(ctx context.Context, registry *services.APISpecRegistryService, serverURL string) (map[string]any, []byte, error) {
	if registry == nil {
		spec := buildOpenAPISpec(serverURL)
		raw, err := marshalOpenAPIYAML(spec)
		if err != nil {
			return nil, nil, err
		}
		return spec, raw, nil
	}

	current, err := registry.CurrentPublished(ctx)
	if err != nil {
		if errors.Is(err, services.ErrAPISpecNotFound) {
			spec := buildOpenAPISpec(serverURL)
			raw, marshalErr := marshalOpenAPIYAML(spec)
			if marshalErr != nil {
				return nil, nil, marshalErr
			}
			return spec, raw, nil
		}
		return nil, nil, err
	}

	raw, err := os.ReadFile(current.BundlePath)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to read current openapi snapshot: %w", err)
	}

	var spec map[string]any
	if err := yaml.Unmarshal(raw, &spec); err != nil {
		return nil, nil, fmt.Errorf("failed to decode current openapi snapshot: %w", err)
	}
	if len(serverURL) > 0 {
		spec["servers"] = []map[string]any{{"url": serverURL}}
		raw, err = marshalOpenAPIYAML(spec)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to marshal current openapi snapshot: %w", err)
		}
	}
	return spec, raw, nil
}
