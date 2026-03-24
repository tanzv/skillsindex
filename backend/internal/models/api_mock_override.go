package models

import "time"

// APIMockOverride stores one profile-bound mock override for a published API operation.
type APIMockOverride struct {
	ID             uint   `gorm:"primaryKey"`
	ProfileID      uint   `gorm:"not null;index;uniqueIndex:idx_api_mock_override_profile_operation,priority:1"`
	OperationID    string `gorm:"size:191;not null;uniqueIndex:idx_api_mock_override_profile_operation,priority:2"`
	StatusCode     int    `gorm:"not null"`
	ContentType    string `gorm:"size:120;not null"`
	ExampleName    string `gorm:"size:120"`
	BodyPayload    string `gorm:"type:text"`
	HeadersPayload string `gorm:"type:text"`
	LatencyMS      int    `gorm:"not null"`
	CreatedBy      uint   `gorm:"not null"`
	UpdatedBy      uint   `gorm:"not null"`
	CreatedAt      time.Time
	UpdatedAt      time.Time
}
