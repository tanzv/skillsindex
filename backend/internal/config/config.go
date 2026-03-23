package config

import (
	"bufio"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

// Config stores runtime options for the web application.
type Config struct {
	AppEnv              string
	ServerPort          string
	DatabaseURL         string
	SessionSecret       string
	SessionCookieSecure bool
	APIOnly             bool
	CORSAllowedOrigins  []string
	StoragePath         string
	AllowRegistration   bool
	AdminUsername       string
	AdminPassword       string
	AdminRole           string
	SkillMPBaseURL      string
	SkillMPToken        string
	DingTalkClientID    string
	DingTalkSecret      string
	DingTalkRedirect    string
	DingTalkScope       string
	DingTalkAuthBase    string
	DingTalkAPIBase     string
	APIKeys             []string
	RepoSyncEnabled     bool
	RepoSyncInterval    time.Duration
	RepoSyncTimeout     time.Duration
	RepoSyncBatchSize   int
}

// Load reads configuration from environment variables.
func Load() Config {
	loadDotEnvDefaults()

	cfg := Config{
		AppEnv:              firstNonEmpty(os.Getenv("APP_ENV"), "development"),
		ServerPort:          firstNonEmpty(os.Getenv("APP_PORT"), "8080"),
		DatabaseURL:         firstNonEmpty(os.Getenv("DATABASE_URL"), "postgres://postgres:postgres@localhost:5432/skillsindex?sslmode=disable"),
		SessionSecret:       firstNonEmpty(os.Getenv("SESSION_SECRET"), "change-me-in-production"),
		SessionCookieSecure: parseBoolEnv(os.Getenv("SESSION_COOKIE_SECURE"), false),
		APIOnly:             parseBoolEnv(os.Getenv("API_ONLY"), false),
		CORSAllowedOrigins:  parseListEnv(os.Getenv("CORS_ALLOWED_ORIGINS")),
		StoragePath:         firstNonEmpty(os.Getenv("STORAGE_PATH"), "./storage"),
		AllowRegistration:   parseBoolEnv(os.Getenv("ALLOW_REGISTRATION"), true),
		AdminUsername:       firstNonEmpty(os.Getenv("ADMIN_USERNAME"), "admin"),
		AdminPassword:       firstNonEmpty(os.Getenv("ADMIN_PASSWORD"), "Admin123456!"),
		AdminRole:           firstNonEmpty(os.Getenv("ADMIN_ROLE"), "super_admin"),
		SkillMPBaseURL:      firstNonEmpty(os.Getenv("SKILLMP_BASE_URL"), "https://skillsmp.com"),
		SkillMPToken:        strings.TrimSpace(os.Getenv("SKILLMP_TOKEN")),
		DingTalkClientID:    strings.TrimSpace(os.Getenv("DINGTALK_CLIENT_ID")),
		DingTalkSecret:      strings.TrimSpace(os.Getenv("DINGTALK_CLIENT_SECRET")),
		DingTalkRedirect:    firstNonEmpty(os.Getenv("DINGTALK_REDIRECT_URL"), "http://127.0.0.1:8080/auth/dingtalk/callback"),
		DingTalkScope:       firstNonEmpty(os.Getenv("DINGTALK_SCOPE"), "openid"),
		DingTalkAuthBase:    firstNonEmpty(os.Getenv("DINGTALK_AUTH_BASE_URL"), "https://login.dingtalk.com/oauth2/auth"),
		DingTalkAPIBase:     firstNonEmpty(os.Getenv("DINGTALK_API_BASE_URL"), "https://api.dingtalk.com"),
		APIKeys:             parseListEnv(os.Getenv("API_KEYS")),
		RepoSyncEnabled:     parseBoolEnv(os.Getenv("REPO_SYNC_ENABLED"), false),
		RepoSyncInterval:    parseDurationEnv(os.Getenv("REPO_SYNC_INTERVAL"), 30*time.Minute),
		RepoSyncTimeout:     parseDurationEnv(os.Getenv("REPO_SYNC_TIMEOUT"), 10*time.Minute),
		RepoSyncBatchSize:   parseIntEnv(os.Getenv("REPO_SYNC_BATCH_SIZE"), 20),
	}
	return cfg
}

// IsProduction reports whether current runtime environment is production.
func (c Config) IsProduction() bool {
	return strings.EqualFold(strings.TrimSpace(c.AppEnv), "production")
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return value
		}
	}
	return ""
}

func loadDotEnvDefaults() {
	for _, candidate := range dotEnvCandidates() {
		loadDotEnvFile(candidate)
	}
}

func dotEnvCandidates() []string {
	return []string{
		".env",
		filepath.Join("..", ".env"),
	}
}

func loadDotEnvFile(path string) {
	file, err := os.Open(path)
	if err != nil {
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		key, value, ok := parseDotEnvLine(line)
		if !ok || key == "" {
			continue
		}
		if _, exists := os.LookupEnv(key); exists {
			continue
		}

		_ = os.Setenv(key, value)
	}
}

func parseDotEnvLine(line string) (string, string, bool) {
	clean := strings.TrimSpace(line)
	clean = strings.TrimPrefix(clean, "export ")
	separatorIndex := strings.Index(clean, "=")
	if separatorIndex <= 0 {
		return "", "", false
	}

	key := strings.TrimSpace(clean[:separatorIndex])
	value := strings.TrimSpace(clean[separatorIndex+1:])
	value = strings.Trim(value, `"'`)
	return key, value, true
}

func parseBoolEnv(raw string, defaultValue bool) bool {
	value := strings.ToLower(strings.TrimSpace(raw))
	switch value {
	case "1", "true", "yes", "on":
		return true
	case "0", "false", "no", "off":
		return false
	default:
		return defaultValue
	}
}

func parseListEnv(raw string) []string {
	parts := strings.Split(raw, ",")
	result := make([]string, 0, len(parts))
	for _, item := range parts {
		token := strings.TrimSpace(item)
		if token == "" {
			continue
		}
		result = append(result, token)
	}
	return result
}

func parseDurationEnv(raw string, defaultValue time.Duration) time.Duration {
	clean := strings.TrimSpace(raw)
	if clean == "" {
		return defaultValue
	}
	value, err := time.ParseDuration(clean)
	if err != nil || value <= 0 {
		return defaultValue
	}
	return value
}

func parseIntEnv(raw string, defaultValue int) int {
	clean := strings.TrimSpace(raw)
	if clean == "" {
		return defaultValue
	}
	value, err := strconv.Atoi(clean)
	if err != nil || value <= 0 {
		return defaultValue
	}
	return value
}
