import { AppLocale } from "../lib/i18n";

export interface SkillDetailCopy {
  title: string;
  breadcrumbRoot: string;
  breadcrumb: string;
  tabSkill: string;
  tabReadme: string;
  tabFiles: string;
  tabChangelog: string;
  tabMatrix: string;
  favoriteSkill: string;
  installWorkspace: string;
  summaryDescription: string;
  installCount: string;
  favoriteRating: string;
  recentRelease: string;
  officialVerified: string;
  riskFlag: string;
  qualityHealth: string;
  qualityScore: string;
  securityScore: string;
  docsScore: string;
  maintenanceResponse: string;
  installCommandAvailable: string;
  installCommandMissing: string;
  ratingUnavailable: string;
  metricUnavailable: string;
  fileBrowserTitle: string;
  fileSelectedHint: string;
  fileTreeRoot: string;
  fileHint: string;
  fileInfoTitle: string;
  fileInfoLabel: string;
  filePathHint: string;
  fileSourceHint: string;
  openOriginal: string;
  copyPath: string;
  fileSynced: string;
  presetHint: string;
  switchable: string;
  filePrevNextHint: string;
  fileDiffHint: string;
  installFlowTitle: string;
  installFlowHint: string;
  successRate: string;
  rollbackCount: string;
  metadataTitle: string;
  licenseLine: string;
  categoryLine: string;
  tagsLine: string;
  releasedLine: string;
  governanceState: string;
  auditor: string;
  actionCenter: string;
  installCurrent: string;
  copyCommand: string;
  openReadme: string;
  compareSkill: string;
  submitFeedback: string;
  favoriteAdd: string;
  favoriteRemove: string;
  submitRating: string;
  postComment: string;
  recentComments: string;
  commentsEmpty: string;
  commentPlaceholder: string;
  deleteComment: string;
  signInToInteract: string;
  installable: string;
  mediumRisk: string;
  maintained: string;
  dependencyTitle: string;
  runtimeLabel: string;
  testFrameworkLabel: string;
  bizVersionLabel: string;
  conflictText: string;
  runtimeValue: string;
  frameworkValue: string;
  bizVersionValue: string;
  loading: string;
  notFound: string;
  loadError: string;
  copied: string;
  copyFailed: string;
  ratingSubmitted: string;
  commentPosted: string;
  commentDeleted: string;
  commentInvalid: string;
  addedCompare: string;
  favoriteSaved: string;
  favoriteRemoved: string;
  installed: string;
  metaEntryLabel: string;
  metaSourceLabel: string;
  metaLanguageLabel: string;
  backToMarketplace: string;
  openDashboard: string;
  signIn: string;
}

