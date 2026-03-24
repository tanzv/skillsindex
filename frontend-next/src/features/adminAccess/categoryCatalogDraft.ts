import type {
  AdminNormalizedCategoryCatalogItem,
  AdminNormalizedCategoryCatalogSubcategory
} from "@/src/lib/admin/adminAccountSettingsModel";

function normalizeCategoryCatalogOrder(items: AdminNormalizedCategoryCatalogItem[]): AdminNormalizedCategoryCatalogItem[] {
  return items.map((item, index) => ({
    ...item,
    sortOrder: (index + 1) * 10,
    subcategories: item.subcategories.map((subcategory, subcategoryIndex) => ({
      ...subcategory,
      sortOrder: (subcategoryIndex + 1) * 10
    }))
  }));
}

export function createEmptyCategoryCatalogItem(items: AdminNormalizedCategoryCatalogItem[]): AdminNormalizedCategoryCatalogItem {
  return {
    slug: "",
    name: "",
    description: "",
    enabled: true,
    sortOrder: (items.length + 1) * 10,
    subcategories: []
  };
}

export function createEmptyCategoryCatalogSubcategory(
  subcategories: AdminNormalizedCategoryCatalogSubcategory[]
): AdminNormalizedCategoryCatalogSubcategory {
  return {
    slug: "",
    name: "",
    enabled: true,
    sortOrder: (subcategories.length + 1) * 10
  };
}

export function updateCategoryCatalogCategory(
  items: AdminNormalizedCategoryCatalogItem[],
  categoryIndex: number,
  patch: Partial<AdminNormalizedCategoryCatalogItem>
): AdminNormalizedCategoryCatalogItem[] {
  return normalizeCategoryCatalogOrder(items.map((item, index) => (index === categoryIndex ? { ...item, ...patch } : item)));
}

export function removeCategoryCatalogCategory(
  items: AdminNormalizedCategoryCatalogItem[],
  categoryIndex: number
): AdminNormalizedCategoryCatalogItem[] {
  return normalizeCategoryCatalogOrder(items.filter((_, index) => index !== categoryIndex));
}

export function moveCategoryCatalogCategory(
  items: AdminNormalizedCategoryCatalogItem[],
  categoryIndex: number,
  direction: -1 | 1
): AdminNormalizedCategoryCatalogItem[] {
  const nextIndex = categoryIndex + direction;
  if (categoryIndex < 0 || categoryIndex >= items.length || nextIndex < 0 || nextIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  const current = nextItems[categoryIndex];
  nextItems[categoryIndex] = nextItems[nextIndex];
  nextItems[nextIndex] = current;
  return normalizeCategoryCatalogOrder(nextItems);
}

export function addCategoryCatalogCategory(items: AdminNormalizedCategoryCatalogItem[]): AdminNormalizedCategoryCatalogItem[] {
  return normalizeCategoryCatalogOrder([...items, createEmptyCategoryCatalogItem(items)]);
}

export function addCategoryCatalogSubcategory(
  items: AdminNormalizedCategoryCatalogItem[],
  categoryIndex: number
): AdminNormalizedCategoryCatalogItem[] {
  return normalizeCategoryCatalogOrder(
    items.map((item, index) =>
      index === categoryIndex
        ? {
            ...item,
            subcategories: [...item.subcategories, createEmptyCategoryCatalogSubcategory(item.subcategories)]
          }
        : item
    )
  );
}

export function updateCategoryCatalogSubcategory(
  items: AdminNormalizedCategoryCatalogItem[],
  categoryIndex: number,
  subcategoryIndex: number,
  patch: Partial<AdminNormalizedCategoryCatalogSubcategory>
): AdminNormalizedCategoryCatalogItem[] {
  return normalizeCategoryCatalogOrder(
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

export function removeCategoryCatalogSubcategory(
  items: AdminNormalizedCategoryCatalogItem[],
  categoryIndex: number,
  subcategoryIndex: number
): AdminNormalizedCategoryCatalogItem[] {
  return normalizeCategoryCatalogOrder(
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

export function moveCategoryCatalogSubcategory(
  items: AdminNormalizedCategoryCatalogItem[],
  categoryIndex: number,
  subcategoryIndex: number,
  direction: -1 | 1
): AdminNormalizedCategoryCatalogItem[] {
  return normalizeCategoryCatalogOrder(
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
