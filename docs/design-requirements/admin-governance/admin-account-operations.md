# 管理端账号治理实施设计（当前实现 + 目标补齐）

## 1. 目标与状态

本文件收口 `FR-ACC-007~012` 在管理端的真实落地情况，覆盖：

1. 账号列表
2. 状态治理
3. 强制下线
4. 管理员重置密码
5. 角色治理关联约束

当前状态：`部分覆盖`

原因：

1. 核心 API 与表单处理器已存在
2. 但列表筛选、状态模型、重置流程与审计字段仍未达到最终目标态

## 2. 当前入口与路由

### 2.1 页面入口

后台页面采用通配视图路由承载，当前账号治理页面可通过：

1. `GET /admin/accounts`
2. `GET /dashboard/access` 或相关访问分区页面

页面表单处理器当前已存在：

1. `POST /admin/accounts/create`
2. `POST /admin/accounts/{userID}/status`
3. `POST /admin/accounts/{userID}/force-signout`
4. `POST /admin/accounts/{userID}/password-reset`
5. `POST /admin/users/{userID}/role`
6. `POST /admin/roles/assign`

### 2.2 API 入口

当前 API 如下：

1. `GET /api/v1/admin/accounts`
2. `POST /api/v1/admin/accounts/{userID}/status`
3. `POST /api/v1/admin/accounts/{userID}/force-signout`
4. `POST /api/v1/admin/accounts/{userID}/password-reset`
5. `POST /api/v1/admin/users/{userID}/role`

## 3. 当前权限与状态模型

### 3.1 权限边界

当前实现中，平台账号治理不是 `admin/super_admin` 共用能力，而是仅允许 `super_admin` 执行。

依据：

1. 所有账号治理 API 都先校验 `user.CanManageUsers()`
2. `CanManageUsers()` 当前仅对 `super_admin` 返回 true

因此当前真实口径为：

1. `admin` 可治理全站技能与评论
2. `admin` 当前不能治理平台账号状态、角色或密码
3. `super_admin` 才能执行账号列表、状态更新、强退与管理员重置密码

### 3.2 当前账号状态

当前状态枚举只有：

1. `active`
2. `disabled`

当前保护规则：

1. 不允许禁用当前已登录账号自身
2. 不允许禁用最后一个活跃的 `super_admin`
3. 账号被禁用后，会联动 `ForceSignOutUser(...)` 使旧会话失效

说明：

1. `locked` 不是当前实现状态
2. 若后续引入锁定策略，应在数据模型、鉴权和审计中一起补齐

## 4. 当前接口契约

### 4.1 账号列表

- 接口：`GET /api/v1/admin/accounts`

当前返回字段：

1. `id`
2. `username`
3. `role`
4. `status`
5. `created_at`
6. `updated_at`
7. `force_logout_at`
8. `total`

当前结论：

1. 已具备列表基础能力
2. 已支持按用户名关键字、角色、状态的服务端筛选
3. 当前未返回最近登录时间、活跃会话数、风险状态等运营字段

### 4.2 状态变更

- 接口：`POST /api/v1/admin/accounts/{userID}/status`
- 页面表单：`POST /admin/accounts/{userID}/status`
- 请求字段：`status`

当前 API 错误码：

1. `unauthorized`
2. `permission_denied`
3. `invalid_user_id`
4. `invalid_payload`
5. `invalid_status`
6. `cannot_disable_current_account`
7. `user_not_found`
8. `last_super_admin_guard`
9. `update_failed`

当前行为：

1. 只接受 `active|disabled`
2. 当目标状态为 `disabled` 时，更新状态后还会强制旧会话失效
3. 成功后写入审计

### 4.3 强制下线

- 接口：`POST /api/v1/admin/accounts/{userID}/force-signout`
- 页面表单：`POST /admin/accounts/{userID}/force-signout`

当前 API 错误码：

1. `unauthorized`
2. `permission_denied`
3. `invalid_user_id`
4. `user_not_found`
5. `force_signout_failed`

当前实现语义：

1. 通过更新 `users.force_logout_at` 使既有会话整体失效
2. 该能力不依赖逐条删除所有 session 记录
3. 成功后写入审计

### 4.4 管理员重置密码

- 接口：`POST /api/v1/admin/accounts/{userID}/password-reset`
- 页面表单：`POST /admin/accounts/{userID}/password-reset`
- 请求字段：`new_password`

当前 API 错误码：

1. `unauthorized`
2. `permission_denied`
3. `invalid_user_id`
4. `invalid_payload`
5. `invalid_password`
6. `user_not_found`
7. `reset_failed`

当前实现语义：

1. 当前模式是“管理员直接提交一个新密码”
2. 系统在服务端更新密码 hash，并将账号状态恢复/保持为 `active`
3. 随后调用 `ForceSignOutUser(...)` 使旧会话失效
4. 成功后写入审计

当前差距：

1. 当前不是一次性重置链接模式
2. 当前仍要求管理员输入明文新密码作为请求参数
3. 若要满足更高安全等级，应升级为一次性链接或临时凭证交付流程

### 4.5 角色治理关联

虽然角色治理不完全属于本文件主体，但当前平台账号治理依赖其一致性约束：

1. 页面：`POST /admin/users/{userID}/role`、`POST /admin/roles/assign`
2. API：`POST /api/v1/admin/users/{userID}/role`
3. 当前已实现“最后一个 `super_admin` 不可降级”保护
4. 成功后写入角色变更审计

## 5. 当前审计覆盖

当前页面端审计动作：

1. `user_create_by_admin`
2. `user_update_status`
3. `user_force_signout`
4. `user_password_reset`
5. `user_update_role`

当前 API 端审计动作：

1. `api_user_update_status`
2. `api_user_force_signout`
3. `api_user_password_reset`

当前缺口：

1. 审计结构仍较轻，缺少 `request_id`、`reason`、`result`、`source_ip` 等字段
2. 状态变更与密码重置缺少标准化二次确认记录
3. 未形成统一的审计事件字典

## 6. 当前结论与目标补齐

### 6.1 当前已可支撑的管理动作

1. 超管查看账号列表
2. 超管禁用 / 启用账号
3. 超管强制账号下线
4. 超管直接重置密码
5. 超管调整角色

### 6.2 仍需补齐的目标态能力

1. 用户名 / 角色 / 状态检索过滤
2. `locked` 等更细状态机
3. 管理员密码重置的一次性链接流程
4. 原因字段、确认流与更强审计模型
5. 最近登录时间、活跃会话数、风险标签等运营视图字段
