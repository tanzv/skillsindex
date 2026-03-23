package services

import (
	"context"
	"testing"
	"time"

	"skillsindex/internal/models"
)

func TestListMarketplaceRelatedSkillsPrefersImportedAndDeterministicMatches(t *testing.T) {
	db := setupSkillServiceTestDB(t)
	svc := NewSkillService(db)
	ctx := context.Background()

	owner := models.User{Username: "owner-marketplace", PasswordHash: "hash"}
	outsider := models.User{Username: "outsider-marketplace", PasswordHash: "hash"}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}
	if err := db.Create(&outsider).Error; err != nil {
		t.Fatalf("failed to create outsider: %v", err)
	}

	base, err := svc.CreateSkill(ctx, CreateSkillInput{
		OwnerID:         owner.ID,
		Name:            "Release Coordinator",
		Description:     "Coordinates release automation workflows.",
		Content:         "release automation workflow",
		Visibility:      models.VisibilityPublic,
		SourceType:      models.SourceTypeRepository,
		RecordOrigin:    models.RecordOriginImported,
		CategorySlug:    "development",
		SubcategorySlug: "automation",
		Tags:            []string{"release", "ci", "automation"},
	})
	if err != nil {
		t.Fatalf("failed to create base skill: %v", err)
	}

	topMatch, err := svc.CreateSkill(ctx, CreateSkillInput{
		OwnerID:         owner.ID,
		Name:            "CI Release Guard",
		Description:     "Strongly related release automation guardrails.",
		Content:         "release ci automation",
		Visibility:      models.VisibilityPublic,
		SourceType:      models.SourceTypeRepository,
		RecordOrigin:    models.RecordOriginImported,
		CategorySlug:    "development",
		SubcategorySlug: "automation",
		StarCount:       420,
		QualityScore:    9.6,
		Tags:            []string{"release", "ci", "automation"},
	})
	if err != nil {
		t.Fatalf("failed to create top related skill: %v", err)
	}

	privateOwnedMatch, err := svc.CreateSkill(ctx, CreateSkillInput{
		OwnerID:         owner.ID,
		Name:            "Private Release Notes",
		Description:     "Owner-only automation notes.",
		Content:         "automation release notes",
		Visibility:      models.VisibilityPrivate,
		SourceType:      models.SourceTypeManual,
		RecordOrigin:    models.RecordOriginImported,
		CategorySlug:    "development",
		SubcategorySlug: "automation",
		StarCount:       110,
		QualityScore:    8.2,
		Tags:            []string{"release", "automation"},
	})
	if err != nil {
		t.Fatalf("failed to create private related skill: %v", err)
	}

	categoryOnlyMatch, err := svc.CreateSkill(ctx, CreateSkillInput{
		OwnerID:         outsider.ID,
		Name:            "Deployment Planner",
		Description:     "Related by category only.",
		Content:         "deployment planner",
		Visibility:      models.VisibilityPublic,
		SourceType:      models.SourceTypeManual,
		RecordOrigin:    models.RecordOriginImported,
		CategorySlug:    "development",
		SubcategorySlug: "deployment",
		StarCount:       500,
		QualityScore:    9.1,
		Tags:            []string{"deployment"},
	})
	if err != nil {
		t.Fatalf("failed to create category-only skill: %v", err)
	}

	seedMatch, err := svc.CreateSkill(ctx, CreateSkillInput{
		OwnerID:         outsider.ID,
		Name:            "Seed Automation",
		Description:     "Should be excluded because it is a seed record.",
		Content:         "seed automation",
		Visibility:      models.VisibilityPublic,
		SourceType:      models.SourceTypeManual,
		RecordOrigin:    models.RecordOriginSeed,
		CategorySlug:    "development",
		SubcategorySlug: "automation",
		StarCount:       700,
		QualityScore:    9.9,
		Tags:            []string{"release", "automation"},
	})
	if err != nil {
		t.Fatalf("failed to create seed skill: %v", err)
	}

	unrelated, err := svc.CreateSkill(ctx, CreateSkillInput{
		OwnerID:         outsider.ID,
		Name:            "Finance Digest",
		Description:     "Should not be included.",
		Content:         "finance budget",
		Visibility:      models.VisibilityPublic,
		SourceType:      models.SourceTypeManual,
		RecordOrigin:    models.RecordOriginImported,
		CategorySlug:    "business",
		SubcategorySlug: "finance",
		StarCount:       950,
		QualityScore:    9.9,
		Tags:            []string{"finance"},
	})
	if err != nil {
		t.Fatalf("failed to create unrelated skill: %v", err)
	}

	now := time.Now().UTC()
	updates := []struct {
		id        uint
		updatedAt time.Time
	}{
		{id: topMatch.ID, updatedAt: now.Add(-2 * time.Hour)},
		{id: privateOwnedMatch.ID, updatedAt: now.Add(-3 * time.Hour)},
		{id: categoryOnlyMatch.ID, updatedAt: now.Add(-48 * time.Hour)},
		{id: seedMatch.ID, updatedAt: now.Add(-1 * time.Hour)},
		{id: unrelated.ID, updatedAt: now.Add(-1 * time.Hour)},
	}
	for _, item := range updates {
		if err := db.Model(&models.Skill{}).Where("id = ?", item.id).Update("updated_at", item.updatedAt).Error; err != nil {
			t.Fatalf("failed to update timestamp for skill %d: %v", item.id, err)
		}
	}

	items, err := svc.ListMarketplaceRelatedSkills(ctx, base.ID, owner.ID, 3)
	if err != nil {
		t.Fatalf("failed to list marketplace related skills: %v", err)
	}
	if len(items) != 3 {
		t.Fatalf("unexpected related skill count: got=%d want=3", len(items))
	}
	if items[0].ID != topMatch.ID {
		t.Fatalf("unexpected top related skill: got=%d want=%d", items[0].ID, topMatch.ID)
	}
	if items[1].ID != privateOwnedMatch.ID {
		t.Fatalf("owner private imported skill should be visible and ranked second: got=%d want=%d", items[1].ID, privateOwnedMatch.ID)
	}
	if items[2].ID != categoryOnlyMatch.ID {
		t.Fatalf("unexpected third related skill: got=%d want=%d", items[2].ID, categoryOnlyMatch.ID)
	}
	for _, item := range items {
		if item.ID == base.ID {
			t.Fatalf("current skill must not be included in related results")
		}
		if item.ID == seedMatch.ID {
			t.Fatalf("seed skills must not be included in related results")
		}
		if item.ID == unrelated.ID {
			t.Fatalf("unrelated skills must not be included in related results")
		}
	}

	anonymousItems, err := svc.ListMarketplaceRelatedSkills(ctx, base.ID, 0, 6)
	if err != nil {
		t.Fatalf("failed to list anonymous related skills: %v", err)
	}
	for _, item := range anonymousItems {
		if item.ID == privateOwnedMatch.ID {
			t.Fatalf("anonymous viewer must not receive private related skills")
		}
	}
}

