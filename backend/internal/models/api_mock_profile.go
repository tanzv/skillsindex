package models

import "time"

// APIMockProfile stores one published-spec-scoped mock profile.
type APIMockProfile struct {
	ID        uint   `gorm:"primaryKey"`
	Name      string `gorm:"size:120;not null"`
	SpecID    uint   `gorm:"not null;index;uniqueIndex:idx_api_mock_profile_spec_name,priority:1"`
	Mode      string `gorm:"size:32;not null"`
	IsDefault bool   `gorm:"not null"`
	CreatedBy uint   `gorm:"not null"`
	UpdatedBy uint   `gorm:"not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
}
