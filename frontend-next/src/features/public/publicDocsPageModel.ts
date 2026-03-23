import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import { publicHomeRoute } from "@/src/lib/routing/publicRouteRegistry";
import { adminOverviewRoute, workspaceOverviewRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import type { PublicMarketplaceResponse } from "@/src/lib/schemas/public";

export interface PublicDocsPageStat {
  label: string;
  value: string;
  detail: string;
}

export interface PublicDocsPageLinkItem {
  key: string;
  href: string;
  label: string;
  meta: string;
}

export interface PublicDocsPageSection {
  key: string;
  title: string;
  description?: string;
  links?: PublicDocsPageLinkItem[];
  badges?: string[];
  tags?: string[];
  emphasis?: boolean;
  testId: string;
}

export interface PublicDocsPageModel {
  eyebrow: string;
  title: string;
  description: string;
  breadcrumbTitle: string;
  stats: PublicDocsPageStat[];
  platformSection: PublicDocsPageSection;
  snapshotSection: PublicDocsPageSection;
  quickLinksSection: PublicDocsPageSection;
  tagsSection: PublicDocsPageSection;
}

export type PublicDocsPageMessages = Pick<
  PublicMarketplaceMessages,
  | "docsAppRouterBadge"
  | "docsAppRouterDescription"
  | "docsAppRouterTitle"
  | "docsBackendBadge"
  | "docsBackendDescription"
  | "docsBackendTitle"
  | "docsDescription"
  | "docsDesignSystemBadge"
  | "docsDesignSystemDescription"
  | "docsDesignSystemTitle"
  | "docsEyebrow"
  | "docsQuickLinkAdmin"
  | "docsQuickLinkMarketplace"
  | "docsQuickLinkWorkspace"
  | "docsQuickLinksTitle"
  | "docsTitle"
  | "governanceTitle"
  | "metricCategoryFamilies"
  | "metricTopTagPivots"
  | "resultsDiscoveryNotesDescription"
  | "resultsDiscoveryNotesTitle"
  | "shellHome"
  | "skillCountSuffix"
  | "stageAccess"
  | "stageLanding"
  | "statCategories"
  | "statTopTags"
>;

export interface BuildPublicDocsPageModelInput {
  marketplace: PublicMarketplaceResponse;
  messages: PublicDocsPageMessages;
  resolvePath: (route: string) => string;
}

export function buildPublicDocsPageModel({
  marketplace,
  messages,
  resolvePath
}: BuildPublicDocsPageModelInput): PublicDocsPageModel {
  return {
    eyebrow: messages.docsEyebrow,
    title: messages.docsTitle,
    description: messages.docsDescription,
    breadcrumbTitle: messages.docsTitle,
    stats: [
      {
        label: messages.docsAppRouterTitle,
        value: messages.docsAppRouterBadge,
        detail: messages.docsAppRouterDescription
      },
      {
        label: messages.docsDesignSystemTitle,
        value: messages.docsDesignSystemBadge,
        detail: messages.docsDesignSystemDescription
      },
      {
        label: messages.docsBackendTitle,
        value: messages.docsBackendBadge,
        detail: messages.docsBackendDescription
      },
      {
        label: messages.statCategories,
        value: String(marketplace.categories.length),
        detail: messages.metricCategoryFamilies
      }
    ],
    platformSection: {
      key: "docs-platform",
      title: messages.docsAppRouterTitle,
      description: messages.docsAppRouterDescription,
      badges: [
        messages.docsAppRouterBadge,
        messages.docsDesignSystemBadge,
        messages.docsBackendBadge
      ],
      emphasis: true,
      testId: "public-docs-platform"
    },
    snapshotSection: {
      key: "docs-marketplace-snapshot",
      title: messages.resultsDiscoveryNotesTitle,
      description: messages.resultsDiscoveryNotesDescription,
      links: marketplace.categories.slice(0, 4).map((category) => ({
        key: category.slug,
        href: resolvePath(`/categories/${category.slug}`),
        label: category.name,
        meta: `${category.count} ${messages.skillCountSuffix}`
      })),
      testId: "public-docs-snapshot"
    },
    quickLinksSection: {
      key: "docs-quick-links",
      title: messages.docsQuickLinksTitle,
      links: [
        {
          key: "docs-marketplace",
          href: resolvePath(publicHomeRoute),
          label: messages.docsQuickLinkMarketplace,
          meta: messages.stageLanding
        },
        {
          key: "docs-workspace",
          href: workspaceOverviewRoute,
          label: messages.docsQuickLinkWorkspace,
          meta: messages.stageAccess
        },
        {
          key: "docs-admin",
          href: adminOverviewRoute,
          label: messages.docsQuickLinkAdmin,
          meta: messages.governanceTitle
        }
      ],
      testId: "public-docs-quick-links"
    },
    tagsSection: {
      key: "docs-tags",
      title: messages.statTopTags,
      description: messages.metricTopTagPivots,
      tags: marketplace.top_tags.slice(0, 6).map((tag) => tag.name),
      testId: "public-docs-tags"
    }
  };
}
