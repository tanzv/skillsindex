package services

import (
	"context"
	"errors"
	"fmt"
	"testing"
	"time"

	"skillsindex/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupSkillServiceTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open db: %v", err)
	}
	if err := db.AutoMigrate(
		&models.User{},
		&models.Organization{},
		&models.OrganizationMember{},
		&models.Skill{},
		&models.SkillVersion{},
		&models.Tag{},
		&models.SkillTag{},
	); err != nil {
		t.Fatalf("failed to migrate db: %v", err)
	}
	return db
}

func TestParseTagInput(t *testing.T) {
	got := ParseTagInput(" Go,go, DevOps, test-case ,, ")
	want := []string{"go", "devops", "test-case"}
	if len(got) != len(want) {
		t.Fatalf("unexpected tag count: got=%d want=%d", len(got), len(want))
	}
	for i := range got {
		if got[i] != want[i] {
			t.Fatalf("unexpected tag at %d: got=%s want=%s", i, got[i], want[i])
		}
	}
}

func TestSearchSkillsRespectsVisibilityAndFilters(t *testing.T) {
	db := setupSkillServiceTestDB(t)
	svc := NewSkillService(db)

	alice := models.User{Username: "alice", PasswordHash: "hash"}
	bob := models.User{Username: "bob", PasswordHash: "hash"}
	if err := db.Create(&alice).Error; err != nil {
		t.Fatalf("failed to create alice: %v", err)
	}
	if err := db.Create(&bob).Error; err != nil {
		t.Fatalf("failed to create bob: %v", err)
	}

	publicGo := models.Skill{OwnerID: alice.ID, Name: "Go Logger", Description: "Public logging helper", Visibility: models.VisibilityPublic, SourceType: models.SourceTypeManual}
	privateAlice := models.Skill{OwnerID: alice.ID, Name: "Internal Ops", Description: "Private ops helper", Visibility: models.VisibilityPrivate, SourceType: models.SourceTypeManual}
	publicDocker := models.Skill{OwnerID: bob.ID, Name: "Docker Deploy", Description: "Deploy stack", Visibility: models.VisibilityPublic, SourceType: models.SourceTypeManual}
	if err := db.Create(&publicGo).Error; err != nil {
		t.Fatalf("failed to create publicGo: %v", err)
	}
	if err := db.Create(&privateAlice).Error; err != nil {
		t.Fatalf("failed to create privateAlice: %v", err)
	}
	if err := db.Create(&publicDocker).Error; err != nil {
		t.Fatalf("failed to create publicDocker: %v", err)
	}

	if err := svc.ReplaceSkillTags(context.Background(), publicGo.ID, []string{"go", "backend"}); err != nil {
		t.Fatalf("failed to tag publicGo: %v", err)
	}
	if err := svc.ReplaceSkillTags(context.Background(), privateAlice.ID, []string{"ops"}); err != nil {
		t.Fatalf("failed to tag privateAlice: %v", err)
	}
	if err := svc.ReplaceSkillTags(context.Background(), publicDocker.ID, []string{"devops"}); err != nil {
		t.Fatalf("failed to tag publicDocker: %v", err)
	}

	t.Run("guest sees public only", func(t *testing.T) {
		items, err := svc.SearchSkills(context.Background(), SearchInput{ViewerUserID: 0})
		if err != nil {
			t.Fatalf("search failed: %v", err)
		}
		if len(items) != 2 {
			t.Fatalf("unexpected result count: got=%d want=2", len(items))
		}
	})

	t.Run("owner sees own private skills", func(t *testing.T) {
		items, err := svc.SearchSkills(context.Background(), SearchInput{ViewerUserID: alice.ID})
		if err != nil {
			t.Fatalf("search failed: %v", err)
		}
		if len(items) != 3 {
			t.Fatalf("unexpected result count: got=%d want=3", len(items))
		}
	})

	t.Run("search by text", func(t *testing.T) {
		items, err := svc.SearchSkills(context.Background(), SearchInput{ViewerUserID: alice.ID, Query: "docker"})
		if err != nil {
			t.Fatalf("search failed: %v", err)
		}
		if len(items) != 1 {
			t.Fatalf("unexpected result count: got=%d want=1", len(items))
		}
		if items[0].Name != "Docker Deploy" {
			t.Fatalf("unexpected item: got=%s", items[0].Name)
		}
	})

	t.Run("search by tag", func(t *testing.T) {
		items, err := svc.SearchSkills(context.Background(), SearchInput{ViewerUserID: 0, Tags: []string{"go"}})
		if err != nil {
			t.Fatalf("search failed: %v", err)
		}
		if len(items) != 1 {
			t.Fatalf("unexpected result count: got=%d want=1", len(items))
		}
		if items[0].Name != "Go Logger" {
			t.Fatalf("unexpected item: got=%s", items[0].Name)
		}
	})
}

