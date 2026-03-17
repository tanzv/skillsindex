package models

import "time"

// AuditLog stores immutable audit records for privileged actions.
type AuditLog struct {
	ID          uint   `gorm:"primaryKey"`
	ActorUserID *uint  `gorm:"index"`
	ActorUser   *User  `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;foreignKey:ActorUserID"`
	Action      string `gorm:"size:128;index;not null"`
	TargetType  string `gorm:"size:64;index;not null"`
	TargetID    uint   `gorm:"index"`
	RequestID   string `gorm:"size:128;index"`
	Result      string `gorm:"size:32;index"`
	Reason      string `gorm:"size:256"`
	SourceIP    string `gorm:"size:64;index"`
	Summary     string `gorm:"size:512"`
	Details     string `gorm:"type:text"`
	CreatedAt   time.Time
}