func TestBuildPublicRankingReturnsDeterministicSections(t *testing.T) {
	db := setupSkillServiceTestDB(t)
	svc := NewSkillService(db)
	ctx := context.Background()

	owner := models.User{Username: "ranking-owner", PasswordHash: "hash"}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}

	alpha, err := svc.CreateSkill(ctx, CreateSkillInput{
		OwnerID:         owner.ID,
		Name:            "Alpha Release",
		Description:     "Highest stars in the deck.",
		Content:         "alpha release",
		Visibility:      models.VisibilityPublic,
		SourceType:      models.SourceTypeRepository,
		RecordOrigin:    models.RecordOriginImported,
		CategorySlug:    "development",
		SubcategorySlug: "frontend",
		StarCount:       520,
		QualityScore:    8.8,
		Tags:            []string{"release"},
	})
	if err != nil {
		t.Fatalf("failed to create alpha: %v", err)
	}

	bravo, err := svc.CreateSkill(ctx, CreateSkillInput{
		OwnerID:         owner.ID,
		Name:            "Bravo Quality",
		Description:     "Highest quality in the deck.",
		Content:         "bravo quality",
		Visibility:      models.VisibilityPublic,
		SourceType:      models.SourceTypeRepository,
		RecordOrigin:    models.RecordOriginImported,
		CategorySlug:    "development",
		SubcategorySlug: "backend",
		StarCount:       300,
		QualityScore:    9.7,
		Tags:            []string{"quality"},
	})
	if err != nil {
		t.Fatalf("failed to create bravo: %v", err)
	}

	charlie, err := svc.CreateSkill(ctx, CreateSkillInput{
		OwnerID:         owner.ID,
		Name:            "Charlie Tooling",
		Description:     "Tooling support entry.",
		Content:         "charlie tooling",
		Visibility:      models.VisibilityPublic,
		SourceType:      models.SourceTypeManual,
		RecordOrigin:    models.RecordOriginImported,
		CategorySlug:    "tools",
		SubcategorySlug: "automation-tools",
		StarCount:       280,
		QualityScore:    9.1,
		Tags:            []string{"tooling"},
	})
	if err != nil {
		t.Fatalf("failed to create charlie: %v", err)
	}

	delta, err := svc.CreateSkill(ctx, CreateSkillInput{
		OwnerID:         owner.ID,
		Name:            "Delta Stable",
		Description:     "Same stars and quality as bravo but older.",
		Content:         "delta stable",
		Visibility:      models.VisibilityPublic,
		SourceType:      models.SourceTypeManual,
		RecordOrigin:    models.RecordOriginImported,
		CategorySlug:    "development",
		SubcategorySlug: "frontend",
		StarCount:       300,
		QualityScore:    9.7,
		Tags:            []string{"stable"},
	})
	if err != nil {
		t.Fatalf("failed to create delta: %v", err)
	}

	seed, err := svc.CreateSkill(ctx, CreateSkillInput{
		OwnerID:         owner.ID,
		Name:            "Seed Hidden",
		Description:     "Should stay out of ranking.",
		Content:         "seed hidden",
		Visibility:      models.VisibilityPublic,
		SourceType:      models.SourceTypeManual,
		RecordOrigin:    models.RecordOriginSeed,
		CategorySlug:    "development",
		SubcategorySlug: "frontend",
		StarCount:       900,
		QualityScore:    10,
	})
	if err != nil {
		t.Fatalf("failed to create seed: %v", err)
	}

	now := time.Now().UTC()
	updates := []struct {
		id        uint
		updatedAt time.Time
	}{
		{id: alpha.ID, updatedAt: now.Add(-1 * time.Hour)},
		{id: bravo.ID, updatedAt: now.Add(-2 * time.Hour)},
		{id: charlie.ID, updatedAt: now.Add(-3 * time.Hour)},
		{id: delta.ID, updatedAt: now.Add(-24 * time.Hour)},
		{id: seed.ID, updatedAt: now},
	}
	for _, item := range updates {
		if err := db.Model(&models.Skill{}).Where("id = ?", item.id).Update("updated_at", item.updatedAt).Error; err != nil {
			t.Fatalf("failed to update timestamp for skill %d: %v", item.id, err)
		}
	}

	starsRanking, err := svc.BuildPublicRanking(ctx, PublicRankingInput{SortBy: "stars", Limit: 12})
	if err != nil {
		t.Fatalf("failed to build stars ranking: %v", err)
	}
	if starsRanking.SortBy != "stars" {
		t.Fatalf("unexpected ranking sort: got=%s want=stars", starsRanking.SortBy)
	}
	if len(starsRanking.RankedItems) != 4 {
		t.Fatalf("unexpected ranked item count: got=%d want=4", len(starsRanking.RankedItems))
	}
	if starsRanking.RankedItems[0].ID != alpha.ID {
		t.Fatalf("stars ranking should place alpha first: got=%d want=%d", starsRanking.RankedItems[0].ID, alpha.ID)
	}
	if starsRanking.RankedItems[1].ID != bravo.ID {
		t.Fatalf("more recent equal-score item should rank before older item: got=%d want=%d", starsRanking.RankedItems[1].ID, bravo.ID)
	}
	if len(starsRanking.Highlights) != 3 {
		t.Fatalf("unexpected highlight count: got=%d want=3", len(starsRanking.Highlights))
	}
	if len(starsRanking.ListItems) != 1 {
		t.Fatalf("unexpected list item count: got=%d want=1", len(starsRanking.ListItems))
	}
	if starsRanking.Summary.TotalCompared != 4 {
		t.Fatalf("unexpected total compared: got=%d want=4", starsRanking.Summary.TotalCompared)
	}
	if starsRanking.Summary.TopStars != 520 {
		t.Fatalf("unexpected top stars: got=%d want=520", starsRanking.Summary.TopStars)
	}
	if starsRanking.Summary.TopQuality != 9.7 {
		t.Fatalf("unexpected top quality: got=%.1f want=9.7", starsRanking.Summary.TopQuality)
	}
	if starsRanking.Summary.AverageQuality != 9.3 {
		t.Fatalf("unexpected average quality: got=%.1f want=9.3", starsRanking.Summary.AverageQuality)
	}
	if len(starsRanking.CategoryLeaders) == 0 {
		t.Fatalf("expected category leaders to be populated")
	}
	if starsRanking.CategoryLeaders[0].CategorySlug != "development" {
		t.Fatalf("unexpected top category leader: got=%s want=development", starsRanking.CategoryLeaders[0].CategorySlug)
	}
	if starsRanking.CategoryLeaders[0].Count != 3 {
		t.Fatalf("unexpected development category count: got=%d want=3", starsRanking.CategoryLeaders[0].Count)
	}
	if starsRanking.CategoryLeaders[0].LeadingSkill.ID != alpha.ID {
		t.Fatalf("unexpected leading skill for development: got=%d want=%d", starsRanking.CategoryLeaders[0].LeadingSkill.ID, alpha.ID)
	}
	for _, item := range starsRanking.RankedItems {
		if item.ID == seed.ID {
			t.Fatalf("seed skill must not appear in public rankings")
		}
	}

	qualityRanking, err := svc.BuildPublicRanking(ctx, PublicRankingInput{SortBy: "quality", Limit: 12})
	if err != nil {
		t.Fatalf("failed to build quality ranking: %v", err)
	}
	if qualityRanking.RankedItems[0].ID != bravo.ID {
		t.Fatalf("quality ranking should place bravo first: got=%d want=%d", qualityRanking.RankedItems[0].ID, bravo.ID)
	}
	if qualityRanking.RankedItems[1].ID != delta.ID {
		t.Fatalf("quality ranking should keep older equal-quality item second: got=%d want=%d", qualityRanking.RankedItems[1].ID, delta.ID)
	}

	customRanking, err := svc.BuildPublicRanking(ctx, PublicRankingInput{
		SortBy:              "stars",
		Limit:               4,
		HighlightLimit:      2,
		CategoryLeaderLimit: 1,
	})
	if err != nil {
		t.Fatalf("failed to build custom ranking: %v", err)
	}
	if len(customRanking.Highlights) != 2 {
		t.Fatalf("unexpected custom highlight count: got=%d want=2", len(customRanking.Highlights))
	}
	if len(customRanking.ListItems) != 2 {
		t.Fatalf("unexpected custom list item count: got=%d want=2", len(customRanking.ListItems))
	}
	if len(customRanking.CategoryLeaders) != 1 {
		t.Fatalf("unexpected custom category leader count: got=%d want=1", len(customRanking.CategoryLeaders))
	}
}
