package models

import "time"

// SystemSetting stores mutable platform-level configuration values.
type SystemSetting struct {
	Key       string `gorm:"primaryKey;size:128"`
	Value     string `gorm:"size:4096;not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
}
