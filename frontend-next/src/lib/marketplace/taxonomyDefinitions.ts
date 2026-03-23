export interface MarketplaceTaxonomySubcategoryDefinition {
  slug: string;
  name: string;
  legacyCategorySlugs?: string[];
  legacySubcategorySlugs?: string[];
  keywords?: string[];
}

export interface MarketplaceTaxonomyCategoryDefinition {
  slug: string;
  name: string;
  description: string;
  subcategories: MarketplaceTaxonomySubcategoryDefinition[];
}

export interface MarketplaceTaxonomyClassification {
  category: MarketplaceTaxonomyCategoryDefinition;
  subcategory: MarketplaceTaxonomySubcategoryDefinition;
}

export interface MarketplaceClassificationInput {
  rawCategory: string;
  rawSubcategory: string;
  rawLabel: string;
  rawDescription: string;
  tags?: string[];
  sourceType?: string;
}

export const marketplaceTaxonomy: MarketplaceTaxonomyCategoryDefinition[] = [
  {
    slug: "productivity-writing",
    name: "Productivity & Writing",
    description: "Document workflows, notes, schedules, and task-oriented assistants.",
    subcategories: [
      {
        slug: "pdf-documents",
        name: "PDF & Documents",
        legacyCategorySlugs: ["documentation"],
        legacySubcategorySlugs: ["documents", "technical-docs"],
        keywords: ["pdf", "document", "docs", "contract", "report"]
      },
      {
        slug: "notes-pkm",
        name: "Notes & PKM",
        legacyCategorySlugs: ["documentation"],
        legacySubcategorySlugs: ["knowledge-base"],
        keywords: ["notes", "knowledge", "wiki", "pkm", "memo"]
      },
      {
        slug: "calendar-scheduling",
        name: "Calendar & Scheduling",
        keywords: ["calendar", "schedule", "scheduling", "timeline", "meeting"]
      },
      {
        slug: "productivity-tasks",
        name: "Productivity & Tasks",
        legacyCategorySlugs: ["business"],
        legacySubcategorySlugs: ["project-management", "business-apps"],
        keywords: ["productivity", "task", "workflow", "project", "kanban"]
      }
    ]
  },
  {
    slug: "design-art",
    name: "Design & Art",
    description: "Visual creation, media production, and design-oriented skill workflows.",
    subcategories: [
      {
        slug: "image-video-generation",
        name: "Image & Video Generation",
        legacyCategorySlugs: ["content-media"],
        legacySubcategorySlugs: ["design"],
        keywords: ["image", "video", "design", "art", "visual", "illustration"]
      },
      {
        slug: "media-streaming",
        name: "Media & Streaming",
        legacyCategorySlugs: ["content-media"],
        legacySubcategorySlugs: ["media"],
        keywords: ["media", "stream", "audio", "podcast", "broadcast"]
      }
    ]
  },
  {
    slug: "education-learning",
    name: "Education & Learning",
    description: "Teaching, enablement, and guided learning programs for teams and individuals.",
    subcategories: [
      {
        slug: "education-learning",
        name: "Education & Learning",
        legacyCategorySlugs: ["documentation"],
        legacySubcategorySlugs: ["education"],
        keywords: ["education", "learning", "tutorial", "training", "course"]
      }
    ]
  },
  {
    slug: "lifestyle-health",
    name: "Lifestyle & Health",
    description: "Wellness, routines, personal growth, and real-world daily support tools.",
    subcategories: [
      {
        slug: "health-fitness",
        name: "Health & Fitness",
        legacyCategorySlugs: ["business", "lifestyle"],
        legacySubcategorySlugs: ["health-fitness", "wellness-health"],
        keywords: ["health", "fitness", "wellness"]
      },
      {
        slug: "personal-development",
        name: "Personal Development",
        legacyCategorySlugs: ["lifestyle"],
        legacySubcategorySlugs: ["literature-writing", "philosophy-ethics", "arts-crafts", "culinary-arts", "divination-mysticism"],
        keywords: ["personal", "habit", "journal", "writing", "self"]
      },
      {
        slug: "smart-home-iot",
        name: "Smart Home & IoT",
        keywords: ["iot", "smart home", "homekit", "sensor", "device"]
      },
      {
        slug: "transportation",
        name: "Transportation",
        keywords: ["transport", "travel", "route", "trip", "fleet"]
      }
    ]
  },
  {
    slug: "programming-development",
    name: "Programming & Development",
    description: "Coding workflows, agents, infra, security, and applied software delivery tracks.",
    subcategories: [
      {
        slug: "web-frontend-development",
        name: "Web & Frontend Development",
        legacyCategorySlugs: ["development"],
        legacySubcategorySlugs: ["frontend", "backend", "full-stack", "cms-platforms", "package-distribution", "ecommerce-development"],
        keywords: ["nextjs", "frontend", "backend", "full stack", "full-stack", "react", "vue", "svelte", "web", "ui"]
      },
      {
        slug: "coding-agents-ides",
        name: "Coding Agents & IDEs",
        legacyCategorySlugs: ["development", "tools"],
        legacySubcategorySlugs: ["architecture-patterns", "framework-internals", "ide-plugins", "debugging"],
        keywords: ["agent", "ide", "editor", "copilot", "code review", "pair programming"]
      },
      {
        slug: "browser-automation",
        name: "Browser & Automation",
        legacyCategorySlugs: ["tools", "testing-automation"],
        legacySubcategorySlugs: ["automation-tools", "browser-tasks", "workflow-regression", "testing", "assertion-library", "coverage-matrix"],
        keywords: ["browser", "automation", "playwright", "selenium", "e2e", "regression"]
      },
      {
        slug: "ai-llms",
        name: "AI & LLMs",
        legacyCategorySlugs: ["data-ai"],
        legacySubcategorySlugs: ["llm-ai", "machine-learning"],
        keywords: ["ai", "llm", "prompt", "rag", "embedding", "model", "ml"]
      },
      {
        slug: "cli-utilities",
        name: "CLI Utilities",
        legacyCategorySlugs: ["tools"],
        legacySubcategorySlugs: ["cli-tools", "system-admin", "productivity-tools", "domain-utilities"],
        keywords: ["cli", "terminal", "shell", "command", "unix", "console"]
      },
      {
        slug: "git-github",
        name: "Git & GitHub",
        legacyCategorySlugs: ["engineering", "devops"],
        legacySubcategorySlugs: ["repository", "repository-sync", "repository-guard", "git-workflows"],
        keywords: ["git", "github", "repo", "repository", "pull request", "commit"]
      },
      {
        slug: "devops-cloud",
        name: "DevOps & Cloud",
        legacyCategorySlugs: ["operations", "devops"],
        legacySubcategorySlugs: ["release", "recovery", "cloud", "containers", "cicd", "monitoring"],
        keywords: ["cloud", "deployment", "rollout", "rollback", "docker", "kubernetes", "infra", "devops"]
      },
      {
        slug: "security-passwords",
        name: "Security & Passwords",
        legacyCategorySlugs: ["testing-security"],
        legacySubcategorySlugs: ["security", "permission-validation", "policy-checks"],
        keywords: ["security", "auth", "permission", "password", "oauth", "sso", "secret"]
      },
      {
        slug: "ios-macos-development",
        name: "iOS & macOS Development",
        legacyCategorySlugs: ["development"],
        legacySubcategorySlugs: ["mobile"],
        keywords: ["ios", "macos", "swift", "xcode", "apple"]
      },
      {
        slug: "agent-to-agent-protocols",
        name: "Agent-to-Agent Protocols",
        keywords: ["protocol", "mcp", "a2a", "agent-to-agent"]
      }
    ]
  },
  {
    slug: "marketing-content",
    name: "Marketing & Content",
    description: "Campaign planning, publishing, and communication workflows.",
    subcategories: [
      {
        slug: "marketing-sales",
        name: "Marketing & Sales",
        legacyCategorySlugs: ["business", "content-media"],
        legacySubcategorySlugs: ["sales-marketing", "content-creation"],
        keywords: ["marketing", "sales", "campaign", "copy", "seo", "social"]
      },
      {
        slug: "communication",
        name: "Communication",
        keywords: ["communication", "email", "chat", "slack", "message", "notification"]
      }
    ]
  },
  {
    slug: "games-entertainment",
    name: "Games & Entertainment",
    description: "Interactive entertainment, gameplay tools, and audience-facing media companions.",
    subcategories: [
      {
        slug: "games",
        name: "Games",
        legacyCategorySlugs: ["development"],
        legacySubcategorySlugs: ["gaming"],
        keywords: ["game", "gaming", "play"]
      }
    ]
  },
  {
    slug: "business-finance",
    name: "Business & Finance",
    description: "Revenue, shopping, payment, and business operating models.",
    subcategories: [
      {
        slug: "finance",
        name: "Finance",
        legacyCategorySlugs: ["business", "blockchain"],
        legacySubcategorySlugs: ["finance-investment", "payment", "web3-tools", "smart-contracts", "defi"],
        keywords: ["finance", "payment", "budget", "billing", "crypto", "blockchain", "defi"]
      },
      {
        slug: "shopping-ecommerce",
        name: "Shopping & E-commerce",
        legacyCategorySlugs: ["business"],
        legacySubcategorySlugs: ["ecommerce", "real-estate-legal"],
        keywords: ["shop", "shopping", "commerce", "retail", "store", "cart"]
      }
    ]
  },
  {
    slug: "translate",
    name: "Translate",
    description: "Speech, transcription, and localization flows for multilingual delivery.",
    subcategories: [
      {
        slug: "speech-transcription",
        name: "Speech & Transcription",
        keywords: ["speech", "transcription", "translate", "translation", "voice", "subtitle"]
      }
    ]
  },
  {
    slug: "research-analysis",
    name: "Research & Analysis",
    description: "Search, discovery, analytics, and data interpretation workflows.",
    subcategories: [
      {
        slug: "search-research",
        name: "Search & Research",
        legacyCategorySlugs: ["research"],
        legacySubcategorySlugs: ["academic", "scientific-computing", "lab-tools", "astronomy-physics", "bioinformatics", "computational-chemistry"],
        keywords: ["research", "search", "paper", "analysis", "discovery"]
      },
      {
        slug: "data-analytics",
        name: "Data & Analytics",
        legacyCategorySlugs: ["research", "databases", "data-ai"],
        legacySubcategorySlugs: ["data-analysis", "data-engineering", "sql-databases", "database-tools", "nosql-databases"],
        keywords: ["data", "analytics", "sql", "database", "warehouse", "bi"]
      }
    ]
  }
];

export const taxonomyCategoryLookup = new Map(marketplaceTaxonomy.map((category) => [category.slug, category]));
export const taxonomySubcategoryLookup = new Map(
  marketplaceTaxonomy.flatMap((category) => category.subcategories.map((subcategory) => [subcategory.slug, subcategory] as const))
);
export const taxonomyOrderLookup = new Map(
  marketplaceTaxonomy.flatMap((category, categoryIndex) =>
    category.subcategories.map((subcategory, subcategoryIndex) => [subcategory.slug, { categoryIndex, subcategoryIndex }] as const)
  )
);
