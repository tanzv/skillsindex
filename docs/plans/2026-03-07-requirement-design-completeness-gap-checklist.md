# SkillsIndex 需求设计完整性差距清单

更新日期：2026-03-07

## 1. 判定口径

只有当以下条件同时满足时，才可认定“需求设计完整”：

1. 需求文档与当前真实实现一致
2. 共享契约不存在互相冲突
3. 关键模块具备成功路径与失败路径验收
4. 覆盖矩阵中的关键模块不再停留在 `部分覆盖`

## 2. 当前结论

当前结论仍然是：**结构上完整，发布口径上未完整。**

但与本清单首次建立时相比，当前已有两项关键进展：

1. 身份与访问管理的共享契约已完成收口
2. OpenAPI / API Key / 数据与审计 / 运维基线已完成第二轮收口

这意味着：

1. 目前最大的风险已不再是“文档写错了当前实现”
2. 而是“当前实现里仍存在真实安全差距和治理闭环缺口”

## 3. 差距清单

### 3.1 身份与访问管理（P0）

**本轮已完成的文档收口：**

1. 会话 cookie 与服务端会话记录已与真实实现对齐
2. 账号中心、密码、会话、后台账号治理已与真实路由/API 对齐
3. 当前状态已统一为“已覆盖 / 部分覆盖 / 目标态”三层口径

**剩余差距：**

1. 失败登录限流 / 临时锁定未实现
2. password reset request / confirm 审计未补齐
3. `AuditLog` 仍缺少 `request_id/result/reason/source_ip`

### 3.2 导入、同步、异步任务与版本追踪（P0）

涉及文档：

1. `docs/design-requirements/ingestion-sync/ingestion-channels.md`
2. `docs/design-requirements/ingestion-sync/sync-lifecycle-records.md`
3. `docs/design-requirements/ingestion-sync/async-sync-job-orchestration.md`
4. `docs/design-requirements/ingestion-sync/scheduled-sync-version-history.md`
5. `docs/design-requirements/data-model/data-model-constraints.md`

主要差距：

1. 缺少统一闭环：首次导入、手动重同步、定时同步、重试、回滚尚未统一收敛为 `job -> run -> version -> audit`
2. 缺少版本规则：首次成功导入是否生成版本、失败后是否生成 run、回滚如何追加版本仍需明确
3. 缺少分页与过滤契约：jobs、sync-runs、versions 的分页、排序、筛选条件未闭环
4. 缺少边界与安全规则：zip 大小 / 文件数、repo 白名单、远程同步超时、外部 token 脱敏仍需补充

### 3.3 组织管理与内容审核治理（P1）

涉及文档：

1. `docs/design-requirements/admin-governance/organization-workspace-governance.md`
2. `docs/design-requirements/admin-governance/content-moderation-governance.md`
3. `docs/design-requirements/data-model/data-model-constraints.md`
4. `docs/design-requirements/test-acceptance/test-acceptance.md`

主要差距：

1. 组织与工作空间边界未完全闭环
2. 组织角色治理缺少实施细节：邀请、移除、角色变更、最后 owner 保护、平台救援边界仍需细化
3. 审核案件状态机未闭环：举报 case 状态与内容状态未完全拆开
4. 评论 / 内容治理数据模型与审计字段尚未统一

### 3.4 API Key、开放 API 与企业 SSO（P0/P1）

**本轮已完成的文档收口：**

1. 已明确匿名公开 API、API Key 保护检索 API、会话型 API 三类边界
2. 已统一当前真实 scope 命名：`skills.search.read`、`skills.ai_search.read` 等
3. 已明确 `401 api_key_invalid` 与 `403 api_key_scope_denied` 的实现口径
4. 已明确 API Key 生命周期、明文返回时机与自身/跨账号管理边界

**剩余差距：**

1. 静态 key 当前绕过 scope 校验，是 P0 安全差距
2. 空 scope / 非法 scope 当前仍存在宽松放行兼容行为，是 P0 安全差距
3. 当前 scope 只覆盖搜索类接口，尚未扩展到更多公开只读能力
4. 企业 SSO 的协议级契约、映射、回收仍未闭环

### 3.5 数据模型、审计模型与运维合规（P0/P1）

**本轮已完成的文档收口：**

1. `APIKey` 当前字段、生命周期与 scope 存储方式已与实现对齐
2. `AuditLog` 当前字段与运维记录复用方式已明确
3. 运维 API、审计导出、release gates、recovery drills、backup / release / approval 记录已与实现对齐

**剩余差距：**

1. `AuditLog` 仍不足以支撑强合规与排障，需要补 `request_id/result/reason/source_ip`
2. 运维门禁尚未接入发布流水线自动阻断
3. 4xx / 5xx 指标当前仍是占位值，不是完整观测事实
4. 备份产物校验、恢复自动化与外部留存仍未闭环

## 4. 建议补齐顺序

### 第一阶段：共享契约收口（已完成）

1. 身份与访问管理
2. API Key / API 安全边界
3. 数据模型与审计模型

### 第二阶段：实现层安全与治理闭环（当前建议立即进入）

1. API Key 安全边界硬化
2. 审计模型增强
3. password reset 审计补齐
4. 导入 / 同步 / 任务 / 版本链路闭环

### 第三阶段：模块治理闭环

1. 组织管理
2. 内容审核治理
3. 企业 SSO

### 第四阶段：平台与发布闭环

1. 运维门禁自动化
2. 全量专项验收
3. 发布证据固化

## 5. 达到“需求设计完整”的完成定义

当以下条件全部满足时，可认定需求设计完整：

1. 关键模块不再停留在 `部分覆盖`
2. 共享契约（会话、账号、API Key、审计、版本、删除 / 归档）无冲突
3. 每个关键模块都有成功路径与失败路径验收
4. 当前实现中的宽松兼容行为已被需求显式定案或被代码收紧
5. 用户端、管理端、公共能力、端到端场景四类覆盖都可用 `已覆盖` 描述

## 6. 建议下一步动作

1. 直接进入 API Key 安全边界硬化
2. 随后补强审计模型与 password reset 审计
3. 然后处理导入 / 同步 / 任务 / 版本链路
4. 最后再收口组织治理、内容审核、企业 SSO 与运维自动化
