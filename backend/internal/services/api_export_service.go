package services

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"skillsindex/internal/models"

	"gopkg.in/yaml.v3"
	"gorm.io/gorm"
)

// CreateAPIExportInput defines one export artifact request.
type CreateAPIExportInput struct {
	ExportType  string
	Format      string
	Target      string
	ActorUserID uint
}

// CreateAPIExportResult returns the persisted audit record and generated artifact bytes.
type CreateAPIExportResult struct {
	Record      models.APIExportRecord `json:"record"`
	ArtifactRaw []byte                 `json:"artifact_raw"`
}

// APIExportService manages published OpenAPI export generation and audit records.
type APIExportService struct {
	db         *gorm.DB
	storageDir string
}

// NewAPIExportService constructs an export service.
func NewAPIExportService(db *gorm.DB, storageDir string) *APIExportService {
	return &APIExportService{
		db:         db,
		storageDir: storageDir,
	}
}

// ListCurrentExports returns export audit records for the current published spec.
func (s *APIExportService) ListCurrentExports(ctx context.Context) ([]models.APIExportRecord, error) {
	spec, err := getCurrentPublishedSpecRecord(ctx, s.db)
	if err != nil {
		return nil, err
	}

	var items []models.APIExportRecord
	if err := s.db.WithContext(ctx).
		Where("spec_id = ?", spec.ID).
		Order("created_at DESC, id DESC").
		Find(&items).Error; err != nil {
		return nil, fmt.Errorf("failed to list api export records: %w", err)
	}
	return items, nil
}

// CreateCurrentExport generates one export artifact for the current published spec and persists an audit record.
func (s *APIExportService) CreateCurrentExport(ctx context.Context, input CreateAPIExportInput) (CreateAPIExportResult, error) {
	if s == nil || s.db == nil {
		return CreateAPIExportResult{}, fmt.Errorf("api export service is not configured")
	}
	if input.ActorUserID == 0 {
		return CreateAPIExportResult{}, fmt.Errorf("actor user id is required")
	}

	spec, err := getCurrentPublishedSpecRecord(ctx, s.db)
	if err != nil {
		return CreateAPIExportResult{}, err
	}

	exportType := normalizeExportType(input.ExportType)
	if exportType == "" {
		return CreateAPIExportResult{}, fmt.Errorf("unsupported export type: %s", input.ExportType)
	}
	format := normalizeExportFormat(input.Format)
	if format == "" {
		return CreateAPIExportResult{}, fmt.Errorf("unsupported export format: %s", input.Format)
	}
	target := strings.TrimSpace(input.Target)
	if target == "" {
		target = "admin-download"
	}

	specMap, rawYAML, err := loadPublishedSnapshotMap(spec)
	if err != nil {
		return CreateAPIExportResult{}, err
	}

	artifactMap := specMap
	switch exportType {
	case "raw-published", "sdk-input":
		artifactMap = specMap
	case "public-subset":
		artifactMap, err = buildPublicSubsetOpenAPISpec(ctx, s.db, spec, specMap)
		if err != nil {
			return CreateAPIExportResult{}, err
		}
	default:
		return CreateAPIExportResult{}, fmt.Errorf("unsupported export type: %s", exportType)
	}

	artifactRaw, err := marshalExportArtifact(format, artifactMap, rawYAML)
	if err != nil {
		return CreateAPIExportResult{}, err
	}

	artifactPath, checksum, err := s.persistExportArtifact(spec.Slug, exportType, format, artifactRaw)
	if err != nil {
		return CreateAPIExportResult{}, err
	}

	record := models.APIExportRecord{
		SpecID:       spec.ID,
		ExportType:   exportType,
		Target:       target,
		Format:       format,
		ArtifactPath: artifactPath,
		Checksum:     hashBytes(artifactRaw),
		CreatedBy:    input.ActorUserID,
		CreatedAt:    time.Now().UTC(),
	}
	if checksum != record.Checksum {
		record.Checksum = checksum
	}
	if err := s.db.WithContext(ctx).Create(&record).Error; err != nil {
		return CreateAPIExportResult{}, fmt.Errorf("failed to persist api export record: %w", err)
	}

	return CreateAPIExportResult{
		Record:      record,
		ArtifactRaw: artifactRaw,
	}, nil
}

func normalizeExportType(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "raw-published":
		return "raw-published"
	case "public-subset":
		return "public-subset"
	case "sdk-input":
		return "sdk-input"
	default:
		return ""
	}
}

