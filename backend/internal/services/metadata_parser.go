package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// ExtractedSkill is parsed metadata and content imported from upload/repository sources.
type ExtractedSkill struct {
	Name        string
	Description string
	Content     string
	Tags        []string
}

type skillManifest struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Tags        []string `json:"tags"`
	ContentFile string   `json:"content_file"`
}

func extractSkillFromDirectory(basePath string) (ExtractedSkill, error) {
	manifestPath := filepath.Join(basePath, "skill.json")
	manifest := skillManifest{}
	manifestFound := false

	if data, err := os.ReadFile(manifestPath); err == nil {
		if err := json.Unmarshal(data, &manifest); err != nil {
			return ExtractedSkill{}, fmt.Errorf("failed to parse skill.json: %w", err)
		}
		manifestFound = true
	} else if !errors.Is(err, os.ErrNotExist) {
		return ExtractedSkill{}, fmt.Errorf("failed to read skill.json: %w", err)
	}

	contentFile := strings.TrimSpace(manifest.ContentFile)
	if contentFile == "" {
		contentFile = "README.md"
	}

	content, err := readFileIfExists(filepath.Join(basePath, contentFile))
	if err != nil {
		return ExtractedSkill{}, err
	}
	if content == "" && contentFile != "README.md" {
		content, err = readFileIfExists(filepath.Join(basePath, "README.md"))
		if err != nil {
			return ExtractedSkill{}, err
		}
	}
	if strings.TrimSpace(content) == "" {
		return ExtractedSkill{}, fmt.Errorf("skill content is empty")
	}

	name := strings.TrimSpace(manifest.Name)
	if name == "" {
		name = extractTitleFromMarkdown(content)
	}
	if name == "" {
		name = filepath.Base(basePath)
	}

	description := strings.TrimSpace(manifest.Description)
	if description == "" {
		description = extractDescriptionFromMarkdown(content)
	}

	tags := normalizeTagSlice(manifest.Tags)
	if !manifestFound {
		tags = []string{}
	}

	return ExtractedSkill{
		Name:        name,
		Description: description,
		Content:     content,
		Tags:        tags,
	}, nil
}

func readFileIfExists(path string) (string, error) {
	data, err := os.ReadFile(path)
	if err == nil {
		return string(data), nil
	}
	if errors.Is(err, os.ErrNotExist) {
		return "", nil
	}
	return "", fmt.Errorf("failed to read %s: %w", path, err)
}

func extractTitleFromMarkdown(content string) string {
	lines := strings.Split(content, "\n")
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if strings.HasPrefix(trimmed, "#") {
			return strings.TrimSpace(strings.TrimLeft(trimmed, "#"))
		}
	}
	return ""
}

func extractDescriptionFromMarkdown(content string) string {
	lines := strings.Split(content, "\n")
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" || strings.HasPrefix(trimmed, "#") {
			continue
		}
		return trimmed
	}
	return ""
}
