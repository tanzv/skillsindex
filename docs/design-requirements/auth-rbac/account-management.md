# 账号管理需求（当前实现收口版）

## 1. 目的与范围

本文件定义 `FR-ACC-001~012` 的账号管理需求，并按“当前实现 / 部分覆盖 / 目标补齐”三层收口。

范围包含：

1. 用户端账号中心
2. 忘记密码与重置
3. 平台级账号治理
4. 安全与审计约束

当前结论：

1. 账号管理模块整体状态仍为 `部分覆盖`
2. 原因不是“完全没做”，而是当前已有路由、API 与数据模型，但部分契约和发布口径尚未闭环
3. 本文以当前 `backend/internal/web`、`backend/internal/services`、`backend/internal/models` 的真实行为为准

## 2. 当前能力总览

### 2.1 用户端已落地能力

当前已具备以下账号中心能力：

1. `/account` 入口与三页结构：`/account/profile`、`/account/security`、`/account/sessions`
2. 资料查看与更新：页面与 API 双通路
3. 密码修改：要求输入当前密码，可选择撤销其他会话
4. 会话管理：支持列出活跃会话、撤销指定会话、撤销其他会话
5. 忘记密码：提供页面流与 API 流的 request / confirm 两阶段处理

### 2.2 管理端已落地能力

当前已具备以下平台级账号治理能力：

1. 账号列表 API：`GET /api/v1/admin/accounts`
2. 账号状态变更：`POST /api/v1/admin/accounts/{userID}/status`
3. 强制下线：`POST /api/v1/admin/accounts/{userID}/force-signout`
4. 管理员重置密码：`POST /api/v1/admin/accounts/{userID}/password-reset`
5. 页面表单版治理：`/admin/accounts/*` 对应 POST 处理器已存在
6. 角色治理已独立实现于 `/admin/users/{userID}/role` 与 `/api/v1/admin/users/{userID}/role`

### 2.3 当前总体限制

1. 平台账号治理目前仅 `super_admin` 可执行，不是 `admin/super_admin` 共用能力
2. 账号状态当前只有 `active|disabled`
3. 列表检索、过滤、锁定策略、风险告警等仍未闭环
4. 忘记密码链路具备 token、安全与限流，但投递介质与审计闭环仍未完善

## 3. 需求分项收口

### FR-ACC-001 账号中心入口

当前状态：`已覆盖`

当前实现：

1. `GET /account` 已存在
2. 当前行为为重定向到 `GET /account/profile`
3. 所有 `/account/*` 页面都要求登录态

### FR-ACC-002 基础资料管理

当前状态：`已覆盖`

当前实现：

1. 页面：`GET/POST /account/profile`
2. API：`GET/POST /api/v1/account/profile`
3. 当前可维护字段：`display_name`、`avatar_url`、`bio`
4. 更新后立即返回最新资料并写入审计

当前校验：

1. `display_name` 最长 64 字符，且禁止控制字符
2. `avatar_url` 必须是合法 `http/https` URL
3. `bio` 最长 500 字符

### FR-ACC-003 密码修改

当前状态：`已覆盖`

当前实现：

1. 页面：`POST /account/security/password`
2. API：`POST /api/v1/account/security/password`
3. 请求字段：`current_password`、`new_password`、`revoke_other_sessions`
4. 修改成功后始终刷新当前会话
5. 当 `revoke_other_sessions=true` 时，会联动撤销其他会话并更新 `force_logout_at`

当前规则：

1. 必须验证当前密码
2. 新密码长度至少 8
3. 新旧密码不得相同
4. 修改成功后账号状态会保持/恢复为 `active`

### FR-ACC-004 忘记密码与重置

当前状态：`部分覆盖`

当前实现：

1. 页面：`/account/password-reset/request` 与 `/account/password-reset/confirm`
2. API：`POST /api/v1/account/password-reset/request` 与 `POST /api/v1/account/password-reset/confirm`
3. 重置 token 采用哈希存储，不落明文
4. token 具备一次性与时效约束
5. 确认重置成功后会自动启动新会话
6. request / confirm API 当前都会写审计事件，并带 `request_id`、`result`、`reason`、`source_ip`

当前安全约束：

1. token TTL 为 30 分钟
2. 限流窗口为 15 分钟
3. 单用户窗口内最多 5 次请求
4. 单 IP 窗口内最多 40 次请求
5. 未知用户名返回泛化成功语义，避免账号枚举

当前未闭环点：

1. 页面流未区分速率限制提示，仍统一走泛化成功语义
2. 投递通道仅停留在“生成可投递 token”，未在当前代码中绑定邮件/短信发送器

### FR-ACC-005 会话管理

当前状态：`部分覆盖`

当前实现：

1. 页面：`GET /account/sessions`、`POST /account/sessions/{sessionID}/revoke`、`POST /account/sessions/revoke-others`
2. API：`GET /api/v1/account/sessions`、`POST /api/v1/account/sessions/{sessionID}/revoke`、`POST /api/v1/account/sessions/revoke-others`
3. 可展示会话 `session_id`、`user_agent`、`issued_ip`、`last_seen`、`expires_at`、`is_current`
4. 禁止直接撤销当前会话
5. “撤销其他会话”执行后会刷新当前浏览器会话

