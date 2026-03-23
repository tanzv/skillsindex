import {
  type MarketplaceTaxonomyCategoryDefinition,
  type MarketplaceTaxonomySubcategoryDefinition,
  marketplaceTaxonomy
} from "@/src/lib/marketplace/taxonomyDefinitions";
import {
  humanizeMarketplaceSlug,
  normalizeMarketplaceSlug
} from "@/src/lib/marketplace/taxonomyText";
import type { MarketplaceSkill } from "@/src/lib/schemas/public";

interface SkillDetailTaxonomyMatch {
  category: MarketplaceTaxonomyCategoryDefinition | null;
  subcategory: MarketplaceTaxonomySubcategoryDefinition | null;
}

function findSubcategoryByDirectSlug(
  category: MarketplaceTaxonomyCategoryDefinition,
  normalizedSubcategory: string
): MarketplaceTaxonomySubcategoryDefinition | null {
  return category.subcategories.find((item) => item.slug === normalizedSubcategory) || null;
}

function findSubcategoryByLegacySubcategorySlug(
  category: MarketplaceTaxonomyCategoryDefinition,
  normalizedSubcategory: string
): MarketplaceTaxonomySubcategoryDefinition | null {
  return category.subcategories.find((item) => item.legacySubcategorySlugs?.includes(normalizedSubcategory)) || null;
}

function findGlobalSubcategoryMatch(
  normalizedCategory: string,
  normalizedSubcategory: string
): SkillDetailTaxonomyMatch {
  for (const category of marketplaceTaxonomy) {
    const directSubcategoryMatch = normalizedSubcategory
      ? findSubcategoryByDirectSlug(category, normalizedSubcategory)
      : null;

    if (directSubcategoryMatch) {
      return { category, subcategory: directSubcategoryMatch };
    }

    const legacySubcategoryMatch = normalizedSubcategory
      ? findSubcategoryByLegacySubcategorySlug(category, normalizedSubcategory)
      : null;

    if (legacySubcategoryMatch) {
      return { category, subcategory: legacySubcategoryMatch };
    }

    const legacyCategoryMatch = normalizedCategory
      ? category.subcategories.find((item) => item.legacyCategorySlugs?.includes(normalizedCategory))
      : null;

    if (legacyCategoryMatch) {
      return { category, subcategory: legacyCategoryMatch };
    }
  }

  return { category: null, subcategory: null };
}

function resolveSkillDetailTaxonomyMatch(skill: MarketplaceSkill): SkillDetailTaxonomyMatch {
  const normalizedCategory = normalizeMarketplaceSlug(skill.category);
  const normalizedSubcategory = normalizeMarketplaceSlug(skill.subcategory);
  const directCategoryMatch = marketplaceTaxonomy.find((item) => item.slug === normalizedCategory) || null;

  if (directCategoryMatch) {
    const directSubcategoryMatch = normalizedSubcategory
      ? findSubcategoryByDirectSlug(directCategoryMatch, normalizedSubcategory)
      : null;

    if (directSubcategoryMatch) {
      return { category: directCategoryMatch, subcategory: directSubcategoryMatch };
    }

    const legacySubcategoryMatch = normalizedSubcategory
      ? findSubcategoryByLegacySubcategorySlug(directCategoryMatch, normalizedSubcategory)
      : null;

    if (legacySubcategoryMatch) {
      return { category: directCategoryMatch, subcategory: legacySubcategoryMatch };
    }
  }

  const globalMatch = findGlobalSubcategoryMatch(normalizedCategory, normalizedSubcategory);
  if (globalMatch.category || globalMatch.subcategory) {
    return globalMatch;
  }

  return {
    category: directCategoryMatch,
    subcategory: null
  };
}

export function resolveSkillDetailCategoryLabel(skill: MarketplaceSkill): string {
  const match = resolveSkillDetailTaxonomyMatch(skill);
  return match.category?.name || humanizeMarketplaceSlug(skill.category, "General");
}

export function resolveSkillDetailSubcategoryLabel(skill: MarketplaceSkill): string {
  const match = resolveSkillDetailTaxonomyMatch(skill);
  return match.subcategory?.name || humanizeMarketplaceSlug(skill.subcategory, "General");
}
