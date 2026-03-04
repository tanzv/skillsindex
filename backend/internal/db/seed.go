package db

import (
	"fmt"
	"strings"
	"time"

	"skillsindex/internal/models"

	"gorm.io/gorm"
)

// EnsureSeedData inserts demo marketplace data when database is empty.
func EnsureSeedData(database *gorm.DB) error {
	var total int64
	if err := database.Model(&models.Skill{}).Count(&total).Error; err != nil {
		return fmt.Errorf("failed to count skills: %w", err)
	}
	if total > 0 {
		return nil
	}

	owner := models.User{
		Username:     "marketbot",
		PasswordHash: "disabled-login",
		Role:         models.RoleViewer,
	}
	if err := database.Where("username = ?", owner.Username).FirstOrCreate(&owner).Error; err != nil {
		return fmt.Errorf("failed to create seed owner: %w", err)
	}

	now := time.Now().UTC()
	type seedSkill struct {
		Name            string
		Description     string
		Content         string
		CategorySlug    string
		SubcategorySlug string
		SourceType      models.SkillSourceType
		SourceURL       string
		RepoURL         string
		InstallCommand  string
		StarCount       int
		QualityScore    float64
		Tags            []string
		DaysAgo         int
	}

	seedSkills := []seedSkill{
		{
			Name:            "Go Service Blueprint",
			Description:     "Opinionated structure for production Go services.",
			Content:         "# Go Service Blueprint\n\nBuild API, worker, and cron in one clean layout.",
			CategorySlug:    "development",
			SubcategorySlug: "backend",
			SourceType:      models.SourceTypeRepository,
			SourceURL:       "https://github.com/example/go-service-blueprint",
			RepoURL:         "https://github.com/example/go-service-blueprint",
			InstallCommand:  "codex skill install github:example/go-service-blueprint",
			StarCount:       640,
			QualityScore:    9.2,
			Tags:            []string{"go", "api", "backend"},
			DaysAgo:         32,
		},
		{
			Name:            "LLM Prompt Ops",
			Description:     "Prompt evaluation and regression workflow for LLM apps.",
			Content:         "# LLM Prompt Ops\n\nVersion prompts and run automatic benchmark checks.",
			CategorySlug:    "data-ai",
			SubcategorySlug: "llm-ai",
			SourceType:      models.SourceTypeSkillMP,
			SourceURL:       "https://skillsmp.com/skills/llm-prompt-ops",
			RepoURL:         "",
			InstallCommand:  "codex skill install skillmp:llm-prompt-ops",
			StarCount:       1280,
			QualityScore:    9.6,
			Tags:            []string{"llm", "prompts", "evaluation"},
			DaysAgo:         11,
		},
		{
			Name:            "Kubernetes Incident Playbook",
			Description:     "Fast triage commands and checklists for K8s incidents.",
			Content:         "# Kubernetes Incident Playbook\n\nReduce MTTR with structured diagnosis workflow.",
			CategorySlug:    "devops",
			SubcategorySlug: "monitoring",
			SourceType:      models.SourceTypeRepository,
			SourceURL:       "https://github.com/example/k8s-incident-playbook",
			RepoURL:         "https://github.com/example/k8s-incident-playbook",
			InstallCommand:  "codex skill install github:example/k8s-incident-playbook",
			StarCount:       930,
			QualityScore:    9.1,
			Tags:            []string{"kubernetes", "sre", "incident"},
			DaysAgo:         58,
		},
		{
			Name:            "Markdown Knowledge Base Builder",
			Description:     "Convert fragmented notes into indexed technical docs.",
			Content:         "# Markdown Knowledge Base Builder\n\nGenerate a searchable handbook from markdown folders.",
			CategorySlug:    "documentation",
			SubcategorySlug: "knowledge-base",
			SourceType:      models.SourceTypeManual,
			SourceURL:       "",
			RepoURL:         "",
			InstallCommand:  "codex skill run kb-builder --source ./notes",
			StarCount:       475,
			QualityScore:    8.7,
			Tags:            []string{"docs", "knowledge", "markdown"},
			DaysAgo:         90,
		},
		{
			Name:            "SQL Query Clinic",
			Description:     "Review and optimize SQL query plans with proven templates.",
			Content:         "# SQL Query Clinic\n\nIdentify slow scans and improve indexes safely.",
			CategorySlug:    "databases",
			SubcategorySlug: "sql-databases",
			SourceType:      models.SourceTypeSkillMP,
			SourceURL:       "https://skillsmp.com/skills/sql-query-clinic",
			RepoURL:         "",
			InstallCommand:  "codex skill install skillmp:sql-query-clinic",
			StarCount:       812,
			QualityScore:    9.0,
			Tags:            []string{"sql", "performance", "postgres"},
			DaysAgo:         21,
		},
		{
			Name:            "React Design Sprint",
			Description:     "Turn product ideas into polished React UI prototypes.",
			Content:         "# React Design Sprint\n\nComponent architecture and visual system in one sprint.",
			CategorySlug:    "development",
			SubcategorySlug: "frontend",
			SourceType:      models.SourceTypeRepository,
			SourceURL:       "https://github.com/example/react-design-sprint",
			RepoURL:         "https://github.com/example/react-design-sprint",
			InstallCommand:  "codex skill install github:example/react-design-sprint",
			StarCount:       1198,
			QualityScore:    9.4,
			Tags:            []string{"react", "design-system", "frontend"},
			DaysAgo:         6,
		},
		{
			Name:            "MCP Server Starter",
			Description:     "Scaffold and harden MCP servers for external integrations.",
			Content:         "# MCP Server Starter\n\nBuild robust tool contracts and test harness quickly.",
			CategorySlug:    "tools",
			SubcategorySlug: "automation-tools",
			SourceType:      models.SourceTypeManual,
			SourceURL:       "",
			RepoURL:         "",
			InstallCommand:  "codex skill run mcp-starter",
			StarCount:       704,
			QualityScore:    8.9,
			Tags:            []string{"mcp", "automation", "integration"},
			DaysAgo:         14,
		},
		{
			Name:            "Security Threat Modeling Pack",
			Description:     "Structured threat modeling templates for product teams.",
			Content:         "# Security Threat Modeling Pack\n\nUse STRIDE and practical mitigation checklists.",
			CategorySlug:    "testing-security",
			SubcategorySlug: "security",
			SourceType:      models.SourceTypeSkillMP,
			SourceURL:       "https://skillsmp.com/skills/threat-modeling-pack",
			RepoURL:         "",
			InstallCommand:  "codex skill install skillmp:threat-modeling-pack",
			StarCount:       667,
			QualityScore:    9.1,
			Tags:            []string{"security", "threat-modeling", "risk"},
			DaysAgo:         40,
		},
		{
			Name:            "Founder Weekly Report",
			Description:     "Generate concise investor and team weekly updates.",
			Content:         "# Founder Weekly Report\n\nTurn raw activity logs into clear executive summaries.",
			CategorySlug:    "business",
			SubcategorySlug: "project-management",
			SourceType:      models.SourceTypeManual,
			SourceURL:       "",
			RepoURL:         "",
			InstallCommand:  "codex skill run founder-weekly --input ./updates",
			StarCount:       392,
			QualityScore:    8.4,
			Tags:            []string{"reporting", "management", "startup"},
			DaysAgo:         75,
		},
		{
			Name:            "Crypto Protocol Analyst",
			Description:     "Analyze token design, governance and on-chain economics.",
			Content:         "# Crypto Protocol Analyst\n\nStandardized checklist for protocol due diligence.",
			CategorySlug:    "blockchain",
			SubcategorySlug: "defi",
			SourceType:      models.SourceTypeSkillMP,
			SourceURL:       "https://skillsmp.com/skills/crypto-protocol-analyst",
			RepoURL:         "",
			InstallCommand:  "codex skill install skillmp:crypto-protocol-analyst",
			StarCount:       523,
			QualityScore:    8.8,
			Tags:            []string{"blockchain", "defi", "analysis"},
			DaysAgo:         28,
		},
		{
			Name:            "Paper to Production",
			Description:     "Convert ML research papers into reproducible pipelines.",
			Content:         "# Paper to Production\n\nBridge academic insights into production-ready experiments.",
			CategorySlug:    "research",
			SubcategorySlug: "machine-learning",
			SourceType:      models.SourceTypeRepository,
			SourceURL:       "https://github.com/example/paper-to-production",
			RepoURL:         "https://github.com/example/paper-to-production",
			InstallCommand:  "codex skill install github:example/paper-to-production",
			StarCount:       588,
			QualityScore:    9.0,
			Tags:            []string{"research", "ml", "pipeline"},
			DaysAgo:         47,
		},
		{
			Name:            "Visual Story Pack",
			Description:     "Build consistent narrative visuals for product launches.",
			Content:         "# Visual Story Pack\n\nDesign story arc, slides, social cards and launch pages.",
			CategorySlug:    "content-media",
			SubcategorySlug: "design",
			SourceType:      models.SourceTypeManual,
			SourceURL:       "",
			RepoURL:         "",
			InstallCommand:  "codex skill run visual-story-pack",
			StarCount:       344,
			QualityScore:    8.3,
			Tags:            []string{"design", "storytelling", "media"},
			DaysAgo:         63,
		},
	}

	for _, item := range seedSkills {
		createdAt := now.AddDate(0, 0, -item.DaysAgo)
		skill := models.Skill{
			OwnerID:         owner.ID,
			Name:            item.Name,
			Description:     item.Description,
			Content:         item.Content,
			CategorySlug:    item.CategorySlug,
			SubcategorySlug: item.SubcategorySlug,
			Visibility:      models.VisibilityPublic,
			SourceType:      item.SourceType,
			SourceURL:       item.SourceURL,
			RepoURL:         item.RepoURL,
			InstallCommand:  item.InstallCommand,
			StarCount:       item.StarCount,
			QualityScore:    item.QualityScore,
			CreatedAt:       createdAt,
			UpdatedAt:       createdAt,
		}
		if item.SourceURL != "" {
			t := createdAt
			skill.LastSyncedAt = &t
		}
		if err := database.Create(&skill).Error; err != nil {
			return fmt.Errorf("failed to create seed skill %s: %w", item.Name, err)
		}
		for _, rawTag := range item.Tags {
			tagName := strings.TrimSpace(strings.ToLower(rawTag))
			if tagName == "" {
				continue
			}
			tag := models.Tag{Name: tagName}
			if err := database.Where("name = ?", tagName).FirstOrCreate(&tag).Error; err != nil {
				return fmt.Errorf("failed to create seed tag %s: %w", tagName, err)
			}
			if err := database.Model(&skill).Association("Tags").Append(&tag); err != nil {
				return fmt.Errorf("failed to append seed tag %s: %w", tagName, err)
			}
		}
	}

	return nil
}
