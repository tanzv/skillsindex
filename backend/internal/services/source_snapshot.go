package services

import (
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"unicode/utf8"
)

const (
	defaultSourceFileListLimit = 64
	defaultSourceFileMaxBytes  = 256 * 1024
)

var (
	ErrSourceFilePathInvalid = errors.New("invalid source file path")
	ErrSourceFileNotFound    = errors.New("source file not found")
	ErrSourceFileTooLarge    = errors.New("source file too large")
	ErrSourceFileUnsupported = errors.New("source file is not previewable")
)

var previewableSourceExtensions = map[string]string{
	".cfg":  "Text",
	".conf": "Text",
	".ini":  "Text",
	".js":   "JavaScript",
	".json": "JSON",
	".jsx":  "JavaScript",
	".md":   "Markdown",
	".py":   "Python",
	".sh":   "Shell",
	".sql":  "SQL",
	".text": "Text",
	".toml": "TOML",
	".ts":   "TypeScript",
	".tsx":  "TypeScript",
	".txt":  "Text",
	".xml":  "XML",
	".yaml": "YAML",
	".yml":  "YAML",
}

var previewableSourceBaseNames = map[string]string{
	"dockerfile": "Dockerfile",
	"license":    "Text",
	"makefile":   "Makefile",
	"readme":     "Markdown",
}

type SourceFileSnapshot struct {
	Name      string
	SizeBytes int64
	SizeLabel string
	Language  string
}

type SourceFileContent struct {
	Name      string
	SizeBytes int64
	SizeLabel string
	Language  string
	Content   string
}

func normalizeSourceFileListLimit(limit int) int {
	if limit <= 0 {
		return defaultSourceFileListLimit
	}
	if limit > 200 {
		return 200
	}
	return limit
}

func normalizeSourceFileMaxBytes(limit int) int {
	if limit <= 0 {
		return defaultSourceFileMaxBytes
	}
	if limit > 1024*1024 {
		return 1024 * 1024
	}
	return limit
}

func inferSourceFileLanguage(fileName string) string {
	normalizedName := strings.ToLower(strings.TrimSpace(fileName))
	if language, ok := previewableSourceExtensions[filepath.Ext(normalizedName)]; ok {
		return language
	}
	baseName := strings.TrimSuffix(filepath.Base(normalizedName), filepath.Ext(normalizedName))
	if language, ok := previewableSourceBaseNames[baseName]; ok {
		return language
	}
	return "Text"
}

func FormatSourceFileSizeLabel(sizeBytes int64) string {
	normalizedSize := sizeBytes
	if normalizedSize < 64 {
		normalizedSize = 64
	}
	if normalizedSize < 1024*1024 {
		return fmt.Sprintf("%.1fKB", float64(normalizedSize)/1024.0)
	}
	return fmt.Sprintf("%.1fMB", float64(normalizedSize)/(1024.0*1024.0))
}

func isPreviewableSourceFile(fileName string) bool {
	normalizedName := strings.ToLower(strings.TrimSpace(fileName))
	if normalizedName == "" {
		return false
	}
	if _, ok := previewableSourceExtensions[filepath.Ext(normalizedName)]; ok {
		return true
	}
	baseName := strings.TrimSuffix(filepath.Base(normalizedName), filepath.Ext(normalizedName))
	_, ok := previewableSourceBaseNames[baseName]
	return ok
}

func resolveSourceBrowseRoot(basePath string, sourcePath string) (string, string, error) {
	if strings.TrimSpace(sourcePath) == "" {
		return basePath, resolveDefaultSourceFile(basePath), nil
	}

	resolvedPath, err := resolvePathWithinBase(basePath, sourcePath, "source path")
	if err != nil {
		return "", "", fmt.Errorf("%w: %v", ErrSourceFilePathInvalid, err)
	}
	info, err := os.Stat(resolvedPath)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return "", "", ErrSourceFileNotFound
		}
		return "", "", fmt.Errorf("failed to inspect source path: %w", err)
	}
	if info.IsDir() {
		return resolvedPath, resolveDefaultSourceFile(resolvedPath), nil
	}
	rootPath := filepath.Dir(resolvedPath)
	return rootPath, filepath.Base(resolvedPath), nil
}

