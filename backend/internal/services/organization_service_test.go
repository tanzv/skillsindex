package services

import (
	"context"
	"errors"
	"fmt"
	"testing"

	"skillsindex/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupOrganizationServiceTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open db: %v", err)
	}
	if err := db.AutoMigrate(&models.User{}, &models.Organization{}, &models.OrganizationMember{}); err != nil {
		t.Fatalf("failed to migrate db: %v", err)
	}
	return db
}

func TestCreateOrganizationCreatesOwnerMembership(t *testing.T) {
	db := setupOrganizationServiceTestDB(t)
	svc := NewOrganizationService(db)

	owner := models.User{Username: "owner", PasswordHash: "hash", Role: models.RoleMember}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}

	org, err := svc.CreateOrganization(context.Background(), "Team Alpha", owner.ID)
	if err != nil {
		t.Fatalf("create organization failed: %v", err)
	}
	if org.Name != "Team Alpha" {
		t.Fatalf("unexpected organization name: %s", org.Name)
	}
	if org.Slug == "" {
		t.Fatalf("expected non-empty organization slug")
	}

	member, err := svc.GetMembership(context.Background(), org.ID, owner.ID)
	if err != nil {
		t.Fatalf("failed to query owner membership: %v", err)
	}
	if member.Role != models.OrganizationRoleOwner {
		t.Fatalf("unexpected owner membership role: %s", member.Role)
	}
}

func TestAddOrUpdateMemberRequiresPermission(t *testing.T) {
	db := setupOrganizationServiceTestDB(t)
	svc := NewOrganizationService(db)

	owner := models.User{Username: "owner", PasswordHash: "hash", Role: models.RoleMember}
	outsider := models.User{Username: "outsider", PasswordHash: "hash", Role: models.RoleMember}
	target := models.User{Username: "target", PasswordHash: "hash", Role: models.RoleMember}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}
	if err := db.Create(&outsider).Error; err != nil {
		t.Fatalf("failed to create outsider: %v", err)
	}
	if err := db.Create(&target).Error; err != nil {
		t.Fatalf("failed to create target: %v", err)
	}

	org, err := svc.CreateOrganization(context.Background(), "Team ACL", owner.ID)
	if err != nil {
		t.Fatalf("create organization failed: %v", err)
	}

	err = svc.AddOrUpdateMember(context.Background(), org.ID, outsider, target.ID, models.OrganizationRoleMember)
	if err == nil {
		t.Fatalf("expected permission denied for outsider")
	}

	if err := svc.AddOrUpdateMember(context.Background(), org.ID, owner, target.ID, models.OrganizationRoleAdmin); err != nil {
		t.Fatalf("owner failed to add member: %v", err)
	}
	member, err := svc.GetMembership(context.Background(), org.ID, target.ID)
	if err != nil {
		t.Fatalf("failed to load target membership: %v", err)
	}
	if member.Role != models.OrganizationRoleAdmin {
		t.Fatalf("unexpected target role: %s", member.Role)
	}
}

func TestCanManageOrganizationSkill(t *testing.T) {
	db := setupOrganizationServiceTestDB(t)
	svc := NewOrganizationService(db)

	owner := models.User{Username: "owner", PasswordHash: "hash", Role: models.RoleMember}
	member := models.User{Username: "member", PasswordHash: "hash", Role: models.RoleMember}
	viewer := models.User{Username: "viewer", PasswordHash: "hash", Role: models.RoleMember}
	admin := models.User{Username: "global-admin", PasswordHash: "hash", Role: models.RoleAdmin}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}
	if err := db.Create(&member).Error; err != nil {
		t.Fatalf("failed to create member: %v", err)
	}
	if err := db.Create(&viewer).Error; err != nil {
		t.Fatalf("failed to create viewer: %v", err)
	}
	if err := db.Create(&admin).Error; err != nil {
		t.Fatalf("failed to create global admin: %v", err)
	}

	org, err := svc.CreateOrganization(context.Background(), "Team Scope", owner.ID)
	if err != nil {
		t.Fatalf("create organization failed: %v", err)
	}
	if err := svc.AddOrUpdateMember(context.Background(), org.ID, owner, member.ID, models.OrganizationRoleMember); err != nil {
		t.Fatalf("failed to add member: %v", err)
	}
	if err := svc.AddOrUpdateMember(context.Background(), org.ID, owner, viewer.ID, models.OrganizationRoleViewer); err != nil {
		t.Fatalf("failed to add viewer: %v", err)
	}

	canOwner, err := svc.CanManageSkillInOrganization(context.Background(), owner, org.ID, member.ID)
	if err != nil || !canOwner {
		t.Fatalf("expected owner to manage all org skills, err=%v", err)
	}
	canMemberOwn, err := svc.CanManageSkillInOrganization(context.Background(), member, org.ID, member.ID)
	if err != nil || !canMemberOwn {
		t.Fatalf("expected org member to manage own skill, err=%v", err)
	}
	canMemberOther, err := svc.CanManageSkillInOrganization(context.Background(), member, org.ID, owner.ID)
	if err != nil {
		t.Fatalf("unexpected error for org member check: %v", err)
	}
	if canMemberOther {
		t.Fatalf("org member should not manage others skill")
	}
	canViewer, err := svc.CanManageSkillInOrganization(context.Background(), viewer, org.ID, viewer.ID)
	if err != nil {
		t.Fatalf("unexpected error for viewer check: %v", err)
	}
	if canViewer {
		t.Fatalf("org viewer should not manage skill")
	}
	canGlobalAdmin, err := svc.CanManageSkillInOrganization(context.Background(), admin, org.ID, owner.ID)
	if err != nil || !canGlobalAdmin {
		t.Fatalf("global admin should manage org skill, err=%v", err)
	}
}

