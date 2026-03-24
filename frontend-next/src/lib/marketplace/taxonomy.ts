import type { MarketplaceCategory, MarketplaceSkill, PublicMarketplaceResponse } from "@/src/lib/schemas/public";

import {
  type MarketplaceClassificationInput,
  type MarketplaceTaxonomyCategoryDefinition,
  type MarketplaceTaxonomyClassification,
  type MarketplaceTaxonomySubcategoryDefinition,
  marketplaceTaxonomy,
  taxonomyCategoryLookup,
  taxonomyOrderLookup,
  taxonomySubcategoryLookup
} from "./taxonomyDefinitions";
import {
  buildLegacyMarketplaceCategorySummary,
  buildMarketplaceTaxonomyCategorySummary
} from "./categoryCatalog";
import {
  buildMarketplaceKeywordSet,
  hasMarketplaceKeywordMatch,
  humanizeMarketplaceSlug,
  normalizeMarketplaceSlug
} from "./taxonomyText";

function matchesTaxonomySubcategoryByLegacySlug(
  definition: MarketplaceTaxonomySubcategoryDefinition,
  input: MarketplaceClassificationInput
): boolean {
  const normalizedCategory = normalizeMarketplaceSlug(input.rawCategory);
  const normalizedSubcategory = normalizeMarketplaceSlug(input.rawSubcategory);

  if (normalizedSubcategory && definition.legacySubcategorySlugs?.includes(normalizedSubcategory)) {
    return true;
  }

  if (!normalizedSubcategory && normalizedCategory && definition.legacyCategorySlugs?.includes(normalizedCategory)) {
    return true;
  }

  return false;
}

function matchesTaxonomySubcategoryByHeuristics(
  definition: MarketplaceTaxonomySubcategoryDefinition,
  input: MarketplaceClassificationInput,
  keywords: Set<string>
): boolean {
  const normalizedCategory = normalizeMarketplaceSlug(input.rawCategory);
  const normalizedSubcategory = normalizeMarketplaceSlug(input.rawSubcategory);

  if (definition.legacySubcategorySlugs?.includes(normalizedSubcategory)) {
    return true;
  }

  if (definition.legacyCategorySlugs?.includes(normalizedCategory)) {
    if (!definition.legacySubcategorySlugs?.length) {
      return true;
    }

    if (!normalizedSubcategory) {
      return true;
    }
  }

  return hasMarketplaceKeywordMatch(keywords, definition.keywords);
}

function resolveMarketplaceClassification(input: MarketplaceClassificationInput): MarketplaceTaxonomyClassification {
  const keywords = buildMarketplaceKeywordSet(
    input.rawCategory,
    input.rawSubcategory,
    input.rawLabel,
    input.rawDescription,
    input.tags,
    input.sourceType
  );

  for (const category of marketplaceTaxonomy) {
    for (const subcategory of category.subcategories) {
      if (matchesTaxonomySubcategoryByLegacySlug(subcategory, input)) {
        return { category, subcategory };
      }
    }
  }

  for (const category of marketplaceTaxonomy) {
    for (const subcategory of category.subcategories) {
      if (matchesTaxonomySubcategoryByHeuristics(subcategory, input, keywords)) {
        return { category, subcategory };
      }
    }
  }

  const fallbackCategory = taxonomyCategoryLookup.get("programming-development")!;
  const fallbackSubcategory = taxonomySubcategoryLookup.get("coding-agents-ides")!;

  return {
    category: fallbackCategory,
    subcategory: fallbackSubcategory
  };
}

function resolveBackendMarketplaceCategorySlug(item: MarketplaceSkill): string {
  return normalizeMarketplaceSlug(item.category_group);
}

function resolveBackendMarketplaceSubcategorySlug(item: MarketplaceSkill): string {
  return normalizeMarketplaceSlug(item.subcategory_group);
}

function hasBackendMarketplaceClassification(item: MarketplaceSkill): boolean {
  return Boolean(resolveBackendMarketplaceCategorySlug(item) && resolveBackendMarketplaceSubcategorySlug(item));
}

function resolveMarketplaceCategoryDefinitionFromItem(item: MarketplaceSkill): MarketplaceTaxonomyCategoryDefinition | null {
  const backendCategorySlug = resolveBackendMarketplaceCategorySlug(item);
  if (backendCategorySlug) {
    return taxonomyCategoryLookup.get(backendCategorySlug) || null;
  }

  return resolveMarketplaceClassification({
    rawCategory: item.category,
    rawSubcategory: item.subcategory,
    rawLabel: item.name,
    rawDescription: item.description,
    tags: item.tags,
    sourceType: item.source_type
  }).category;
}