func normalizeExportFormat(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "json":
		return "json"
	case "yaml", "yml", "":
		return "yaml"
	default:
		return ""
	}
}

func marshalExportArtifact(format string, artifactMap map[string]any, rawYAML []byte) ([]byte, error) {
	switch format {
	case "json":
		raw, err := json.MarshalIndent(artifactMap, "", "  ")
		if err != nil {
			return nil, fmt.Errorf("failed to marshal api export json: %w", err)
		}
		return raw, nil
	case "yaml":
		if artifactMap == nil && len(rawYAML) > 0 {
			return rawYAML, nil
		}
		raw, err := yaml.Marshal(artifactMap)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal api export yaml: %w", err)
		}
		return raw, nil
	default:
		return nil, fmt.Errorf("unsupported export format: %s", format)
	}
}

func buildPublicSubsetOpenAPISpec(ctx context.Context, database *gorm.DB, spec models.APISpec, specMap map[string]any) (map[string]any, error) {
	cloned, err := cloneOpenAPISpecMap(specMap)
	if err != nil {
		return nil, err
	}

	publicPaths, err := listPublicExportPaths(ctx, database, spec.ID)
	if err != nil {
		return nil, err
	}

	pathValues, ok := cloned["paths"].(map[string]any)
	if !ok || pathValues == nil {
		cloned["paths"] = map[string]any{}
		return cloned, nil
	}

	filteredPaths := make(map[string]any)
	for path, value := range pathValues {
		if _, exists := publicPaths[path]; exists {
			filteredPaths[path] = value
		}
	}
	cloned["paths"] = filteredPaths
	if len(filteredPaths) == 0 {
		cloned["components"] = map[string]any{}
	}
	return cloned, nil
}

func listPublicExportPaths(ctx context.Context, database *gorm.DB, specID uint) (map[string]struct{}, error) {
	var operations []models.APIOperation
	if err := database.WithContext(ctx).
		Where("spec_id = ? AND visibility = ?", specID, "public").
		Find(&operations).Error; err != nil {
		return nil, fmt.Errorf("failed to query public api operations: %w", err)
	}

	var policies []models.APIOperationPolicy
	if err := database.WithContext(ctx).
		Where("spec_id = ?", specID).
		Find(&policies).Error; err != nil {
		return nil, fmt.Errorf("failed to query api export policies: %w", err)
	}
	policyByOperationID := make(map[string]*models.APIOperationPolicy, len(policies))
	for index := range policies {
		policy := policies[index]
		policyByOperationID[policy.OperationID] = &policy
	}

	allowedPaths := make(map[string]struct{})
	for _, operation := range operations {
		resolved := resolveAPIOperationPolicy(operation, policyByOperationID[operation.OperationID])
		if !resolved.ExportEnabled {
			continue
		}
		allowedPaths[operation.Path] = struct{}{}
	}
	return allowedPaths, nil
}

func cloneOpenAPISpecMap(specMap map[string]any) (map[string]any, error) {
	raw, err := json.Marshal(specMap)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal openapi spec for clone: %w", err)
	}

	var cloned map[string]any
	if err := json.Unmarshal(raw, &cloned); err != nil {
		return nil, fmt.Errorf("failed to clone openapi spec: %w", err)
	}
	return cloned, nil
}

func (s *APIExportService) persistExportArtifact(specSlug string, exportType string, format string, artifactRaw []byte) (string, string, error) {
	targetDir := filepath.Join(s.storageDir, "exports", specSlug, exportType)
	if err := os.MkdirAll(targetDir, 0o755); err != nil {
		return "", "", fmt.Errorf("failed to create api export directory: %w", err)
	}

	extension := "yaml"
	if format == "json" {
		extension = "json"
	}
	fileName := fmt.Sprintf("%s.%s", time.Now().UTC().Format("20060102T150405Z"), extension)
	artifactPath := filepath.Join(targetDir, fileName)
	if err := os.WriteFile(artifactPath, artifactRaw, 0o644); err != nil {
		return "", "", fmt.Errorf("failed to write api export artifact: %w", err)
	}
	return artifactPath, hashBytes(artifactRaw), nil
}

func sortStringKeys(values map[string]struct{}) []string {
	keys := make([]string, 0, len(values))
	for key := range values {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	return keys
}
