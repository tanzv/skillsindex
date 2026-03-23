# 2026-03-21 Skill 管理平台后端需求审查

## 1. 审查目的

本文件用于回答以下问题：

1. 当前项目的真实定位是什么
2. 需求文档对后端功能的定义是否完整
3. 当前代码是否已经提供对应接口与后端能力
4. 哪些模块属于“已实现但未完全闭环”，哪些模块仍然停留在目标态

本次审查范围聚焦于：

1. `docs/design-requirements/**`
2. `backend/internal/web/**`
3. `backend/internal/services/**`
4. `backend/internal/models/**`

## 2. 平台定位理解

当前项目不是“交易购买后端服务”平台，而是企业内部的 Skill 资产管理、同步、分发与治理平台。

根据需求文档，SkillsIndex 的核心目标是：

1. 将分散在 Markdown、代码仓库、SkillMP 的 Skill 内容统一索引与管理
2. 通过角色、权限、会话、安全控制与审计形成可控治理边界
3. 通过 API Key 与 OpenAPI 提供可复用的公开检索能力
4. 通过仓库与 SkillMP 同步机制维持 Skill 内容持续更新

对应依据：

1. `docs/design-requirements/overview/background-goals.md`
2. `docs/design-requirements/overview/scope-assumptions.md`

## 3. 当前需求结构判断

当前需求文档的结构结论应认定为：

1. 大模块结构完整
2. 发布口径未完整

原因不是缺少核心需求，而是若干治理模块仍停留在：

1. 共享契约未完全统一
2. 失败路径与安全边界未完全收口
3. 测试验收与发布证据未完全闭环

对应依据：

1. `docs/design-requirements/overview/functional-module-completeness-summary.md`
2. `docs/design-requirements/overview/functional-coverage-matrix.md`
3. `docs/design-requirements/test-acceptance/test-acceptance.md`

## 4. 平台能力地图

### 4.1 用户侧能力

1. 市场发现：关键词搜索、AI 搜索、分类、时间线、详情
2. 互动系统：收藏、评分、评论
3. 账号体系：注册、登录、注销、会话
4. 账号中心：资料维护、密码修改、会话管理、忘记密码

### 4.2 管理侧能力

1. 导入中心：手动、Zip、仓库、SkillMP 四类导入
2. 记录治理：可见性切换、远程同步、删除
3. 同步治理：sync policy、sync run、版本历史、回滚
4. API Key 治理：创建、撤销、轮换、scope 更新
5. 账号治理：状态变更、强制下线、管理员重置密码
6. 组织治理：组织创建、成员治理、技能绑定
7. 内容治理：举报、审核队列、处理动作
8. 异步任务治理：任务列表、重试、取消

### 4.3 开放能力

1. 公开搜索 API
2. OpenAPI 与 Swagger
3. API Key 鉴权
4. 钉钉 OAuth

### 4.4 平台基础

1. 用户与角色模型
2. 服务端会话模型
3. 审计日志模型
4. 组织与组织成员模型
5. Moderation case 模型
6. Skill version 快照模型

## 5. 需求与当前实现对照

### 5.1 市场与发现

需求状态：

1. 已覆盖

当前实现判断：

1. 需求目标明确，围绕公开 Skill 发现链路
2. 该模块服务于 Skill 资产浏览，不涉及交易语义

结论：

1. 产品方向清晰
2. 不属于本次争议点

### 5.2 互动系统

需求状态：

1. 已覆盖

当前实现证据：

1. 已有收藏接口
2. 已有评分接口
3. 已有评论发布与删除接口
4. 已有 Skill 举报与评论举报接口

接口入口：

1. `/api/v1/skills/{skillID}/favorite`
2. `/api/v1/skills/{skillID}/rating`
3. `/api/v1/skills/{skillID}/comments`
4. `/api/v1/skills/{skillID}/comments/{commentID}/delete`
5. `/api/v1/skills/{skillID}/report`
6. `/api/v1/skills/{skillID}/comments/{commentID}/report`

结论：

1. 互动能力主链路已存在
2. 后端接口完整度较高

### 5.3 身份与访问管理

需求状态：

1. 部分覆盖

当前实现证据：

1. `/account/profile`、`/account/security`、`/account/sessions` 页面入口已存在
2. `/api/v1/account/profile`、`/api/v1/account/sessions` 等 API 已存在
3. 忘记密码 request / confirm API 已存在
4. 管理端账号治理 API 已存在
5. 登录失败限流已存在
6. 服务端会话模型已存在
7. 审计字段已包含 `request_id`、`result`、`reason`、`source_ip`

