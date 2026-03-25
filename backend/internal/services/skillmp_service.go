package services

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// SkillMPService fetches skill content from SkillMP endpoints.
type SkillMPService struct {
	baseURL      string
	defaultToken string
	httpClient   *http.Client
}

// SkillMPFetchInput defines how to access a skill from SkillMP.
type SkillMPFetchInput struct {
	URL     string
	SkillID string
	Token   string
}

// NewSkillMPService creates a SkillMP integration service.
func NewSkillMPService(baseURL string, defaultToken string) *SkillMPService {
	base := strings.TrimSpace(baseURL)
	if base == "" {
		base = "https://skillsmp.com"
	}
	return &SkillMPService{
		baseURL:      strings.TrimRight(base, "/"),
		defaultToken: strings.TrimSpace(defaultToken),
		httpClient: &http.Client{
			Timeout: 20 * time.Second,
		},
	}
}

// FetchSkill fetches and parses skill metadata and content from SkillMP.
func (s *SkillMPService) FetchSkill(ctx context.Context, input SkillMPFetchInput) (ExtractedSkill, string, error) {
	resolvedURL, err := s.resolveURL(input)
	if err != nil {
		return ExtractedSkill{}, "", err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, resolvedURL, nil)
	if err != nil {
		return ExtractedSkill{}, "", fmt.Errorf("failed to build request: %w", err)
	}
	req.Header.Set("Accept", "application/json, text/markdown, text/plain;q=0.9")

	token := strings.TrimSpace(input.Token)
	if token == "" {
		token = s.defaultToken
	}
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return ExtractedSkill{}, "", fmt.Errorf("failed to request SkillMP: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return ExtractedSkill{}, "", fmt.Errorf("failed to read SkillMP response: %w", err)
	}
	if resp.StatusCode >= http.StatusBadRequest {
		return ExtractedSkill{}, "", fmt.Errorf("SkillMP returned status %d", resp.StatusCode)
	}

	contentType := strings.ToLower(resp.Header.Get("Content-Type"))
	if strings.Contains(contentType, "application/json") || looksLikeJSON(body) {
		meta, err := parseSkillMPJSON(body)
		if err != nil {
			return ExtractedSkill{}, "", err
		}
		meta.Analysis = buildSkillMPJSONAnalysis(meta.Content)
		return meta, resolvedURL, nil
	}

	content := strings.TrimSpace(string(body))
	if content == "" {
		return ExtractedSkill{}, "", fmt.Errorf("SkillMP content is empty")
	}
	return ExtractedSkill{
		Name:        fallbackNameFromURL(extractTitleFromMarkdown(content), resolvedURL),
		Description: extractDescriptionFromMarkdown(content),
		Content:     content,
		Tags:        []string{"skillmp"},
		Analysis:    buildSkillMPMarkdownAnalysis(content),
	}, resolvedURL, nil
}

func (s *SkillMPService) resolveURL(input SkillMPFetchInput) (string, error) {
	if raw := strings.TrimSpace(input.URL); raw != "" {
		if _, err := url.ParseRequestURI(raw); err != nil {
			return "", fmt.Errorf("invalid skill url")
		}
		return raw, nil
	}

	skillID := strings.TrimSpace(input.SkillID)
	if skillID == "" {
		return "", fmt.Errorf("skill url or skill id is required")
	}
	return s.baseURL + "/api/v1/skills/" + url.PathEscape(skillID), nil
}

func parseSkillMPJSON(body []byte) (ExtractedSkill, error) {
	type skillMPResponse struct {
		Name        string   `json:"name"`
		Title       string   `json:"title"`
		Description string   `json:"description"`
		Summary     string   `json:"summary"`
		Content     string   `json:"content"`
		Markdown    string   `json:"markdown"`
		Body        string   `json:"body"`
		Tags        []string `json:"tags"`
		Labels      []string `json:"labels"`
	}

	var payload skillMPResponse
	if err := json.Unmarshal(body, &payload); err != nil {
		return ExtractedSkill{}, fmt.Errorf("failed to parse SkillMP json: %w", err)
	}

	content := firstNonEmptyString(payload.Content, payload.Markdown, payload.Body)
	content = strings.TrimSpace(content)
	if content == "" {
		return ExtractedSkill{}, fmt.Errorf("SkillMP json content is empty")
	}

	markdownContent, frontmatter, frontmatterErr := splitSkillMarkdownContent(content)
	hasFrontmatter := frontmatterErr == nil && hasMeaningfulSkillFrontmatter(frontmatter)
	markdownBody := content
	if hasFrontmatter {
		markdownBody = markdownContent
	}

	name := strings.TrimSpace(firstNonEmptyString(
		payload.Name,
		payload.Title,
		frontmatter.Name,
		extractTitleFromMarkdown(markdownBody),
	))
	if name == "" {
		name = "SkillMP Skill"
	}

	description := strings.TrimSpace(firstNonEmptyString(
		payload.Description,
		payload.Summary,
		frontmatter.Description,
		extractDescriptionFromMarkdown(markdownBody),
	))
	tags := normalizeTagSlice(append(payload.Tags, payload.Labels...))
	if len(tags) == 0 {
		tags = normalizeTagSlice(frontmatter.Tags)
	}
	if len(tags) == 0 {
		tags = []string{"skillmp"}
	}

	return ExtractedSkill{
		Name:        name,
		Description: description,
		Content:     content,
		Tags:        tags,
	}, nil
}

func looksLikeJSON(body []byte) bool {
	trimmed := strings.TrimSpace(string(body))
	if trimmed == "" {
		return false
	}
	return strings.HasPrefix(trimmed, "{") || strings.HasPrefix(trimmed, "[")
}

func fallbackNameFromURL(name string, rawURL string) string {
	if strings.TrimSpace(name) != "" {
		return strings.TrimSpace(name)
	}
	parsed, err := url.Parse(rawURL)
	if err != nil {
		return "SkillMP Skill"
	}
	base := strings.TrimSpace(strings.Trim(parsed.Path, "/"))
	if base == "" {
		return "SkillMP Skill"
	}
	segments := strings.Split(base, "/")
	last := strings.TrimSpace(segments[len(segments)-1])
	if last == "" {
		return "SkillMP Skill"
	}
	return last
}

func firstNonEmptyString(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return value
		}
	}
	return ""
}

func buildSkillMPJSONAnalysis(content string) SourceTopologySnapshot {
	metadataSources := []string{"skillmp.json", "skillmp.json.content"}
	if skillMPContentHasFrontmatter(content) {
		metadataSources = append(metadataSources, "skillmp.json.content.frontmatter")
	}
	return buildInlineSourceTopology("skillmp.json", content, "skillmp_json", metadataSources)
}

func buildSkillMPMarkdownAnalysis(content string) SourceTopologySnapshot {
	mechanism := "skillmp_markdown"
	metadataSources := []string{"skillmp.markdown"}
	if skillMPContentHasFrontmatter(content) {
		mechanism = "skillmp_markdown_frontmatter"
		metadataSources = append(metadataSources, "skillmp.markdown.frontmatter")
	}
	return buildInlineSourceTopology("SKILL.md", content, mechanism, metadataSources)
}

func skillMPContentHasFrontmatter(content string) bool {
	_, frontmatter, err := splitSkillMarkdownContent(content)
	return err == nil && hasMeaningfulSkillFrontmatter(frontmatter)
}
