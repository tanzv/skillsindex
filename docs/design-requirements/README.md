# SkillsIndex 设计需求说明书（功能分目录版）

## 1. 文档目标

本目录用于沉淀 SkillsIndex 的完整产品需求说明，按功能域拆分目录，覆盖：

1. 业务背景与范围
2. 认证与权限
3. 技能导入与同步
4. 互动能力
5. 管理后台与治理
6. 对外 API 与集成
7. 数据模型、非功能要求、测试与发布

本版以当前代码实现（`internal/web`、`internal/services`、`internal/models`）为基线，既描述现状能力，也定义后续验收标准。

## 2. 目录索引

- `overview/background-goals.md`：背景、目标、成功标准
- `overview/scope-assumptions.md`：范围、边界、约束
- `overview/requirement-traceability.md`：需求编号与追踪矩阵
- `overview/functional-coverage-matrix.md`：用户端/管理端功能完整性矩阵
- `overview/prototype-traceability-matrix.md`：FR/NFR 到原型页面节点与路由映射
- `marketplace/marketplace-discovery.md`：市场、分类、时间线、检索
- `auth-rbac/auth-session-rbac.md`：账号、会话、CSRF、角色权限
- `auth-rbac/account-management.md`：账号管理目标态需求（用户端 + 管理端）
- `auth-rbac/account-center-implementation.md`：账号中心实施级设计（目标态）
- `ingestion-sync/ingestion-channels.md`：四类导入渠道需求
- `ingestion-sync/sync-lifecycle-records.md`：记录管理与远程同步生命周期
- `ingestion-sync/async-sync-job-orchestration.md`：导入/同步异步任务编排（目标态）
- `ingestion-sync/scheduled-sync-version-history.md`：定时同步、同步记录、版本与全量历史（目标态）
- `interactions/interaction-system.md`：收藏、评分、评论
- `admin-governance/admin-dashboard-governance.md`：后台分区、治理能力
- `admin-governance/admin-account-operations.md`：管理端账号治理实施设计（目标态）
- `admin-governance/organization-workspace-governance.md`：组织与工作空间治理（目标态）
- `admin-governance/content-moderation-governance.md`：内容治理与审核（目标态）
- `public-api/openapi-public-api.md`：OpenAPI、公开 API、鉴权策略
- `public-api/api-key-scope-governance.md`：API Key 细粒度授权治理（目标态）
- `integrations/dingtalk-oauth.md`：钉钉 OAuth 与个人授权
- `integrations/enterprise-sso-extension.md`：企业身份与 SSO 扩展（目标态）
- `data-model/data-model-constraints.md`：实体模型与约束
- `non-functional/nfr.md`：性能、可靠性、安全、可观测性
- `non-functional/operations-compliance-observability.md`：运维、合规与可观测实施要求（目标态）
- `test-acceptance/test-acceptance.md`：测试策略与验收清单
- `roadmap-risks/roadmap-risks.md`：里程碑、风险与待确认项

## 3. 阅读建议

1. 先读 `overview` 统一业务口径与完整性边界
2. 再按业务域阅读（市场、导入、治理、API）
3. 最后对照 `test-acceptance` 执行验收

## 4. 命名规则

目录与文件都使用语义化 kebab-case 命名，以可读性优先：

1. 目录名按业务域命名（如 `overview`、`marketplace`）
2. 文件名按主题命名（如 `scope-assumptions.md`）
3. 不再使用数字前缀，避免非业务语义噪音

## 5. 版本说明

- 当前版本：v2.0（功能分目录重构版）
- 替代关系：替代单文件版本 `docs/design-requirements-spec.md` 的详细内容承载职责

## 6. 状态约定

为确保“最终 Web 完整性”讨论口径统一，本目录使用两类状态：

1. `已覆盖`：当前功能已实现且需求文档已闭环
2. `目标态（待实现）`：为最终完整性新增的设计需求，待进入实现计划
