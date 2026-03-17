# 测试与验收需求

## 1. 测试策略

1. 单元测试：服务层业务规则、边界条件、错误分支
2. 路由/处理器测试：鉴权、权限、状态码、重定向行为
3. 契约测试：OpenAPI 产物与接口行为一致
4. 回归测试：导入、同步、检索、互动、治理主链路

## 1.1 当前执行口径

1. `已覆盖`：当前实现、需求定义与验收路径已基本闭环
2. `部分覆盖`：当前已有实现或路由/API 已接入，但仍需补齐契约、场景或回归覆盖
3. `目标态（待实现）`：需求已定义，但当前尚未进入有效实现范围

## 2. 功能验收矩阵

| 模块 | 最低验收场景 |
| --- | --- |
| 账号认证 | 注册开关、登录失败、会话过期 |
| 权限 | viewer/member/admin/super_admin 边界校验 |
| 导入 | 手动/Zip/仓库/SkillMP 各 1 成功 + 1 失败 |
| 同步 | repository/skillmp 重同步成功与异常 |
| 定时同步与版本历史（部分覆盖） | 策略触发、运行记录、版本快照、差异对比、回滚链路 |
| 互动 | 收藏切换、评分边界、评论删改权限 |
| 账号管理（部分覆盖） | 资料更新、密码修改/重置、会话管理、后台账号禁用与重置、登录限流、reset 审计 |
| 异步任务（部分覆盖） | 导入任务排队、重试、取消、幂等去重 |
| 组织协作（部分覆盖） | 组织创建、成员角色变更、最后 owner 保护 |
| 内容审核（部分覆盖） | 举报进入队列、审核处理、审计可追溯 |
| API Key | 创建、撤销、过期、鉴权失败、仅创建时展示明文 |
| API Key Scope（部分覆盖） | scope 鉴权、空 scope/非法 scope/静态 key 的 403 拒绝、轮换流程 |
| 公开 API | 搜索参数组合、401、分页正确性、兼容 OpenAPI 路径可访问、私有 marketplace 匿名受限 |
| 钉钉 | 未配置、授权成功、grant 过期、撤销 |
| 企业 SSO（部分覆盖） | IdP 登录、账号映射、离职回收 |
| 审计 | 关键操作可查且字段完整 |
| 后台治理 | `/admin/*` 与 `/dashboard/*` 等价行为，用户角色更新约束生效 |
| 运维合规（部分覆盖） | 审计留存、备份恢复演练、告警与门禁校验 |

## 3. 路由覆盖验收

以下路由必须纳入自动化或人工验收清单：

1. `/skillsmp`
2. `/docs/openapi.json`
3. `/docs/openapi.yaml`
4. `/dashboard`
5. `/dashboard/{section}`
6. `/admin/users/{userID}/role`

## 4. 发布前强制检查

1. `go test ./...` 全通过
2. 无 P0/P1 未关闭缺陷
3. 鉴权与权限链路人工抽检通过
4. OpenAPI 文档可访问且可在 Swagger 正常浏览
5. 性能基线压测完成并产出报告（包含 P50/P95/错误率）

## 5. 验收通过标准

当以下条件全部满足时判定可发布：

1. FR 与 NFR 关键项已覆盖
2. 公开 API 与后台关键路径无阻断缺陷
3. 审计链路完整可追溯
4. 兼容路由与别名路由行为一致

## 6. 用户端与管理端完整性验收

发布前必须额外完成以下“跨端完整性”验收：

1. 用户端场景验收：游客检索 -> 登录 -> 互动提交
2. 管理端场景验收：导入 -> 记录治理 -> 审计可追溯
3. 超管场景验收：用户角色更新 + 最后 super_admin 保护
4. 公共能力验收：OpenAPI 入口、API Key 鉴权、钉钉授权链路

执行依据：

1. `overview/functional-coverage-matrix.md`
2. `overview/requirement-traceability.md`

## 7. 账号管理专项验收（FR-ACC，当前部分覆盖）

当前账号管理能力已进入部分覆盖状态；在进入“最终完整 Web”发布前，必须至少补齐并验证以下专项：

### 7.1 用户端账号中心

1. `/account` 必须重定向到 `/account/profile`
2. 资料更新必须覆盖合法值、非法 URL、超长简介、控制字符输入
3. 密码修改必须覆盖：
   - 当前密码错误
   - 新密码过短
   - 新旧密码相同
   - `revoke_other_sessions=true` 时当前会话被刷新

