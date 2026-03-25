package services

import (
	"net/url"
	"path"
	"strings"
)

type repoSourceNormalizer func(RepoSource) (RepoSource, bool)

var repoSourceNormalizers = []repoSourceNormalizer{
	normalizeGitHubRepositorySource,
	normalizeRawGitHubRepositorySource,
	normalizeGitLabRepositorySource,
}

// NormalizeRepoSource converts supported repository page URLs into clone-ready sources.
func NormalizeRepoSource(source RepoSource) RepoSource {
	normalized := RepoSource{
		URL:    strings.TrimSpace(source.URL),
		Branch: strings.TrimSpace(source.Branch),
		Path:   strings.TrimSpace(source.Path),
	}
	if normalized.URL == "" {
		return normalized
	}

	for _, normalizer := range repoSourceNormalizers {
		if candidate, ok := normalizer(normalized); ok {
			return candidate
		}
	}
	return normalized
}

func normalizeGitHubRepositorySource(source RepoSource) (RepoSource, bool) {
	parsed, err := url.Parse(source.URL)
	if err != nil {
		return source, false
	}
	host := strings.ToLower(strings.TrimSpace(parsed.Host))
	if host != "github.com" && host != "www.github.com" {
		return source, false
	}

	segments := splitURLPathSegments(parsed.Path)
	if len(segments) < 2 {
		return source, false
	}

	repoBaseURL := buildGitHubRepoCloneURL(parsed.Scheme, host, segments[0], segments[1])
	if repoBaseURL == "" {
		return source, false
	}
	normalized := source
	normalized.URL = repoBaseURL

	if len(segments) < 4 {
		return normalized, true
	}

	switch segments[2] {
	case "tree":
		if normalized.Branch == "" {
			normalized.Branch = segments[3]
		}
		if normalized.Path == "" && len(segments) > 4 {
			normalized.Path = strings.Join(segments[4:], "/")
		}
	case "blob":
		if normalized.Branch == "" {
			normalized.Branch = segments[3]
		}
		if normalized.Path == "" && len(segments) > 4 {
			normalized.Path = normalizeBlobParentPath(strings.Join(segments[4:], "/"))
		}
	}

	return normalized, true
}

func normalizeRawGitHubRepositorySource(source RepoSource) (RepoSource, bool) {
	parsed, err := url.Parse(source.URL)
	if err != nil {
		return source, false
	}
	host := strings.ToLower(strings.TrimSpace(parsed.Host))
	if host != "raw.githubusercontent.com" {
		return source, false
	}

	segments := splitURLPathSegments(parsed.Path)
	if len(segments) < 4 {
		return source, false
	}

	normalized := source
	normalized.URL = "https://github.com/" + segments[0] + "/" + strings.TrimSuffix(segments[1], ".git") + ".git"
	if normalized.Branch == "" {
		normalized.Branch = segments[2]
	}
	if normalized.Path == "" && len(segments) > 3 {
		normalized.Path = normalizeBlobParentPath(strings.Join(segments[3:], "/"))
	}

	return normalized, true
}

func normalizeGitLabRepositorySource(source RepoSource) (RepoSource, bool) {
	parsed, err := url.Parse(source.URL)
	if err != nil {
		return source, false
	}
	host := strings.ToLower(strings.TrimSpace(parsed.Host))
	if host != "gitlab.com" && host != "www.gitlab.com" {
		return source, false
	}

	segments := splitURLPathSegments(parsed.Path)
	if len(segments) < 2 {
		return source, false
	}

	actionIndex := -1
	for index, segment := range segments {
		if segment == "-" {
			actionIndex = index
			break
		}
	}
	if actionIndex == -1 || actionIndex+2 >= len(segments) {
		return source, false
	}

	namespaceParts := segments[:actionIndex]
	if len(namespaceParts) < 2 {
		return source, false
	}
	repoName := namespaceParts[len(namespaceParts)-1]
	namespace := strings.Join(namespaceParts[:len(namespaceParts)-1], "/")

	normalized := source
	normalized.URL = buildGitLabRepoCloneURL(parsed.Scheme, host, namespace, repoName)
	switch segments[actionIndex+1] {
	case "tree":
		if normalized.Branch == "" {
			normalized.Branch = segments[actionIndex+2]
		}
		if normalized.Path == "" && len(segments) > actionIndex+3 {
			normalized.Path = strings.Join(segments[actionIndex+3:], "/")
		}
	case "blob", "raw":
		if normalized.Branch == "" {
			normalized.Branch = segments[actionIndex+2]
		}
		if normalized.Path == "" && len(segments) > actionIndex+3 {
			normalized.Path = normalizeBlobParentPath(strings.Join(segments[actionIndex+3:], "/"))
		}
	}

	return normalized, true
}

func splitURLPathSegments(value string) []string {
	rawSegments := strings.Split(strings.TrimSpace(value), "/")
	segments := make([]string, 0, len(rawSegments))
	for _, segment := range rawSegments {
		trimmed := strings.TrimSpace(segment)
		if trimmed == "" {
			continue
		}
		segments = append(segments, trimmed)
	}
	return segments
}

func buildGitHubRepoCloneURL(scheme string, host string, owner string, repo string) string {
	safeScheme := strings.TrimSpace(scheme)
	if safeScheme == "" {
		safeScheme = "https"
	}
	repoName := strings.TrimSuffix(strings.TrimSpace(repo), ".git")
	if strings.TrimSpace(owner) == "" || repoName == "" {
		return ""
	}
	return safeScheme + "://" + host + "/" + strings.TrimSpace(owner) + "/" + repoName + ".git"
}

func buildGitLabRepoCloneURL(scheme string, host string, namespace string, repo string) string {
	safeScheme := strings.TrimSpace(scheme)
	if safeScheme == "" {
		safeScheme = "https"
	}
	repoName := strings.TrimSuffix(strings.TrimSpace(repo), ".git")
	trimmedNamespace := strings.Trim(strings.TrimSpace(namespace), "/")
	if trimmedNamespace == "" || repoName == "" {
		return ""
	}
	return safeScheme + "://" + host + "/" + trimmedNamespace + "/" + repoName + ".git"
}

func normalizeBlobParentPath(value string) string {
	trimmed := strings.Trim(strings.TrimSpace(value), "/")
	if trimmed == "" {
		return ""
	}
	parent := strings.Trim(path.Dir(trimmed), "/")
	if parent == "." {
		return ""
	}
	return parent
}
