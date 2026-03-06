package models

import "time"

// OAuthProvider defines third-party auth provider identifier.
type OAuthProvider string

const (
	// OAuthProviderDingTalk is DingTalk OAuth provider.
	OAuthProviderDingTalk OAuthProvider = "dingtalk"
	// OAuthProviderFeishu is Feishu OAuth provider.
	OAuthProviderFeishu OAuthProvider = "feishu"
	// OAuthProviderDingTalkSync is DingTalk directory sync provider key.
	OAuthProviderDingTalkSync OAuthProvider = "dingtalk_sync"
	// OAuthProviderFeishuSync is Feishu directory sync provider key.
	OAuthProviderFeishuSync OAuthProvider = "feishu_sync"
)

// OAuthGrant stores user-level temporary authorization tokens from external providers.
type OAuthGrant struct {
	ID               uint          `gorm:"primaryKey"`
	UserID           uint          `gorm:"index;index:idx_oauth_provider_user,unique;not null"`
	User             User          `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Provider         OAuthProvider `gorm:"type:varchar(32);index;index:idx_oauth_provider_user,unique;index:idx_oauth_provider_external,unique;not null"`
	ExternalUserID   string        `gorm:"size:128;index;index:idx_oauth_provider_external,unique;not null"`
	AccessToken      string        `gorm:"type:text;not null"`
	RefreshToken     string        `gorm:"type:text"`
	Scope            string        `gorm:"size:256"`
	ExpiresAt        time.Time     `gorm:"index;not null"`
	RefreshExpiresAt time.Time
	CreatedAt        time.Time
	UpdatedAt        time.Time
}
