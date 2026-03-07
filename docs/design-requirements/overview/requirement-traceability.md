# 需求编号与追踪矩阵

## 1. 编号规则

- `FR-MKT-*`：市场与发现
- `FR-AUTH-*`：认证与权限
- `FR-ACC-*`：账号管理（用户端与管理端）
- `FR-ING-*`：导入与同步
- `FR-JOB-*`：导入/同步任务编排
- `FR-INT-*`：互动系统
- `FR-ADM-*`：后台治理
- `FR-ORG-*`：组织与工作空间治理
- `FR-MOD-*`：内容治理与审核
- `FR-API-*`：公开 API 与文档
- `FR-KEY-*`：API Key 细粒度授权
- `FR-DT-*`：钉钉集成
- `FR-SSO-*`：企业身份与 SSO
- `NFR-*`：非功能需求
- `NFR-OPS-*`：运维、合规与可观测实施

## 2. 追踪矩阵

| 编号 | 需求主题 | 关键路由/能力 | 对应文档 | 测试用例ID前缀 | 覆盖状态 |
| --- | --- | --- | --- | --- | --- |
| FR-MKT-001~008 | 市场、分类、时间线、详情 | `/` `/categories` `/timeline` `/skills/{skillID}` `/zh/*` `/skillsmp` | `marketplace/marketplace-discovery.md` | `TC-MKT-*` | 已覆盖 |
| FR-AUTH-001~007 | 注册登录、会话、CSRF、RBAC | `/register` `/login` `/logout` 中间件校验链路 | `auth-rbac/auth-session-rbac.md` | `TC-AUTH-*` | 已覆盖 |
| FR-ACC-001~012 | 账号中心、密码与会话管理、后台账号治理 | `/account/*` `/api/v1/account/*` `/admin/accounts/*` `/api/v1/admin/accounts/*` | `auth-rbac/account-management.md` `auth-rbac/account-center-implementation.md` `admin-governance/admin-account-operations.md` | `TC-ACC-*` | 部分覆盖 |
| FR-ING-001~022 | 手动/Zip/仓库/SkillMP 导入、同步、定时策略、版本历史 | `/skills/manual` `/skills/upload` `/skills/repo` `/skills/skillmp` `/skills/{skillID}/sync` `/admin/sync-policies/*` `/admin/sync-runs/*` `/skills/{skillID}/versions/*` | `ingestion-sync/` | `TC-ING-*` | 部分覆盖 |
| FR-JOB-001~010 | 异步任务编排、重试、幂等、任务观测 | `/admin/jobs/*` `/api/v1/admin/jobs/*` | `ingestion-sync/async-sync-job-orchestration.md` | `TC-JOB-*` | 部分覆盖 |
| FR-INT-001~007 | 收藏、评分、评论与权限 | `/skills/{skillID}/favorite` `/rating` `/comments` | `interactions/interaction-system.md` | `TC-INT-*` | 已覆盖 |
| FR-ADM-001~011 | 后台分区、API Key、审计、用户管理 | `/admin/*` `/dashboard/*` `/admin/users/{userID}/role` | `admin-governance/admin-dashboard-governance.md` | `TC-ADM-*` | 已覆盖 |
| FR-ORG-001~010 | 组织创建、成员治理、组织级技能权限 | `/admin/organizations/*` `/api/v1/admin/organizations/*` `/skills/{skillID}/organization-*` | `admin-governance/organization-workspace-governance.md` | `TC-ORG-*` | 部分覆盖 |
| FR-MOD-001~009 | 举报、审核队列、内容处理与申诉 | `/admin/moderation/*` `/api/v1/admin/moderation/*` `/api/v1/skills/{skillID}/report` | `admin-governance/content-moderation-governance.md` | `TC-MOD-*` | 部分覆盖 |
| FR-API-001~010 | OpenAPI、公开 API、会话型 API、鉴权与兼容 | `/openapi.*` `/docs/openapi.*` `/api/v1/skills/*` | `public-api/openapi-public-api.md` | `TC-API-*` | 已覆盖 |
| FR-KEY-001~008 | API Key scope、403 授权拒绝、轮换治理 | `/admin/apikeys/*` `/api/v1/admin/apikeys/{keyID}/scopes` `/api/v1/admin/apikeys/{keyID}/rotate` | `public-api/api-key-scope-governance.md` | `TC-KEY-*` | 部分覆盖 |
| FR-DT-001~006 | 钉钉 OAuth 授权与 profile 代理 | `/auth/dingtalk/*` `/api/v1/dingtalk/me` | `integrations/dingtalk-oauth.md` | `TC-DT-*` | 已覆盖 |
| FR-SSO-001~009 | 企业 OIDC/SAML 接入、账号映射、离职回收 | `/auth/sso/*` `/api/v1/admin/sso/*` | `integrations/enterprise-sso-extension.md` | `TC-SSO-*` | 部分覆盖 |
| NFR-001~015 | 性能、可靠性、安全、可观测性 | P95、超时、CSRF、安全约束 | `non-functional/nfr.md` | `TC-NFR-*` | 已覆盖 |
| NFR-OPS-001~012 | 运维门禁、审计留存、备份恢复、告警基线 | `/api/v1/admin/ops/*` 可观测/运维策略 | `non-functional/operations-compliance-observability.md` | `TC-OPS-*` | 部分覆盖 |

## 3. 验收映射

验收执行时，以 `test-acceptance/test-acceptance.md` 中的测试矩阵为准，要求至少做到：

1. 每个 FR 组有对应可执行场景
2. 每个核心流程至少覆盖 1 个成功路径与 1 个失败路径
3. 鉴权、权限、边界输入属于强制覆盖项

## 4. 路由覆盖校验清单

每次评审必须确认以下“兼容与别名路由”未漏写在需求中：

1. `/skillsmp`
2. `/docs/openapi.json`
3. `/docs/openapi.yaml`
4. `/dashboard`
5. `/dashboard/{section}`

## 5. 完整性补充

针对“用户端与管理端功能是否完整”的审查，必须同时核对：

1. `overview/functional-coverage-matrix.md`
2. `test-acceptance/test-acceptance.md`

判定原则：只有当用户端、管理端、公共能力、端到端场景四类覆盖均为“已覆盖”时，才能认定当前版本的需求设计文档完整。若存在“部分覆盖”模块，则必须继续纳入当前阶段开发计划，不得按发布闭环能力宣称完成。

对于“最终完整 Web”判定，还需同时满足目标态模块具备实施级设计文档与验收编号（`TC-ACC/TC-ING/TC-JOB/TC-ORG/TC-MOD/TC-KEY/TC-SSO/TC-OPS`）。
