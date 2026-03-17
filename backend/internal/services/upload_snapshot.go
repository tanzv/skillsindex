package services

import (
	"archive/zip"
	"fmt"
	"os"
)

func (s *UploadService) withUnpackedArchive(
	zipPath string,
	reader func(rootPath string, preferredFile string) error,
) error {
	archiveReader, err := zip.OpenReader(zipPath)
	if err != nil {
		return fmt.Errorf("failed to open zip: %w", err)
	}
	defer archiveReader.Close()

	tmpDir, err := os.MkdirTemp("", "skillsindex-upload-snapshot-*")
	if err != nil {
		return fmt.Errorf("failed to create temp dir: %w", err)
	}
	defer os.RemoveAll(tmpDir)

	for _, file := range archiveReader.File {
		if err := unpackZipEntry(tmpDir, file); err != nil {
			return err
		}
	}

	return reader(tmpDir, resolveDefaultSourceFile(tmpDir))
}

func (s *UploadService) ListFiles(zipPath string, limit int) ([]SourceFileSnapshot, error) {
	var files []SourceFileSnapshot
	err := s.withUnpackedArchive(zipPath, func(rootPath string, preferredFile string) error {
		resolvedFiles, err := listSourceFiles(rootPath, preferredFile, limit)
		if err != nil {
			return err
		}
		files = resolvedFiles
		return nil
	})
	if err != nil {
		return nil, err
	}
	return files, nil
}

func (s *UploadService) ReadFile(zipPath string, requestedPath string, maxBytes int) (SourceFileContent, error) {
	var result SourceFileContent
	err := s.withUnpackedArchive(zipPath, func(rootPath string, preferredFile string) error {
		content, err := readSourceFile(rootPath, preferredFile, requestedPath, maxBytes)
		if err != nil {
			return err
		}
		result = content
		return nil
	})
	if err != nil {
		return SourceFileContent{}, err
	}
	return result, nil
}