func TestListMembersRequiresPermission(t *testing.T) {
	db := setupOrganizationServiceTestDB(t)
	svc := NewOrganizationService(db)

	owner := models.User{Username: "owner-list", PasswordHash: "hash", Role: models.RoleMember}
	outsider := models.User{Username: "outsider-list", PasswordHash: "hash", Role: models.RoleMember}
	target := models.User{Username: "target-list", PasswordHash: "hash", Role: models.RoleMember}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}
	if err := db.Create(&outsider).Error; err != nil {
		t.Fatalf("failed to create outsider: %v", err)
	}
	if err := db.Create(&target).Error; err != nil {
		t.Fatalf("failed to create target: %v", err)
	}

	org, err := svc.CreateOrganization(context.Background(), "Team Members", owner.ID)
	if err != nil {
		t.Fatalf("create organization failed: %v", err)
	}
	if err := svc.AddOrUpdateMember(context.Background(), org.ID, owner, target.ID, models.OrganizationRoleMember); err != nil {
		t.Fatalf("failed to add member: %v", err)
	}

	if _, err := svc.ListMembers(context.Background(), org.ID, outsider); err == nil {
		t.Fatalf("expected permission denied for outsider")
	}

	members, err := svc.ListMembers(context.Background(), org.ID, owner)
	if err != nil {
		t.Fatalf("owner failed to list members: %v", err)
	}
	if len(members) != 2 {
		t.Fatalf("unexpected member count: %d", len(members))
	}
}

func TestRemoveMemberGuardsLastOwner(t *testing.T) {
	db := setupOrganizationServiceTestDB(t)
	svc := NewOrganizationService(db)

	owner := models.User{Username: "owner-remove", PasswordHash: "hash", Role: models.RoleMember}
	peerOwner := models.User{Username: "peer-owner-remove", PasswordHash: "hash", Role: models.RoleMember}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}
	if err := db.Create(&peerOwner).Error; err != nil {
		t.Fatalf("failed to create peer owner: %v", err)
	}

	org, err := svc.CreateOrganization(context.Background(), "Team Remove", owner.ID)
	if err != nil {
		t.Fatalf("create organization failed: %v", err)
	}

	if err := svc.RemoveMember(context.Background(), org.ID, owner, owner.ID); err == nil {
		t.Fatalf("expected remove last owner to fail")
	}

	if err := svc.AddOrUpdateMember(context.Background(), org.ID, owner, peerOwner.ID, models.OrganizationRoleOwner); err != nil {
		t.Fatalf("failed to add peer owner: %v", err)
	}
	if err := svc.RemoveMember(context.Background(), org.ID, owner, owner.ID); err != nil {
		t.Fatalf("failed to remove owner when peer owner exists: %v", err)
	}

	if _, err := svc.GetMembership(context.Background(), org.ID, owner.ID); err == nil {
		t.Fatalf("expected removed owner membership not found")
	}
}

func TestListOrganizationsByRole(t *testing.T) {
	db := setupOrganizationServiceTestDB(t)
	svc := NewOrganizationService(db)

	owner := models.User{Username: "owner-org-list", PasswordHash: "hash", Role: models.RoleMember}
	admin := models.User{Username: "admin-org-list", PasswordHash: "hash", Role: models.RoleAdmin}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}
	if err := db.Create(&admin).Error; err != nil {
		t.Fatalf("failed to create admin: %v", err)
	}

	org, err := svc.CreateOrganization(context.Background(), "Org View Scope", owner.ID)
	if err != nil {
		t.Fatalf("create organization failed: %v", err)
	}
	if org.ID == 0 {
		t.Fatalf("expected created organization id")
	}

	ownerOrgs, err := svc.ListOrganizations(context.Background(), owner)
	if err != nil {
		t.Fatalf("owner list organizations failed: %v", err)
	}
	if len(ownerOrgs) != 1 {
		t.Fatalf("unexpected owner organization count: %d", len(ownerOrgs))
	}

	adminOrgs, err := svc.ListOrganizations(context.Background(), admin)
	if err != nil {
		t.Fatalf("admin list organizations failed: %v", err)
	}
	if len(adminOrgs) != 1 {
		t.Fatalf("unexpected admin organization count: %d", len(adminOrgs))
	}
}

func TestOrganizationServiceGetByID(t *testing.T) {
	db := setupOrganizationServiceTestDB(t)
	svc := NewOrganizationService(db)

	organization := models.Organization{Name: "Get Org", Slug: "get-org"}
	if err := db.Create(&organization).Error; err != nil {
		t.Fatalf("failed to create organization: %v", err)
	}

	t.Run("success", func(t *testing.T) {
		got, err := svc.GetByID(context.Background(), organization.ID)
		if err != nil {
			t.Fatalf("get organization by id failed: %v", err)
		}
		if got.ID != organization.ID {
			t.Fatalf("unexpected organization id: got=%d want=%d", got.ID, organization.ID)
		}
		if got.Name != organization.Name {
			t.Fatalf("unexpected organization name: got=%s want=%s", got.Name, organization.Name)
		}
	})

	t.Run("not found", func(t *testing.T) {
		_, err := svc.GetByID(context.Background(), 99999)
		if !errors.Is(err, ErrOrganizationNotFound) {
			t.Fatalf("expected ErrOrganizationNotFound, got=%v", err)
		}
	})
}