func TestListSkillsForUserScopeIncludesOrganizationSkills(t *testing.T) {
	db := setupSkillServiceTestDB(t)
	svc := NewSkillService(db)

	alice := models.User{Username: "alice-scope", PasswordHash: "hash"}
	bob := models.User{Username: "bob-scope", PasswordHash: "hash"}
	if err := db.Create(&alice).Error; err != nil {
		t.Fatalf("failed to create alice: %v", err)
	}
	if err := db.Create(&bob).Error; err != nil {
		t.Fatalf("failed to create bob: %v", err)
	}

	org := models.Organization{Name: "Team Scope", Slug: "team-scope"}
	if err := db.Create(&org).Error; err != nil {
		t.Fatalf("failed to create organization: %v", err)
	}

	alicePersonal := models.Skill{
		OwnerID:      alice.ID,
		Name:         "Alice Personal Skill",
		Visibility:   models.VisibilityPrivate,
		SourceType:   models.SourceTypeManual,
		CategorySlug: "development",
	}
	bobOrgSkill := models.Skill{
		OwnerID:         bob.ID,
		Name:            "Bob Org Skill",
		Visibility:      models.VisibilityPrivate,
		SourceType:      models.SourceTypeManual,
		OrganizationID:  &org.ID,
		CategorySlug:    "development",
		SubcategorySlug: "backend",
	}
	bobOtherSkill := models.Skill{
		OwnerID:      bob.ID,
		Name:         "Bob Other Skill",
		Visibility:   models.VisibilityPrivate,
		SourceType:   models.SourceTypeManual,
		CategorySlug: "development",
	}
	if err := db.Create(&alicePersonal).Error; err != nil {
		t.Fatalf("failed to create alice personal skill: %v", err)
	}
	if err := db.Create(&bobOrgSkill).Error; err != nil {
		t.Fatalf("failed to create bob org skill: %v", err)
	}
	if err := db.Create(&bobOtherSkill).Error; err != nil {
		t.Fatalf("failed to create bob other skill: %v", err)
	}

	items, err := svc.ListSkillsForUserScope(context.Background(), alice.ID, []uint{org.ID})
	if err != nil {
		t.Fatalf("failed to list skills by user scope: %v", err)
	}
	if len(items) != 2 {
		t.Fatalf("unexpected skill count: got=%d want=2", len(items))
	}
	names := map[string]bool{}
	for _, item := range items {
		names[item.Name] = true
	}
	if !names["Alice Personal Skill"] || !names["Bob Org Skill"] {
		t.Fatalf("unexpected skill set: %#v", names)
	}
	if names["Bob Other Skill"] {
		t.Fatalf("should not include unrelated private skill")
	}
}