接口入口：

1. `/api/v1/account/profile`
2. `/api/v1/account/security/password`
3. `/api/v1/account/sessions`
4. `/api/v1/account/password-reset/request`
5. `/api/v1/account/password-reset/confirm`
6. `/api/v1/admin/accounts`
7. `/api/v1/admin/accounts/{userID}/status`
8. `/api/v1/admin/accounts/{userID}/force-signout`
9. `/api/v1/admin/accounts/{userID}/password-reset`

结论：

1. 该模块不是“未实现”
2. 当前更准确的状态是“主能力已落地，但若按最终治理口径仍未完全闭环”

剩余缺口：

1. 用户自助停用未实现
2. 更严格的管理员密码重置交付模式未收口
3. 更丰富的设备与异常会话治理信息未补齐

### 5.4 导入与记录治理

需求状态：

1. 已覆盖

当前实现证据：

1. 四类导入入口存在
2. records 治理入口存在
3. 远程同步入口存在
4. 删除入口存在

接口入口：

1. `/skills/manual`
2. `/skills/upload`
3. `/skills/repo`
4. `/skills/skillmp`
5. `/skills/{skillID}/visibility`
6. `/skills/{skillID}/sync`
7. `/skills/{skillID}/delete`

结论：

1. 导入与记录治理主链路已具备
2. 不是当前最大缺口

### 5.5 定时同步、运行记录与版本历史

需求状态：

1. 部分覆盖

当前实现证据：

1. `sync-policies` 路由已存在
2. `sync-runs` 路由已存在
3. Skill 维度 `sync-runs` 路由已存在
4. 版本列表、详情、compare、rollback、restore 已存在
5. `SkillVersion` 模型已包含快照、diff、digest、summary、risk、archive 字段
6. create / visibility / delete / sync 都已自动捕获版本
7. rollback / restore 会生成新版本，不覆盖历史

接口入口：

1. `/api/v1/admin/sync-policies`
2. `/api/v1/admin/sync-policies/create`
3. `/api/v1/admin/sync-policies/{policyID}/update`
4. `/api/v1/admin/sync-policies/{policyID}/toggle`
5. `/api/v1/admin/sync-policies/{policyID}/delete`
6. `/api/v1/admin/sync-runs`
7. `/api/v1/admin/sync-runs/{runID}`
8. `/api/v1/skills/{skillID}/sync-runs`
9. `/skills/{skillID}/versions`
10. `/skills/{skillID}/versions/compare`
11. `/skills/{skillID}/versions/{versionID}`
12. `/api/v1/skills/{skillID}/versions/{versionID}/rollback`

结论：

1. 这一块已经明显有实现，不应简单表述为“未做”
2. 但当前实现仍偏“现有能力收口”而非“目标态完整治理体系”

剩余缺口：

1. `sync policy` 当前更像 repository 默认策略别名，不是通用多策略模型
2. `sync-runs` 当前仍明显复用 sync jobs 视图
3. `job -> run -> version -> audit` 统一链路仍未完全标准化
4. 分页、过滤、重试、失败分布等治理口径仍偏弱

### 5.6 API Key 与公开 API

需求状态：

1. OpenAPI 与公开 API 已覆盖
2. API Key 细粒度授权部分覆盖

当前实现证据：

1. OpenAPI、Swagger、兼容文档入口已存在
2. API Key 支持 query 与 Bearer 双通道
3. 401 与 403 已做分流
4. scope deny-by-default 已存在
5. 静态 key 对受保护接口已不再宽松放行
6. 当前支持的 scope 集合已定义

接口入口：

1. `/openapi.json`
2. `/openapi.yaml`
3. `/docs/swagger`
4. `/docs/openapi.json`
5. `/docs/openapi.yaml`
6. `/api/v1/skills/search`
7. `/api/v1/skills/ai-search`
8. `/api/v1/admin/apikeys`
9. `/api/v1/admin/apikeys/{keyID}/revoke`
10. `/api/v1/admin/apikeys/{keyID}/rotate`
11. `/api/v1/admin/apikeys/{keyID}/scopes`

结论：

1. 公开 API 和 API Key 生命周期已经具备主干能力
2. 当前问题主要不是“有没有接口”，而是 scope 覆盖面偏窄

