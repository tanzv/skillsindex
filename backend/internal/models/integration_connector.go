package models

import "time"

// IntegrationConnector stores external integration endpoint configuration.
type IntegrationConnector struct {
	ID          uint   `gorm:"primaryKey"`
	Name        string `gorm:"size:128;index;not null"`
	Provider    string `gorm:"size:64;index;not null"`
	Description string `gorm:"size:1024"`
	BaseURL     string `gorm:"size:512"`
	ConfigJSON  string `gorm:"type:text"`
	Enabled     bool   `gorm:"index;default:true;not null"`
	CreatedBy   uint   `gorm:"index;not null"`
	Creator     User   `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:CreatedBy"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// WebhookDeliveryLog stores delivery records for connector webhook events.
type WebhookDeliveryLog struct {
	ID           uint                 `gorm:"primaryKey"`
	ConnectorID  uint                 `gorm:"index;not null"`
	Connector    IntegrationConnector `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	EventType    string               `gorm:"size:128;index;not null"`
	Endpoint     string               `gorm:"size:512;not null"`
	StatusCode   int
	Outcome      string    `gorm:"size:32;index;not null"`
	RequestID    string    `gorm:"size:128;index"`
	ErrorMessage string    `gorm:"size:1024"`
	DeliveredAt  time.Time `gorm:"index;not null"`
	CreatedAt    time.Time
}
