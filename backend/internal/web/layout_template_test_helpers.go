package web

import (
	"html/template"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"skillsindex/internal/models"
)

func mustParseLayoutTemplate(t *testing.T) *template.Template {
	t.Helper()
	translations := defaultEnglishTranslations()

	tmpl, err := template.New("layout").Funcs(template.FuncMap{
		"tagNames": func(tags []models.Tag) string {
			names := make([]string, 0, len(tags))
			for _, tag := range tags {
				names = append(names, tag.Name)
			}
			return strings.Join(names, ", ")
		},
		"formatTimePtr": func(value *time.Time) string {
			if value == nil {
				return "Never"
			}
			return value.UTC().Format("2006-01-02 15:04 UTC")
		},
		"formatTime": func(value time.Time) string {
			return value.UTC().Format("2006-01-02")
		},
		"formatDateTime": func(value time.Time) string {
			return value.UTC().Format("2006-01-02 15:04 UTC")
		},
		"isSyncable": func(source models.SkillSourceType) bool {
			return source == models.SourceTypeRepository || source == models.SourceTypeSkillMP
		},
		"totalPages": func(total int64, pageSize int) int {
			if pageSize <= 0 {
				return 1
			}
			pages := int((total + int64(pageSize) - 1) / int64(pageSize))
			if pages < 1 {
				return 1
			}
			return pages
		},
		"plus": func(value int, delta int) int {
			return value + delta
		},
		"minus": func(value int, delta int) int {
			return value - delta
		},
		"toUpper": strings.ToUpper,
		"tr": func(_ string, key string) string {
			if value, ok := translations[key]; ok {
				return value
			}
			return key
		},
		"queryEscape": func(value string) string {
			return value
		},
		"canAccessDashboard": func(user *models.User) bool {
			if user == nil {
				return false
			}
			return user.CanAccessDashboard()
		},
		"canManageUsers": func(user *models.User) bool {
			if user == nil {
				return false
			}
			return user.CanManageUsers()
		},
		"canViewAllSkills": func(user *models.User) bool {
			if user == nil {
				return false
			}
			return user.CanViewAllSkills()
		},
		"apiKeyStatus": func(key models.APIKey) string {
			if key.RevokedAt != nil {
				return "revoked"
			}
			if key.ExpiresAt != nil && time.Now().UTC().After(key.ExpiresAt.UTC()) {
				return "expired"
			}
			return "active"
		},
		"apiKeyScopes": func(key models.APIKey) string {
			if strings.TrimSpace(key.Scopes) == "" {
				return "legacy-all"
			}
			return key.Scopes
		},
		"roleKey": func(role models.UserRole) string {
			return string(role)
		},
		"ownerSelected": func(current *uint, userID uint) bool {
			if current == nil {
				return false
			}
			return *current == userID
		},
		"topFeaturedQuality": func(skills []models.Skill) float64 {
			if len(skills) == 0 {
				return 0
			}
			best := skills[0].QualityScore
			for i := 1; i < len(skills); i++ {
				if skills[i].QualityScore > best {
					best = skills[i].QualityScore
				}
			}
			return best
		},
		"topFeaturedPercent": func(skills []models.Skill) float64 {
			if len(skills) == 0 {
				return 0
			}
			best := skills[0].QualityScore
			for i := 1; i < len(skills); i++ {
				if skills[i].QualityScore > best {
					best = skills[i].QualityScore
				}
			}
			return best * 10
		},
		"sessionLabel": func(value string) string {
			clean := strings.TrimSpace(value)
			if len(clean) <= 14 {
				return clean
			}
			return clean[:8] + "..." + clean[len(clean)-4:]
		},
		"isAdminPage":                isAdminPage,
		"isAuthShellPage":            isAuthShellPage,
		"isLoginPage":                isLoginPage,
		"isRegisterPage":             isRegisterPage,
		"isPasswordResetRequestPage": isPasswordResetRequestPage,
		"isPasswordResetConfirmPage": isPasswordResetConfirmPage,
		"loginPath":                  loginPath,
		"registerPath":               registerPath,
		"passwordResetRequestPath":   passwordResetRequestPath,
		"passwordResetConfirmPath":   passwordResetConfirmPath,
		"bodyClass":                  bodyClass,
	}).ParseFiles(filepath.Join("..", "..", "web", "templates", "layout.tmpl"))
	if err != nil {
		t.Fatalf("parse layout template failed: %v", err)
	}
	return tmpl
}
