package models

import "time"

// UserSession stores one authenticated session for account security governance.
type UserSession struct {
	ID         uint       `gorm:"primaryKey"`
	UserID     uint       `gorm:"index;not null"`
	User       User       `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	SessionID  string     `gorm:"size:64;uniqueIndex;not null"`
	UserAgent  string     `gorm:"size:512"`
	IssuedIP   string     `gorm:"size:64"`
	ExpiresAt  time.Time  `gorm:"index;not null"`
	LastSeenAt time.Time  `gorm:"index;not null"`
	RevokedAt  *time.Time `gorm:"index"`
	CreatedAt  time.Time
	UpdatedAt  time.Time
}
