"use client";

import Link from "next/link";

import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { formatPublicDate } from "@/src/lib/i18n/publicLocale";
import { publicHomeRoute } from "@/src/lib/routing/publicRouteRegistry";
import { usePublicRouteState } from "@/src/lib/routing/usePublicRouteState";
import type { PublicMarketplaceResponse } from "@/src/lib/schemas/public";

import { PublicNarrativeStage } from "./PublicNarrativeStage";
import { MarketplaceCompareSelectionList } from "./marketplace/MarketplaceCompareSelectionList";
import { MarketplaceSkillCard } from "./marketplace/MarketplaceSkillCard";
import { MarketplaceSupportLinkList } from "./marketplace/MarketplaceSupportLinkList";
import { buildPublicProgramPageModel, type PublicProgramPageKey } from "./publicProgramPageModel";

interface PublicProgramPageProps {
  pageKey: PublicProgramPageKey;
  marketplace: PublicMarketplaceResponse;
}

export function PublicProgramPage({ pageKey, marketplace }: PublicProgramPageProps) {
  const { locale, messages } = usePublicI18n();
  const { toPublicPath } = usePublicRouteState();
  const model = buildPublicProgramPageModel({
    pageKey,
    marketplace,
    messages,
    locale,
    resolvePath: toPublicPath,
    formatDate: formatPublicDate
  });

  return (
    <PublicNarrativeStage
      testId={`public-program-${pageKey}`}
      eyebrow={messages.stageMarketplace}
      title={model.descriptor.title}
      description={model.descriptor.description}
      stats={model.stats}
      mainSections={[
        {
          key: model.primarySection.key,
          title: model.primarySection.title,
          description: model.primarySection.description,
          content: (
            <div className="marketplace-list-stack">
              {model.primarySection.items?.map((item) => (
                <MarketplaceSkillCard key={item.id} item={item} />
              ))}
            </div>
          ),
          emphasis: model.primarySection.emphasis,
          testId: model.primarySection.testId
        },
        {
          key: model.categoriesSection.key,
          title: model.categoriesSection.title,
          description: model.categoriesSection.description,
          content: <MarketplaceSupportLinkList items={model.categoriesSection.links || []} />,
          testId: model.categoriesSection.testId
        }
      ]}
      sideSections={[
        {
          key: `${pageKey}-continue`,
          title: model.continueSectionTitle,
          description: model.continueSectionDescription,
          content: <MarketplaceSupportLinkList items={model.continueLinks} />,
          testId: `public-program-${pageKey}-continue`
        },
        {
          key: `${pageKey}-signals`,
          title: model.signalsSectionTitle,
          description: model.signalsSectionDescription,
          content: (
            <div className="marketplace-list-stack">
              <MarketplaceSupportLinkList items={model.signalLinks} />
              {model.leadingSkillSignal ? <MarketplaceCompareSelectionList items={[model.leadingSkillSignal]} /> : null}
            </div>
          ),
          testId: `public-program-${pageKey}-signals`
        }
      ]}
      beforeSections={
        <nav className="marketplace-breadcrumb" aria-label={messages.categoryBreadcrumbAriaLabel}>
          <Link href={toPublicPath(publicHomeRoute)} className="marketplace-breadcrumb-link">
            {messages.shellHome}
          </Link>
          <span className="marketplace-breadcrumb-separator">/</span>
          <span className="marketplace-breadcrumb-current">{model.breadcrumbTitle}</span>
        </nav>
      }
    />
  );
}
