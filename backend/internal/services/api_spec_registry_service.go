package services

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"skillsindex/internal/models"

	"github.com/getkin/kin-openapi/openapi3"
	"gorm.io/gorm"
	"gopkg.in/yaml.v3"
)

var (
	// ErrAPISpecNotFound indicates the requested API spec record does not exist.
	ErrAPISpecNotFound = errors.New("api spec not found")
)

const apiSpecSourceTypeRepository = "repository"

// ImportAPISpecDraftInput defines one draft import request.
type ImportAPISpecDraftInput struct {
	Name        string
	Slug        string
	SourcePath  string
	ActorUserID uint
}

// ImportAPISpecDraftResult returns the persisted draft and bundle location.
type ImportAPISpecDraftResult struct {
	Spec       models.APISpec
	BundlePath string
}

// APISpecRegistryService manages OpenAPI draft import and validation.
type APISpecRegistryService struct {
	db         *gorm.DB
	storageDir string
}

// NewAPISpecRegistryService constructs an API spec registry service.
func NewAPISpecRegistryService(db *gorm.DB, storageDir string) *APISpecRegistryService {
	return &APISpecRegistryService{
		db:         db,
		storageDir: storageDir,
	}
}

// ImportDraft loads a repository-backed OpenAPI source file, validates it, and persists a draft record.
func (s *APISpecRegistryService) ImportDraft(ctx context.Context, input ImportAPISpecDraftInput) (ImportAPISpecDraftResult, error) {
	if s == nil || s.db == nil {
		return ImportAPISpecDraftResult{}, fmt.Errorf("api spec registry service is not configured")
	}

	name := strings.TrimSpace(input.Name)
	if name == "" {
		return ImportAPISpecDraftResult{}, fmt.Errorf("api spec name is required")
	}
	slug := strings.ToLower(strings.TrimSpace(input.Slug))
	if slug == "" {
		return ImportAPISpecDraftResult{}, fmt.Errorf("api spec slug is required")
	}
	sourcePath := strings.TrimSpace(input.SourcePath)
	if sourcePath == "" {
		return ImportAPISpecDraftResult{}, fmt.Errorf("api spec source path is required")
	}
	if input.ActorUserID == 0 {
		return ImportAPISpecDraftResult{}, fmt.Errorf("actor user id is required")
	}

	document, bundleRaw, err := loadOpenAPIDocument(sourcePath)
	if err != nil {
		return ImportAPISpecDraftResult{}, err
	}

	bundlePath, checksum, err := s.persistBundle(slug, bundleRaw)
	if err != nil {
		return ImportAPISpecDraftResult{}, err
	}

	version := resolveSpecVersion(document)
	spec := models.APISpec{
		Name:            name,
		Slug:            slug,
		SourceType:      apiSpecSourceTypeRepository,
		Status:          models.APISpecStatusDraft,
		SemanticVersion: version,
		IsCurrent:       false,
		SourcePath:      sourcePath,
		BundlePath:      bundlePath,
		Checksum:        checksum,
		CreatedBy:       input.ActorUserID,
	}
	if err := s.db.WithContext(ctx).Create(&spec).Error; err != nil {
		return ImportAPISpecDraftResult{}, fmt.Errorf("failed to persist api spec draft: %w", err)
	}

	return ImportAPISpecDraftResult{
		Spec:       spec,
		BundlePath: bundlePath,
	}, nil
}

// ValidateDraft re-validates the source document for a draft spec and marks it validated.
func (s *APISpecRegistryService) ValidateDraft(ctx context.Context, specID uint) (models.APISpec, error) {
	spec, err := s.getByID(ctx, specID)
	if err != nil {
		return models.APISpec{}, err
	}
	if _, _, err := loadOpenAPIDocument(spec.SourcePath); err != nil {
		return models.APISpec{}, err
	}

	spec.Status = models.APISpecStatusValidated
	if err := s.db.WithContext(ctx).Save(&spec).Error; err != nil {
		return models.APISpec{}, fmt.Errorf("failed to mark api spec validated: %w", err)
	}
	return spec, nil
}

// CurrentPublished returns the current published spec metadata.
func (s *APISpecRegistryService) CurrentPublished(ctx context.Context) (models.APISpec, error) {
	var spec models.APISpec
	err := s.db.WithContext(ctx).
		Where("is_current = ? AND status = ?", true, models.APISpecStatusPublished).
		Order("published_at DESC, id DESC").
		First(&spec).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return models.APISpec{}, ErrAPISpecNotFound
	}
	if err != nil {
		return models.APISpec{}, fmt.Errorf("failed to load current published api spec: %w", err)
	}
	return spec, nil
}

func (s *APISpecRegistryService) getByID(ctx context.Context, specID uint) (models.APISpec, error) {
	if specID == 0 {
		return models.APISpec{}, ErrAPISpecNotFound
	}

	var spec models.APISpec
	err := s.db.WithContext(ctx).First(&spec, specID).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return models.APISpec{}, ErrAPISpecNotFound
	}
	if err != nil {
		return models.APISpec{}, fmt.Errorf("failed to load api spec: %w", err)
	}
	return spec, nil
}

func (s *APISpecRegistryService) persistBundle(slug string, bundleRaw []byte) (string, string, error) {
	checksum := hashBytes(bundleRaw)
	targetDir := filepath.Join(s.storageDir, "specs", slug)
	if err := os.MkdirAll(targetDir, 0o755); err != nil {
		return "", "", fmt.Errorf("failed to create api spec bundle directory: %w", err)
	}

	fileName := fmt.Sprintf("%s-draft.yaml", time.Now().UTC().Format("20060102T150405Z"))
	targetPath := filepath.Join(targetDir, fileName)
	if err := os.WriteFile(targetPath, bundleRaw, 0o644); err != nil {
		return "", "", fmt.Errorf("failed to write api spec bundle: %w", err)
	}
	return targetPath, checksum, nil
}

func loadOpenAPIDocument(sourcePath string) (*openapi3.T, []byte, error) {
	loader := openapi3.NewLoader()
	loader.IsExternalRefsAllowed = true

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

func resolveSpecVersion(document *openapi3.T) string {
	if document == nil {
		return "0.1.0-draft"
	}
	version := strings.TrimSpace(document.Info.Version)
	if version == "" {
		return "0.1.0-draft"
	}
	return version
}

func hashBytes(value []byte) string {
	sum := sha256.Sum256(value)
	return hex.EncodeToString(sum[:])
}
