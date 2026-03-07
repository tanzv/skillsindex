# 非功能需求（当前实现基线）

## 1. 文档定位

本文件用于收口当前代码中已体现的性能、可靠性、安全与可观测性基线，并明确仍未闭环的非功能差距。

当前结论：

1. `NFR-001~015` 整体基础能力已存在
2. 但部分安全与可观测条目仍是“已实现基线 + 目标补齐”模式
3. 与运维、合规、门禁直接相关的内容，需与 `non-functional/operations-compliance-observability.md` 联合阅读

## 2. 性能（NFR-001~005）

### NFR-001 查询性能

目标基线：

1. 市场关键词搜索 P95 <= 2 秒（1 万技能基线）

当前实现侧约束：

1. `GET /api/v1/skills/search` 的 `limit` 最大为 100
2. 匿名市场接口关键字模式页面大小当前固定为 24
3. `GET /api/v1/skills/ai-search` 的 `limit` 最大为 100
4. 匿名市场 AI 模式当前单页最多返回 48 条

### NFR-002 页面体验

目标基线：

1. 市场、分类、详情、后台核心页首屏 <= 3 秒（基线网络）

当前实现说明：

1. 匿名市场聚合接口已返回筛选、分页、类目、热门标签与卡片数据，具备前端一次性拉取基础
2. 详情接口已聚合技能、互动统计、评论与当前 viewer 状态

### NFR-003 写入性能

目标基线：

1. 收藏 / 评分 / 评论 / API Key 写操作 P95 <= 500ms

当前实现说明：

1. 互动写接口与 API Key 生命周期接口都已具备独立处理器与服务层
2. 但当前仓库未见固定性能报告，本条仍需通过压测证据闭环

### NFR-004 外部调用超时

当前目标基线：

1. SkillMP 请求超时 20 秒
2. 钉钉请求默认超时 10 秒

说明：

1. 本条仍需结合导入/集成文档和实际服务配置继续核对
2. 当前文档先保留为既定 NFR 基线

### NFR-005 性能测量规范

性能验收统一口径：

1. 数据规模：至少 10,000 条技能记录
2. 并发基线：20~50 并发用户
3. 压测时长：预热 3 分钟 + 采样 10 分钟
4. 指标口径：P50 / P95 / 错误率 / 吞吐量同时输出
5. 测试脚本版本需记录在报告中

## 3. 可靠性（NFR-006~008）

### NFR-006 同步鲁棒性

目标基线：

1. 仓库与 SkillMP 同步失败不覆盖旧数据

### NFR-007 事务一致性

目标基线：

1. 技能内容与标签替换必须在同一事务提交

### NFR-008 失败可追踪

当前已实现基线：

1. 鉴权、资料更新、密码修改、会话撤销、API Key 生命周期等关键路径均返回可定位错误码
2. `AuditLog` 已支持关键治理动作的追加式记录
3. `AuditService.ListRecent(...)` 已支持最近审计日志查询

当前差距：

1. 仍缺少统一 `request_id` 贯穿应用日志与审计日志的结构化落点
2. 密码重置 request / confirm 仍未纳入审计

## 4. 安全（NFR-009~012）

### NFR-009 会话安全

当前已实现基线：

1. 登录态 cookie 已签名
2. cookie 名称为 `skillsindex_session`
3. 属性为 `HttpOnly + SameSite=Lax + Secure(可配置)`
4. 当前会话有效性同时依赖：
   - cookie 签名与过期时间
   - 服务端 `UserSession`
   - `users.force_logout_at`

### NFR-010 CSRF 防护

当前已实现基线：

1. 全局中间件对所有非 `GET/HEAD/OPTIONS/TRACE` 请求执行 CSRF 校验
2. token 来源支持 `X-CSRF-Token` 与表单字段 `csrf_token`
3. 配套 cookie 为 `skillsindex_csrf`

### NFR-011 API 鉴权

当前已实现基线：

1. API Key 支持 query `api_key` 与 `Authorization: Bearer`
2. 无效 key 返回 `401 api_key_invalid`
3. 缺失 scope 返回 `403 api_key_scope_denied`
4. 数据库 key 校验要求未撤销且未过期

当前安全差距：

1. 静态配置 key 当前绕过 scope 校验
2. 空 scope / 非法 scope 当前仍存在兼容性宽松放行风险
3. 失败登录限流与临时锁定策略尚未实现

### NFR-012 输入与路径安全

当前已知基线：

1. 评论长度、评分范围、资料字段长度等输入约束已实现
2. 密码重置请求具备按用户与 IP 的速率限制
3. 密码重置 token 仅存 hash，不存明文

待继续核对项：

1. Zip 解压防路径逃逸
2. 仓库子路径防路径逃逸
3. 外部连接配置与 token 脱敏

## 5. 可观测性（NFR-013~015）

### NFR-013 日志追溯

当前已实现基线：

1. `RequestID` 中间件已启用
2. 关键治理动作已写入 `AuditLog`
3. 运维记录当前复用 `AuditLog` 作为事实存储

### NFR-014 请求级关联

当前状态：`部分覆盖`

说明：

1. 请求 ID 已生成
2. 但当前 `AuditLog` 模型没有 `request_id` 字段
3. 因此“应用日志 -> 审计日志 -> 运维导出”的全链路关联仍未闭环

### NFR-015 指标与告警

当前已实现基线：

1. 已提供运维 metrics、alerts、audit export、release gates、recovery drills、releases、change approvals、backup plans、backup runs API
2. release gate 当前已具备可计算门禁快照

当前差距：

1. `error_rate_4xx` 与 `error_rate_5xx` 当前仍为占位值 0
2. 告警与门禁尚未接入 CI/CD 自动阻断
3. 留存、导出、告警阈值仍需外部证据闭环

## 6. 当前非功能优先差距

P0：

1. API Key 最小权限边界收紧
2. 审计模型增强（`request_id/result/reason/source_ip`）
3. 密码重置链路审计补齐

P1：

1. 登录失败限流 / 锁定策略
2. 运维指标真实性与告警接入
3. 导入、同步、组织、审核链路的统一追踪字段