const englishCopy: SkillDetailCopy = {
  title: "Skill Detail and Usage",
  breadcrumbRoot: "Marketplace",
  breadcrumb: "Marketplace / browser-automation-pro / SKILL.md (default)",
  tabSkill: "SKILL.md",
  tabReadme: "README",
  tabFiles: "Files",
  tabChangelog: "Changelog",
  tabMatrix: "Compatibility",
  favoriteSkill: "Favorite Skill",
  installWorkspace: "Install to Workspace",
  summaryDescription:
    "End-to-end browser automation for commerce and Odoo workflows, with replay, assertions, retry strategy, and trace exports.",
  installCount: "Install Command",
  favoriteRating: "Favorites and Rating",
  recentRelease: "Recent Release",
  officialVerified: "Official Verified",
  riskFlag: "Risk Medium",
  qualityHealth: "Quality and Maintenance Health",
  qualityScore: "Quality Score",
  securityScore: "Security Score",
  docsScore: "Docs Score",
  maintenanceResponse: "Maintenance Response",
  installCommandAvailable: "Available",
  installCommandMissing: "Not Provided",
  ratingUnavailable: "No ratings",
  metricUnavailable: "N/A",
  fileBrowserTitle: "File Browser (Directory + Preview)",
  fileSelectedHint: "selected: SKILL.md · synced",
  fileTreeRoot: "browser-automation-pro/",
  fileHint: "Click to preview · Double click to full-screen · Right click to copy path",
  fileInfoTitle: "File Info",
  fileInfoLabel:
    "Current: SKILL.md\nPath: /browser-automation-pro/SKILL.md\nLanguage: Markdown\nEncoding: UTF-8\nEdited: 2026-02-20 14:32",
  filePathHint: "Path: /browser-automation-pro/SKILL.md",
  fileSourceHint: "source: tree selection · stable",
  openOriginal: "Open Source",
  copyPath: "Copy Path",
  fileSynced: "Directory and preview are synchronized",
  presetHint: "Preset: SKILL.md (active) / README.md / CHANGELOG.md",
  switchable: "Switchable",
  filePrevNextHint: "Prev file: README.md · Next file: CHANGELOG.md",
  fileDiffHint: "Copy snippet · Diff compare",
  installFlowTitle: "Install and Enable Flow",
  installFlowHint: "Recommended: install → enable → verify → upgrade or rollback",
  successRate: "Success Rate 99.2%",
  rollbackCount: "Rollback Count 2",
  metadataTitle: "Author and Governance",
  licenseLine: "License: MIT",
  categoryLine: "Category: Developer Tools / Quality Assurance",
  tagsLine: "Tags: browser, playwright, odoo, ci",
  releasedLine: "Recent Release: 2026-02-20",
  governanceState: "Governance: Signed · Audited",
  auditor: "Auditor: Platform Admin",
  actionCenter: "Action Center",
  installCurrent: "Install to Current Workspace",
  copyCommand: "Copy Command",
  openReadme: "Open SKILL.md",
  compareSkill: "History",
  submitFeedback: "Submit Feedback",
  favoriteAdd: "Add Favorite",
  favoriteRemove: "Remove Favorite",
  submitRating: "Submit Rating",
  postComment: "Post Comment",
  recentComments: "Recent Comments",
  commentsEmpty: "No comments yet.",
  commentPlaceholder: "Write practical feedback (max 3000)",
  deleteComment: "Delete",
  signInToInteract: "Sign in to interact",
  installable: "Installable",
  mediumRisk: "Risk Medium",
  maintained: "Maintained",
  dependencyTitle: "Compatibility and Dependencies",
  runtimeLabel: "Runtime",
  testFrameworkLabel: "Test Framework",
  bizVersionLabel: "Business Version",
  conflictText: "Conflict data is not provided",
  runtimeValue: "Not specified by source",
  frameworkValue: "Not specified by source",
  bizVersionValue: "Not specified by source",
  loading: "Loading skill detail",
  notFound: "Skill detail not found",
  loadError: "Failed to load skill detail",
  copied: "Copied",
  copyFailed: "Copy Failed",
  ratingSubmitted: "Rating Submitted",
  commentPosted: "Comment Posted",
  commentDeleted: "Comment Deleted",
  commentInvalid: "Comment cannot be empty",
  addedCompare: "Opened Changelog",
  favoriteSaved: "Favorited",
  favoriteRemoved: "Unfavorited",
  installed: "Install Triggered",
  metaEntryLabel: "entry",
  metaSourceLabel: "source",
  metaLanguageLabel: "language",
  backToMarketplace: "Back to Marketplace",
  openDashboard: "Open Dashboard",
  signIn: "Sign In"
};

