package web

import (
	"strings"

	"skillsindex/internal/models"
)

func filterSkillsByMarketplaceSelection(
	skills []models.Skill,
	category string,
	subcategory string,
	categoryGroup string,
	subcategoryGroup string,
) []models.Skill {
	return filterSkillsByMarketplaceSelectionWithTaxonomy(
		skills,
		category,
		subcategory,
		categoryGroup,
		subcategoryGroup,
		publicMarketplaceTaxonomy,
	)
}

func filterSkillsByMarketplaceSelectionWithTaxonomy(
	skills []models.Skill,
	category string,
	subcategory string,
	categoryGroup string,
	subcategoryGroup string,
	taxonomy []marketplacePresentationCategoryDefinition,
) []models.Skill {
	normalizedCategory := strings.TrimSpace(category)
	normalizedSubcategory := strings.TrimSpace(subcategory)
	normalizedCategoryGroup := normalizeMarketplacePresentationSlug(categoryGroup)
	normalizedSubcategoryGroup := normalizeMarketplacePresentationSlug(subcategoryGroup)

	if normalizedCategory == "" && normalizedSubcategory == "" && normalizedCategoryGroup == "" && normalizedSubcategoryGroup == "" {
		return skills
	}

	filtered := make([]models.Skill, 0, len(skills))
	for _, skill := range skills {
		if normalizedCategory != "" && skill.CategorySlug != normalizedCategory {
			continue
		}
		if normalizedSubcategory != "" && skill.SubcategorySlug != normalizedSubcategory {
			continue
		}
		if normalizedCategoryGroup != "" || normalizedSubcategoryGroup != "" {
			classification := resolveMarketplacePresentationClassificationForSkillWithTaxonomy(skill, taxonomy)
			if normalizedCategoryGroup != "" && classification.CategorySlug != normalizedCategoryGroup {
				continue
			}
			if normalizedSubcategoryGroup != "" && classification.SubcategorySlug != normalizedSubcategoryGroup {
				continue
			}
		}
		filtered = append(filtered, skill)
	}
	return filtered
}

func resolveMarketplacePresentationClassificationForSkill(skill models.Skill) marketplacePresentationClassification {
	return resolveMarketplacePresentationClassificationForSkillWithTaxonomy(skill, publicMarketplaceTaxonomy)
}

func resolveMarketplacePresentationClassificationForSkillWithTaxonomy(
	skill models.Skill,
	taxonomy []marketplacePresentationCategoryDefinition,
) marketplacePresentationClassification {
	return resolveMarketplacePresentationClassificationWithTaxonomy(taxonomy, marketplacePresentationClassificationInput{
		RawCategory:    skill.CategorySlug,
		RawSubcategory: skill.SubcategorySlug,
		RawLabel:       skill.Name,
		RawDescription: skill.Description,
		Tags:           skillTagNames(skill.Tags),
		SourceType:     string(skill.SourceType),
	})
}
