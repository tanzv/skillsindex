package models

import (
	"time"

	"gorm.io/gorm"
)

// SkillVisibility controls whether a skill is visible to everyone or owner only.
type SkillVisibility string

const (
	VisibilityPrivate SkillVisibility = "private"
	VisibilityPublic  SkillVisibility = "public"
)

// SkillSourceType indicates how a skill was imported into the system.
type SkillSourceType string

const (
	SourceTypeManual     SkillSourceType = "manual"
	SourceTypeUpload     SkillSourceType = "upload"
	SourceTypeRepository SkillSourceType = "repository"
	SourceTypeSkillMP    SkillSourceType = "skillmp"
)

// SkillRecordOrigin indicates whether a skill is marketplace-ready imported data or local seed data.
type SkillRecordOrigin string

const (
	RecordOriginImported SkillRecordOrigin = "imported"
	RecordOriginSeed     SkillRecordOrigin = "seed"
)

// Skill stores metadata and content for a single skill item.
type Skill struct {
	ID                 uint              `gorm:"primaryKey"`
	OwnerID            uint              `gorm:"index;not null"`
	Owner              User              `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	OrganizationID     *uint             `gorm:"index"`
	Organization       *Organization     `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	Name               string            `gorm:"size:128;index;not null"`
	Description        string            `gorm:"size:1024"`
	Content            string            `gorm:"type:text"`
	CategorySlug       string            `gorm:"size:64;index"`
	SubcategorySlug    string            `gorm:"size:64;index"`
	Visibility         SkillVisibility   `gorm:"type:varchar(16);index;default:'private';not null"`
	SourceType         SkillSourceType   `gorm:"type:varchar(16);index;not null"`
	RecordOrigin       SkillRecordOrigin `gorm:"type:varchar(16);index;default:'imported';not null"`
	SourceURL          string            `gorm:"size:512"`
	SourceBranch       string            `gorm:"size:128"`
	SourcePath         string            `gorm:"size:512"`
	RepoURL            string            `gorm:"size:512"`
	SourceAnalysisJSON string            `gorm:"type:text"`
	InstallCommand     string            `gorm:"size:1024"`
	StarCount          int               `gorm:"index;default:0"`
	QualityScore       float64
	LastSyncedAt       *time.Time
	Tags               []Tag `gorm:"many2many:skill_tags;constraint:OnDelete:CASCADE;"`
	CreatedAt          time.Time
	UpdatedAt          time.Time
}

// BeforeCreate ensures direct inserts still receive the marketplace default origin.
func (s *Skill) BeforeCreate(_ *gorm.DB) error {
	if s.RecordOrigin == "" {
		s.RecordOrigin = RecordOriginImported
	}
	return nil
}
