package models

import "time"

// Tag is a searchable label attached to one or many skills.
type Tag struct {
	ID        uint   `gorm:"primaryKey"`
	Name      string `gorm:"size:64;uniqueIndex;not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

// SkillTag is the join table between skills and tags.
type SkillTag struct {
	SkillID uint `gorm:"primaryKey"`
	TagID   uint `gorm:"primaryKey"`
}
