package models

import "testing"

func TestNormalizeUserRole(t *testing.T) {
	cases := []struct {
		name  string
		input string
		want  UserRole
	}{
		{name: "super admin", input: "super_admin", want: RoleSuperAdmin},
		{name: "admin", input: "admin", want: RoleAdmin},
		{name: "member", input: "member", want: RoleMember},
		{name: "viewer", input: "viewer", want: RoleViewer},
		{name: "trim and lowercase", input: " ADMIN ", want: RoleAdmin},
		{name: "fallback to member", input: "unknown", want: RoleMember},
		{name: "empty fallback", input: "", want: RoleMember},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got := NormalizeUserRole(tc.input)
			if got != tc.want {
				t.Fatalf("unexpected role: got=%s want=%s", got, tc.want)
			}
		})
	}
}

func TestUserRolePermissions(t *testing.T) {
	ownerID := uint(10)
	otherOwnerID := uint(20)

	viewer := User{ID: ownerID, Role: RoleViewer}
	if viewer.CanAccessDashboard() {
		t.Fatalf("viewer should not access dashboard")
	}
	if viewer.CanManageSkill(ownerID) {
		t.Fatalf("viewer should not manage skills")
	}
	if viewer.CanManageUsers() {
		t.Fatalf("viewer should not manage users")
	}
	if viewer.CanManageAPIKeys(ownerID) {
		t.Fatalf("viewer should not manage api keys")
	}
	if viewer.CanDeleteComment(ownerID) {
		t.Fatalf("viewer should not delete comments")
	}

	member := User{ID: ownerID, Role: RoleMember}
	if !member.CanAccessDashboard() {
		t.Fatalf("member should access dashboard")
	}
	if !member.CanManageSkill(ownerID) {
		t.Fatalf("member should manage own skill")
	}
	if member.CanManageSkill(otherOwnerID) {
		t.Fatalf("member should not manage others skill")
	}
	if member.CanManageUsers() {
		t.Fatalf("member should not manage users")
	}
	if !member.CanManageAPIKeys(ownerID) {
		t.Fatalf("member should manage own api keys")
	}
	if member.CanManageAPIKeys(otherOwnerID) {
		t.Fatalf("member should not manage others api keys")
	}
	if !member.CanDeleteComment(ownerID) {
		t.Fatalf("member should delete own comments")
	}
	if member.CanDeleteComment(otherOwnerID) {
		t.Fatalf("member should not delete others comments")
	}

	admin := User{ID: ownerID, Role: RoleAdmin}
	if !admin.CanAccessDashboard() {
		t.Fatalf("admin should access dashboard")
	}
	if !admin.CanManageSkill(otherOwnerID) {
		t.Fatalf("admin should manage all skills")
	}
	if admin.CanManageUsers() {
		t.Fatalf("admin should not manage user roles")
	}
	if !admin.CanDeleteComment(otherOwnerID) {
		t.Fatalf("admin should moderate comments")
	}
	if !admin.CanManageAPIKeys(ownerID) {
		t.Fatalf("admin should manage own api keys")
	}
	if admin.CanManageAPIKeys(otherOwnerID) {
		t.Fatalf("admin should not manage others api keys")
	}

	superAdmin := User{ID: ownerID, Role: RoleSuperAdmin}
	if !superAdmin.CanManageUsers() {
		t.Fatalf("super admin should manage users")
	}
	if !superAdmin.CanManageAPIKeys(otherOwnerID) {
		t.Fatalf("super admin should manage any api keys")
	}
}