function resolveMarketplaceSubcategoryDefinitionFromItem(item: MarketplaceSkill): MarketplaceTaxonomySubcategoryDefinition | null {
  const backendSubcategorySlug = resolveBackendMarketplaceSubcategorySlug(item);
  if (backendSubcategorySlug) {
    return taxonomySubcategoryLookup.get(backendSubcategorySlug) || null;
  }

  return resolveMarketplaceClassification({
    rawCategory: item.category,
    rawSubcategory: item.subcategory,
    rawLabel: item.name,
    rawDescription: item.description,
    tags: item.tags,
    sourceType: item.source_type
  }).subcategory;
}

export function resolveMarketplaceCategorySummary(
  categories: MarketplaceCategory[],
  activeCategory: string | undefined,
  items: MarketplaceSkill[] = []
): MarketplaceCategory | null {
  const normalizedCategory = normalizeMarketplaceSlug(activeCategory);
  if (!normalizedCategory) {
    return null;
  }

  const groupedCategory = categories.find((category) => normalizeMarketplaceSlug(category.slug) === normalizedCategory) || null;
  const taxonomyCategory = taxonomyCategoryLookup.get(normalizedCategory);

  if (taxonomyCategory) {
    return buildMarketplaceTaxonomyCategorySummary(taxonomyCategory, groupedCategory);
  }

  if (groupedCategory) {
    return groupedCategory;
  }

  return buildLegacyMarketplaceCategorySummary(items, normalizedCategory);
}

export function resolveMarketplaceSkillCategoryLabel(item: MarketplaceSkill): string {
  const backendLabel = String(item.category_group_label || "").trim();
  if (backendLabel) {
    return backendLabel;
  }

  return resolveMarketplaceCategoryDefinitionFromItem(item)?.name || "";
}

export function resolveMarketplaceSkillSubcategoryLabel(item: MarketplaceSkill): string {
  const backendLabel = String(item.subcategory_group_label || "").trim();
  if (backendLabel) {
    return backendLabel;
  }

  return resolveMarketplaceSubcategoryDefinitionFromItem(item)?.name || "";
}

export function resolveMarketplaceSkillCategorySlug(item: MarketplaceSkill): string {
  const backendCategorySlug = resolveBackendMarketplaceCategorySlug(item);
  if (backendCategorySlug) {
    return backendCategorySlug;
  }

  return resolveMarketplaceCategoryDefinitionFromItem(item)?.slug || "";
}

export function resolveMarketplaceSkillSubcategorySlug(item: MarketplaceSkill): string {
  const backendSubcategorySlug = resolveBackendMarketplaceSubcategorySlug(item);
  if (backendSubcategorySlug) {
    return backendSubcategorySlug;
  }

  return resolveMarketplaceSubcategoryDefinitionFromItem(item)?.slug || "";
}

export function isPresentationCategorySlug(categorySlug: string | undefined): boolean {
  return taxonomyCategoryLookup.has(normalizeMarketplaceSlug(categorySlug));
}

export function matchesMarketplaceCategorySelection(
  item: MarketplaceSkill,
  activeCategory: string | undefined,
  activeSubcategory?: string
): boolean {
  const normalizedCategory = normalizeMarketplaceSlug(activeCategory);
  const normalizedSubcategory = normalizeMarketplaceSlug(activeSubcategory);

  if (!normalizedCategory) {
    return true;
  }

  if (isPresentationCategorySlug(normalizedCategory)) {
    if (resolveMarketplaceSkillCategorySlug(item) !== normalizedCategory) {
      return false;
    }

    if (normalizedSubcategory && resolveMarketplaceSkillSubcategorySlug(item) !== normalizedSubcategory) {
      return false;
    }

    return true;
  }

  if (normalizeMarketplaceSlug(item.category) !== normalizedCategory) {
    return false;
  }

  if (normalizedSubcategory && normalizeMarketplaceSlug(item.subcategory) !== normalizedSubcategory) {
    return false;
  }

  return true;
}

