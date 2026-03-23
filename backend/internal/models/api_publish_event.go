package models

import "time"

// APIPublishEvent stores publish and rollback audit records for API assets.
type APIPublishEvent struct {
	ID          uint   `gorm:"primaryKey"`
	SpecID      uint   `gorm:"not null;index"`
	EventType   string `gorm:"size:32;not null"`
	FromVersion string `gorm:"size:32"`
	ToVersion   string `gorm:"size:32;not null"`
	DiffSummary string `gorm:"type:text"`
	CreatedBy   uint   `gorm:"not null"`
	CreatedAt   time.Time
}