剩余缺口：

1. scope 当前只绑定搜索类接口
2. 尚未扩展到详情、治理只读或更多细粒度能力
3. 缺少更强的运维治理，例如强制轮换、批量撤销、风险分级

### 5.7 组织治理

需求状态：

1. 部分覆盖

当前实现证据：

1. 组织列表、创建、成员列表、成员 upsert、角色更新、成员移除都已存在
2. Skill 绑定组织、解绑组织接口已存在
3. 服务层已实现最后一个 owner 保护

接口入口：

1. `/api/v1/admin/organizations`
2. `/api/v1/admin/organizations/{orgID}/members`
3. `/api/v1/admin/organizations/{orgID}/members/{userID}/role`
4. `/api/v1/admin/organizations/{orgID}/members/{userID}/remove`
5. `/api/v1/skills/{skillID}/organization-bind`
6. `/api/v1/skills/{skillID}/organization-unbind`

结论：

1. 组织能力不是只停留在数据模型预留
2. 后端已经具备相当一部分治理能力

剩余缺口：

1. 邀请机制未完整呈现
2. 工作空间治理与平台救援边界未完全文档化收口
3. 最终验收链路还不够完整

### 5.8 内容审核治理

需求状态：

1. 部分覆盖

当前实现证据：

1. `ModerationCase` 模型已存在
2. 状态 `open/resolved/rejected` 已存在
3. 动作 `none/flagged/hidden/deleted` 已存在
4. 后台审核队列与 resolve / reject 接口已存在
5. 用户举报 Skill / Comment 接口已存在

接口入口：

1. `/api/v1/admin/moderation`
2. `/api/v1/admin/moderation/{caseID}/resolve`
3. `/api/v1/admin/moderation/{caseID}/reject`
4. `/api/v1/skills/{skillID}/report`
5. `/api/v1/skills/{skillID}/comments/{commentID}/report`

结论：

1. 审核后端能力已经进入有效实现范围
2. 当前缺的是治理闭环，不是接口空白

剩余缺口：

1. 申诉链路未体现
2. 案件状态、内容状态、审计口径仍需进一步统一

### 5.9 运维、合规与可观测

需求状态：

1. 部分覆盖

当前实现证据：

1. metrics、alerts、audit export、release gates、recovery drills、backup 等 API 已存在
2. 审计模型当前已经支持 `request_id`、`result`、`reason`、`source_ip`

接口入口：

1. `/api/v1/admin/ops/metrics`
2. `/api/v1/admin/ops/alerts`
3. `/api/v1/admin/ops/audit-export`
4. `/api/v1/admin/ops/release-gates`
5. `/api/v1/admin/ops/release-gates/run`
6. `/api/v1/admin/ops/recovery-drills`
7. `/api/v1/admin/ops/recovery-drills/run`
8. `/api/v1/admin/ops/backup/plans`
9. `/api/v1/admin/ops/backup/runs`

结论：

1. 文档里对审计字段不足的描述，和当前模型相比已经有部分滞后
2. 但从发布闭环角度看，自动化门禁、真实监控、恢复演练证据仍不够强

## 6. 综合判断

本次审查后的准确结论应为：

1. 项目方向明确，且明确是 Skill 管理、同步、分发、治理平台
2. 当前需求文档已经覆盖完整的大模块框架
3. 当前后端实现并不缺少主干接口，很多“部分覆盖”模块其实已经有真实路由、服务和模型
4. 当前真正的缺口主要在治理闭环，而不是核心接口缺失

换句话说：

1. 可以说“需求结构完整”
2. 也可以说“很多关键后端能力已经存在”
3. 但还不能说“已达到最终发布闭环”

## 7. 当前最值得优先收口的点

建议按以下优先级继续推进：

1. 统一 `job -> run -> version -> audit` 链路
2. 将 sync policy 从当前 alias 模式推进到通用多策略治理模型
3. 扩展 API Key scope 覆盖范围
4. 完善组织治理与内容审核的最终契约和验收
5. 补强运维门禁、可观测性与恢复证据链

对应执行清单见：

1. `docs/plans/2026-03-21-skill-management-backend-gap-closure-checklist.md`

## 8. 一句话结论

当前系统已经是一个方向明确、后端主能力较完整的 Skill 同步管理平台；主要问题不在于“没有后端服务接口”，而在于若干治理模块仍未完成最终的契约、审计与验收闭环。