const chineseCopy: SkillDetailCopy = {
  title: "\u6280\u80fd\u8be6\u60c5\u4e0e\u4f7f\u7528",
  breadcrumbRoot: "\u6280\u80fd\u5e02\u573a",
  breadcrumb: "\u6280\u80fd\u5e02\u573a / browser-automation-pro / SKILL.md\uff08\u9ed8\u8ba4\uff09",
  tabSkill: "SKILL.md",
  tabReadme: "README",
  tabFiles: "\u6587\u4ef6\u76ee\u5f55",
  tabChangelog: "\u66f4\u65b0\u65e5\u5fd7",
  tabMatrix: "\u517c\u5bb9\u77e9\u9635",
  favoriteSkill: "\u6536\u85cf\u6280\u80fd",
  installWorkspace: "\u5b89\u88c5\u5230\u5de5\u4f5c\u533a",
  summaryDescription:
    "\u7528\u4e8e\u7535\u5546\u4e0eOdoo\u4e1a\u52a1\u7684\u7aef\u5230\u7aef\u81ea\u52a8\u5316\u56de\u5f52\uff0c\u8986\u76d6\u5f55\u5236\u56de\u653e\u3001\u65ad\u8a00\u6821\u9a8c\u3001\u5931\u8d25\u91cd\u8bd5\u3001\u62a5\u544a\u4e0e\u8ffd\u8e2a\u4ea7\u7269\u5bfc\u51fa\u3002",
  installCount: "\u5b89\u88c5\u547d\u4ee4",
  favoriteRating: "\u6536\u85cf\u4e0e\u8bc4\u5206",
  recentRelease: "\u6700\u8fd1\u53d1\u5e03",
  officialVerified: "\u5b98\u65b9\u8ba4\u8bc1",
  riskFlag: "\u98ce\u9669\u4e2d",
  qualityHealth: "\u8d28\u91cf\u4e0e\u7ef4\u62a4\u5065\u5eb7\u5ea6",
  qualityScore: "\u8d28\u91cf\u6307\u6570",
  securityScore: "\u5b89\u5168\u6307\u6570",
  docsScore: "\u6587\u6863\u6307\u6570",
  maintenanceResponse: "\u7ef4\u62a4\u54cd\u5e94",
  installCommandAvailable: "\u5df2\u63d0\u4f9b",
  installCommandMissing: "\u672a\u63d0\u4f9b",
  ratingUnavailable: "\u6682\u65e0\u8bc4\u5206",
  metricUnavailable: "\u672a\u63d0\u4f9b",
  fileBrowserTitle: "\u6587\u4ef6\u6d4f\u89c8\u5668\uff08\u76ee\u5f55 + \u9884\u89c8 \u4e00\u4f53\u5316\uff09",
  fileSelectedHint: "selected: SKILL.md \u00b7 synced",
  fileTreeRoot: "browser-automation-pro/",
  fileHint: "\u5355\u51fb\u5207\u6362\u9884\u89c8 \u00b7 \u53cc\u51fb\u5168\u5c4f \u00b7 \u53f3\u952e\u590d\u5236\u8def\u5f84",
  fileInfoTitle: "\u6587\u4ef6\u4fe1\u606f",
  fileInfoLabel:
    "\u5f53\u524d\u9009\u4e2d\uff1aSKILL.md\n\u8def\u5f84\uff1a/browser-automation-pro/SKILL.md\n\u8bed\u8a00\uff1aMarkdown\n\u7f16\u7801\uff1aUTF-8\n\u6700\u8fd1\u7f16\u8f91\uff1a2026-02-20 14:32",
  filePathHint: "Path: /browser-automation-pro/SKILL.md",
  fileSourceHint: "source: tree selection · stable",
  openOriginal: "\u6253\u5f00\u539f\u6587",
  copyPath: "\u590d\u5236\u8def\u5f84",
  fileSynced: "\u76ee\u5f55\u4e0e\u9884\u89c8\u5df2\u540c\u6b65",
  presetHint: "\u9884\u8bbe\u5207\u6362\uff1aSKILL.md\uff08\u5f53\u524d\uff09 / README.md / CHANGELOG.md",
  switchable: "\u53ef\u5207\u6362",
  filePrevNextHint: "\u4e0a\u4e00\u6587\u4ef6: README.md \u00b7 \u4e0b\u4e00\u6587\u4ef6: CHANGELOG.md",
  fileDiffHint: "\u590d\u5236\u7247\u6bb5 \u00b7 \u5dee\u5f02\u5bf9\u6bd4",
  installFlowTitle: "\u5b89\u88c5\u4e0e\u542f\u7528\u6d41\u7a0b",
  installFlowHint: "\u5efa\u8bae\u987a\u5e8f\uff1a\u5b89\u88c5 \u2192 \u542f\u7528 \u2192 \u9a8c\u8bc1 \u2192 \u5347\u7ea7/\u56de\u6eda",
  successRate: "\u6210\u529f\u7387 99.2%",
  rollbackCount: "\u6700\u8fd1\u56de\u6eda 2 \u6b21",
  metadataTitle: "\u4f5c\u8005\u4e0e\u6cbb\u7406\u4fe1\u606f",
  licenseLine: "\u8bb8\u53ef\u8bc1\uff1aMIT",
  categoryLine: "\u5206\u7c7b\uff1a\u5f00\u53d1\u5de5\u5177 / \u8d28\u91cf\u4fdd\u969c",
  tagsLine: "\u6807\u7b7e\uff1abrowser, playwright, odoo, ci",
  releasedLine: "\u6700\u8fd1\u53d1\u5e03\uff1a2026-02-20",
  governanceState: "\u6cbb\u7406\u72b6\u6001\uff1a\u5df2\u7b7e\u540d \u00b7 \u5df2\u5ba1\u8ba1",
  auditor: "\u5ba1\u8ba1\u4eba\uff1a\u5e73\u53f0\u7ba1\u7406\u5458",
  actionCenter: "\u64cd\u4f5c\u4e2d\u5fc3",
  installCurrent: "\u5b89\u88c5\u5230\u5f53\u524d\u5de5\u4f5c\u533a",
  copyCommand: "\u590d\u5236\u547d\u4ee4",
  openReadme: "\u6253\u5f00 SKILL.md",
  compareSkill: "\u53d8\u66f4\u5386\u53f2",
  submitFeedback: "\u63d0\u4ea4\u53cd\u9988",
  favoriteAdd: "\u6dfb\u52a0\u6536\u85cf",
  favoriteRemove: "\u53d6\u6d88\u6536\u85cf",
  submitRating: "\u63d0\u4ea4\u8bc4\u5206",
  postComment: "\u53d1\u5e03\u8bc4\u8bba",
  recentComments: "\u6700\u8fd1\u8bc4\u8bba",
  commentsEmpty: "\u6682\u65e0\u8bc4\u8bba",
  commentPlaceholder: "\u8bf7\u8f93\u5165\u5b9e\u7528\u53cd\u9988\uff08\u6700\u591a 3000 \u5b57\u7b26\uff09",
  deleteComment: "\u5220\u9664",
  signInToInteract: "\u767b\u5f55\u540e\u53ef\u4ea4\u4e92",
  installable: "\u53ef\u5b89\u88c5",
  mediumRisk: "\u98ce\u9669\u4e2d\u7b49",
  maintained: "\u6301\u7eed\u7ef4\u62a4",
  dependencyTitle: "\u517c\u5bb9\u4e0e\u4f9d\u8d56\u77e9\u9635",
  runtimeLabel: "\u8fd0\u884c\u65f6",
  testFrameworkLabel: "\u6d4b\u8bd5\u6846\u67b6",
  bizVersionLabel: "\u4e1a\u52a1\u7248\u672c",
  conflictText: "\u51b2\u7a81\u4fe1\u606f\uff1a\u6765\u6e90\u672a\u63d0\u4f9b",
  runtimeValue: "\u6765\u6e90\u672a\u63d0\u4f9b",
  frameworkValue: "\u6765\u6e90\u672a\u63d0\u4f9b",
  bizVersionValue: "\u6765\u6e90\u672a\u63d0\u4f9b",
  loading: "\u6b63\u5728\u52a0\u8f7d\u6280\u80fd\u8be6\u60c5",
  notFound: "\u672a\u627e\u5230\u6280\u80fd\u8be6\u60c5",
  loadError: "\u6280\u80fd\u8be6\u60c5\u52a0\u8f7d\u5931\u8d25",
  copied: "\u5df2\u590d\u5236",
  copyFailed: "\u590d\u5236\u5931\u8d25",
  ratingSubmitted: "\u8bc4\u5206\u5df2\u63d0\u4ea4",
  commentPosted: "\u8bc4\u8bba\u5df2\u53d1\u5e03",
  commentDeleted: "\u8bc4\u8bba\u5df2\u5220\u9664",
  commentInvalid: "\u8bf7\u8f93\u5165\u8bc4\u8bba\u5185\u5bb9",
  addedCompare: "\u5df2\u5207\u6362\u5230\u53d8\u66f4\u65e5\u5fd7",
  favoriteSaved: "\u5df2\u6536\u85cf",
  favoriteRemoved: "\u5df2\u53d6\u6d88\u6536\u85cf",
  installed: "\u5df2\u89e6\u53d1\u5b89\u88c5",
  metaEntryLabel: "\u5165\u53e3",
  metaSourceLabel: "\u6765\u6e90",
  metaLanguageLabel: "\u8bed\u8a00",
  backToMarketplace: "\u8fd4\u56de\u5e02\u573a",
  openDashboard: "\u6253\u5f00\u63a7\u5236\u53f0",
  signIn: "\u767b\u5f55"
};

export const publicSkillDetailCopy: Record<AppLocale, SkillDetailCopy> = {
  en: englishCopy,
  zh: chineseCopy
};
