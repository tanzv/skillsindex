package services

import (
	"fmt"
	"net/url"
	"os"
	"path/filepath"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
	"gopkg.in/yaml.v3"
)

func resolveAPISpecSourcePath(sourcePath string) (string, []string, error) {
	trimmed := strings.TrimSpace(sourcePath)
	if trimmed == "" {
		return "", nil, fmt.Errorf("api spec source path is required")
	}

	resolvedPath, err := filepath.Abs(trimmed)
	if err != nil {
		return "", nil, fmt.Errorf("failed to resolve api spec source path: %w", err)
	}

	allowedRoots, err := discoverAPISpecSourceRoots()
	if err != nil {
		return "", nil, err
	}
	if !isPathWithinAnyRoot(resolvedPath, allowedRoots) {
		return "", nil, fmt.Errorf("api spec source path must stay within repository openapi source roots")
	}
	return resolvedPath, allowedRoots, nil
}

func discoverAPISpecSourceRoots() ([]string, error) {
	cwd, err := os.Getwd()
	if err != nil {
		return nil, fmt.Errorf("failed to resolve working directory: %w", err)
	}

	dedup := make(map[string]struct{})
	roots := make([]string, 0, 4)
	for dir := cwd; ; dir = filepath.Dir(dir) {
		for _, candidate := range []string{
			filepath.Join(dir, "api", "openapi"),
			filepath.Join(dir, "backend", "api", "openapi"),
		} {
			info, statErr := os.Stat(candidate)
			if statErr != nil || !info.IsDir() {
				continue
			}
			resolved, absErr := filepath.Abs(candidate)
			if absErr != nil {
				continue
			}
			if _, exists := dedup[resolved]; exists {
				continue
			}
			dedup[resolved] = struct{}{}
			roots = append(roots, resolved)
		}

		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
	}

	if len(roots) == 0 {
		return nil, fmt.Errorf("repository openapi source roots not found")
	}
	return roots, nil
}

func loadOpenAPIDocument(sourcePath string, allowedRoots []string) (*openapi3.T, []byte, error) {
	loader := openapi3.NewLoader()
	loader.IsExternalRefsAllowed = true
	loader.ReadFromURIFunc = func(_ *openapi3.Loader, location *url.URL) ([]byte, error) {
		targetPath, err := resolveRestrictedOpenAPIRefPath(location, allowedRoots)
		if err != nil {
			return nil, err
		}
		raw, err := os.ReadFile(targetPath)
		if err != nil {
			return nil, fmt.Errorf("failed to read openapi ref: %w", err)
		}
		return raw, nil
	}

	document, err := loader.LoadFromFile(sourcePath)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to load openapi source: %w", err)
	}
	if err := document.Validate(loader.Context); err != nil {
		return nil, nil, fmt.Errorf("failed to validate openapi source: %w", err)
	}

	bundleRaw, err := yaml.Marshal(document)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to marshal bundled openapi document: %w", err)
	}

	return document, bundleRaw, nil
}

func resolveRestrictedOpenAPIRefPath(location *url.URL, allowedRoots []string) (string, error) {
	if location == nil {
		return "", fmt.Errorf("openapi ref location is required")
	}
	if location.Scheme != "" && location.Scheme != "file" {
		return "", fmt.Errorf("external refs are not allowed: %s", location.String())
	}

	targetPath := location.Path
	if targetPath == "" {
		targetPath = location.Opaque
	}
	if targetPath == "" {
		return "", fmt.Errorf("openapi ref path is empty")
	}

	resolvedPath, err := filepath.Abs(filepath.FromSlash(targetPath))
	if err != nil {
		return "", fmt.Errorf("failed to resolve openapi ref path: %w", err)
	}
	if !isPathWithinAnyRoot(resolvedPath, allowedRoots) {
		return "", fmt.Errorf("openapi ref path must stay within repository openapi source roots")
	}
	return resolvedPath, nil
}

func isPathWithinAnyRoot(targetPath string, allowedRoots []string) bool {
	for _, root := range allowedRoots {
		if isPathWithinRoot(targetPath, root) {
			return true
		}
	}
	return false
}

func isPathWithinRoot(targetPath string, root string) bool {
	resolvedTarget, targetErr := filepath.Abs(targetPath)
	resolvedRoot, rootErr := filepath.Abs(root)
	if targetErr != nil || rootErr != nil {
		return false
	}

	relative, err := filepath.Rel(resolvedRoot, resolvedTarget)
	if err != nil {
		return false
	}
	return relative == "." || (relative != ".." && !strings.HasPrefix(relative, ".."+string(filepath.Separator)))
}
