package models

import (
	"strings"
	"time"
)

// OrganizationRole defines user permission level inside one organization.
type OrganizationRole string

const (
	OrganizationRoleOwner  OrganizationRole = "owner"
	OrganizationRoleAdmin  OrganizationRole = "admin"
	OrganizationRoleMember OrganizationRole = "member"
	OrganizationRoleViewer OrganizationRole = "viewer"
)

// NormalizeOrganizationRole normalizes organization role with a safe fallback.
func NormalizeOrganizationRole(raw string) OrganizationRole {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case string(OrganizationRoleOwner):
		return OrganizationRoleOwner
	case string(OrganizationRoleAdmin):
		return OrganizationRoleAdmin
	case string(OrganizationRoleViewer):
		return OrganizationRoleViewer
	default:
		return OrganizationRoleMember
	}
}

// Organization groups members and shared skills in one collaboration scope.
type Organization struct {
	ID        uint   `gorm:"primaryKey"`
	Name      string `gorm:"size:128;not null"`
	Slug      string `gorm:"size:128;uniqueIndex;not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
	Members   []OrganizationMember `gorm:"constraint:OnDelete:CASCADE;"`
	Skills    []Skill              `gorm:"foreignKey:OrganizationID"`
}

// OrganizationMember maps a user to organization role.
type OrganizationMember struct {
	OrganizationID uint             `gorm:"primaryKey"`
	Organization   Organization     `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	UserID         uint             `gorm:"primaryKey"`
	User           User             `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Role           OrganizationRole `gorm:"type:varchar(16);index;default:'member';not null"`
	CreatedAt      time.Time
	UpdatedAt      time.Time
}
