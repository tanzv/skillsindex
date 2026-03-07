# SkillsIndex 需求设计完整性差距清单

日期：2026-03-07
目的：基于当前正式需求文档，明确“达到需求设计完整闭环”还缺哪些内容，并给出建议补齐顺序。

## 1. 判定口径

当前需求设计是否“完整”，以以下文档为准：

1. `docs/design-requirements/README.md`
2. `docs/design-requirements/overview/functional-coverage-matrix.md`
3. `docs/design-requirements/overview/requirement-traceability.md`
4. `docs/design-requirements/test-acceptance/test-acceptance.md`

判定原则：

1. 用户端、管理端、公共能力、端到端场景四类覆盖均为 `已覆盖`，才能认定“当前版本需求设计完整”
2. 若模块被标记为 `部分覆盖`，则说明当前已有实现或路由/API，但契约、场景、验收或设计尚未闭环
3. 若模块被标记为 `目标态（待实现）`，则说明需求已定义，但当前仍未进入有效实现范围

## 2. 当前结论

当前需求体系已经具备完整骨架，但尚未达到“完整闭环”状态。

已完成的部分：

1. 文档分层已统一
2. 主要业务域均有独立设计文档
3. 覆盖矩阵、追踪矩阵、验收文档已建立
4. 当前状态已从“已覆盖/目标态”二分法，升级为“已覆盖/部分覆盖/目标态”三层口径

仍未闭环的模块：

1. `FR-ACC`：账号中心与平台账号治理
2. `FR-ING`：定时同步、同步运行记录、版本历史
3. `FR-JOB`：异步任务编排
4. `FR-ORG`：组织协作治理
5. `FR-MOD`：内容审核治理
6. `FR-KEY`：API Key 细粒度授权
7. `FR-SSO`：企业身份与 SSO
8. `NFR-OPS`：运维合规与发布门禁

## 3. 差距清单

### 3.1 身份与访问管理（P0）

涉及文档：

1. `docs/design-requirements/auth-rbac/auth-session-rbac.md`
2. `docs/design-requirements/auth-rbac/account-management.md`
3. `docs/design-requirements/auth-rbac/account-center-implementation.md`
4. `docs/design-requirements/admin-governance/admin-account-operations.md`
5. `docs/design-requirements/data-model/data-model-constraints.md`

主要差距：

1. 会话模型未闭环：当前文档同时存在“自包含 Cookie”与“可列出/撤销单会话”的要求，但缺少统一服务端会话模型说明
2. 账号生命周期未闭环：缺少 `active/disabled/locked/reset_pending/...` 的状态机、迁移条件和操作者边界
3. 自助账号操作与平台账号治理未完全对齐：用户自助修改密码、会话撤销、忘记密码，与管理员禁用/强退/重置之间缺少统一契约
4. 审计字段未闭环：需要明确 `actor/target/result/reason/request_id/ip/user_agent` 等字段
5. 验收场景未闭环：需要把资料更新、密码修改、密码重置、会话撤销、管理员强退、最后 super_admin 保护映射到可执行验收用例

补齐标准：

1. 会话撤销语义唯一明确
2. 账号状态迁移图可直接指导实现与测试
3. `FR-ACC` 可全部挂到 `TC-ACC-*`

### 3.2 导入、同步、异步任务与版本追踪（P0）

涉及文档：

1. `docs/design-requirements/ingestion-sync/ingestion-channels.md`
2. `docs/design-requirements/ingestion-sync/sync-lifecycle-records.md`
3. `docs/design-requirements/ingestion-sync/async-sync-job-orchestration.md`
4. `docs/design-requirements/ingestion-sync/scheduled-sync-version-history.md`
5. `docs/design-requirements/data-model/data-model-constraints.md`

主要差距：

1. 缺少统一闭环：首次导入、手动重同步、定时同步、重试、回滚，尚未统一收敛为 `job -> run -> version -> audit` 链路
2. 缺少基线版本规则：首次成功导入是否生成版本、失败后是否生成 run、回滚如何追加版本，仍需明确定义
3. 缺少版本可见性规则：版本历史、差异对比、回滚的权限和私有技能可见性约束未完全写清
4. 缺少分页与过滤契约：jobs、sync-runs、versions 的分页、排序、默认窗口、筛选条件未闭环
5. 缺少边界与安全规则：zip 大小/文件数、repo 白名单、远程同步超时、外部 token 使用与脱敏仍需补充

补齐标准：

1. `FR-ING` 与 `FR-JOB` 的状态机、权限、失败分支和审计字段统一
2. `TC-ING-*` 与 `TC-JOB-*` 能直接从文档导出
3. 版本链路与删除/归档策略不冲突

### 3.3 组织管理与内容审核治理（P1）

涉及文档：

