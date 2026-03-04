package models

import "time"

// PasswordResetToken stores one-time password reset token hash for account recovery.
type PasswordResetToken struct {
	ID        uint       `gorm:"primaryKey"`
	UserID    uint       `gorm:"index;not null"`
	User      User       `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	TokenHash string     `gorm:"size:128;uniqueIndex;not null"`
	IssuedIP  string     `gorm:"size:64"`
	ExpiresAt time.Time  `gorm:"index;not null"`
	UsedAt    *time.Time `gorm:"index"`
	CreatedAt time.Time
	UpdatedAt time.Time
}
