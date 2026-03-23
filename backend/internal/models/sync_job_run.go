package models

import "time"

// SyncJobRun stores one repository synchronization batch execution record.
type SyncJobRun struct {
	ID             uint        `gorm:"primaryKey"`
	PolicyID       *uint       `gorm:"index"`
	Policy         *SyncPolicy `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;foreignKey:PolicyID"`
	JobID          *uint       `gorm:"index"`
	Job            *AsyncJob   `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;foreignKey:JobID"`
	Trigger        string      `gorm:"size:32;index;not null"`
	TriggerType    string      `gorm:"size:32;index;not null;default:'manual'"`
	Scope          string      `gorm:"size:16;index;not null"`
	Status         string      `gorm:"size:16;index;not null"`
	TargetSkillID  *uint       `gorm:"index"`
	TargetSkill    *Skill      `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;foreignKey:TargetSkillID"`
	OwnerUserID    *uint       `gorm:"index"`
	OwnerUser      *User       `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;foreignKey:OwnerUserID"`
	ActorUserID    *uint       `gorm:"index"`
	ActorUser      *User       `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;foreignKey:ActorUserID"`
	Candidates     int         `gorm:"not null;default:0"`
	Synced         int         `gorm:"not null;default:0"`
	Failed         int         `gorm:"not null;default:0"`
	Attempt        int         `gorm:"not null;default:1"`
	ErrorCode      string      `gorm:"size:64;index"`
	ErrorMessage   string      `gorm:"size:2048"`
	ErrorSummary   string      `gorm:"size:2048"`
	SourceRevision string      `gorm:"size:256"`
	StartedAt      time.Time   `gorm:"index;not null"`
	FinishedAt     time.Time   `gorm:"index;not null"`
	DurationMs     int         `gorm:"not null;default:0"`
	CreatedAt      time.Time
}