1. `docs/design-requirements/admin-governance/organization-workspace-governance.md`
2. `docs/design-requirements/admin-governance/content-moderation-governance.md`
3. `docs/design-requirements/data-model/data-model-constraints.md`
4. `docs/design-requirements/test-acceptance/test-acceptance.md`

主要差距：

1. 组织与工作空间边界未完全闭环：标题覆盖“组织与工作空间”，正文主要仍以 organization 为主，workspace 模型不足
2. 组织角色治理缺少实施细节：邀请、移除、角色变更、最后 owner 保护、平台救援边界仍需更精细的规则
3. 审核案件状态机未闭环：需要区分举报 case 状态与内容状态，并定义 resolve/reject/appeal/reopen 语义
4. 评论/内容治理数据模型未闭环：评论删除、隐藏、审核、申诉与审计字段之间尚未统一
5. 验收链路未闭环：组织协作与审核治理虽有入口，但跨模块 E2E 还需要更具体的动作定义

补齐标准：

1. `FR-ORG` 和 `FR-MOD` 各自有明确状态机
2. 组织角色与平台角色叠加规则唯一明确
3. 审核动作与内容状态、审计、申诉形成闭环

### 3.4 API Key、开放 API 与企业 SSO（P0/P1）

涉及文档：

1. `docs/design-requirements/public-api/openapi-public-api.md`
2. `docs/design-requirements/public-api/api-key-scope-governance.md`
3. `docs/design-requirements/integrations/enterprise-sso-extension.md`
4. `docs/design-requirements/non-functional/nfr.md`
5. `docs/design-requirements/test-acceptance/test-acceptance.md`

主要差距：

1. API Key 安全边界未闭环：哪些接口只能 `session + CSRF`，哪些允许 API Key，尚未完全收束
2. Scope 命名与实现不一致：文档命名与代码中的 scope 命名还需统一
3. 静态 key 绕过最小权限模型的问题仍未在需求层定案
4. 公开 API 契约未闭环：`401/403/429`、分页上限、非法参数、稳定排序、AI 搜索分页仍需补齐
5. 企业 SSO 协议级契约未闭环：OIDC/SAML/SCIM 的最小实施规则与异常分支仍不足

补齐标准：

1. `FR-KEY` 能完整映射到 scope、轮换、403、审计与实现命名
2. `FR-SSO` 能覆盖登录、映射、禁用回收与异常场景
3. `FR-API` 的错误码、分页、限流与兼容策略可直接交给测试编写契约用例

### 3.5 数据模型、审计模型与运维合规（P0/P1）

涉及文档：

1. `docs/design-requirements/data-model/data-model-constraints.md`
2. `docs/design-requirements/non-functional/nfr.md`
3. `docs/design-requirements/non-functional/operations-compliance-observability.md`
4. `docs/design-requirements/test-acceptance/test-acceptance.md`

主要差距：

1. `Skill` 的筛选、分类、排序、版本、治理支撑字段不够细
2. `SkillComment` 的状态、软删除、治理关联字段未闭环
3. `AuditLog` 最小字段不足以支撑审计追溯与合规导出
4. `NFR-OPS` 已有 API 与治理入口，但需求层对门禁、恢复演练、告警校验、导出校验仍是部分覆盖
5. 数据删除、版本归档、审计留存之间仍存在规则冲突风险

补齐标准：

1. 数据模型可以直接支撑当前已开发治理能力
2. 审计字段可支撑安全、合规、排障三类场景
3. 运维合规需求可直接落成 `TC-OPS-*`

## 4. 建议补齐顺序

### 第一阶段：共享契约收口（最高优先）

1. 身份与访问管理
2. API Key / API 安全边界
3. 数据模型与审计模型

目标：先解决所有跨模块共享契约冲突，避免后续功能补齐返工。

### 第二阶段：治理闭环收口

1. 异步任务、同步运行记录、版本历史
2. 组织管理
3. 内容审核治理

目标：让“已有路由/API”的模块从 `部分覆盖` 走向“需求、契约、验收均闭环”。

### 第三阶段：平台与发布闭环

1. 企业 SSO
2. 运维合规与门禁
3. 全量端到端场景与专项验收补齐

目标：把目标态扩展能力也纳入可发布口径。

## 5. 达到“需求设计完整”的完成定义

当以下条件全部满足时，可认定需求设计完整：

1. 覆盖矩阵中不存在关键模块 `部分覆盖`
2. 追踪矩阵中各 FR/NFR 组状态与真实实现一致
3. 验收文档中每个关键模块均具备成功路径与失败路径
4. 共享契约（会话、账号、API Key、审计、版本、删除/归档）无互相冲突
5. 当前版本可用 `已覆盖` 描述用户端、管理端、公共能力、端到端场景四类覆盖

## 6. 建议下一步动作

1. 先修订身份与访问管理相关文档
2. 再修订公开 API / API Key / 数据模型 / 审计模型
3. 然后收口导入同步、组织治理、内容审核治理
4. 最后补运维合规与企业 SSO 的专项验收口径

