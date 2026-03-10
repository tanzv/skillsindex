import type { AppLocale } from "../../lib/i18n";

export interface RankingPageCopy {
  title: string;
  subtitle: string;
  sortByLabel: string;
  sortByStars: string;
  sortByQuality: string;
  rankLabel: string;
  skillLabel: string;
  categoryLabel: string;
  starsLabel: string;
  qualityLabel: string;
  updatedLabel: string;
  topThreeLabel: string;
  fullRankingLabel: string;
  totalComparedLabel: string;
  topStarsMetricLabel: string;
  topQualityMetricLabel: string;
  averageQualityMetricLabel: string;
  openSkillLabel: string;
  viewCategories: string;
  noData: string;
  loadError: string;
  topbar: {
    brandSubtitle: string;
    categoryNav: string;
    downloadRankingNav: string;
    signedIn: string;
    signedOut: string;
    openWorkspace: string;
    signIn: string;
  };
}

const rankingPageCopy: Record<AppLocale, RankingPageCopy> = {
  en: {
    title: "Top Skills Ranking",
    subtitle: "Monitor the highest-performing skills by popularity and quality.",
    sortByLabel: "Sort by",
    sortByStars: "Stars",
    sortByQuality: "Quality",
    rankLabel: "Rank",
    skillLabel: "Skill Name",
    categoryLabel: "Category",
    starsLabel: "Stars",
    qualityLabel: "Quality",
    updatedLabel: "Updated",
    topThreeLabel: "Top 3 Highlights",
    fullRankingLabel: "Ranking List",
    totalComparedLabel: "Compared",
    topStarsMetricLabel: "Top Stars",
    topQualityMetricLabel: "Top Quality",
    averageQualityMetricLabel: "Avg. Quality",
    openSkillLabel: "Open Skill",
    viewCategories: "View Categories",
    noData: "No ranking data is available.",
    loadError: "Failed to load ranking data.",
    topbar: {
      brandSubtitle: "User Portal",
      categoryNav: "Categories",
      downloadRankingNav: "Download Ranking",
      signedIn: "Signed in",
      signedOut: "Guest mode",
      openWorkspace: "Open Workspace",
      signIn: "Sign In"
    }
  },
  zh: {
    title: "\u6280\u80fd\u6392\u884c\u699c",
    subtitle: "\u6309\u70ed\u5ea6\u4e0e\u8d28\u91cf\u76d1\u63a7\u8868\u73b0\u6700\u4f73\u7684\u6280\u80fd\u3002",
    sortByLabel: "\u6392\u5e8f\u65b9\u5f0f",
    sortByStars: "\u661f\u6807",
    sortByQuality: "\u8d28\u91cf",
    rankLabel: "\u6392\u540d",
    skillLabel: "\u6280\u80fd\u540d\u79f0",
    categoryLabel: "\u5206\u7c7b",
    starsLabel: "\u661f\u6807",
    qualityLabel: "\u8d28\u91cf",
    updatedLabel: "\u66f4\u65b0",
    topThreeLabel: "\u524d\u4e09\u4eae\u70b9",
    fullRankingLabel: "\u5b8c\u6574\u699c\u5355",
    totalComparedLabel: "\u5bf9\u6bd4\u603b\u6570",
    topStarsMetricLabel: "\u6700\u9ad8\u661f\u6807",
    topQualityMetricLabel: "\u6700\u9ad8\u8d28\u91cf",
    averageQualityMetricLabel: "\u5e73\u5747\u8d28\u91cf",
    openSkillLabel: "\u6253\u5f00\u6280\u80fd",
    viewCategories: "\u67e5\u770b\u5206\u7c7b",
    noData: "\u6682\u65e0\u6392\u884c\u6570\u636e\u3002",
    loadError: "\u6392\u884c\u6570\u636e\u52a0\u8f7d\u5931\u8d25\u3002",
    topbar: {
      brandSubtitle: "\u7528\u6237\u95e8\u6237",
      categoryNav: "\u5206\u7c7b",
      downloadRankingNav: "\u4e0b\u8f7d\u6392\u884c\u699c",
      signedIn: "\u5df2\u767b\u5f55",
      signedOut: "\u8bbf\u5ba2\u6a21\u5f0f",
      openWorkspace: "\u6253\u5f00\u5de5\u4f5c\u53f0",
      signIn: "\u767b\u5f55"
    }
  }
};

export function resolvePublicRankingCopy(locale: AppLocale): RankingPageCopy {
  return rankingPageCopy[locale];
}
