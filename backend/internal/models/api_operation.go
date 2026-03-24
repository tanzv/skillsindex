package models

import "time"

// APIOperation stores one operation extracted from an imported OpenAPI asset version.
type APIOperation struct {
	ID          uint   `gorm:"primaryKey"`
	SpecID      uint   `gorm:"not null;index;uniqueIndex:idx_api_operation_spec_operation,priority:1"`
	OperationID string `gorm:"size:191;not null;uniqueIndex:idx_api_operation_spec_operation,priority:2"`
	Method      string `gorm:"size:16;not null;index"`
	Path        string `gorm:"size:255;not null;index"`
	TagGroup    string `gorm:"size:120"`
	Summary     string `gorm:"size:500"`
	Deprecated  bool   `gorm:"not null;default:false"`
	Visibility  string `gorm:"size:32;not null;index"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