export function buildMarketplaceSkillSearchText(item: MarketplaceSkill): string {
  return [
    item.name,
    item.description,
    item.category,
    item.subcategory,
    item.source_type,
    item.tags.join(" "),
    resolveMarketplaceSkillCategorySlug(item),
    resolveMarketplaceSkillCategoryLabel(item),
    resolveMarketplaceSkillSubcategorySlug(item),
    resolveMarketplaceSkillSubcategoryLabel(item)
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function buildRawMarketplaceCategoriesFromItems(items: MarketplaceSkill[]): MarketplaceCategory[] {
  const categoryCounter = new Map<string, { name: string; description: string; subcategories: Map<string, { name: string; count: number }> }>();

  for (const item of items) {
    const categorySlug = normalizeMarketplaceSlug(item.category) || "general";
    const categoryEntry = categoryCounter.get(categorySlug) || {
      name: humanizeMarketplaceSlug(item.category),
      description: "",
      subcategories: new Map<string, { name: string; count: number }>()
    };

    const subcategorySlug = normalizeMarketplaceSlug(item.subcategory) || "general";
    const subcategoryEntry = categoryEntry.subcategories.get(subcategorySlug) || {
      name: humanizeMarketplaceSlug(item.subcategory, "General"),
      count: 0
    };

    subcategoryEntry.count += 1;
    categoryEntry.subcategories.set(subcategorySlug, subcategoryEntry);
    categoryCounter.set(categorySlug, categoryEntry);
  }

  return [...categoryCounter.entries()]
    .map(([slug, entry]) => ({
      slug,
      name: entry.name,
      description: entry.description,
      count: [...entry.subcategories.values()].reduce((total, item) => total + item.count, 0),
      subcategories: [...entry.subcategories.entries()]
        .map(([subcategorySlug, subcategory]) => ({
          slug: subcategorySlug,
          name: subcategory.name,
          count: subcategory.count
        }))
        .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
    }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
}

export function buildMarketplacePresentationCategories(rawCategories: MarketplaceCategory[]): MarketplaceCategory[] {
  const groupedCategories = new Map<
    string,
    {
      definition: (typeof marketplaceTaxonomy)[number];
      count: number;
      subcategories: Map<string, { definition: MarketplaceTaxonomySubcategoryDefinition; count: number }>;
    }
  >();

  for (const rawCategory of rawCategories) {
    const rawSubcategories =
      Array.isArray(rawCategory.subcategories) && rawCategory.subcategories.length > 0
        ? rawCategory.subcategories
        : [{ slug: rawCategory.slug, name: rawCategory.name, count: rawCategory.count }];

    for (const rawSubcategory of rawSubcategories) {
      const count = Number(rawSubcategory.count || 0);
      if (!Number.isFinite(count) || count <= 0) {
        continue;
      }

      const classification = resolveMarketplaceClassification({
        rawCategory: rawCategory.slug,
        rawSubcategory: rawSubcategory.slug,
        rawLabel: `${rawCategory.name} ${rawSubcategory.name}`,
        rawDescription: `${rawCategory.description} ${rawSubcategory.name}`
      });

      const currentGroup = groupedCategories.get(classification.category.slug) || {
        definition: classification.category,
        count: 0,
        subcategories: new Map<string, { definition: MarketplaceTaxonomySubcategoryDefinition; count: number }>()
      };
      currentGroup.count += count;

      const currentSubcategory = currentGroup.subcategories.get(classification.subcategory.slug) || {
        definition: classification.subcategory,
        count: 0
      };
      currentSubcategory.count += count;
      currentGroup.subcategories.set(classification.subcategory.slug, currentSubcategory);
      groupedCategories.set(classification.category.slug, currentGroup);
    }
  }

  return marketplaceTaxonomy
    .map((category) => {
      const groupedCategory = groupedCategories.get(category.slug);
      if (!groupedCategory || groupedCategory.count <= 0) {
        return null;
      }

      const subcategories = [...groupedCategory.subcategories.values()]
        .sort((left, right) => {
          if (right.count !== left.count) {
            return right.count - left.count;
          }

          const leftOrder = taxonomyOrderLookup.get(left.definition.slug);
          const rightOrder = taxonomyOrderLookup.get(right.definition.slug);
          if (leftOrder && rightOrder && leftOrder.subcategoryIndex !== rightOrder.subcategoryIndex) {
            return leftOrder.subcategoryIndex - rightOrder.subcategoryIndex;
          }

          return left.definition.name.localeCompare(right.definition.name);
        })
        .map((subcategory) => ({
          slug: subcategory.definition.slug,
          name: subcategory.definition.name,
          count: subcategory.count
        }));

      return {
        slug: category.slug,
        name: category.name,
        description: category.description,
        count: groupedCategory.count,
        subcategories
      };
    })
    .filter((category): category is MarketplaceCategory => Boolean(category));
}

export function buildMarketplacePresentationPayload(payload: PublicMarketplaceResponse): PublicMarketplaceResponse {
  const categoriesAreAlreadyGrouped =
    Array.isArray(payload.categories) &&
    payload.categories.length > 0 &&
    payload.categories.every(
      (category) =>
        taxonomyCategoryLookup.has(normalizeMarketplaceSlug(category.slug)) &&
        category.subcategories.every((subcategory) => taxonomySubcategoryLookup.has(normalizeMarketplaceSlug(subcategory.slug)))
    );
  const itemsAlreadyCarryGroupedFields =
    Array.isArray(payload.items) &&
    (payload.items.length === 0 || payload.items.every((item) => hasBackendMarketplaceClassification(item)));

  if (categoriesAreAlreadyGrouped && itemsAlreadyCarryGroupedFields) {
    return payload;
  }

  const rawCategories =
    Array.isArray(payload.categories) && payload.categories.length > 0
      ? payload.categories
      : buildRawMarketplaceCategoriesFromItems(payload.items);

  return {
    ...payload,
    categories: buildMarketplacePresentationCategories(rawCategories)
  };
}
