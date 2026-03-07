# SkillsIndex 设计需求说明书（按能力分层版）

## 1. 文档定位

本目录用于沉淀 SkillsIndex 的正式需求设计，按“业务能力 + 平台基础 + 质量保障”三层组织，统一回答以下问题：

1. 产品当前覆盖了哪些功能能力
2. 最终完整 Web 还需要补齐哪些目标态设计
3. 各需求如何映射到原型、实现与测试验收

本版以当前仓库实现（`backend/internal/web`、`backend/internal/services`、`backend/internal/models`）为基线，既描述现状能力，也沉淀目标态设计与发布验收口径。

## 2. 能力分层地图

当前需求设计分为三层：

1. 业务功能：直接面向用户、运营或管理员的产品能力
2. 平台基础：支撑业务能力落地的数据、非功能与开放能力设计
3. 质量保障：用于追踪、验收、发布和风险管理的横切设计

其中：

1. “组织治理”归入“组织管理”
2. “账号治理”中的平台级账号状态、密码重置、会话强退等能力归入“身份与访问管理”
3. “数据模型、非功能需求、测试验收”属于平台基础与质量保障，不单独视为用户功能

## 3. 分类索引

### 3.1 产品总览与需求追踪

用于统一业务目标、范围边界、需求编号、覆盖完整性与原型映射：

- `overview/background-goals.md`：背景、目标、成功标准
- `overview/scope-assumptions.md`：范围、边界、约束
- `overview/requirement-traceability.md`：需求编号与追踪矩阵
- `overview/functional-coverage-matrix.md`：用户端/管理端功能完整性矩阵
- `overview/prototype-traceability-matrix.md`：FR/NFR 到原型页面节点与路由映射

### 3.2 用户端功能

用于描述终端用户直接感知的产品能力：

- `marketplace/marketplace-discovery.md`：市场发现、分类、时间线、技能详情与本地化入口
- `interactions/interaction-system.md`：收藏、评分、评论与详情页互动聚合

### 3.3 身份与访问管理

用于描述认证、会话、权限、账号中心与平台级账号治理：

- `auth-rbac/auth-session-rbac.md`：注册、登录、会话、CSRF、平台角色与 RBAC
- `auth-rbac/account-management.md`：账号管理需求（用户端账号中心 + 管理端账号治理）
- `auth-rbac/account-center-implementation.md`：账号中心实施级设计
- `admin-governance/admin-account-operations.md`：平台级账号治理实施设计

### 3.4 组织管理

用于描述组织、成员、组织内角色与工作空间治理：

- `admin-governance/organization-workspace-governance.md`：组织与工作空间治理设计

### 3.5 内容导入与同步

用于描述技能导入、记录治理、异步任务、定时同步、版本历史与回滚：

- `ingestion-sync/ingestion-channels.md`：四类导入渠道需求
- `ingestion-sync/sync-lifecycle-records.md`：记录治理与远程同步生命周期
- `ingestion-sync/async-sync-job-orchestration.md`：导入/同步异步任务编排
- `ingestion-sync/scheduled-sync-version-history.md`：定时同步、同步记录、版本与全量历史

### 3.6 治理后台

用于描述后台管理框架与治理型能力：

- `admin-governance/admin-dashboard-governance.md`：后台分区、导航、治理能力总览
- `admin-governance/content-moderation-governance.md`：内容治理与审核

### 3.7 开放能力与外部集成

用于描述公开 API、API Key 与第三方身份/授权集成：

- `public-api/openapi-public-api.md`：OpenAPI、公开 API、鉴权策略
- `public-api/api-key-scope-governance.md`：API Key 细粒度授权治理
- `integrations/dingtalk-oauth.md`：钉钉 OAuth 与个人授权
- `integrations/enterprise-sso-extension.md`：企业身份与 SSO 扩展

### 3.8 平台基础设计

用于描述业务能力共同依赖的底层设计：

- `data-model/data-model-constraints.md`：实体模型、关系与约束
- `non-functional/nfr.md`：性能、可靠性、安全、可观测性
- `non-functional/operations-compliance-observability.md`：运维、合规与可观测实施要求

### 3.9 质量保障与发布

用于描述验收标准、测试策略、风险与里程碑：

- `test-acceptance/test-acceptance.md`：测试策略与验收清单
- `roadmap-risks/roadmap-risks.md`：里程碑、风险与待确认项

## 4. 阅读建议

建议按以下顺序阅读：

1. 先读“产品总览与需求追踪”，统一范围、口径与完整性边界
2. 再按业务能力阅读“用户端功能、身份与访问管理、组织管理、内容导入与同步、治理后台”
3. 需要对接外部系统时，再阅读“开放能力与外部集成”
4. 进入设计评审、开发排期或发布前，补读“平台基础设计”与“质量保障与发布”

## 5. 命名规则

目录与文件继续使用语义化 kebab-case 命名，以可读性优先：

1. 目录名按能力域命名，如 `overview`、`auth-rbac`、`ingestion-sync`
2. 文件名按主题命名，如 `scope-assumptions.md`、`account-management.md`
3. 不使用数字前缀，避免非业务语义噪音

## 6. 状态约定

为确保“当前态”与“目标态”讨论口径统一，本目录使用以下状态：

1. `已覆盖`：当前功能已实现且需求文档已闭环
2. `部分覆盖`：当前已有实现，但能力、路由、验收或设计尚未完全闭环
3. `目标态（待实现）`：为最终完整性新增的设计需求，待进入实现计划

状态判定以 `overview/functional-coverage-matrix.md` 与 `overview/requirement-traceability.md` 为准；若路由或 API 已存在但契约与验收尚未闭环，应统一标记为 `部分覆盖`。

## 7. 版本说明

- 当前版本：v2.1（按能力分层整理版）
- 替代关系：继续承接 `docs/design-requirements-spec.md` 的正式需求说明职责
- 本次调整范围：重组索引与分类口径，不修改现有文件路径与文档编号
