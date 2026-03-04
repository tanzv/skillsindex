package services

import (
	"archive/zip"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
)

// UploadService handles uploaded skill package parsing.
type UploadService struct{}

// NewUploadService creates a new upload service.
func NewUploadService() *UploadService {
	return &UploadService{}
}

// ExtractFromZipFile parses a zip archive and returns extracted skill data.
func (s *UploadService) ExtractFromZipFile(zipPath string) (ExtractedSkill, error) {
	reader, err := zip.OpenReader(zipPath)
	if err != nil {
		return ExtractedSkill{}, fmt.Errorf("failed to open zip: %w", err)
	}
	defer reader.Close()

	tmpDir, err := os.MkdirTemp("", "skillsindex-upload-*")
	if err != nil {
		return ExtractedSkill{}, fmt.Errorf("failed to create temp dir: %w", err)
	}
	defer os.RemoveAll(tmpDir)

	for _, file := range reader.File {
		if err := unpackZipEntry(tmpDir, file); err != nil {
			return ExtractedSkill{}, err
		}
	}

	return extractSkillFromDirectory(tmpDir)
}

func unpackZipEntry(root string, file *zip.File) error {
	cleanName := filepath.Clean(file.Name)
	if cleanName == "." || strings.HasPrefix(cleanName, "..") || filepath.IsAbs(cleanName) {
		return fmt.Errorf("invalid zip entry path: %s", file.Name)
	}

	target := filepath.Join(root, cleanName)
	cleanRoot := filepath.Clean(root)
	cleanTarget := filepath.Clean(target)
	prefix := cleanRoot + string(os.PathSeparator)
	if cleanTarget != cleanRoot && !strings.HasPrefix(cleanTarget, prefix) {
		return fmt.Errorf("invalid zip entry path: %s", file.Name)
	}

	if file.FileInfo().IsDir() {
		if err := os.MkdirAll(cleanTarget, 0o755); err != nil {
			return fmt.Errorf("failed to create directory: %w", err)
		}
		return nil
	}

	if err := os.MkdirAll(filepath.Dir(cleanTarget), 0o755); err != nil {
		return fmt.Errorf("failed to create parent directory: %w", err)
	}

	src, err := file.Open()
	if err != nil {
		return fmt.Errorf("failed to open zip entry: %w", err)
	}
	defer src.Close()

	dst, err := os.OpenFile(cleanTarget, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, file.Mode())
	if err != nil {
		return fmt.Errorf("failed to create output file: %w", err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, src); err != nil {
		return fmt.Errorf("failed to copy zip entry: %w", err)
	}
	return nil
}
