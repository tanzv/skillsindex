package models

import "time"

// SkillFavorite marks one user's favorite relation to one skill.
type SkillFavorite struct {
	SkillID   uint      `gorm:"primaryKey"`
	Skill     Skill     `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	UserID    uint      `gorm:"primaryKey"`
	User      User      `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	CreatedAt time.Time `gorm:"index"`
}

// SkillRating stores one user's rating for one skill.
type SkillRating struct {
	SkillID   uint  `gorm:"primaryKey"`
	Skill     Skill `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	UserID    uint  `gorm:"primaryKey"`
	User      User  `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Score     int   `gorm:"not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

// SkillComment stores free-text discussion under one skill.
type SkillComment struct {
	ID        uint   `gorm:"primaryKey"`
	SkillID   uint   `gorm:"index;not null"`
	Skill     Skill  `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	UserID    uint   `gorm:"index;not null"`
	User      User   `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Content   string `gorm:"type:text;not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
}