当前未闭环点：

1. 未提供设备名称、地理位置、登录来源等更丰富的安全上下文
2. 未提供异常会话通知与确认机制
3. 发布口径上仍需补齐跨端验收与错误码文档

### FR-ACC-006 账号停用（用户自助）

当前状态：`目标态（待实现）`

说明：

1. 当前只有管理员可执行账号状态治理
2. 用户自助停用、恢复说明、数据保留策略尚未进入实现

### FR-ACC-007 用户列表与检索

当前状态：`部分覆盖`

当前实现：

1. 已提供账号列表 API
2. 已提供后台页面表单治理入口
3. 列表返回字段包含 `id`、`username`、`role`、`status`、`created_at`、`updated_at`、`force_logout_at`

当前未闭环点：

1. 当前 API 未实现用户名检索
2. 当前 API 未实现角色过滤
3. 当前 API 未实现状态过滤
4. 未返回最近登录时间、活跃会话数等扩展指标

### FR-ACC-008 账号状态治理

当前状态：`部分覆盖`

当前实现：

1. 入口：`POST /api/v1/admin/accounts/{userID}/status` 与 `POST /admin/accounts/{userID}/status`
2. 当前仅支持 `active` 与 `disabled`
3. 禁用账号后会触发强制下线
4. 具备“当前账号不可自禁用”与“最后一个活跃 super_admin 不可禁用”保护

当前未闭环点：

1. 没有 `locked`、`suspended` 等更细状态
2. 没有二次确认与原因字段的统一契约
3. 没有安全事件驱动的自动锁定策略

### FR-ACC-009 管理员密码重置

当前状态：`部分覆盖`

当前实现：

1. 入口：`POST /api/v1/admin/accounts/{userID}/password-reset` 与 `POST /admin/accounts/{userID}/password-reset`
2. 当前模式为管理员直接提交 `new_password`
3. 系统重置密码后会强制旧会话失效
4. 成功重置时会把账号状态恢复为 `active`

当前未闭环点：

1. 当前不是“一次性链接”模式
2. 当前需要管理员直接输入新密码，仍属于过渡实现
3. 若要满足更严格安全治理，应升级为一次性凭证或临时密码交付流程

### FR-ACC-010 角色治理一致性

当前状态：`已覆盖`

当前实现：

1. 页面入口：`POST /admin/users/{userID}/role`、`POST /admin/roles/assign`
2. API 入口：`POST /api/v1/admin/users/{userID}/role`
3. 禁止降级最后一个 `super_admin`
4. 所有角色变更写入审计

### FR-ACC-011 安全控制

当前状态：`部分覆盖`

当前已实现：

1. 所有变更类请求纳入全局 CSRF 校验
2. 登录态操作使用签名 cookie + 服务端会话记录双重收口
3. 密码重置 token 仅存 hash
4. 密码重置请求具备按用户与 IP 的频率限制
5. 登录失败当前按用户名和来源 IP 做短窗口限流，超阈值返回稳定的 `429` / throttling 响应

当前未实现：

1. 管理员可操作的解锁、阈值配置与风险可视化策略
2. 风险登录通知与多因子挑战
3. 设备信誉、地理异常等更强风控信号

### FR-ACC-012 审计覆盖

当前状态：`已覆盖（Window A 基线）`

当前已审计动作：

1. `account_profile_update`
2. `account_password_change`
3. `account_session_revoke`
4. `account_session_revoke_others`
5. `user_update_status` / `api_user_update_status`
6. `user_force_signout` / `api_user_force_signout`
7. `user_password_reset` / `api_user_password_reset`
8. `user_update_role`
9. `password_reset_request`
10. `password_reset_confirm`

当前审计字段基线：

1. 通用审计模型当前已补齐 `request_id`、`result`、`reason`、`source_ip`
2. 匿名入口允许写入无 actor 的审计事件，便于覆盖 password reset request 与失败确认
3. 关键账号链路均已有处理器级或服务级回归测试

## 4. 当前结构性结论

当前账号管理设计已经具备可开发、可联调、可验收的主骨架，但还不能宣称“最终完整 Web 已闭环”。

主要差距集中在：

1. 用户自助停用未实现
2. 后台账号列表筛选与治理细节不足
3. 管理员密码重置仍是过渡式实现
4. 更强的风险登录治理与通知能力仍未补齐

## 5. 与其他文档关系

1. 认证与会话基线见 `auth-rbac/auth-session-rbac.md`
2. 账号中心接口与错误码见 `auth-rbac/account-center-implementation.md`
3. 管理端治理实施见 `admin-governance/admin-account-operations.md`
4. 数据实体与约束见 `data-model/data-model-constraints.md`
5. 总体覆盖状态见 `overview/functional-coverage-matrix.md`
