package models

import "time"

// APISpecStatus identifies the lifecycle state of one OpenAPI asset version.
type APISpecStatus string

const (
	// APISpecStatusDraft indicates the spec has been imported but not yet validated.
	APISpecStatusDraft APISpecStatus = "draft"
	// APISpecStatusValidated indicates the spec passed platform validation.
	APISpecStatusValidated APISpecStatus = "validated"
	// APISpecStatusPublished indicates the spec is available for runtime consumption.
	APISpecStatusPublished APISpecStatus = "published"
	// APISpecStatusDeprecated indicates the spec is still retained but should no longer be used for new clients.
	APISpecStatusDeprecated APISpecStatus = "deprecated"
	// APISpecStatusArchived indicates the spec is retained for history only.
	APISpecStatusArchived APISpecStatus = "archived"
)

// APISpec stores one imported OpenAPI asset version and its bundled artifact metadata.
type APISpec struct {
	ID              uint          `gorm:"primaryKey"`
	Name            string        `gorm:"size:120;not null"`
	Slug            string        `gorm:"size:120;not null;index"`
	SourceType      string        `gorm:"size:32;not null"`
	Status          APISpecStatus `gorm:"type:varchar(32);not null;index"`
	SemanticVersion string        `gorm:"size:32;not null"`
	IsCurrent       bool          `gorm:"not null;default:false;index"`
	SourcePath      string        `gorm:"size:512;not null"`
	BundlePath      string        `gorm:"size:512;not null"`
	Checksum        string        `gorm:"size:128;not null"`
	CreatedBy       uint          `gorm:"not null"`
	PublishedBy     *uint
	PublishedAt     *time.Time
	CreatedAt       time.Time
	UpdatedAt       time.Time
}
