package models

import "time"

// SyncPolicySourceType identifies the remote source family targeted by one sync policy.
type SyncPolicySourceType string

const (
	// SyncPolicySourceRepository identifies repository-backed synchronization.
	SyncPolicySourceRepository SyncPolicySourceType = "repository"
	// SyncPolicySourceSkillMP identifies SkillMP-backed synchronization.
	SyncPolicySourceSkillMP SyncPolicySourceType = "skillmp"
)

// SyncPolicy stores one managed synchronization policy record.
type SyncPolicy struct {
	ID              uint                 `gorm:"primaryKey"`
	PolicyName      string               `gorm:"size:128;index;not null"`
	TargetScope     string               `gorm:"size:256;index;not null"`
	SourceType      SyncPolicySourceType `gorm:"type:varchar(32);index;not null"`
	CronExpr        string               `gorm:"size:128"`
	IntervalMinutes int                  `gorm:"not null;default:0"`
	TimeoutMinutes  int                  `gorm:"not null;default:0"`
	BatchSize       int                  `gorm:"not null;default:0"`
	Timezone        string               `gorm:"size:64;not null;default:'UTC'"`
	Enabled         bool                 `gorm:"index;not null;default:false"`
	MaxRetry        int                  `gorm:"not null;default:3"`
	RetryBackoff    string               `gorm:"size:128"`
	CreatedByUserID *uint                `gorm:"index"`
	CreatedByUser   *User                `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;foreignKey:CreatedByUserID"`
	UpdatedByUserID *uint                `gorm:"index"`
	UpdatedByUser   *User                `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;foreignKey:UpdatedByUserID"`
	DeletedAt       *time.Time           `gorm:"index"`
	CreatedAt       time.Time
	UpdatedAt       time.Time
}
