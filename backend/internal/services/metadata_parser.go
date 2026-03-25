package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"gopkg.in/yaml.v3"
)

// ExtractedSkill is parsed metadata and content imported from upload/repository sources.
type ExtractedSkill struct {
	Name        string
	Description string
	Content     string
	Tags        []string
	Analysis    SourceTopologySnapshot
}

type skillManifest struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Tags        []string `json:"tags"`
	ContentFile string   `json:"content_file"`
}

type skillFrontmatter struct {
	Name        string   `yaml:"name"`
	Description string   `yaml:"description"`
	Tags        []string `yaml:"tags"`
}

type extractedSkillContent struct {
	Body           string
	Frontmatter    skillFrontmatter
	FilePath       string
	HasFrontmatter bool
}

func extractSkillFromDirectory(basePath string) (ExtractedSkill, error) {
	return extractSkillFromRoot(basePath, "")
}

func extractSkillFromRoot(basePath string, preferredContentFile string) (ExtractedSkill, error) {
	manifest, _, err := readSkillManifest(basePath)
	if err != nil {
		return ExtractedSkill{}, err
	}

	content, err := extractSkillContent(basePath, preferredContentFile, manifest.ContentFile)
	if err != nil {
		return ExtractedSkill{}, err
	}

	name := strings.TrimSpace(manifest.Name)
	if name == "" {
		name = strings.TrimSpace(content.Frontmatter.Name)
	}
	if name == "" {
		name = extractTitleFromMarkdown(content.Body)
	}
	if name == "" {
		name = filepath.Base(basePath)
	}

	description := strings.TrimSpace(manifest.Description)
	if description == "" {
		description = strings.TrimSpace(content.Frontmatter.Description)
	}
	if description == "" {
		description = extractDescriptionFromMarkdown(content.Body)
	}

	tags := normalizeTagSlice(manifest.Tags)
	if len(tags) == 0 {
		tags = normalizeTagSlice(content.Frontmatter.Tags)
	}

	analysis, err := buildSourceTopology(basePath, content.FilePath)
	if err != nil {
		return ExtractedSkill{}, err
	}

	return ExtractedSkill{
		Name:        name,
		Description: description,
		Content:     content.Body,
		Tags:        tags,
		Analysis:    analysis,
	}, nil
}

func readSkillManifest(basePath string) (skillManifest, bool, error) {
	manifestPath := filepath.Join(basePath, "skill.json")
	manifest := skillManifest{}

	data, err := os.ReadFile(manifestPath)
	if err == nil {
		if err := json.Unmarshal(data, &manifest); err != nil {
			return skillManifest{}, false, fmt.Errorf("failed to parse skill.json: %w", err)
		}
		return manifest, true, nil
	}
	if errors.Is(err, os.ErrNotExist) {
		return manifest, false, nil
	}
	return skillManifest{}, false, fmt.Errorf("failed to read skill.json: %w", err)
}

func extractSkillContent(basePath string, preferredContentFile string, manifestContentFile string) (extractedSkillContent, error) {
	for _, candidate := range buildSkillContentCandidates(preferredContentFile, manifestContentFile) {
		resolvedPath, err := resolvePathWithinBase(basePath, candidate, "content_file")
		if err != nil {
			return extractedSkillContent{}, err
		}

		content, err := readFileIfExists(resolvedPath)
		if err != nil {
			return extractedSkillContent{}, err
		}
		if strings.TrimSpace(content) == "" {
			continue
		}

		if strings.EqualFold(filepath.Base(candidate), "SKILL.md") {
			body, frontmatter, err := splitSkillMarkdownContent(content)
			if err != nil {
				return extractedSkillContent{}, err
			}
			if strings.TrimSpace(body) == "" {
				continue
			}
			return extractedSkillContent{
				Body:           body,
				Frontmatter:    frontmatter,
				FilePath:       filepath.ToSlash(candidate),
				HasFrontmatter: hasMeaningfulSkillFrontmatter(frontmatter),
			}, nil
		}

		return extractedSkillContent{
			Body:     content,
			FilePath: filepath.ToSlash(candidate),
		}, nil
	}

	return extractedSkillContent{}, fmt.Errorf(
		"skill content is empty; provide a non-empty README.md, SKILL.md, or configure skill.json content_file",
	)
}

func buildSkillContentCandidates(values ...string) []string {
	candidates := make([]string, 0, 3)
	seen := make(map[string]struct{}, 3)
	appendCandidate := func(value string) {
		trimmed := strings.TrimSpace(value)
		if trimmed == "" {
			return
		}
		key := strings.ToLower(trimmed)
		if _, exists := seen[key]; exists {
			return
		}
		seen[key] = struct{}{}
		candidates = append(candidates, trimmed)
	}

	for _, value := range values {
		appendCandidate(value)
	}
	appendCandidate("README.md")
	appendCandidate("SKILL.md")
	return candidates
}

func splitSkillMarkdownContent(content string) (string, skillFrontmatter, error) {
	lines := strings.Split(content, "\n")
	if len(lines) < 3 || strings.TrimSpace(lines[0]) != "---" {
		return content, skillFrontmatter{}, nil
	}

	frontmatterEnd := -1
	for index := 1; index < len(lines); index++ {
		if strings.TrimSpace(lines[index]) == "---" {
			frontmatterEnd = index
			break
		}
	}
	if frontmatterEnd == -1 {
		return "", skillFrontmatter{}, fmt.Errorf("failed to parse SKILL.md frontmatter: missing closing delimiter")
	}

	frontmatter := skillFrontmatter{}
	if err := yaml.Unmarshal([]byte(strings.Join(lines[1:frontmatterEnd], "\n")), &frontmatter); err != nil {
		return "", skillFrontmatter{}, fmt.Errorf("failed to parse SKILL.md frontmatter: %w", err)
	}

	body := strings.Join(lines[frontmatterEnd+1:], "\n")
	return strings.TrimLeft(body, "\n"), frontmatter, nil
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