func TestCountDashboardSkills(t *testing.T) {
	db := setupSkillServiceTestDB(t)
	svc := NewSkillService(db)

	alice := models.User{Username: "alice-dashboard", PasswordHash: "hash"}
	bob := models.User{Username: "bob-dashboard", PasswordHash: "hash"}
	if err := db.Create(&alice).Error; err != nil {
		t.Fatalf("failed to create alice: %v", err)
	}
	if err := db.Create(&bob).Error; err != nil {
		t.Fatalf("failed to create bob: %v", err)
	}

	skills := []models.Skill{
		{OwnerID: alice.ID, Name: "Alice Public Manual", Visibility: models.VisibilityPublic, SourceType: models.SourceTypeManual},
		{OwnerID: alice.ID, Name: "Alice Private Upload", Visibility: models.VisibilityPrivate, SourceType: models.SourceTypeUpload},
		{OwnerID: alice.ID, Name: "Alice Public Repo", Visibility: models.VisibilityPublic, SourceType: models.SourceTypeRepository},
		{OwnerID: bob.ID, Name: "Bob Private SkillMP", Visibility: models.VisibilityPrivate, SourceType: models.SourceTypeSkillMP},
	}
	for _, item := range skills {
		if err := db.Create(&item).Error; err != nil {
			t.Fatalf("failed to create skill %q: %v", item.Name, err)
		}
	}

	scopeCounts, err := svc.CountDashboardSkills(context.Background(), alice.ID, false)
	if err != nil {
		t.Fatalf("failed to count scope skills: %v", err)
	}
	if scopeCounts.Total != 3 {
		t.Fatalf("unexpected scope total count: got=%d want=3", scopeCounts.Total)
	}
	if scopeCounts.Public != 2 {
		t.Fatalf("unexpected scope public count: got=%d want=2", scopeCounts.Public)
	}
	if scopeCounts.Private != 1 {
		t.Fatalf("unexpected scope private count: got=%d want=1", scopeCounts.Private)
	}
	if scopeCounts.Syncable != 1 {
		t.Fatalf("unexpected scope syncable count: got=%d want=1", scopeCounts.Syncable)
	}

	globalCounts, err := svc.CountDashboardSkills(context.Background(), alice.ID, true)
	if err != nil {
		t.Fatalf("failed to count global skills: %v", err)
	}
	if globalCounts.Total != 4 {
		t.Fatalf("unexpected global total count: got=%d want=4", globalCounts.Total)
	}
	if globalCounts.Public != 2 {
		t.Fatalf("unexpected global public count: got=%d want=2", globalCounts.Public)
	}
	if globalCounts.Private != 2 {
		t.Fatalf("unexpected global private count: got=%d want=2", globalCounts.Private)
	}
	if globalCounts.Syncable != 2 {
		t.Fatalf("unexpected global syncable count: got=%d want=2", globalCounts.Syncable)
	}
}

func TestListRepositorySkillsForSync(t *testing.T) {
	db := setupSkillServiceTestDB(t)
	svc := NewSkillService(db)

	ownerA := models.User{Username: "owner-a", PasswordHash: "hash"}
	ownerB := models.User{Username: "owner-b", PasswordHash: "hash"}
	if err := db.Create(&ownerA).Error; err != nil {
		t.Fatalf("failed to create ownerA: %v", err)
	}
	if err := db.Create(&ownerB).Error; err != nil {
		t.Fatalf("failed to create ownerB: %v", err)
	}

	now := time.Now().UTC()
	oldSync := now.Add(-3 * time.Hour)
	recentSync := now.Add(-5 * time.Minute)

	skills := []models.Skill{
		{
			OwnerID:      ownerA.ID,
			Name:         "repo-null-sync",
			SourceType:   models.SourceTypeRepository,
			SourceURL:    "https://example.com/repo-null",
			LastSyncedAt: nil,
		},
		{
			OwnerID:      ownerA.ID,
			Name:         "repo-old-sync",
			SourceType:   models.SourceTypeRepository,
			SourceURL:    "https://example.com/repo-old",
			LastSyncedAt: &oldSync,
		},
		{
			OwnerID:      ownerA.ID,
			Name:         "repo-recent-sync",
			SourceType:   models.SourceTypeRepository,
			SourceURL:    "https://example.com/repo-recent",
			LastSyncedAt: &recentSync,
		},
		{
			OwnerID:    ownerA.ID,
			Name:       "repo-empty-url",
			SourceType: models.SourceTypeRepository,
			SourceURL:  "   ",
		},
		{
			OwnerID:    ownerA.ID,
			Name:       "manual-skill",
			SourceType: models.SourceTypeManual,
			SourceURL:  "https://example.com/manual",
		},
		{
			OwnerID:      ownerB.ID,
			Name:         "repo-owner-b",
			SourceType:   models.SourceTypeRepository,
			SourceURL:    "https://example.com/repo-owner-b",
			LastSyncedAt: &oldSync,
		},
	}
	for _, skill := range skills {
		if err := db.Create(&skill).Error; err != nil {
			t.Fatalf("failed to create skill %q: %v", skill.Name, err)
		}
	}

	dueBefore := now.Add(-30 * time.Minute)
	items, err := svc.ListRepositorySkillsForSync(context.Background(), nil, &dueBefore, 20)
	if err != nil {
		t.Fatalf("failed to list due repository skills: %v", err)
	}
	if len(items) != 3 {
		t.Fatalf("unexpected due item count: got=%d want=3", len(items))
	}
	names := map[string]bool{}
	for _, item := range items {
		names[item.Name] = true
	}
	if !names["repo-null-sync"] || !names["repo-old-sync"] || !names["repo-owner-b"] {
		t.Fatalf("unexpected due result names: %#v", names)
	}

	itemsByOwner, err := svc.ListRepositorySkillsForSync(context.Background(), &ownerA.ID, nil, 20)
	if err != nil {
		t.Fatalf("failed to list repository skills by owner: %v", err)
	}
	if len(itemsByOwner) != 3 {
		t.Fatalf("unexpected owner repository count: got=%d want=3", len(itemsByOwner))
	}
}

