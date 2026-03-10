import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { AppLocale } from "../../lib/i18n";
import type { SessionUser } from "../../lib/api";
import type { ThemeMode } from "../../lib/themeModePath";
import MarketplaceSearchStrip from "../../components/MarketplaceSearchStrip";
import MarketplacePageBreadcrumb from "../../components/MarketplacePageBreadcrumb";
import MarketplaceHomeResultsContent from "./MarketplaceHomeResultsContent";
import MarketplaceHomeLocaleThemeSwitch from "./MarketplaceHomeLocaleThemeSwitch";
import MarketplaceHomeSearchOverlay from "./MarketplaceHomeSearchOverlay";
import MarketplaceHomeSkillCard from "./MarketplaceHomeSkillCard";
import MarketplaceHomeTopStatsCard from "./MarketplaceHomeTopStatsCard";
import MarketplacePublicPageShell from "../marketplacePublic/MarketplacePublicPageShell";
import MarketplaceTopbar from "../marketplacePublic/MarketplaceTopbar";
import { buildMarketplaceText } from "../marketplacePublic/marketplaceText";
import type { PrototypeCardEntry } from "./MarketplaceHomePage.helpers";
import { useMarketplaceHomeController } from "./useMarketplaceHomeController";

interface MarketplaceHomePageProps {
  locale: AppLocale;
  sessionUser: SessionUser | null;
  onNavigate: (path: string) => void;
  onLogout?: () => Promise<void> | void;
  onThemeModeChange?: (nextMode: ThemeMode) => void;
  onLocaleChange?: (nextLocale: AppLocale) => void;
  locationKey: string;
  isResultsPage?: boolean;
}

export default function MarketplaceHomePage({
  locale,
  sessionUser,
  onNavigate,
  onLogout,
  onThemeModeChange,
  onLocaleChange,
  locationKey,
  isResultsPage = false
}: MarketplaceHomePageProps) {
  const { t } = useTranslation();
  const text = useMemo(() => buildMarketplaceText(t), [t, locale]);

  const {
    form,
    recentSearches,
    isSearchOverlayOpen,
    isMobileLayout,
    isLightTheme,
    currentThemeMode,
    rootClassName,
    topbarBrandTitle,
    topbarBrandSubtitle,
    topbarActionBundle,
    topbarRightRegistrations,
    resultsPageBreadcrumbItems,
    hotFilters,
    trendPathData,
    featuredCards,
    resultCards,
    currentPage,
    totalPages,
    autoLoadConfig,
    shouldDisableSearchSubmit,
    handleBrandClick,
    handleSearchSubmit,
    handleSearchEntryOpen,
    handleSearchInputKeyDown,
    handlePageChange,
    handleSkillOpen,
    handleHotFilterApply,
    handleFilterFieldChange,
    handleOverlayClose,
    handleRecentSearchApply,
    handleRecentSearchClear
  } = useMarketplaceHomeController({
    locale,
    sessionUser,
    text,
    onNavigate,
    onLogout,
    locationKey,
    isResultsPage
  });

  function renderSkillCard(card: PrototypeCardEntry, key: string): JSX.Element {
    return <MarketplaceHomeSkillCard card={card} cardKey={key} onOpen={handleSkillOpen} />;
  }

  return (
    <MarketplacePublicPageShell
      isResultsStage={isResultsPage}
      isMobileLayout={isMobileLayout}
      isLightTheme={isLightTheme}
      rootClassName={rootClassName}
      rootTestId="marketplace-home-root"
    >
      <MarketplaceTopbar
        shellClassName="animated-fade-down"
        dataAnimated
        brandTitle={topbarBrandTitle}
        brandSubtitle={topbarBrandSubtitle}
        onBrandClick={handleBrandClick}
        isLightTheme={isLightTheme}
        primaryActions={topbarActionBundle.primaryActions}
        utilityActions={topbarActionBundle.utilityActions}
        rightRegistrations={topbarRightRegistrations}
        localeThemeSwitch={
          <MarketplaceHomeLocaleThemeSwitch
            locale={locale}
            currentThemeMode={currentThemeMode}
            onThemeModeChange={onThemeModeChange}
            onLocaleChange={onLocaleChange}
          />
        }
      />

      {isResultsPage ? (
        <>
          <section className="marketplace-page-breadcrumb-shell">
            <MarketplacePageBreadcrumb
              items={resultsPageBreadcrumbItems}
              ariaLabel="Results page breadcrumb"
              testIdPrefix="results-page-breadcrumb"
            />
          </section>

          <section className="marketplace-search-strip animated-fade-up delay-1" role="search" aria-label="Marketplace search" data-animated="true">
            <MarketplaceSearchStrip
              variant="results"
              text={text}
              form={form}
              submitDisabled={shouldDisableSearchSubmit}
              hotFilters={hotFilters}
              onFilterFieldChange={handleFilterFieldChange}
              onSearchInputKeyDown={handleSearchInputKeyDown}
              onSearchSubmit={handleSearchSubmit}
              onHotFilterApply={handleHotFilterApply}
            />
          </section>

          <main className="marketplace-layout animated-fade-up delay-2" data-animated="true">
            <MarketplaceHomeResultsContent
              isResultsPage={true}
              text={text}
              currentPage={currentPage}
              totalPages={totalPages}
              resultCards={resultCards}
              featuredCards={featuredCards}
              autoLoadConfig={autoLoadConfig}
              onPageChange={handlePageChange}
              renderSkillCard={renderSkillCard}
            />
          </main>
        </>
      ) : (
        <>
          <section className="marketplace-search-strip animated-fade-up delay-1" role="search" aria-label="Marketplace search" data-animated="true">
            <MarketplaceHomeTopStatsCard text={text} trendPathData={trendPathData} />
            <MarketplaceSearchStrip
              variant="home-entry"
              text={text}
              form={form}
              submitDisabled={shouldDisableSearchSubmit}
              hotFilters={hotFilters}
              onFilterFieldChange={handleFilterFieldChange}
              onSearchInputKeyDown={handleSearchInputKeyDown}
              onSearchSubmit={handleSearchSubmit}
              onSearchEntryOpen={handleSearchEntryOpen}
              onHotFilterApply={handleHotFilterApply}
            />
          </section>

          <main className="marketplace-layout animated-fade-up delay-2" data-animated="true">
            <MarketplaceHomeResultsContent
              isResultsPage={false}
              text={text}
              currentPage={currentPage}
              totalPages={totalPages}
              resultCards={resultCards}
              featuredCards={featuredCards}
              autoLoadConfig={autoLoadConfig}
              onPageChange={handlePageChange}
              renderSkillCard={renderSkillCard}
            />
          </main>
        </>
      )}

      <MarketplaceHomeSearchOverlay
        isVisible={!isResultsPage && isSearchOverlayOpen}
        text={text}
        form={form}
        recentSearches={recentSearches}
        isLightTheme={isLightTheme}
        onFilterFieldChange={handleFilterFieldChange}
        onSearchSubmit={handleSearchSubmit}
        onSearchInputKeyDown={handleSearchInputKeyDown}
        onRecentSearchApply={handleRecentSearchApply}
        onRecentSearchClear={handleRecentSearchClear}
        onClose={handleOverlayClose}
      />
    </MarketplacePublicPageShell>
  );
}
