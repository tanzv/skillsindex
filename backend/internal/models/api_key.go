package models

import "time"

// APIKey stores one issued API credential for a specific account.
type APIKey struct {
	ID            uint   `gorm:"primaryKey"`
	UserID        uint   `gorm:"index;not null"`
	User          User   `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Name          string `gorm:"size:128;not null"`
	Purpose       string `gorm:"size:255;not null;default:''"`
	CreatedBy     uint   `gorm:"index;not null;default:0"`
	Prefix        string `gorm:"size:24;index;not null"`
	KeyHash       string `gorm:"size:128;uniqueIndex;not null"`
	Scopes        string `gorm:"size:1024;not null;default:''"`
	RevokedAt     *time.Time
	ExpiresAt     *time.Time `gorm:"index"`
	LastRotatedAt *time.Time
	LastUsedAt    *time.Time
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

// IsActive returns whether the API key is currently usable.
func (k APIKey) IsActive(now time.Time) bool {
	if k.RevokedAt != nil {
		return false
	}
	if k.ExpiresAt != nil && now.After(k.ExpiresAt.UTC()) {
		return false
	}
	return true
}
