package models

import "time"

// IncidentSeverity defines incident impact level.
type IncidentSeverity string

const (
	IncidentSeverityLow      IncidentSeverity = "low"
	IncidentSeverityMedium   IncidentSeverity = "medium"
	IncidentSeverityHigh     IncidentSeverity = "high"
	IncidentSeverityCritical IncidentSeverity = "critical"
)

// IncidentStatus defines incident lifecycle state.
type IncidentStatus string

const (
	IncidentStatusOpen      IncidentStatus = "open"
	IncidentStatusMitigated IncidentStatus = "mitigated"
	IncidentStatusResolved  IncidentStatus = "resolved"
)

// Incident stores operational incident records for response and postmortem workflows.
type Incident struct {
	ID            uint             `gorm:"primaryKey"`
	Title         string           `gorm:"size:160;index;not null"`
	Summary       string           `gorm:"size:2048"`
	Severity      IncidentSeverity `gorm:"type:varchar(16);index;default:'medium';not null"`
	Status        IncidentStatus   `gorm:"type:varchar(16);index;default:'open';not null"`
	Source        string           `gorm:"size:128;index"`
	Impact        string           `gorm:"size:1024"`
	OwnerUserID   *uint            `gorm:"index"`
	OwnerUser     *User            `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	DetectedAt    time.Time        `gorm:"index;not null"`
	ResolvedAt    *time.Time       `gorm:"index"`
	ResponseNotes string           `gorm:"type:text"`
	Postmortem    string           `gorm:"type:text"`
	CreatedBy     uint             `gorm:"index;not null"`
	Creator       User             `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:CreatedBy"`
	CreatedAt     time.Time
	UpdatedAt     time.Time
}
