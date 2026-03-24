package models

import "time"

// APIExportRecord stores one generated export artifact for a published API spec.
type APIExportRecord struct {
	ID           uint   `gorm:"primaryKey"`
	SpecID       uint   `gorm:"not null;index"`
	ExportType   string `gorm:"size:64;not null;index"`
	Target       string `gorm:"size:120;not null"`
	Format       string `gorm:"size:16;not null"`
	ArtifactPath string `gorm:"size:512;not null"`
	Checksum     string `gorm:"size:128;not null"`
	CreatedBy    uint   `gorm:"not null"`
	CreatedAt    time.Time
}
