package services

import (
	"context"
	"errors"
	"testing"

	"skillsindex/internal/models"
)

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
