import { AppLocale } from "../../lib/i18n";

export interface SkillDetailCopy {
  title: string;
  breadcrumbRoot: string;
  breadcrumb: string;
  tabSkill: string;
  tabReadme: string;
  tabFiles: string;
  tabChangelog: string;
  tabMatrix: string;
  tabOverview: string;
  tabInstallationMethod: string;
  tabSkillDocument: string;
  tabResources: string;
  tabRelatedSkills: string;
  tabVersionHistory: string;
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
  fileTreeTitle: string;
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
  installationPanelTitle: string;
  resourcesPanelTitle: string;
  summaryTitle: string;
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
  copyPrompt: string;
  openReadme: string;
  compareSkill: string;
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
  viewDetails: string;
  detailsAction: string;
  agentAudience: string;
  humanAudience: string;
  sendPromptToAgent: string;
  agentPromptTitle: string;
  relatedSkillsEmpty: string;
  relatedSkillsLoading: string;
  versionHistoryEmpty: string;
  versionHistorySourceNote: string;
  sourceUrlLabel: string;
  repositoryLabel: string;
  selectedFileLabel: string;
  updatedAtLabel: string;
  typeLabel: string;
  fileCountLabel: string;
}

const englishCopy: SkillDetailCopy = {
  title: "Skill Detail and Usage",
  breadcrumbRoot: "Marketplace",
  breadcrumb: "Marketplace / browser-automation-pro / Overview",
  tabSkill: "SKILL.md",
  tabReadme: "README",
  tabFiles: "Files",
  tabChangelog: "Changelog",
  tabMatrix: "Compatibility",
  tabOverview: "Overview",
  tabInstallationMethod: "Installation Method",
  tabSkillDocument: "SKILL.md",
  tabResources: "Resources",
  tabRelatedSkills: "Related Skills",
  tabVersionHistory: "Version History",
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
  fileBrowserTitle: "File Browser",
  fileTreeTitle: "File Tree",
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
  installFlowTitle: "Installation Method",
  installFlowHint: "Recommended: install → enable → verify → upgrade or rollback",
  installationPanelTitle: "Installation Method",
  resourcesPanelTitle: "Resources",
  summaryTitle: "Summary",
  successRate: "Success Rate 99.2%",
  rollbackCount: "Rollback Count 2",
  metadataTitle: "Source and Metadata",
  licenseLine: "License: MIT",
  categoryLine: "Category: Developer Tools / Quality Assurance",
  tagsLine: "Tags: browser, playwright, odoo, ci",
  releasedLine: "Recent Release: 2026-02-20",
  governanceState: "Governance: Signed · Audited",
  auditor: "Auditor: Platform Admin",
  actionCenter: "Action Center",
  installCurrent: "Install to Current Workspace",
  copyCommand: "Copy Command",
  copyPrompt: "Copy Prompt",
  openReadme: "Open SKILL.md",
  compareSkill: "History",
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
  addedCompare: "Opened Version History",
  favoriteSaved: "Favorited",
  favoriteRemoved: "Unfavorited",
  installed: "Install Triggered",
  metaEntryLabel: "entry",
  metaSourceLabel: "source",
  metaLanguageLabel: "language",
  backToMarketplace: "Back to Marketplace",
  openDashboard: "Open Dashboard",
  signIn: "Sign In",
  viewDetails: "View Details",
  detailsAction: "Details",
  agentAudience: "I'm an Agent",
  humanAudience: "I'm a Human",
  sendPromptToAgent: "Send this prompt to your agent to install the skill",
  agentPromptTitle: "Agent prompt",
  relatedSkillsEmpty: "No related skills available",
  relatedSkillsLoading: "Loading related skills",
  versionHistoryEmpty: "Version history is not provided",
  versionHistorySourceNote: "Version history is not provided by the current source",
  sourceUrlLabel: "Source URL",
  repositoryLabel: "Repository",
  selectedFileLabel: "Selected File",
  updatedAtLabel: "Updated At",
  typeLabel: "Type",
  fileCountLabel: "File Count"
};

