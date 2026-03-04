package models

import "time"

// ModerationTargetType identifies content type under moderation workflow.
type ModerationTargetType string

const (
	ModerationTargetSkill   ModerationTargetType = "skill"
	ModerationTargetComment ModerationTargetType = "comment"
)

// ModerationCaseStatus defines moderation case lifecycle states.
type ModerationCaseStatus string

const (
	ModerationStatusOpen     ModerationCaseStatus = "open"
	ModerationStatusResolved ModerationCaseStatus = "resolved"
	ModerationStatusRejected ModerationCaseStatus = "rejected"
)

// ModerationAction defines moderation action applied to content.
type ModerationAction string

const (
	ModerationActionNone    ModerationAction = "none"
	ModerationActionFlagged ModerationAction = "flagged"
	ModerationActionHidden  ModerationAction = "hidden"
	ModerationActionDeleted ModerationAction = "deleted"
)

// ModerationCase stores one moderation report and review result.
type ModerationCase struct {
	ID             uint                 `gorm:"primaryKey"`
	ReporterUserID *uint                `gorm:"index"`
	ReporterUser   *User                `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	ResolverUserID *uint                `gorm:"index"`
	ResolverUser   *User                `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	TargetType     ModerationTargetType `gorm:"type:varchar(32);index;not null"`
	SkillID        *uint                `gorm:"index"`
	Skill          *Skill               `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	CommentID      *uint                `gorm:"index"`
	Comment        *SkillComment        `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	ReasonCode     string               `gorm:"size:64;index;not null"`
	ReasonDetail   string               `gorm:"size:2048"`
	Status         ModerationCaseStatus `gorm:"type:varchar(16);index;default:'open';not null"`
	Action         ModerationAction     `gorm:"type:varchar(16);default:'none';not null"`
	ResolutionNote string               `gorm:"size:2048"`
	ResolvedAt     *time.Time           `gorm:"index"`
	CreatedAt      time.Time
	UpdatedAt      time.Time
}
