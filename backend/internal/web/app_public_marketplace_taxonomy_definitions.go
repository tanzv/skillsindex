package web

var publicMarketplaceTaxonomy = []marketplacePresentationCategoryDefinition{
	{
		Name:        "Productivity & Writing",
		Description: "Document workflows, notes, schedules, and task-oriented assistants.",
		Slug:        "productivity-writing",
		Subcategories: []marketplacePresentationSubcategoryDefinition{
			{Name: "PDF & Documents", Slug: "pdf-documents", LegacyCategorySlugs: []string{"documentation"}, LegacySubcategorySlugs: []string{"documents", "technical-docs"}, Keywords: []string{"pdf", "document", "docs", "contract", "report"}},
			{Name: "Notes & PKM", Slug: "notes-pkm", LegacyCategorySlugs: []string{"documentation"}, LegacySubcategorySlugs: []string{"knowledge-base"}, Keywords: []string{"notes", "knowledge", "wiki", "pkm", "memo"}},
			{Name: "Calendar & Scheduling", Slug: "calendar-scheduling", Keywords: []string{"calendar", "schedule", "scheduling", "timeline", "meeting"}},
			{Name: "Productivity & Tasks", Slug: "productivity-tasks", LegacyCategorySlugs: []string{"business"}, LegacySubcategorySlugs: []string{"project-management", "business-apps"}, Keywords: []string{"productivity", "task", "workflow", "project", "kanban"}},
		},
	},
	{
		Name:        "Design & Art",
		Description: "Visual creation, media production, and design-oriented skill workflows.",
		Slug:        "design-art",
		Subcategories: []marketplacePresentationSubcategoryDefinition{
			{Name: "Image & Video Generation", Slug: "image-video-generation", LegacyCategorySlugs: []string{"content-media"}, LegacySubcategorySlugs: []string{"design"}, Keywords: []string{"image", "video", "design", "art", "visual", "illustration"}},
			{Name: "Media & Streaming", Slug: "media-streaming", LegacyCategorySlugs: []string{"content-media"}, LegacySubcategorySlugs: []string{"media"}, Keywords: []string{"media", "stream", "audio", "podcast", "broadcast"}},
		},
	},
	{
		Name:        "Education & Learning",
		Description: "Teaching, enablement, and guided learning programs for teams and individuals.",
		Slug:        "education-learning",
		Subcategories: []marketplacePresentationSubcategoryDefinition{
			{Name: "Education & Learning", Slug: "education-learning", LegacyCategorySlugs: []string{"documentation"}, LegacySubcategorySlugs: []string{"education"}, Keywords: []string{"education", "learning", "tutorial", "training", "course"}},
		},
	},
	{
		Name:        "Lifestyle & Health",
		Description: "Wellness, routines, personal growth, and real-world daily support tools.",
		Slug:        "lifestyle-health",
		Subcategories: []marketplacePresentationSubcategoryDefinition{
			{Name: "Health & Fitness", Slug: "health-fitness", LegacyCategorySlugs: []string{"business", "lifestyle"}, LegacySubcategorySlugs: []string{"health-fitness", "wellness-health"}, Keywords: []string{"health", "fitness", "wellness"}},
			{Name: "Personal Development", Slug: "personal-development", LegacyCategorySlugs: []string{"lifestyle"}, LegacySubcategorySlugs: []string{"literature-writing", "philosophy-ethics", "arts-crafts", "culinary-arts", "divination-mysticism"}, Keywords: []string{"personal", "habit", "journal", "writing", "self"}},
			{Name: "Smart Home & IoT", Slug: "smart-home-iot", Keywords: []string{"iot", "smart home", "homekit", "sensor", "device"}},
			{Name: "Transportation", Slug: "transportation", Keywords: []string{"transport", "travel", "route", "trip", "fleet"}},
		},
	},
	{
		Name:        "Programming & Development",
		Description: "Coding workflows, agents, infra, security, and applied software delivery tracks.",
		Slug:        "programming-development",
		Subcategories: []marketplacePresentationSubcategoryDefinition{
			{Name: "Web & Frontend Development", Slug: "web-frontend-development", LegacyCategorySlugs: []string{"development"}, LegacySubcategorySlugs: []string{"frontend", "backend", "full-stack", "cms-platforms", "package-distribution", "ecommerce-development"}, Keywords: []string{"nextjs", "frontend", "backend", "full stack", "full-stack", "react", "vue", "svelte", "web", "ui"}},
			{Name: "Coding Agents & IDEs", Slug: "coding-agents-ides", LegacyCategorySlugs: []string{"development", "tools"}, LegacySubcategorySlugs: []string{"architecture-patterns", "framework-internals", "ide-plugins", "debugging"}, Keywords: []string{"agent", "ide", "editor", "copilot", "code review", "pair programming"}},
			{Name: "Browser & Automation", Slug: "browser-automation", LegacyCategorySlugs: []string{"tools", "testing-automation"}, LegacySubcategorySlugs: []string{"automation-tools", "browser-tasks", "workflow-regression", "testing", "assertion-library", "coverage-matrix"}, Keywords: []string{"browser", "automation", "playwright", "selenium", "e2e", "regression"}},
			{Name: "AI & LLMs", Slug: "ai-llms", LegacyCategorySlugs: []string{"data-ai"}, LegacySubcategorySlugs: []string{"llm-ai", "machine-learning"}, Keywords: []string{"ai", "llm", "prompt", "rag", "embedding", "model", "ml"}},
			{Name: "CLI Utilities", Slug: "cli-utilities", LegacyCategorySlugs: []string{"tools"}, LegacySubcategorySlugs: []string{"cli-tools", "system-admin", "productivity-tools", "domain-utilities"}, Keywords: []string{"cli", "terminal", "shell", "command", "unix", "console"}},
			{Name: "Git & GitHub", Slug: "git-github", LegacyCategorySlugs: []string{"engineering", "devops"}, LegacySubcategorySlugs: []string{"repository", "repository-sync", "repository-guard", "git-workflows"}, Keywords: []string{"git", "github", "repo", "repository", "pull request", "commit"}},
			{Name: "DevOps & Cloud", Slug: "devops-cloud", LegacyCategorySlugs: []string{"operations", "devops"}, LegacySubcategorySlugs: []string{"release", "recovery", "cloud", "containers", "cicd", "monitoring"}, Keywords: []string{"cloud", "deployment", "rollout", "rollback", "docker", "kubernetes", "infra", "devops"}},
			{Name: "Security & Passwords", Slug: "security-passwords", LegacyCategorySlugs: []string{"testing-security"}, LegacySubcategorySlugs: []string{"security", "permission-validation", "policy-checks"}, Keywords: []string{"security", "auth", "permission", "password", "oauth", "sso", "secret"}},
			{Name: "iOS & macOS Development", Slug: "ios-macos-development", LegacyCategorySlugs: []string{"development"}, LegacySubcategorySlugs: []string{"mobile"}, Keywords: []string{"ios", "macos", "swift", "xcode", "apple"}},
			{Name: "Agent-to-Agent Protocols", Slug: "agent-to-agent-protocols", Keywords: []string{"protocol", "mcp", "a2a", "agent-to-agent"}},
		},
	},
	{
		Name:        "Marketing & Content",
		Description: "Campaign planning, publishing, and communication workflows.",
		Slug:        "marketing-content",
		Subcategories: []marketplacePresentationSubcategoryDefinition{
			{Name: "Marketing & Sales", Slug: "marketing-sales", LegacyCategorySlugs: []string{"business", "content-media"}, LegacySubcategorySlugs: []string{"sales-marketing", "content-creation"}, Keywords: []string{"marketing", "sales", "campaign", "copy", "seo", "social"}},
			{Name: "Communication", Slug: "communication", Keywords: []string{"communication", "email", "chat", "slack", "message", "notification"}},
		},
	},
	{
		Name:        "Games & Entertainment",
		Description: "Interactive entertainment, gameplay tools, and audience-facing media companions.",
		Slug:        "games-entertainment",
		Subcategories: []marketplacePresentationSubcategoryDefinition{
			{Name: "Games", Slug: "games", LegacyCategorySlugs: []string{"development"}, LegacySubcategorySlugs: []string{"gaming"}, Keywords: []string{"game", "gaming", "play"}},
		},
	},
	{
		Name:        "Business & Finance",
		Description: "Revenue, shopping, payment, and business operating models.",
		Slug:        "business-finance",
		Subcategories: []marketplacePresentationSubcategoryDefinition{
			{Name: "Finance", Slug: "finance", LegacyCategorySlugs: []string{"business", "blockchain"}, LegacySubcategorySlugs: []string{"finance-investment", "payment", "web3-tools", "smart-contracts", "defi"}, Keywords: []string{"finance", "payment", "budget", "billing", "crypto", "blockchain", "defi"}},
			{Name: "Shopping & E-commerce", Slug: "shopping-ecommerce", LegacyCategorySlugs: []string{"business"}, LegacySubcategorySlugs: []string{"ecommerce", "real-estate-legal"}, Keywords: []string{"shop", "shopping", "commerce", "retail", "store", "cart"}},
		},
	},
	{
		Name:        "Translate",
		Description: "Translation, voice, and transcription workflows across written and spoken media.",
		Slug:        "translate",
		Subcategories: []marketplacePresentationSubcategoryDefinition{
			{Name: "Speech & Transcription", Slug: "speech-transcription", Keywords: []string{"speech", "transcription", "translate", "translation", "voice", "subtitle"}},
		},
	},
	{
		Name:        "Research & Analysis",
		Description: "Research discovery, analytical workflows, and data-heavy investigation tools.",
		Slug:        "research-analysis",
		Subcategories: []marketplacePresentationSubcategoryDefinition{
			{Name: "Search & Research", Slug: "search-research", LegacyCategorySlugs: []string{"research"}, LegacySubcategorySlugs: []string{"academic", "scientific-computing", "lab-tools", "astronomy-physics", "bioinformatics", "computational-chemistry"}, Keywords: []string{"research", "search", "paper", "analysis", "discovery"}},
			{Name: "Data & Analytics", Slug: "data-analytics", LegacyCategorySlugs: []string{"research", "databases", "data-ai"}, LegacySubcategorySlugs: []string{"data-analysis", "data-engineering", "sql-databases", "database-tools", "nosql-databases"}, Keywords: []string{"data", "analytics", "sql", "database", "warehouse", "bi"}},
		},
	},
}
