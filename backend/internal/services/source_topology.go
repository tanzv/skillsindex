package services

import (
	"net/url"
	"os"
	"path"
	"path/filepath"
	"regexp"
	"slices"
	"strings"
)

var (
	markdownLinkPattern    = regexp.MustCompile(`\[[^\]]+\]\(([^)]+)\)`)
	inlineCodePattern      = regexp.MustCompile("`([^`\n]+)`")
	skillDependencyPattern = regexp.MustCompile(`\bsuperpowers:([a-z0-9]+(?:-[a-z0-9]+)*)\b`)
)

type SourceDependency struct {
	Kind   string `json:"kind"`
	Target string `json:"target"`
}

// SourceTopologySnapshot describes the primary source entry file and local references it points to.
type SourceTopologySnapshot struct {
	EntryFile       string
	Mechanism       string
	MetadataSources []string
	ReferencePaths  []string
	Dependencies    []SourceDependency
}

// SourceBrowseSnapshot combines previewable files with the parsed source topology.
type SourceBrowseSnapshot struct {
	Files    []SourceFileSnapshot
	Topology SourceTopologySnapshot
}

func buildSourceTopology(rootPath string, preferredFile string) (SourceTopologySnapshot, error) {
	entryFile := filepath.ToSlash(strings.TrimSpace(preferredFile))
	if entryFile == "" {
		return SourceTopologySnapshot{}, nil
	}

	resolvedEntryPath, err := resolvePathWithinBase(rootPath, filepath.FromSlash(entryFile), "source entry file")
	if err != nil {
		return SourceTopologySnapshot{}, err
	}
	contentBytes, err := os.ReadFile(resolvedEntryPath)
	if err != nil {
		return SourceTopologySnapshot{}, err
	}
	content := string(contentBytes)
	manifest, manifestFound, _ := readSkillManifest(rootPath)
	_, frontmatter, frontmatterErr := splitSkillMarkdownContent(content)
	hasFrontmatter := frontmatterErr == nil && hasMeaningfulSkillFrontmatter(frontmatter)
	referencePaths := extractSourceReferencePaths(rootPath, entryFile, content)

	return SourceTopologySnapshot{
		EntryFile:       entryFile,
		Mechanism:       resolveSourceMechanism(entryFile, manifestFound, hasFrontmatter),
		MetadataSources: resolveSourceMetadataSources(entryFile, manifestFound, manifest, hasFrontmatter),
		ReferencePaths:  referencePaths,
		Dependencies:    buildSourceDependencies(content, referencePaths),
	}, nil
}

func buildInlineSourceTopology(
	entryFile string,
	content string,
	mechanism string,
	metadataSources []string,
) SourceTopologySnapshot {
	normalizedEntryFile := filepath.ToSlash(strings.TrimSpace(entryFile))
	referencePaths := extractInlineReferencePaths(normalizedEntryFile, content)

	return SourceTopologySnapshot{
		EntryFile:       normalizedEntryFile,
		Mechanism:       strings.TrimSpace(mechanism),
		MetadataSources: normalizeMetadataSources(metadataSources, normalizedEntryFile),
		ReferencePaths:  referencePaths,
		Dependencies:    buildSourceDependencies(content, referencePaths),
	}
}

func extractSourceReferencePaths(rootPath string, entryFile string, content string) []string {
	return extractReferencePaths(entryFile, content, func(raw string) (string, bool) {
		return normalizeSourceReferencePath(rootPath, entryFile, raw)
	})
}

func extractInlineReferencePaths(entryFile string, content string) []string {
	return extractReferencePaths(entryFile, content, func(raw string) (string, bool) {
		return normalizeInlineReferencePath(entryFile, raw)
	})
}

func extractReferencePaths(
	entryFile string,
	content string,
	normalizer func(raw string) (string, bool),
) []string {
	references := make([]string, 0, 8)
	seen := make(map[string]struct{}, 8)

	appendReference := func(raw string) {
		normalized, ok := normalizer(raw)
		if !ok {
			return
		}
		if _, exists := seen[normalized]; exists {
			return
		}
		seen[normalized] = struct{}{}
		references = append(references, normalized)
	}

	for _, match := range markdownLinkPattern.FindAllStringSubmatch(content, -1) {
		if len(match) > 1 {
			appendReference(match[1])
		}
	}
	for _, match := range inlineCodePattern.FindAllStringSubmatch(content, -1) {
		if len(match) > 1 {
			appendReference(match[1])
		}
	}

	return references
}

