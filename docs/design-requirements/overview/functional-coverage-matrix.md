# 用户端与管理端功能完整性矩阵

## 1. 目标

本文件用于回答“需求设计文档是否覆盖完整功能”，重点从三个维度核查：

1. 用户端功能覆盖
2. 管理端功能覆盖
3. 公共能力与跨端能力覆盖

## 2. 用户端功能覆盖矩阵

| 领域 | 页面/入口 | 核心能力 | 角色 | 对应需求文档 | 覆盖状态 |
| --- | --- | --- | --- | --- | --- |
| 市场发现 | `/` | 关键词搜索、AI 搜索、标签/分类过滤、分页 | 游客/登录用户 | `marketplace/marketplace-discovery.md` | 已覆盖 |
| 分类浏览 | `/categories` `/categories/{categorySlug}` | 分类总览、分类内检索 | 游客/登录用户 | `marketplace/marketplace-discovery.md` | 已覆盖 |
| 时间线 | `/timeline` | day/week/month 聚合趋势 | 游客/登录用户 | `marketplace/marketplace-discovery.md` | 已覆盖 |
| 技能详情 | `/skills/{skillID}` | 技能详情、可见性控制 | 游客/登录用户 | `marketplace/marketplace-discovery.md` | 已覆盖 |
| 账号体系 | `/register` `/login` `/logout` | 注册、登录、会话、注销 | 游客/登录用户 | `auth-rbac/auth-session-rbac.md` | 已覆盖 |
| 互动系统 | 收藏/评分/评论接口 | 收藏切换、评分 1~5、评论发布删除 | member/admin/super_admin | `interactions/interaction-system.md` | 已覆盖 |
| 本地化 | `/zh` `/zh/*` `/skillsmp` | 别名路由与语言切换 | 游客/登录用户 | `marketplace/marketplace-discovery.md` | 已覆盖 |
| 账号中心 | `/account/*` | 资料维护、密码修改、会话管理、忘记密码链路 | 登录用户 | `auth-rbac/account-management.md` `auth-rbac/account-center-implementation.md` | 部分覆盖 |

## 3. 管理端功能覆盖矩阵

| 领域 | 页面/入口 | 核心能力 | 角色 | 对应需求文档 | 覆盖状态 |
| --- | --- | --- | --- | --- | --- |
| 后台导航 | `/admin/*` `/dashboard/*` | 分区导航、总览指标 | member/admin/super_admin | `admin-governance/admin-dashboard-governance.md` | 已覆盖 |
| 导入中心 | `/skills/manual` `/skills/upload` `/skills/repo` `/skills/skillmp` | 四类导入 | member/admin/super_admin | `ingestion-sync/ingestion-channels.md` | 已覆盖 |
| 记录治理 | `/skills/{skillID}/visibility` `/sync` `/delete` | 可见性、重同步、删除 | owner/admin/super_admin | `ingestion-sync/sync-lifecycle-records.md` | 已覆盖 |
| 定时同步治理 | `/admin/sync-policies/*` | 同步策略配置、定时触发、失败重试 | admin/super_admin | `ingestion-sync/scheduled-sync-version-history.md` | 部分覆盖 |
| 同步运行记录 | `/admin/sync-runs/*` | 每次同步运行状态、耗时、错误可追踪 | member/admin/super_admin | `ingestion-sync/scheduled-sync-version-history.md` | 部分覆盖 |
| Skill 版本与历史 | `/skills/{skillID}/versions/*` | 版本快照、diff 对比、受控回滚 | owner/admin/super_admin | `ingestion-sync/scheduled-sync-version-history.md` | 部分覆盖 |
| API Key 管理 | `/admin/apikeys/create` `/admin/apikeys/{keyID}/revoke` | 创建、撤销、状态过滤 | member/admin/super_admin | `admin-governance/admin-dashboard-governance.md` | 已覆盖 |
| 用户管理 | `/admin/users/{userID}/role` | 角色变更与最后 super_admin 保护 | super_admin | `admin-governance/admin-dashboard-governance.md` | 已覆盖 |
| 审计治理 | 审计分区 | 关键操作可追溯 | admin/super_admin | `admin-governance/admin-dashboard-governance.md` | 已覆盖 |
| 账号治理扩展 | `/admin/accounts/*` | 账号状态治理、管理员重置密码、会话强退 | admin/super_admin | `auth-rbac/account-management.md` `admin-governance/admin-account-operations.md` | 部分覆盖 |
| 组织协作治理 | `/admin/organizations/*` | 组织创建、成员角色治理、组织技能共享 | owner/admin/super_admin | `admin-governance/organization-workspace-governance.md` | 部分覆盖 |
| 内容审核治理 | `/admin/moderation/*` | 举报、审核、隐藏/删除、申诉闭环 | admin/super_admin | `admin-governance/content-moderation-governance.md` | 部分覆盖 |
| 异步任务治理 | `/admin/jobs/*` | 导入/同步任务编排、重试、取消、可观测 | member/admin/super_admin | `ingestion-sync/async-sync-job-orchestration.md` | 部分覆盖 |

## 4. 公共能力与跨端覆盖矩阵

