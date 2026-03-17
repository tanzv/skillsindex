package catalog

// Subcategory describes a child category under a top-level category.
type Subcategory struct {
	Slug string
	Name string
}

// Category describes a top-level category and its child categories.
type Category struct {
	Slug          string
	Name          string
	Description   string
	Subcategories []Subcategory
}

var categories = []Category{
	{
		Slug:        "operations",
		Name:        "Operations",
		Description: "Release, recovery, and execution workflows.",
		Subcategories: []Subcategory{
			{Slug: "release", Name: "Release"},
			{Slug: "recovery", Name: "Recovery"},
		},
	},
	{
		Slug:        "engineering",
		Name:        "Engineering",
		Description: "Repository automation and governance helpers.",
		Subcategories: []Subcategory{
			{Slug: "repository", Name: "Repository"},
		},
	},
	{
		Slug:        "tools",
		Name:        "Tools",
		Description: "Productivity, automation, CLI and systems utility skills.",
		Subcategories: []Subcategory{
			{Slug: "productivity-tools", Name: "Productivity Tools"},
			{Slug: "debugging", Name: "Debugging"},
			{Slug: "automation-tools", Name: "Automation Tools"},
			{Slug: "system-admin", Name: "System Administration"},
			{Slug: "ide-plugins", Name: "IDE Plugins"},
			{Slug: "cli-tools", Name: "CLI Tools"},
			{Slug: "domain-utilities", Name: "Domain Utilities"},
		},
	},
	{
		Slug:        "development",
		Name:        "Development",
		Description: "Frontend, backend, full-stack and architecture workflows.",
		Subcategories: []Subcategory{
			{Slug: "cms-platforms", Name: "CMS & Platform"},
			{Slug: "architecture-patterns", Name: "Architecture"},
			{Slug: "frontend", Name: "Frontend"},
			{Slug: "full-stack", Name: "Full Stack"},
			{Slug: "gaming", Name: "Game Development"},
			{Slug: "scripting", Name: "Scripting"},
			{Slug: "backend", Name: "Backend"},
			{Slug: "mobile", Name: "Mobile"},
			{Slug: "package-distribution", Name: "Package Distribution"},
			{Slug: "framework-internals", Name: "Framework Internals"},
			{Slug: "ecommerce-development", Name: "E-commerce Development"},
		},
	},
	{
		Slug:        "business",
		Name:        "Business",
		Description: "Business operations, sales, management and finance.",
		Subcategories: []Subcategory{
			{Slug: "sales-marketing", Name: "Sales & Marketing"},
			{Slug: "project-management", Name: "Project Management"},
			{Slug: "finance-investment", Name: "Finance & Investment"},
			{Slug: "health-fitness", Name: "Health & Fitness"},
			{Slug: "real-estate-legal", Name: "Real Estate & Legal"},
			{Slug: "business-apps", Name: "Business Apps"},
			{Slug: "payment", Name: "Payment"},
			{Slug: "ecommerce", Name: "E-commerce"},
		},
	},
	{
		Slug:        "data-ai",
		Name:        "Data & AI",
		Description: "LLM workflows, data engineering, analysis and ML.",
		Subcategories: []Subcategory{
			{Slug: "llm-ai", Name: "LLM & AI"},
			{Slug: "data-engineering", Name: "Data Engineering"},
			{Slug: "data-analysis", Name: "Data Analysis"},
			{Slug: "machine-learning", Name: "Machine Learning"},
		},
	},
	{
		Slug:        "devops",
		Name:        "DevOps",
		Description: "Git workflows, CI/CD, cloud and operational automation.",
		Subcategories: []Subcategory{
			{Slug: "git-workflows", Name: "Git Workflows"},
			{Slug: "cicd", Name: "CI/CD"},
			{Slug: "cloud", Name: "Cloud"},
			{Slug: "containers", Name: "Containers"},
			{Slug: "monitoring", Name: "Monitoring"},
		},
	},
	{
		Slug:        "testing-security",
		Name:        "Testing & Security",
		Description: "Code quality, test automation and security practices.",
		Subcategories: []Subcategory{
			{Slug: "code-quality", Name: "Code Quality"},
			{Slug: "testing", Name: "Testing"},
			{Slug: "security", Name: "Security"},
		},
	},
	{
		Slug:        "documentation",
		Name:        "Documentation",
		Description: "Knowledge base and technical documentation workflows.",
		Subcategories: []Subcategory{
			{Slug: "knowledge-base", Name: "Knowledge Base"},
			{Slug: "technical-docs", Name: "Technical Docs"},
			{Slug: "education", Name: "Education"},
		},
	},
	{
		Slug:        "content-media",
		Name:        "Content & Media",
		Description: "Content generation, design, media and document processing.",
		Subcategories: []Subcategory{
			{Slug: "content-creation", Name: "Content Creation"},
			{Slug: "documents", Name: "Documents"},
			{Slug: "design", Name: "Design"},
			{Slug: "media", Name: "Media"},
		},
	},
	{
		Slug:        "research",
		Name:        "Research",
		Description: "Scientific, academic and lab research skills.",
		Subcategories: []Subcategory{
			{Slug: "academic", Name: "Academic"},
			{Slug: "computational-chemistry", Name: "Computational Chemistry"},
			{Slug: "bioinformatics", Name: "Bioinformatics"},
			{Slug: "scientific-computing", Name: "Scientific Computing"},
			{Slug: "lab-tools", Name: "Lab Tools"},
			{Slug: "astronomy-physics", Name: "Astronomy & Physics"},
		},
	},
	{
		Slug:        "databases",
		Name:        "Databases",
		Description: "SQL, NoSQL and data platform operations.",
		Subcategories: []Subcategory{
			{Slug: "sql-databases", Name: "SQL Databases"},
			{Slug: "database-tools", Name: "Database Tools"},
			{Slug: "nosql-databases", Name: "NoSQL Databases"},
		},
	},
	{
		Slug:        "lifestyle",
		Name:        "Lifestyle",
		Description: "Personal productivity, writing and wellness oriented skills.",
		Subcategories: []Subcategory{
			{Slug: "divination-mysticism", Name: "Divination & Mysticism"},
			{Slug: "literature-writing", Name: "Literature & Writing"},
			{Slug: "philosophy-ethics", Name: "Philosophy & Ethics"},
			{Slug: "wellness-health", Name: "Wellness & Health"},
			{Slug: "arts-crafts", Name: "Arts & Crafts"},
			{Slug: "culinary-arts", Name: "Culinary Arts"},
		},
	},
	{
		Slug:        "blockchain",
		Name:        "Blockchain",
		Description: "Web3 tools, smart contracts and DeFi workflows.",
		Subcategories: []Subcategory{
			{Slug: "web3-tools", Name: "Web3 Tools"},
			{Slug: "smart-contracts", Name: "Smart Contracts"},
			{Slug: "defi", Name: "DeFi"},
		},
	},
}

// Categories returns all top-level and subcategory definitions.
func Categories() []Category {
	copied := make([]Category, len(categories))
	copy(copied, categories)
	return copied
}

// FindCategory returns the category definition by slug.
func FindCategory(slug string) (Category, bool) {
	for _, category := range categories {
		if category.Slug == slug {
			return category, true
		}
	}
	return Category{}, false
}

// FindSubcategory returns a subcategory definition by slug.
func FindSubcategory(slug string) (Subcategory, bool) {
	for _, category := range categories {
		for _, subcategory := range category.Subcategories {
			if subcategory.Slug == slug {
				return subcategory, true
			}
		}
	}
	return Subcategory{}, false
}
