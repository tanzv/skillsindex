package models

import "time"

// APIOperationAuthMode identifies the runtime authentication mode for one API operation.
type APIOperationAuthMode string

const (
	// APIAuthModeInherit means runtime policy inherits the contract-level default.
	APIAuthModeInherit APIOperationAuthMode = "inherit"
	// APIAuthModePublic means no runtime authentication is required.
	APIAuthModePublic APIOperationAuthMode = "public"
	// APIAuthModeSession means an authenticated user session is required.
	APIAuthModeSession APIOperationAuthMode = "session"
	// APIAuthModeAPIKey means an API key is required.
	APIAuthModeAPIKey APIOperationAuthMode = "api_key"
)

// APIOperationPolicy stores runtime governance overrides for one published API operation.
type APIOperationPolicy struct {
	ID             uint                 `gorm:"primaryKey"`
	SpecID         uint                 `gorm:"not null;index;uniqueIndex:idx_api_policy_spec_operation,priority:1"`
	OperationID    string               `gorm:"size:191;not null;uniqueIndex:idx_api_policy_spec_operation,priority:2"`
	AuthMode       APIOperationAuthMode `gorm:"type:varchar(32);not null;default:'inherit'"`
	RequiredRoles  []string             `gorm:"serializer:json"`
	RequiredScopes []string             `gorm:"serializer:json"`
	Enabled        bool                 `gorm:"not null;default:true"`
	MockEnabled    bool                 `gorm:"not null;default:false"`
	ExportEnabled  bool                 `gorm:"not null;default:true"`
	CreatedBy      uint                 `gorm:"not null"`
	UpdatedBy      uint                 `gorm:"not null"`
	CreatedAt      time.Time
	UpdatedAt      time.Time
}