func TestSetOrganization(t *testing.T) {
	db := setupSkillServiceTestDB(t)
	svc := NewSkillService(db)

	owner := models.User{Username: "owner-bind-org", PasswordHash: "hash"}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}

	organization := models.Organization{Name: "Binding Org", Slug: "binding-org"}
	if err := db.Create(&organization).Error; err != nil {
		t.Fatalf("failed to create organization: %v", err)
	}

	skill := models.Skill{
		OwnerID:    owner.ID,
		Name:       "Organization Binding Skill",
		Visibility: models.VisibilityPrivate,
		SourceType: models.SourceTypeManual,
	}
	if err := db.Create(&skill).Error; err != nil {
		t.Fatalf("failed to create skill: %v", err)
	}

	t.Run("bind success", func(t *testing.T) {
		updated, err := svc.SetOrganization(context.Background(), skill.ID, &organization.ID)
		if err != nil {
			t.Fatalf("set organization failed: %v", err)
		}
		if updated.OrganizationID == nil || *updated.OrganizationID != organization.ID {
			t.Fatalf("unexpected organization id after bind: got=%v want=%d", updated.OrganizationID, organization.ID)
		}
	})

	t.Run("unbind success", func(t *testing.T) {
		updated, err := svc.SetOrganization(context.Background(), skill.ID, nil)
		if err != nil {
			t.Fatalf("unset organization failed: %v", err)
		}
		if updated.OrganizationID != nil {
			t.Fatalf("expected nil organization id after unbind, got=%v", *updated.OrganizationID)
		}
	})

	t.Run("organization not found", func(t *testing.T) {
		missingOrganizationID := uint(99999)
		_, err := svc.SetOrganization(context.Background(), skill.ID, &missingOrganizationID)
		if !errors.Is(err, ErrOrganizationNotFound) {
			t.Fatalf("expected ErrOrganizationNotFound, got=%v", err)
		}
	})

	t.Run("skill not found", func(t *testing.T) {
		_, err := svc.SetOrganization(context.Background(), 99999, &organization.ID)
		if !errors.Is(err, ErrSkillNotFound) {
			t.Fatalf("expected ErrSkillNotFound, got=%v", err)
		}
	})

	t.Run("idempotent path", func(t *testing.T) {
		initial, err := svc.SetOrganization(context.Background(), skill.ID, &organization.ID)
		if err != nil {
			t.Fatalf("initial set organization failed: %v", err)
		}

		again, err := svc.SetOrganization(context.Background(), skill.ID, &organization.ID)
		if err != nil {
			t.Fatalf("idempotent set organization failed: %v", err)
		}
		if again.OrganizationID == nil || *again.OrganizationID != organization.ID {
			t.Fatalf("unexpected organization id after idempotent set: got=%v want=%d", again.OrganizationID, organization.ID)
		}
		if !again.UpdatedAt.Equal(initial.UpdatedAt) {
			t.Fatalf("idempotent call should not update timestamp: initial=%s current=%s", initial.UpdatedAt, again.UpdatedAt)
		}
	})
}
