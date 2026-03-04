package models

import (
	"strings"
	"time"
)

// UserRole defines authorization level for account operations.
type UserRole string

const (
	RoleViewer     UserRole = "viewer"
	RoleMember     UserRole = "member"
	RoleAdmin      UserRole = "admin"
	RoleSuperAdmin UserRole = "super_admin"
)

// UserStatus defines whether account is active for authentication.
type UserStatus string

const (
	UserStatusActive   UserStatus = "active"
	UserStatusDisabled UserStatus = "disabled"
)

// NormalizeUserRole returns a known role and falls back to member.
func NormalizeUserRole(raw string) UserRole {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case string(RoleViewer):
		return RoleViewer
	case string(RoleAdmin):
		return RoleAdmin
	case string(RoleSuperAdmin):
		return RoleSuperAdmin
	default:
		return RoleMember
	}
}

// User represents an account that can upload and share skills.
type User struct {
	ID                      uint       `gorm:"primaryKey"`
	Username                string     `gorm:"size:64;uniqueIndex;not null"`
	PasswordHash            string     `gorm:"size:255;not null"`
	DisplayName             string     `gorm:"size:64"`
	AvatarURL               string     `gorm:"size:512"`
	Bio                     string     `gorm:"size:500"`
	Role                    UserRole   `gorm:"type:varchar(32);index;default:'member';not null"`
	Status                  UserStatus `gorm:"type:varchar(16);index;default:'active';not null"`
	ForceLogoutAt           *time.Time `gorm:"index"`
	CreatedAt               time.Time
	UpdatedAt               time.Time
	Skills                  []Skill              `gorm:"foreignKey:OwnerID"`
	OrganizationMemberships []OrganizationMember `gorm:"foreignKey:UserID"`
}

// IsActive indicates account can log in and use session.
func (u User) IsActive() bool {
	return strings.TrimSpace(strings.ToLower(string(u.Status))) != string(UserStatusDisabled)
}

// EffectiveRole returns normalized role value for policy checks.
func (u User) EffectiveRole() UserRole {
	return NormalizeUserRole(string(u.Role))
}

// CanAccessDashboard determines whether user can access management pages.
func (u User) CanAccessDashboard() bool {
	role := u.EffectiveRole()
	return role == RoleMember || role == RoleAdmin || role == RoleSuperAdmin
}

// CanCreateSkill determines whether user can create or import skills.
func (u User) CanCreateSkill() bool {
	return u.CanAccessDashboard()
}

// CanViewAllSkills determines whether user can view all owners' skills.
func (u User) CanViewAllSkills() bool {
	role := u.EffectiveRole()
	return role == RoleAdmin || role == RoleSuperAdmin
}

// CanManageSkill determines whether user can mutate skill owned by ownerID.
func (u User) CanManageSkill(ownerID uint) bool {
	if u.CanViewAllSkills() {
		return true
	}
	if u.EffectiveRole() != RoleMember {
		return false
	}
	return u.ID != 0 && u.ID == ownerID
}

// CanManageUsers determines whether user can assign account roles.
func (u User) CanManageUsers() bool {
	return u.EffectiveRole() == RoleSuperAdmin
}

// CanManageAPIKeys determines whether user can manage API keys of target account.
func (u User) CanManageAPIKeys(targetUserID uint) bool {
	if u.CanManageUsers() {
		return true
	}
	return u.ID != 0 && u.ID == targetUserID && u.CanAccessDashboard()
}

// CanDeleteComment determines whether user can moderate comments globally.
func (u User) CanDeleteComment(commentAuthorUserID uint) bool {
	if u.CanViewAllSkills() {
		return true
	}
	if u.EffectiveRole() != RoleMember {
		return false
	}
	return u.ID != 0 && u.ID == commentAuthorUserID
}