const chineseCopy: SkillDetailCopy = {
  ...englishCopy,
  title: "技能详情与使用",
  breadcrumbRoot: "技能市场",
  breadcrumb: "技能市场 / browser-automation-pro / 概览",
  tabFiles: "文件",
  tabChangelog: "变更日志",
  tabMatrix: "兼容性",
  tabOverview: "概览",
  tabInstallationMethod: "安装方式",
  tabResources: "资源",
  tabRelatedSkills: "相关技能",
  tabVersionHistory: "版本历史",
  favoriteSkill: "收藏技能",
  installWorkspace: "安装到工作区",
  summaryDescription: "面向电商与 Odoo 工作流的端到端自动化，包含回放、断言、重试策略与追踪导出。",
  installCount: "安装命令",
  favoriteRating: "收藏与评分",
  recentRelease: "最新发布",
  officialVerified: "官方认证",
  riskFlag: "风险中",
  qualityHealth: "质量与维护健康度",
  qualityScore: "质量分",
  securityScore: "安全分",
  docsScore: "文档分",
  maintenanceResponse: "维护响应",
  installCommandAvailable: "已提供",
  installCommandMissing: "未提供",
  ratingUnavailable: "暂无评分",
  metricUnavailable: "未提供",
  fileBrowserTitle: "文件预览",
  fileTreeTitle: "文件树",
  fileSelectedHint: "selected: SKILL.md · synced",
  fileHint: "点击预览·双击全屏·右键复制路径",
  fileInfoTitle: "文件信息",
  fileInfoLabel: "Current: SKILL.md\nPath: /browser-automation-pro/SKILL.md\nLanguage: Markdown\nEncoding: UTF-8\nEdited: 2026-02-20 14:32",
  openOriginal: "打开来源",
  copyPath: "复制路径",
  fileSynced: "目录与预览已同步",
  switchable: "可切换",
  installFlowTitle: "安装方式",
  installFlowHint: "建议顺序：安装 → 启用 → 验证 → 升级或回滚",
  installationPanelTitle: "安装方式",
  resourcesPanelTitle: "资源",
  summaryTitle: "概要",
  successRate: "成功率 99.2%",
  rollbackCount: "回滚次数 2",
  metadataTitle: "来源与元数据",
  licenseLine: "许可协议：MIT",
  categoryLine: "分类：开发工具 / 质量保障",
  tagsLine: "标签：browser, playwright, odoo, ci",
  releasedLine: "最新发布：2026-02-20",
  governanceState: "治理状态：已签名·已审计",
  auditor: "审计人：平台管理员",
  actionCenter: "操作区",
  installCurrent: "安装到当前工作区",
  copyCommand: "复制命令",
  copyPrompt: "复制提示",
  openReadme: "打开 SKILL.md",
  compareSkill: "历史",
  favoriteAdd: "添加收藏",
  favoriteRemove: "取消收藏",
  submitRating: "提交评分",
  postComment: "发布评论",
  recentComments: "最近评论",
  commentsEmpty: "暂无评论。",
  commentPlaceholder: "输入实用反馈（最多 3000 字符）",
  deleteComment: "删除",
  signInToInteract: "登录后可交互",
  installable: "可安装",
  mediumRisk: "风险中",
  maintained: "持续维护",
  dependencyTitle: "兼容性与依赖",
  runtimeLabel: "运行时",
  testFrameworkLabel: "测试框架",
  bizVersionLabel: "业务版本",
  conflictText: "当前来源未提供冲突数据",
  runtimeValue: "来源未说明",
  frameworkValue: "来源未说明",
  bizVersionValue: "来源未说明",
  loading: "正在加载技能详情",
  notFound: "未找到技能详情",
  loadError: "加载技能详情失败",
  copied: "已复制",
  copyFailed: "复制失败",
  ratingSubmitted: "评分已提交",
  commentPosted: "评论已发布",
  commentDeleted: "评论已删除",
  commentInvalid: "评论内容不能为空",
  addedCompare: "已打开版本历史",
  favoriteSaved: "已收藏",
  favoriteRemoved: "已取消收藏",
  installed: "已触发安装",
  metaEntryLabel: "入口",
  metaSourceLabel: "来源",
  metaLanguageLabel: "语言",
  backToMarketplace: "返回市场",
  openDashboard: "打开控制台",
  signIn: "登录",
  viewDetails: "查看详情",
  detailsAction: "详情",
  agentAudience: "我是 Agent",
  humanAudience: "我是 Human",
  sendPromptToAgent: "将此提示发送给你的 Agent 以安装该技能",
  agentPromptTitle: "Agent 提示",
  relatedSkillsEmpty: "暂无相关技能",
  relatedSkillsLoading: "正在加载相关技能",
  versionHistoryEmpty: "当前未提供版本历史",
  versionHistorySourceNote: "当前来源未提供版本历史",
  sourceUrlLabel: "来源地址",
  repositoryLabel: "仓库",
  selectedFileLabel: "当前文件",
  updatedAtLabel: "更新时间",
  typeLabel: "类型",
  fileCountLabel: "文件数"
};

export const publicSkillDetailCopy: Record<AppLocale, SkillDetailCopy> = {
  en: englishCopy,
  zh: chineseCopy
};
