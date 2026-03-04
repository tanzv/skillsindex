package models

import "time"

// OAuthProvider defines third-party auth provider identifier.
type OAuthProvider string

const (
	// OAuthProviderDingTalk is DingTalk OAuth provider.
	OAuthProviderDingTalk OAuthProvider = "dingtalk"
)

// OAuthGrant stores user-level temporary authorization tokens from external providers.
type OAuthGrant struct {
	ID               uint          `gorm:"primaryKey"`
	UserID           uint          `gorm:"index;not null"`
	User             User          `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Provider         OAuthProvider `gorm:"type:varchar(32);index:idx_oauth_provider_user,unique;index:idx_oauth_provider_external,unique;not null"`
	ExternalUserID   string        `gorm:"size:128;index:idx_oauth_provider_external,unique;not null"`
	AccessToken      string        `gorm:"type:text;not null"`
	RefreshToken     string        `gorm:"type:text"`
	Scope            string        `gorm:"size:256"`
	ExpiresAt        time.Time     `gorm:"index;not null"`
	RefreshExpiresAt time.Time
	CreatedAt        time.Time
	UpdatedAt        time.Time
}
