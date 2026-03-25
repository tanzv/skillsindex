package services

import (
	"context"
	"fmt"
	"os"
	"strings"
)

func (s *RepositorySyncService) withClonedRepository(
	ctx context.Context,
	source RepoSource,
	reader func(rootPath string, preferredFile string) error,
) error {
	source = NormalizeRepoSource(source)
	if strings.TrimSpace(source.URL) == "" {
		return fmt.Errorf("repository url is required")
	}

	tmpDir, err := os.MkdirTemp("", "skillsindex-repo-snapshot-*")
	if err != nil {
		return fmt.Errorf("failed to create temp dir: %w", err)
	}
	defer os.RemoveAll(tmpDir)

	if err := cloneRepository(ctx, source, tmpDir); err != nil {
		return err
	}

	rootPath, preferredFile, err := resolveSourceBrowseRoot(tmpDir, source.Path)
	if err != nil {
		return err
	}
	return reader(rootPath, preferredFile)
}

func (s *RepositorySyncService) ListFiles(
	ctx context.Context,
	source RepoSource,
	limit int,
) ([]SourceFileSnapshot, error) {
	var files []SourceFileSnapshot
	err := s.withClonedRepository(ctx, source, func(rootPath string, preferredFile string) error {
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

func (s *RepositorySyncService) DescribeSource(
	ctx context.Context,
	source RepoSource,
	limit int,
) (SourceBrowseSnapshot, error) {
	var snapshot SourceBrowseSnapshot
	err := s.withClonedRepository(ctx, source, func(rootPath string, preferredFile string) error {
		files, err := listSourceFiles(rootPath, preferredFile, limit)
		if err != nil {
			return err
		}
		topology, err := buildSourceTopology(rootPath, preferredFile)
		if err != nil {
			return err
		}
		snapshot = SourceBrowseSnapshot{
			Files:    files,
			Topology: topology,
		}
		return nil
	})
	if err != nil {
		return SourceBrowseSnapshot{}, err
	}
	return snapshot, nil
}

func (s *RepositorySyncService) ReadFile(
	ctx context.Context,
	source RepoSource,
	requestedPath string,
	maxBytes int,
) (SourceFileContent, error) {
	var result SourceFileContent
	err := s.withClonedRepository(ctx, source, func(rootPath string, preferredFile string) error {
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
