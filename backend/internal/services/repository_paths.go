package services

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

func resolvePathWithinBase(basePath string, relativePath string, label string) (string, error) {
	cleanBase := filepath.Clean(basePath)
	cleanRelative := strings.TrimSpace(relativePath)
	if cleanRelative == "" {
		return cleanBase, nil
	}

	cleanTarget := filepath.Clean(filepath.Join(cleanBase, cleanRelative))
	prefix := cleanBase + string(os.PathSeparator)
	if cleanTarget != cleanBase && !strings.HasPrefix(cleanTarget, prefix) {
		return "", fmt.Errorf("%s must stay within repository root", label)
	}

	return cleanTarget, nil
}
