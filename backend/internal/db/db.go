package db

import (
	"fmt"
	"strings"

	"skillsindex/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Open opens a PostgreSQL database connection.
func Open(databaseURL string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect database: %w", err)
	}
	return db, nil
}

// Migrate auto-migrates all schema models.
func Migrate(database *gorm.DB) error {
	schemaModels := []any{
		&models.User{},
		&models.UserSession{},
		&models.PasswordResetToken{},
		&models.Organization{},
		&models.OrganizationMember{},
		&models.Skill{},
		&models.Tag{},
		&models.SkillTag{},
		&models.APIKey{},
		&models.SkillFavorite{},
		&models.SkillRating{},
		&models.SkillComment{},
		&models.ModerationCase{},
		&models.OAuthGrant{},
		&models.AuditLog{},
		&models.IntegrationConnector{},
		&models.WebhookDeliveryLog{},
		&models.Incident{},
		&models.AsyncJob{},
		&models.SyncJobRun{},
		&models.SkillVersion{},
		&models.SystemSetting{},
	}

	for _, schemaModel := range schemaModels {
		if err := database.AutoMigrate(schemaModel); err != nil {
			if isDuplicateRelationError(err) {
				continue
			}
			return fmt.Errorf("failed to migrate schema: %w", err)
		}
	}
	if err := reconcileOAuthGrantIndexes(database); err != nil {
		return err
	}
	return nil
}

func reconcileOAuthGrantIndexes(database *gorm.DB) error {
	if database == nil {
		return nil
	}
	migrator := database.Migrator()
	_ = migrator.DropIndex(&models.OAuthGrant{}, "idx_oauth_provider_user")
	_ = migrator.DropIndex(&models.OAuthGrant{}, "idx_oauth_provider_external")
	if err := migrator.CreateIndex(&models.OAuthGrant{}, "idx_oauth_provider_user"); err != nil {
		return fmt.Errorf("failed to create oauth grant index idx_oauth_provider_user: %w", err)
	}
	if err := migrator.CreateIndex(&models.OAuthGrant{}, "idx_oauth_provider_external"); err != nil {
		return fmt.Errorf("failed to create oauth grant index idx_oauth_provider_external: %w", err)
	}
	return nil
}

func isDuplicateRelationError(err error) bool {
	if err == nil {
		return false
	}
	message := strings.ToLower(err.Error())
	return strings.Contains(message, "sqlstate 42p07") || strings.Contains(message, "already exists")
}