func buildSourceDependencies(content string, referencePaths []string) []SourceDependency {
	dependencies := make([]SourceDependency, 0, len(referencePaths)+4)
	seen := make(map[string]struct{}, len(referencePaths)+4)

	appendDependency := func(kind string, target string) {
		normalizedKind := strings.TrimSpace(kind)
		normalizedTarget := strings.TrimSpace(target)
		if normalizedKind == "" || normalizedTarget == "" {
			return
		}
		key := normalizedKind + ":" + normalizedTarget
		if _, exists := seen[key]; exists {
			return
		}
		seen[key] = struct{}{}
		dependencies = append(dependencies, SourceDependency{
			Kind:   normalizedKind,
			Target: normalizedTarget,
		})
	}

	for _, referencePath := range referencePaths {
		appendDependency("file", referencePath)
	}
	for _, match := range skillDependencyPattern.FindAllStringSubmatch(content, -1) {
		if len(match) > 1 {
			appendDependency("skill", "superpowers:"+match[1])
		}
	}

	return dependencies
}

func normalizeSourceReferencePath(rootPath string, entryFile string, raw string) (string, bool) {
	candidatePath, ok := normalizeReferenceCandidatePath(entryFile, raw)
	if !ok {
		return "", false
	}

	resolvedPath, err := resolvePathWithinBase(rootPath, filepath.FromSlash(candidatePath), "source reference")
	if err != nil {
		return "", false
	}
	info, err := os.Stat(resolvedPath)
	if err != nil || info.IsDir() {
		return "", false
	}

	return filepath.ToSlash(candidatePath), true
}

func normalizeInlineReferencePath(entryFile string, raw string) (string, bool) {
	return normalizeReferenceCandidatePath(entryFile, raw)
}

func normalizeReferenceCandidatePath(entryFile string, raw string) (string, bool) {
	trimmed := strings.TrimSpace(raw)
	trimmed = strings.Trim(trimmed, "<>")
	if trimmed == "" {
		return "", false
	}
	if strings.HasPrefix(trimmed, "#") || strings.HasPrefix(trimmed, "/") {
		return "", false
	}

	if parsed, err := url.Parse(trimmed); err == nil {
		scheme := strings.ToLower(strings.TrimSpace(parsed.Scheme))
		if scheme != "" {
			return "", false
		}
	}

	trimmed = strings.Split(trimmed, "#")[0]
	trimmed = strings.Split(trimmed, "?")[0]
	trimmed = strings.TrimSpace(trimmed)
	if trimmed == "" {
		return "", false
	}

	entryDir := path.Dir(entryFile)
	if entryDir == "." {
		entryDir = ""
	}
	candidatePath := path.Clean(trimmed)
	if entryDir != "" {
		candidatePath = path.Clean(path.Join(entryDir, trimmed))
	}
	candidatePath = strings.Trim(candidatePath, "/")
	if candidatePath == "" || candidatePath == entryFile {
		return "", false
	}
	if !isPreviewableSourceFile(candidatePath) {
		return "", false
	}

	return filepath.ToSlash(candidatePath), true
}

func hasMeaningfulSkillFrontmatter(frontmatter skillFrontmatter) bool {
	return strings.TrimSpace(frontmatter.Name) != "" ||
		strings.TrimSpace(frontmatter.Description) != "" ||
		len(frontmatter.Tags) > 0
}

func resolveSourceMechanism(entryFile string, manifestFound bool, hasFrontmatter bool) string {
	baseName := strings.ToLower(filepath.Base(entryFile))
	switch {
	case manifestFound:
		return "skill_manifest"
	case baseName == "skill.md" && hasFrontmatter:
		return "skill_markdown_frontmatter"
	case baseName == "skill.md":
		return "skill_markdown"
	case baseName == "readme.md":
		return "readme_fallback"
	default:
		return "source_file"
	}
}

func resolveSourceMetadataSources(
	entryFile string,
	manifestFound bool,
	manifest skillManifest,
	hasFrontmatter bool,
) []string {
	sources := make([]string, 0, 3)
	if manifestFound {
		sources = append(sources, "skill.json")
		if strings.TrimSpace(manifest.ContentFile) != "" {
			sources = append(sources, "skill.json.content_file")
		}
	}
	if strings.EqualFold(filepath.Base(entryFile), "SKILL.md") && hasFrontmatter {
		sources = append(sources, "SKILL.md.frontmatter")
	}
	if len(sources) == 0 {
		sources = append(sources, filepath.Base(entryFile))
	}
	return normalizeMetadataSources(sources, entryFile)
}

func normalizeMetadataSources(sources []string, fallback string) []string {
	slices.Sort(sources)
	sources = slices.Compact(sources)
	if len(sources) > 0 {
		return sources
	}

	normalizedFallback := strings.TrimSpace(fallback)
	if normalizedFallback == "" {
		return nil
	}
	return []string{filepath.Base(normalizedFallback)}
}
