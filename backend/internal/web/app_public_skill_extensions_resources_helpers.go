package web

import (
	"net/http"
	"path"
	"strings"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

type apiPublicSkillResourceFile struct {
	Name        string `json:"name"`
	DisplayName string `json:"display_name"`
	SizeBytes   int    `json:"size_bytes"`
	SizeLabel   string `json:"size_label"`
	Language    string `json:"language"`
}

type apiPublicSkillResourcesResponse struct {
	SkillID         uint                         `json:"skill_id"`
	SourceType      string                       `json:"source_type"`
	SourceURL       string                       `json:"source_url"`
	RepoURL         string                       `json:"repo_url"`
	SourceBranch    string                       `json:"source_branch"`
	SourcePath      string                       `json:"source_path"`
	EntryFile       string                       `json:"entry_file"`
	Mechanism       string                       `json:"mechanism"`
	MetadataSources []string                     `json:"metadata_sources"`
	ReferenceCount  int                          `json:"reference_count"`
	ReferencePaths  []string                     `json:"reference_paths"`
	DependencyCount int                          `json:"dependency_count"`
	Dependencies    []services.SourceDependency  `json:"dependencies"`
	InstallCommand  string                       `json:"install_command"`
	UpdatedAt       time.Time                    `json:"updated_at"`
	FileCount       int                          `json:"file_count"`
	Files           []apiPublicSkillResourceFile `json:"files"`
}

func inferPublicSkillResourceFileName(skill models.Skill) string {
	sourcePath := strings.TrimSpace(skill.SourcePath)
	if sourcePath != "" {
		return sourcePath
	}
	content := strings.ToLower(strings.TrimSpace(skill.Content))
	if looksLikeSQLContent(content) {
		return "QUERY.sql"
	}
	return "SKILL.md"
}

func looksLikeSQLContent(content string) bool {
	if content == "" {
		return false
	}
	return strings.Contains(content, "select ") ||
		strings.Contains(content, "insert ") ||
		strings.Contains(content, "update ") ||
		strings.Contains(content, "delete ")
}

func inferPublicSkillResourceLanguage(skill models.Skill, fileName string) string {
	switch strings.ToLower(path.Ext(fileName)) {
	case ".sql":
		return "SQL"
	case ".md":
		return "Markdown"
	default:
		if looksLikeSQLContent(strings.ToLower(strings.TrimSpace(skill.Content))) {
			return "SQL"
		}
		return "Markdown"
	}
}

func formatPublicSkillResourceSizeLabel(content string) string {
	sizeBytes := len(strings.TrimSpace(content))
	return services.FormatSourceFileSizeLabel(int64(sizeBytes))
}

func buildFallbackPublicSkillResourceFiles(skill models.Skill) []apiPublicSkillResourceFile {
	fileName := inferPublicSkillResourceFileName(skill)
	return []apiPublicSkillResourceFile{
		{
			Name:        fileName,
			DisplayName: fileName,
			SizeBytes:   len(strings.TrimSpace(skill.Content)),
			SizeLabel:   formatPublicSkillResourceSizeLabel(skill.Content),
			Language:    inferPublicSkillResourceLanguage(skill, fileName),
		},
	}
}

func buildPublicSkillResourcesResponse(
	skill models.Skill,
	files []apiPublicSkillResourceFile,
	topology services.SourceTopologySnapshot,
) apiPublicSkillResourcesResponse {
	if len(files) == 0 {
		files = buildFallbackPublicSkillResourceFiles(skill)
	}
	entryFile := strings.TrimSpace(topology.EntryFile)
	if entryFile == "" {
		entryFile = inferPublicSkillResourceFileName(skill)
	}
	return apiPublicSkillResourcesResponse{
		SkillID:         skill.ID,
		SourceType:      string(skill.SourceType),
		SourceURL:       skill.SourceURL,
		RepoURL:         skill.RepoURL,
		SourceBranch:    skill.SourceBranch,
		SourcePath:      skill.SourcePath,
		EntryFile:       entryFile,
		Mechanism:       topology.Mechanism,
		MetadataSources: topology.MetadataSources,
		ReferenceCount:  len(topology.ReferencePaths),
		ReferencePaths:  topology.ReferencePaths,
		DependencyCount: len(topology.Dependencies),
		Dependencies:    topology.Dependencies,
		InstallCommand:  skill.InstallCommand,
		UpdatedAt:       skill.UpdatedAt,
		FileCount:       len(files),
		Files:           files,
	}
}

func fallbackSourceTopology(skill models.Skill) services.SourceTopologySnapshot {
	if restored, err := services.DeserializeSourceTopology(skill.SourceAnalysisJSON); err == nil {
		if strings.TrimSpace(restored.EntryFile) != "" ||
			strings.TrimSpace(restored.Mechanism) != "" ||
			len(restored.MetadataSources) > 0 ||
			len(restored.ReferencePaths) > 0 ||
			len(restored.Dependencies) > 0 {
			return restored
		}
	}
	return services.SourceTopologySnapshot{
		EntryFile:       inferPublicSkillResourceFileName(skill),
		Mechanism:       "fallback",
		MetadataSources: []string{inferPublicSkillResourceFileName(skill)},
	}
}

func (a *App) resolvePublicSkillResourceSnapshot(
	r *http.Request,
	skill models.Skill,
) ([]apiPublicSkillResourceFile, services.SourceTopologySnapshot) {
	switch skill.SourceType {
	case models.SourceTypeRepository:
		if a.repositoryService == nil {
			return buildFallbackPublicSkillResourceFiles(skill), fallbackSourceTopology(skill)
		}
		snapshot, err := a.repositoryService.DescribeSource(r.Context(), services.RepoSource{
			URL:    strings.TrimSpace(skill.SourceURL),
			Branch: strings.TrimSpace(skill.SourceBranch),
			Path:   strings.TrimSpace(skill.SourcePath),
		}, 64)
		if err != nil || len(snapshot.Files) == 0 {
			return buildFallbackPublicSkillResourceFiles(skill), fallbackSourceTopology(skill)
		}
		return toAPIPublicSkillResourceFiles(snapshot.Files), snapshot.Topology
	case models.SourceTypeUpload:
		if a.uploadService == nil {
			return buildFallbackPublicSkillResourceFiles(skill), fallbackSourceTopology(skill)
		}
		snapshot, err := a.uploadService.DescribeSource(strings.TrimSpace(skill.SourcePath), 64)
		if err != nil || len(snapshot.Files) == 0 {
			return buildFallbackPublicSkillResourceFiles(skill), fallbackSourceTopology(skill)
		}
		return toAPIPublicSkillResourceFiles(snapshot.Files), snapshot.Topology
	default:
		return buildFallbackPublicSkillResourceFiles(skill), fallbackSourceTopology(skill)
	}
}
