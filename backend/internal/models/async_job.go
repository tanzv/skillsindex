package models

import "time"

// AsyncJobType identifies asynchronous orchestration job category.
type AsyncJobType string

const (
	// AsyncJobTypeImportManual identifies manual import jobs.
	AsyncJobTypeImportManual AsyncJobType = "import_manual"
	// AsyncJobTypeImportUpload identifies upload import jobs.
	AsyncJobTypeImportUpload AsyncJobType = "import_upload"
	// AsyncJobTypeImportRepository identifies repository import jobs.
	AsyncJobTypeImportRepository AsyncJobType = "import_repository"
	// AsyncJobTypeImportSkillMP identifies SkillMP import jobs.
	AsyncJobTypeImportSkillMP AsyncJobType = "import_skillmp"
	// AsyncJobTypeSyncRepository identifies repository sync jobs.
	AsyncJobTypeSyncRepository AsyncJobType = "sync_repository"
	// AsyncJobTypeSyncSkillMP identifies SkillMP sync jobs.
	AsyncJobTypeSyncSkillMP AsyncJobType = "sync_skillmp"
)

// AsyncJobStatus identifies lifecycle status of an asynchronous job.
type AsyncJobStatus string

const (
	// AsyncJobStatusPending indicates job has been queued and not started yet.
	AsyncJobStatusPending AsyncJobStatus = "pending"
	// AsyncJobStatusRunning indicates job execution is in progress.
	AsyncJobStatusRunning AsyncJobStatus = "running"
	// AsyncJobStatusSucceeded indicates job completed successfully.
	AsyncJobStatusSucceeded AsyncJobStatus = "succeeded"
	// AsyncJobStatusFailed indicates job finished with failure.
	AsyncJobStatusFailed AsyncJobStatus = "failed"
	// AsyncJobStatusCanceled indicates job was canceled before completion.
	AsyncJobStatusCanceled AsyncJobStatus = "canceled"
)

// AsyncJob stores orchestration status and metadata for async ingestion/sync operations.
type AsyncJob struct {
	ID               uint           `gorm:"primaryKey"`
	JobType          AsyncJobType   `gorm:"type:varchar(32);index;not null"`
	Status           AsyncJobStatus `gorm:"type:varchar(16);index;not null;default:'pending'"`
	OwnerUserID      *uint          `gorm:"index"`
	OwnerUser        *User          `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;foreignKey:OwnerUserID"`
	ActorUserID      *uint          `gorm:"index"`
	ActorUser        *User          `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;foreignKey:ActorUserID"`
	CanceledByUserID *uint          `gorm:"index"`
	CanceledByUser   *User          `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;foreignKey:CanceledByUserID"`
	TargetSkillID    *uint          `gorm:"index"`
	TargetSkill      *Skill         `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;foreignKey:TargetSkillID"`
	SyncRunID        *uint          `gorm:"index"`
	SyncRun          *SyncJobRun    `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;foreignKey:SyncRunID"`
	Attempt          int            `gorm:"not null;default:1"`
	MaxAttempts      int            `gorm:"not null;default:3"`
	StartedAt        *time.Time     `gorm:"index"`
	FinishedAt       *time.Time     `gorm:"index"`
	ErrorCode        string         `gorm:"size:64;index"`
	ErrorMessage     string         `gorm:"size:2048"`
	PayloadDigest    string         `gorm:"size:128;index"`
	CreatedAt        time.Time
	UpdatedAt        time.Time
}