func resolveDefaultSourceFile(rootPath string) string {
	manifest, _, err := readSkillManifest(rootPath)
	if err != nil {
		return ""
	}
	for _, candidate := range buildSkillContentCandidates(manifest.ContentFile) {
		resolvedPath, resolveErr := resolvePathWithinBase(rootPath, candidate, "content_file")
		if resolveErr != nil {
			continue
		}
		info, statErr := os.Stat(resolvedPath)
		if statErr == nil && !info.IsDir() {
			return filepath.ToSlash(candidate)
		}
	}
	return ""
}

func listSourceFiles(rootPath string, preferredFile string, limit int) ([]SourceFileSnapshot, error) {
	resolvedLimit := normalizeSourceFileListLimit(limit)
	files := make([]SourceFileSnapshot, 0, resolvedLimit)
	var stopWalk = errors.New("source file limit reached")

	err := filepath.WalkDir(rootPath, func(currentPath string, entry fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if entry.IsDir() {
			if entry.Name() == ".git" {
				return filepath.SkipDir
			}
			return nil
		}

		relativePath, err := filepath.Rel(rootPath, currentPath)
		if err != nil {
			return err
		}
		relativePath = filepath.ToSlash(relativePath)
		if !isPreviewableSourceFile(relativePath) {
			return nil
		}

		info, err := entry.Info()
		if err != nil {
			return err
		}
		files = append(files, SourceFileSnapshot{
			Name:      relativePath,
			SizeBytes: info.Size(),
			SizeLabel: FormatSourceFileSizeLabel(info.Size()),
			Language:  inferSourceFileLanguage(relativePath),
		})
		if len(files) >= resolvedLimit {
			return stopWalk
		}
		return nil
	})
	if err != nil && !errors.Is(err, stopWalk) {
		return nil, fmt.Errorf("failed to list source files: %w", err)
	}

	sort.Slice(files, func(leftIndex int, rightIndex int) bool {
		leftName := files[leftIndex].Name
		rightName := files[rightIndex].Name
		if preferredFile != "" {
			if leftName == preferredFile && rightName != preferredFile {
				return true
			}
			if rightName == preferredFile && leftName != preferredFile {
				return false
			}
		}
		return leftName < rightName
	})
	return files, nil
}

func readSourceFile(rootPath string, preferredFile string, requestedPath string, maxBytes int) (SourceFileContent, error) {
	targetPath := strings.TrimSpace(requestedPath)
	if targetPath == "" {
		targetPath = strings.TrimSpace(preferredFile)
	}
	if targetPath == "" {
		files, err := listSourceFiles(rootPath, preferredFile, 1)
		if err != nil {
			return SourceFileContent{}, err
		}
		if len(files) == 0 {
			return SourceFileContent{}, ErrSourceFileNotFound
		}
		targetPath = files[0].Name
	}
	if !isPreviewableSourceFile(targetPath) {
		return SourceFileContent{}, ErrSourceFileUnsupported
	}

	resolvedPath, err := resolvePathWithinBase(rootPath, filepath.FromSlash(targetPath), "source file path")
	if err != nil {
		return SourceFileContent{}, fmt.Errorf("%w: %v", ErrSourceFilePathInvalid, err)
	}
	info, err := os.Stat(resolvedPath)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return SourceFileContent{}, ErrSourceFileNotFound
		}
		return SourceFileContent{}, fmt.Errorf("failed to inspect source file: %w", err)
	}
	if info.IsDir() {
		return SourceFileContent{}, ErrSourceFilePathInvalid
	}
	if info.Size() > int64(normalizeSourceFileMaxBytes(maxBytes)) {
		return SourceFileContent{}, ErrSourceFileTooLarge
	}

	contentBytes, err := os.ReadFile(resolvedPath)
	if err != nil {
		return SourceFileContent{}, fmt.Errorf("failed to read source file: %w", err)
	}
	if !utf8.Valid(contentBytes) {
		return SourceFileContent{}, ErrSourceFileUnsupported
	}

	return SourceFileContent{
		Name:      filepath.ToSlash(targetPath),
		SizeBytes: info.Size(),
		SizeLabel: FormatSourceFileSizeLabel(info.Size()),
		Language:  inferSourceFileLanguage(targetPath),
		Content:   string(contentBytes),
	}, nil
}