### 7.2 会话管理

1. `GET /api/v1/account/sessions` 返回 `current_session_id`、`session_issued_at`、`session_expires_at` 与 `items[]`
2. `items[]` 至少校验 `session_id/user_agent/issued_ip/last_seen/expires_at/is_current`
3. 撤销当前会话必须返回 `cannot_revoke_current_session`
4. 撤销不存在会话必须返回 `session_not_found`
5. 撤销其他会话后，旧会话应失效，当前浏览器应获得新会话

### 7.3 忘记密码与重置

1. 未知用户名请求必须返回泛化成功语义，不得泄露账号存在性
2. API 命中限流时必须返回 `429 too_many_requests`
3. 确认接口必须覆盖：
   - `invalid_reset_token`
   - `expired_reset_token`
   - `used_reset_token`
4. 重置成功后必须自动启动新会话
5. token 必须满足“哈希存储 + 30 分钟有效期 + 一次性使用”
6. request / confirm / rate-limited 场景必须可在审计中追溯 `request_id`、`result`、`reason`、`source_ip`

### 7.4 管理端账号治理

1. 账号治理 API 仅 `super_admin` 可用，普通 `admin` 必须返回 `permission_denied`
2. 当前仅允许 `active|disabled` 两种状态
3. 禁用当前已登录账号自身必须返回 `cannot_disable_current_account`
4. 禁用最后一个活跃 `super_admin` 必须返回 `last_super_admin_guard`
5. 管理员重置密码必须校验最小长度，并在成功后使旧会话失效

### 7.5 审计与安全基线

在最终发布闭环前，至少需要验证以下基线：

1. 忘记密码 request / confirm 的审计策略已经生效且可回查
2. 失败登录限流在 API 与页面流均返回稳定 throttling 响应
3. 审计字段扩展至少覆盖 `request_id`、`result`、`reason`、`source_ip`

## 8. 扩展能力专项验收（当前部分覆盖）

### 8.1 异步任务（FR-JOB）

1. 任务状态机正确流转（pending/running/succeeded/failed）
2. 失败任务重试策略生效且不覆盖历史成功版本
3. 重复提交具备幂等保护

### 8.2 组织协作（FR-ORG）

1. 组织创建后自动生成 owner 成员关系
2. 组织角色权限边界生效（owner/admin/member/viewer）
3. 最后一个 owner 不可被移除或降级

### 8.3 内容治理（FR-MOD）

1. 举报可入队审核
2. 审核处理可变更内容状态（normal/flagged/hidden/deleted）
3. 处理动作可审计追溯

### 8.4 API Key Scope（FR-KEY）

1. 缺少 scope 的 key 调用高权限接口返回 403
2. 空 scope、非法 scope、静态兼容 key 调用受保护公开检索接口返回 `403 api_key_scope_denied`
3. 无效、撤销或过期 key 返回 `401 api_key_invalid`
4. key 轮换期间新旧 key 切换可控
5. scope 变更后鉴权即时生效

### 8.5 企业 SSO（FR-SSO）

1. 支持标准 OIDC 登录回调流程
2. 外部身份与本地账号映射唯一
3. 离职回收后账号访问立即受限

### 8.6 运维合规（NFR-OPS）

1. 发布前门禁检查可重复执行
2. 审计日志留存与导出能力可验证
3. 备份恢复演练满足目标 RPO/RTO

### 8.7 定时同步与版本历史（FR-ING-013~022）

1. 策略触发：到点自动触发并进入任务队列
2. 运行记录：每次同步有完整 run 数据（状态、耗时、错误）
3. 版本生成：成功同步后生成 skill version 快照
4. 差异对比：可查看版本间 content/tags/metadata 差异
5. 回滚审计：回滚生成新版本且审计链路完整

### 8.8 Marketplace Access Baseline（Window A 决策）

当前分支决策：`retain marketplace_public_access`

1. 当 `marketplace_public_access=false` 时，匿名访问公开前端路由应跳转到登录页
2. 登录页跳转必须保留原始 `redirect` 目标
3. 当 `marketplace_public_access=false` 时，`/api/v1/public/marketplace` 与 `/api/v1/public/skills/{skillID}` 的匿名请求返回 `401`
4. 已登录用户在 marketplace private 模式下仍可访问公开市场页面与详情