| 领域 | 核心能力 | 对应需求文档 | 覆盖状态 |
| --- | --- | --- | --- |
| OpenAPI 与文档 | JSON/YAML/Swagger/API 文档入口 | `public-api/openapi-public-api.md` | 已覆盖 |
| 公开 API 鉴权 | API Key（query + bearer）与 401 约束 | `public-api/openapi-public-api.md` | 已覆盖 |
| 会话与安全 | Session Cookie、CSRF、权限校验链 | `auth-rbac/auth-session-rbac.md` `non-functional/nfr.md` | 已覆盖 |
| 钉钉集成 | OAuth 授权、回调、授权撤销、profile 查询 | `integrations/dingtalk-oauth.md` | 已覆盖 |
| 数据模型约束 | 主实体、唯一约束、级联与一致性 | `data-model/data-model-constraints.md` | 已覆盖 |
| 非功能 | 性能、可靠性、安全、可观测性 | `non-functional/nfr.md` | 已覆盖 |
| API Key 细粒度授权 | scope、最小权限、轮换与 403 区分 | `public-api/api-key-scope-governance.md` | 部分覆盖 |
| 企业身份与 SSO | OIDC/SAML、账号映射、离职回收 | `integrations/enterprise-sso-extension.md` | 部分覆盖 |
| 运维合规基线 | 审计留存、告警、备份恢复、发布门禁 | `non-functional/operations-compliance-observability.md` | 部分覆盖 |
| 全量变更追踪 | 每个 Skill 的同步版本链与变更明细可追溯 | `ingestion-sync/scheduled-sync-version-history.md` | 部分覆盖 |

## 5. 端到端场景覆盖（用户端 + 管理端）

### E2E-001 游客发现到登录

1. 游客访问市场检索与分类浏览
2. 游客注册/登录
3. 登录后访问详情并执行互动

覆盖文档：

1. `marketplace/marketplace-discovery.md`
2. `auth-rbac/auth-session-rbac.md`
3. `interactions/interaction-system.md`

### E2E-002 普通成员导入到发布

1. member 进入后台导入技能（任意渠道）
2. 在 records 分区调整可见性
3. 执行重同步或删除

覆盖文档：

1. `ingestion-sync/ingestion-channels.md`
2. `ingestion-sync/sync-lifecycle-records.md`
3. `admin-governance/admin-dashboard-governance.md`

### E2E-003 管理员治理闭环

1. admin/super_admin 进行全站技能治理
2. 管理 API Key 生命周期
3. 审计日志追溯关键动作

覆盖文档：

1. `admin-governance/admin-dashboard-governance.md`
2. `public-api/openapi-public-api.md`
3. `test-acceptance/test-acceptance.md`

### E2E-004 超级管理员权限治理

1. super_admin 进行用户角色调整
2. 验证“最后一个 super_admin”保护
3. 审计记录变更动作

覆盖文档：

1. `admin-governance/admin-dashboard-governance.md`
2. `auth-rbac/auth-session-rbac.md`
3. `overview/requirement-traceability.md`

### E2E-005 账号治理闭环（当前部分覆盖）

1. 用户更新资料并修改密码
2. 管理员禁用账号并强制下线
3. 用户通过重置流程恢复访问

覆盖文档：

1. `auth-rbac/account-center-implementation.md`
2. `admin-governance/admin-account-operations.md`
3. `test-acceptance/test-acceptance.md`

### E2E-006 组织协作与审核治理闭环（当前部分覆盖）

1. 创建组织并邀请成员
2. 将技能绑定组织并执行协作治理
3. 触发举报并在审核分区完成处理

覆盖文档：

1. `admin-governance/organization-workspace-governance.md`
2. `admin-governance/content-moderation-governance.md`
3. `overview/requirement-traceability.md`

### E2E-007 定时同步与版本追踪闭环（当前部分覆盖）

1. 配置同步策略并按计划触发
2. 生成同步运行记录并完成成功同步
3. Skill 生成新版本并可对比差异
4. 执行受控回滚并保留完整历史链路

覆盖文档：

1. `ingestion-sync/scheduled-sync-version-history.md`
2. `ingestion-sync/async-sync-job-orchestration.md`
3. `test-acceptance/test-acceptance.md`

## 6. 完整性判定标准

当以下条件同时满足，可判定需求设计文档覆盖“用户端 + 管理端”完整功能：

1. 用户端核心能力（发现、认证、互动）均有独立需求定义
2. 管理端核心能力（导入、治理、密钥、审计、用户角色）均有独立需求定义
3. 公共能力（API、集成、安全、数据、NFR）具备独立章节
4. 存在端到端场景链路与验收映射
5. 路由覆盖清单无缺口
6. 目标态扩展（账号中心、组织协作、内容审核、异步任务、企业 SSO、运维合规）具备实施级文档

## 7. 当前态与目标态说明

为避免“已实现能力”与“目标完整能力”混淆，状态解释如下：

1. `已覆盖`：需求已定义且当前实现、路由与验收口径均已闭环
2. `部分覆盖`：当前已有实现或路由/API 已接入，但契约、场景或验收仍需继续闭环
3. `目标态（待实现）`：需求已完成设计，但当前尚未进入有效实现范围
