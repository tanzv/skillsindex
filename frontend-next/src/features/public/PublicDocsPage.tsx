"use client";

import { useMemo } from "react";

import { PublicLink } from "@/src/components/shared/PublicLink";
import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { usePublicRouteState } from "@/src/lib/routing/usePublicRouteState";
import type { PublicMarketplaceResponse } from "@/src/lib/schemas/public";

import { PublicNarrativeStage } from "./PublicNarrativeStage";

interface PublicDocsPageProps {
  marketplace: PublicMarketplaceResponse;
}

export function PublicDocsPage({ marketplace }: PublicDocsPageProps) {
  const { messages } = usePublicI18n();
  const { toPublicPath } = usePublicRouteState();

  const stats = useMemo(
    () => [
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
    [
      marketplace.categories.length,
      messages.docsAppRouterBadge,
      messages.docsAppRouterDescription,
      messages.docsAppRouterTitle,
      messages.docsBackendBadge,
      messages.docsBackendDescription,
      messages.docsBackendTitle,
      messages.docsDesignSystemBadge,
      messages.docsDesignSystemDescription,
      messages.docsDesignSystemTitle,
      messages.metricCategoryFamilies,
      messages.statCategories
    ]
  );

  const mainSections = useMemo(
    () => [
      {
        key: "docs-platform",
        title: messages.docsAppRouterTitle,
        description: messages.docsAppRouterDescription,
        content: (
          <div className="marketplace-pill-row">
            <span className="marketplace-skill-chip">{messages.docsAppRouterBadge}</span>
            <span className="marketplace-skill-chip">{messages.docsDesignSystemBadge}</span>
            <span className="marketplace-skill-chip">{messages.docsBackendBadge}</span>
          </div>
        ),
        emphasis: true,
        testId: "public-docs-platform"
      },
      {
        key: "docs-marketplace-snapshot",
        title: messages.resultsDiscoveryNotesTitle,
        description: messages.resultsDiscoveryNotesDescription,
        content: (
          <div className="marketplace-simple-link-list">
            {marketplace.categories.slice(0, 4).map((category) => (
              <PublicLink
                key={category.slug}
                href={toPublicPath(`/categories/${category.slug}`)}
                className="marketplace-simple-link-item"
              >
                <span className="marketplace-sidebar-link">{category.name}</span>
                <span className="marketplace-meta-text">
                  {category.count} {messages.skillCountSuffix}
                </span>
              </PublicLink>
            ))}
          </div>
        ),
        testId: "public-docs-snapshot"
      }
    ],
    [
      marketplace.categories,
      messages.docsAppRouterBadge,
      messages.docsAppRouterDescription,
      messages.docsAppRouterTitle,
      messages.docsBackendBadge,
      messages.docsDesignSystemBadge,
      messages.resultsDiscoveryNotesDescription,
      messages.resultsDiscoveryNotesTitle,
      messages.skillCountSuffix,
      toPublicPath
    ]
  );

  const sideSections = useMemo(
    () => [
      {
        key: "docs-quick-links",
        title: messages.docsQuickLinksTitle,
        content: (
          <div className="marketplace-simple-link-list">
            <PublicLink className="marketplace-simple-link-item" href={toPublicPath("/")}>
              <span className="marketplace-sidebar-link">{messages.docsQuickLinkMarketplace}</span>
              <span className="marketplace-meta-text">{messages.stageLanding}</span>
            </PublicLink>
            <PublicLink className="marketplace-simple-link-item" href="/workspace">
              <span className="marketplace-sidebar-link">{messages.docsQuickLinkWorkspace}</span>
              <span className="marketplace-meta-text">{messages.stageAccess}</span>
            </PublicLink>
            <PublicLink className="marketplace-simple-link-item" href="/admin/overview">
              <span className="marketplace-sidebar-link">{messages.docsQuickLinkAdmin}</span>
              <span className="marketplace-meta-text">{messages.governanceTitle}</span>
            </PublicLink>
          </div>
        ),
        testId: "public-docs-quick-links"
      },
      {
        key: "docs-tags",
        title: messages.statTopTags,
        description: messages.metricTopTagPivots,
        content: (
          <div className="marketplace-pill-row">
            {marketplace.top_tags.slice(0, 6).map((tag) => (
              <span key={tag.name} className="marketplace-skill-chip">
                {tag.name}
              </span>
            ))}
          </div>
        ),
        testId: "public-docs-tags"
      }
    ],
    [
      marketplace.top_tags,
      messages.docsQuickLinkAdmin,
      messages.docsQuickLinkMarketplace,
      messages.docsQuickLinkWorkspace,
      messages.docsQuickLinksTitle,
      messages.governanceTitle,
      messages.metricTopTagPivots,
      messages.stageAccess,
      messages.stageLanding,
      messages.statTopTags,
      toPublicPath
    ]
  );

  return (
    <PublicNarrativeStage
      testId="public-docs-stage"
      eyebrow={messages.docsEyebrow}
      title={messages.docsTitle}
      description={messages.docsDescription}
      stats={stats}
      mainSections={mainSections}
      sideSections={sideSections}
      beforeSections={
        <nav className="marketplace-breadcrumb" aria-label={messages.categoryBreadcrumbAriaLabel}>
          <PublicLink href={toPublicPath("/")} className="marketplace-breadcrumb-link">
            {messages.shellHome}
          </PublicLink>
          <span className="marketplace-breadcrumb-separator">/</span>
          <span className="marketplace-breadcrumb-current">{messages.docsTitle}</span>
        </nav>
      }
    />
  );
}
