package web

var publicMarketplaceTaxonomy = []marketplacePresentationCategoryDefinition{
	{
		Slug: "productivity-writing",
		Subcategories: []marketplacePresentationSubcategoryDefinition{
			{Slug: "pdf-documents", LegacyCategorySlugs: []string{"documentation"}, LegacySubcategorySlugs: []string{"documents", "technical-docs"}, Keywords: []string{"pdf", "document", "docs", "contract", "report"}},
			{Slug: "notes-pkm", LegacyCategorySlugs: []string{"documentation"}, LegacySubcategorySlugs: []string{"knowledge-base"}, Keywords: []string{"notes", "knowledge", "wiki", "pkm", "memo"}},
			{Slug: "calendar-scheduling", Keywords: []string{"calendar", "schedule", "scheduling", "timeline", "meeting"}},
			{Slug: "productivity-tasks", LegacyCategorySlugs: []string{"business"}, LegacySubcategorySlugs: []string{"project-management", "business-apps"}, Keywords: []string{"productivity", "task", "workflow", "project", "kanban"}},
		},
	},
	{
		Slug: "design-art",
		Subcategories: []marketplacePresentationSubcategoryDefinition{
			{Slug: "image-video-generation", LegacyCategorySlugs: []string{"content-media"}, LegacySubcategorySlugs: []string{"design"}, Keywords: []string{"image", "video", "design", "art", "visual", "illustration"}},
			{Slug: "media-streaming", LegacyCategorySlugs: []string{"content-media"}, LegacySubcategorySlugs: []string{"media"}, Keywords: []string{"media", "stream", "audio", "podcast", "broadcast"}},
		},
	},
	{
		Slug: "education-learning",
		Subcategories: []marketplacePresentationSubcategoryDefinition{
			{Slug: "education-learning", LegacyCategorySlugs: []string{"documentation"}, LegacySubcategorySlugs: []string{"education"}, Keywords: []string{"education", "learning", "tutorial", "training", "course"}},
		},
	},
	{
		Slug: "lifestyle-health",
		Subcategories: []marketplacePresentationSubcategoryDefinition{
			{Slug: "health-fitness", LegacyCategorySlugs: []string{"business", "lifestyle"}, LegacySubcategorySlugs: []string{"health-fitness", "wellness-health"}, Keywords: []string{"health", "fitness", "wellness"}},
			{Slug: "personal-development", LegacyCategorySlugs: []string{"lifestyle"}, LegacySubcategorySlugs: []string{"literature-writing", "philosophy-ethics", "arts-crafts", "culinary-arts", "divination-mysticism"}, Keywords: []string{"personal", "habit", "journal", "writing", "self"}},
			{Slug: "smart-home-iot", Keywords: []string{"iot", "smart home", "homekit", "sensor", "device"}},
			{Slug: "transportation", Keywords: []string{"transport", "travel", "route", "trip", "fleet"}},
		},
	},
	{
		Slug: "programming-development",
		Subcategories: []marketplacePresentationSubcategoryDefinition{
			{Slug: "web-frontend-development", LegacyCategorySlugs: []string{"development"}, LegacySubcategorySlugs: []string{"frontend", "backend", "full-stack", "cms-platforms", "package-distribution", "ecommerce-development"}, Keywords: []string{"nextjs", "frontend", "backend", "full stack", "full-stack", "react", "vue", "svelte", "web", "ui"}},
			{Slug: "coding-agents-ides", LegacyCategorySlugs: []string{"development", "tools"}, LegacySubcategorySlugs: []string{"architecture-patterns", "framework-internals", "ide-plugins", "debugging"}, Keywords: []string{"agent", "ide", "editor", "copilot", "code review", "pair programming"}},
			{Slug: "browser-automation", LegacyCategorySlugs: []string{"tools", "testing-automation"}, LegacySubcategorySlugs: []string{"automation-tools", "browser-tasks", "workflow-regression", "testing", "assertion-library", "coverage-matrix"}, Keywords: []string{"browser", "automation", "playwright", "selenium", "e2e", "regression"}},
			{Slug: "ai-llms", LegacyCategorySlugs: []string{"data-ai"}, LegacySubcategorySlugs: []string{"llm-ai", "machine-learning"}, Keywords: []string{"ai", "llm", "prompt", "rag", "embedding", "model", "ml"}},
			{Slug: "cli-utilities", LegacyCategorySlugs: []string{"tools"}, LegacySubcategorySlugs: []string{"cli-tools", "system-admin", "productivity-tools", "domain-utilities"}, Keywords: []string{"cli", "terminal", "shell", "command", "unix", "console"}},
			{Slug: "git-github", LegacyCategorySlugs: []string{"engineering", "devops"}, LegacySubcategorySlugs: []string{"repository", "repository-sync", "repository-guard", "git-workflows"}, Keywords: []string{"git", "github", "repo", "repository", "pull request", "commit"}},
			{Slug: "devops-cloud", LegacyCategorySlugs: []string{"operations", "devops"}, LegacySubcategorySlugs: []string{"release", "recovery", "cloud", "containers", "cicd", "monitoring"}, Keywords: []string{"cloud", "deployment", "rollout", "rollback", "docker", "kubernetes", "infra", "devops"}},
			{Slug: "security-passwords", LegacyCategorySlugs: []string{"testing-security"}, LegacySubcategorySlugs: []string{"security", "permission-validation", "policy-checks"}, Keywords: []string{"security", "auth", "permission", "password", "oauth", "sso", "secret"}},
			{Slug: "ios-macos-development", LegacyCategorySlugs: []string{"development"}, LegacySubcategorySlugs: []string{"mobile"}, Keywords: []string{"ios", "macos", "swift", "xcode", "apple"}},
			{Slug: "agent-to-agent-protocols", Keywords: []string{"protocol", "mcp", "a2a", "agent-to-agent"}},
		},
	},
	{
		Slug: "marketing-content",
		Subcategories: []marketplacePresentationSubcategoryDefinition{
			{Slug: "marketing-sales", LegacyCategorySlugs: []string{"business", "content-media"}, LegacySubcategorySlugs: []string{"sales-marketing", "content-creation"}, Keywords: []string{"marketing", "sales", "campaign", "copy", "seo", "social"}},
			{Slug: "communication", Keywords: []string{"communication", "email", "chat", "slack", "message", "notification"}},
		},
	},
	{
		Slug: "games-entertainment",
		Subcategories: []marketplacePresentationSubcategoryDefinition{
			{Slug: "games", LegacyCategorySlugs: []string{"development"}, LegacySubcategorySlugs: []string{"gaming"}, Keywords: []string{"game", "gaming", "play"}},
		},
	},
	{
		Slug: "business-finance",
		Subcategories: []marketplacePresentationSubcategoryDefinition{
			{Slug: "finance", LegacyCategorySlugs: []string{"business", "blockchain"}, LegacySubcategorySlugs: []string{"finance-investment", "payment", "web3-tools", "smart-contracts", "defi"}, Keywords: []string{"finance", "payment", "budget", "billing", "crypto", "blockchain", "defi"}},
			{Slug: "shopping-ecommerce", LegacyCategorySlugs: []string{"business"}, LegacySubcategorySlugs: []string{"ecommerce", "real-estate-legal"}, Keywords: []string{"shop", "shopping", "commerce", "retail", "store", "cart"}},
		},
	},
	{
		Slug: "translate",
		Subcategories: []marketplacePresentationSubcategoryDefinition{
			{Slug: "speech-transcription", Keywords: []string{"speech", "transcription", "translate", "translation", "voice", "subtitle"}},
		},
	},
	{
		Slug: "research-analysis",
		Subcategories: []marketplacePresentationSubcategoryDefinition{
			{Slug: "search-research", LegacyCategorySlugs: []string{"research"}, LegacySubcategorySlugs: []string{"academic", "scientific-computing", "lab-tools", "astronomy-physics", "bioinformatics", "computational-chemistry"}, Keywords: []string{"research", "search", "paper", "analysis", "discovery"}},
			{Slug: "data-analytics", LegacyCategorySlugs: []string{"research", "databases", "data-ai"}, LegacySubcategorySlugs: []string{"data-analysis", "data-engineering", "sql-databases", "database-tools", "nosql-databases"}, Keywords: []string{"data", "analytics", "sql", "database", "warehouse", "bi"}},
		},
	},
}
