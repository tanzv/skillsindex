import type {
  AdminNormalizedPresentationTaxonomyCategory,
  AdminNormalizedPresentationTaxonomySubcategory
} from "@/src/lib/admin/adminAccountSettingsModel";

function normalizePresentationTaxonomyOrder(
  items: AdminNormalizedPresentationTaxonomyCategory[]
): AdminNormalizedPresentationTaxonomyCategory[] {
  return items.map((item, index) => ({
    ...item,
    sortOrder: (index + 1) * 10,
    subcategories: item.subcategories.map((subcategory, subcategoryIndex) => ({
      ...subcategory,
      sortOrder: (subcategoryIndex + 1) * 10
    }))
  }));
}

export function createEmptyPresentationTaxonomyCategory(
  items: AdminNormalizedPresentationTaxonomyCategory[]
): AdminNormalizedPresentationTaxonomyCategory {
  return {
    slug: "",
    name: "",
    description: "",
    enabled: true,
    sortOrder: (items.length + 1) * 10,
    subcategories: []
  };
}

export function createEmptyPresentationTaxonomySubcategory(
  subcategories: AdminNormalizedPresentationTaxonomySubcategory[]
): AdminNormalizedPresentationTaxonomySubcategory {
  return {
    slug: "",
    name: "",
    enabled: true,
    sortOrder: (subcategories.length + 1) * 10,
    legacyCategorySlugs: [],
    legacySubcategorySlugs: [],
    keywords: []
  };
}

export function addPresentationTaxonomyCategory(
  items: AdminNormalizedPresentationTaxonomyCategory[]
): AdminNormalizedPresentationTaxonomyCategory[] {
  return normalizePresentationTaxonomyOrder([...items, createEmptyPresentationTaxonomyCategory(items)]);
}

export function updatePresentationTaxonomyCategory(
  items: AdminNormalizedPresentationTaxonomyCategory[],
  categoryIndex: number,
  patch: Partial<AdminNormalizedPresentationTaxonomyCategory>
): AdminNormalizedPresentationTaxonomyCategory[] {
  return normalizePresentationTaxonomyOrder(items.map((item, index) => (index === categoryIndex ? { ...item, ...patch } : item)));
}

export function removePresentationTaxonomyCategory(
  items: AdminNormalizedPresentationTaxonomyCategory[],
  categoryIndex: number
): AdminNormalizedPresentationTaxonomyCategory[] {
  return normalizePresentationTaxonomyOrder(items.filter((_, index) => index !== categoryIndex));
}

export function movePresentationTaxonomyCategory(
  items: AdminNormalizedPresentationTaxonomyCategory[],
  categoryIndex: number,
  direction: -1 | 1
): AdminNormalizedPresentationTaxonomyCategory[] {
  const nextIndex = categoryIndex + direction;
  if (categoryIndex < 0 || categoryIndex >= items.length || nextIndex < 0 || nextIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  const current = nextItems[categoryIndex];
  nextItems[categoryIndex] = nextItems[nextIndex];
  nextItems[nextIndex] = current;
  return normalizePresentationTaxonomyOrder(nextItems);
}

export function addPresentationTaxonomySubcategory(
  items: AdminNormalizedPresentationTaxonomyCategory[],
  categoryIndex: number
): AdminNormalizedPresentationTaxonomyCategory[] {
  return normalizePresentationTaxonomyOrder(
    items.map((item, index) =>
      index === categoryIndex
        ? {
            ...item,
            subcategories: [...item.subcategories, createEmptyPresentationTaxonomySubcategory(item.subcategories)]
          }
        : item
    )
  );
}

export function updatePresentationTaxonomySubcategory(
  items: AdminNormalizedPresentationTaxonomyCategory[],
  categoryIndex: number,
  subcategoryIndex: number,
  patch: Partial<AdminNormalizedPresentationTaxonomySubcategory>
): AdminNormalizedPresentationTaxonomyCategory[] {
  return normalizePresentationTaxonomyOrder(
    items.map((item, index) =>
      index === categoryIndex
        ? {
            ...item,
            subcategories: item.subcategories.map((subcategory, currentIndex) =>
              currentIndex === subcategoryIndex ? { ...subcategory, ...patch } : subcategory
            )
          }
        : item
    )
  );
}

export function removePresentationTaxonomySubcategory(
  items: AdminNormalizedPresentationTaxonomyCategory[],
  categoryIndex: number,
  subcategoryIndex: number
): AdminNormalizedPresentationTaxonomyCategory[] {
  return normalizePresentationTaxonomyOrder(
    items.map((item, index) =>
      index === categoryIndex
        ? {
            ...item,
            subcategories: item.subcategories.filter((_, currentIndex) => currentIndex !== subcategoryIndex)
          }
        : item
    )
  );
}

export function movePresentationTaxonomySubcategory(
  items: AdminNormalizedPresentationTaxonomyCategory[],
  categoryIndex: number,
  subcategoryIndex: number,
  direction: -1 | 1
): AdminNormalizedPresentationTaxonomyCategory[] {
  return normalizePresentationTaxonomyOrder(
    items.map((item, index) => {
      if (index !== categoryIndex) {
        return item;
      }

      const nextIndex = subcategoryIndex + direction;
      if (subcategoryIndex < 0 || subcategoryIndex >= item.subcategories.length || nextIndex < 0 || nextIndex >= item.subcategories.length) {
        return item;
      }

      const nextSubcategories = [...item.subcategories];
      const current = nextSubcategories[subcategoryIndex];
      nextSubcategories[subcategoryIndex] = nextSubcategories[nextIndex];
      nextSubcategories[nextIndex] = current;

      return {
        ...item,
        subcategories: nextSubcategories
      };
    })
  );
}
