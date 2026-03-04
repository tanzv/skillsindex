package models

import "time"

// SkillVersion stores immutable snapshots of skill content and metadata.
type SkillVersion struct {
	ID                uint            `gorm:"primaryKey"`
	SkillID           uint            `gorm:"index;not null"`
	OwnerID           uint            `gorm:"index;not null"`
	VersionNumber     int             `gorm:"index;not null"`
	Trigger           string          `gorm:"size:32;index;not null"`
	ActorUserID       *uint           `gorm:"index"`
	ActorUser         *User           `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;foreignKey:ActorUserID"`
	Name              string          `gorm:"size:128;not null"`
	Description       string          `gorm:"size:1024"`
	Content           string          `gorm:"type:text"`
	CategorySlug      string          `gorm:"size:64;index"`
	SubcategorySlug   string          `gorm:"size:64;index"`
	Visibility        SkillVisibility `gorm:"type:varchar(16);index;not null"`
	SourceType        SkillSourceType `gorm:"type:varchar(16);index;not null"`
	SourceURL         string          `gorm:"size:512"`
	SourceBranch      string          `gorm:"size:128"`
	SourcePath        string          `gorm:"size:512"`
	RepoURL           string          `gorm:"size:512"`
	InstallCommand    string          `gorm:"size:1024"`
	StarCount         int             `gorm:"not null;default:0"`
	QualityScore      float64
	TagsJSON          string     `gorm:"type:text"`
	ChangedFieldsJSON string     `gorm:"type:text"`
	BeforeDigest      string     `gorm:"size:64;index"`
	AfterDigest       string     `gorm:"size:64;index"`
	ChangeSummary     string     `gorm:"size:1024"`
	RiskLevel         string     `gorm:"size:16;index"`
	ArchivedAt        *time.Time `gorm:"index"`
	ArchiveReason     string     `gorm:"size:128"`
	CapturedAt        time.Time  `gorm:"index;not null"`
	CreatedAt         time.Time
}
