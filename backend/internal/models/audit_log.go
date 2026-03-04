package models

import "time"

// AuditLog stores immutable audit records for privileged actions.
type AuditLog struct {
	ID          uint   `gorm:"primaryKey"`
	ActorUserID uint   `gorm:"index;not null"`
	ActorUser   User   `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Action      string `gorm:"size:128;index;not null"`
	TargetType  string `gorm:"size:64;index;not null"`
	TargetID    uint   `gorm:"index"`
	Summary     string `gorm:"size:512"`
	Details     string `gorm:"type:text"`
	CreatedAt   time.Time
}
