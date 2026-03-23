"use client";

import { PublicLink } from "@/src/components/shared/PublicLink";
import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { publicHomeRoute } from "@/src/lib/routing/publicRouteRegistry";
import { usePublicRouteState } from "@/src/lib/routing/usePublicRouteState";
import type { PublicMarketplaceResponse } from "@/src/lib/schemas/public";

import { PublicNarrativeStage } from "./PublicNarrativeStage";
import { MarketplaceSupportLinkList } from "./marketplace/MarketplaceSupportLinkList";
import { buildPublicDocsPageModel } from "./publicDocsPageModel";

interface PublicDocsPageProps {
  marketplace: PublicMarketplaceResponse;
}

export function PublicDocsPage({ marketplace }: PublicDocsPageProps) {
  const { messages } = usePublicI18n();
  const { toPublicPath } = usePublicRouteState();
  const model = buildPublicDocsPageModel({
    marketplace,
    messages,
    resolvePath: toPublicPath
  });

  return (
    <PublicNarrativeStage
      testId="public-docs-stage"
      eyebrow={model.eyebrow}
      title={model.title}
      description={model.description}
      stats={model.stats}
      mainSections={[
        {
          key: model.platformSection.key,
          title: model.platformSection.title,
          description: model.platformSection.description,
          content: (
            <div className="marketplace-pill-row">
              {model.platformSection.badges?.map((badge) => (
                <span key={badge} className="marketplace-skill-chip">
                  {badge}
                </span>
              ))}
            </div>
          ),
          emphasis: model.platformSection.emphasis,
          testId: model.platformSection.testId
        },
        {
          key: model.snapshotSection.key,
          title: model.snapshotSection.title,
          description: model.snapshotSection.description,
          content: <MarketplaceSupportLinkList items={model.snapshotSection.links || []} />,
          testId: model.snapshotSection.testId
        }
      ]}
      sideSections={[
        {
          key: model.quickLinksSection.key,
          title: model.quickLinksSection.title,
          description: model.quickLinksSection.description,
          content: <MarketplaceSupportLinkList items={model.quickLinksSection.links || []} />,
          testId: model.quickLinksSection.testId
        },
        {
          key: model.tagsSection.key,
          title: model.tagsSection.title,
          description: model.tagsSection.description,
          content: (
            <div className="marketplace-pill-row">
              {model.tagsSection.tags?.map((tag) => (
                <span key={tag} className="marketplace-skill-chip">
                  {tag}
                </span>
              ))}
            </div>
          ),
          testId: model.tagsSection.testId
        }
      ]}
      beforeSections={
        <nav className="marketplace-breadcrumb" aria-label={messages.categoryBreadcrumbAriaLabel}>
          <PublicLink href={toPublicPath(publicHomeRoute)} className="marketplace-breadcrumb-link">
            {messages.shellHome}
          </PublicLink>
          <span className="marketplace-breadcrumb-separator">/</span>
          <span className="marketplace-breadcrumb-current">{model.breadcrumbTitle}</span>
        </nav>
      }
    />
  );
}
