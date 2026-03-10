import type { AppLocale } from "../../lib/i18n";

export interface PublicCategoriesLocalizedCopy {
  brandSubtitle: string;
  pageTitle: string;
  pageSubtitle: string;
  rankings: string;
  categoriesTab: string;
  topSubcategories: string;
  noDescription: string;
  emptyState: string;
  loadError: string;
  cardCountLabel: string;
  subcategoryCountLabel: string;
  topSubcategoryCountLabel: string;
  iconPlaceholderLabel: string;
  iconPlaceholderFallback: string;
  uncategorizedName: string;
  generalSubcategoryName: string;
}

const categoriesPageCopy: Record<AppLocale, PublicCategoriesLocalizedCopy> = {
  en: {
    brandSubtitle: "User Portal",
    pageTitle: "Categories",
    pageSubtitle: "Select a category and start filtering.",
    rankings: "Open Rankings",
    categoriesTab: "Categories",
    topSubcategories: "Includes",
    noDescription: "No category description available",
    emptyState: "No categories are available",
    loadError: "Unable to resolve category payload",
    cardCountLabel: "Skills",
    subcategoryCountLabel: "Subcategories",
    topSubcategoryCountLabel: "Top 3 Skills",
    iconPlaceholderLabel: "Category icon",
    iconPlaceholderFallback: "CT",
    uncategorizedName: "Uncategorized",
    generalSubcategoryName: "General"
  },
  zh: {
    brandSubtitle: "\u7528\u6237\u95e8\u6237",
    pageTitle: "\u5206\u7c7b",
    pageSubtitle: "\u9009\u62e9\u5206\u7c7b\u540e\u5373\u53ef\u8fdb\u884c\u7b5b\u9009\u3002",
    rankings: "\u67e5\u770b\u6392\u884c\u699c",
    categoriesTab: "\u5206\u7c7b",
    topSubcategories: "\u5305\u542b\u5b50\u5206\u7c7b",
    noDescription: "\u6682\u65e0\u63cf\u8ff0",
    emptyState: "\u6682\u65e0\u53ef\u7528\u5206\u7c7b",
    loadError: "\u5206\u7c7b\u6570\u636e\u52a0\u8f7d\u5931\u8d25",
    cardCountLabel: "\u6280\u80fd\u6570",
    subcategoryCountLabel: "\u5b50\u5206\u7c7b\u6570",
    topSubcategoryCountLabel: "\u524d3\u5b50\u5206\u7c7b\u6280\u80fd\u6570",
    iconPlaceholderLabel: "\u5206\u7c7b\u56fe\u6807",
    iconPlaceholderFallback: "CT",
    uncategorizedName: "\u672a\u5206\u7c7b",
    generalSubcategoryName: "\u901a\u7528"
  }
};

export function resolvePublicCategoriesCopy(locale: AppLocale): PublicCategoriesLocalizedCopy {
  return categoriesPageCopy[locale];
}
