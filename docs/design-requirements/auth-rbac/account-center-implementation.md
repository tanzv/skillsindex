# 账号中心实施级设计（当前实现 + 补齐项）

## 1. 目标与状态

本文件将 `FR-ACC-001~006` 收口为可实现、可联调、可验收的账号中心设计说明。

当前状态：

1. 账号中心主路由与 API 已存在
2. 资料、密码、会话、忘记密码主链路已实现
3. 模块总体仍标记为 `部分覆盖`，因为审计、扩展字段与最终发布口径未完全闭环

## 2. 页面与路由设计

### 2.1 Canonical 页面路由

当前 canonical 页面路由如下：

1. `GET /account`：入口，当前重定向到 `/account/profile`
2. `GET /account/profile`
3. `POST /account/profile`
4. `GET /account/security`
5. `POST /account/security/password`
6. `GET /account/sessions`
7. `POST /account/sessions/{sessionID}/revoke`
8. `POST /account/sessions/revoke-others`
9. `GET /account/password-reset/request`
10. `POST /account/password-reset/request`
11. `GET /account/password-reset/confirm`
12. `POST /account/password-reset/confirm`

说明：

1. 忘记密码页面还提供 `light`、`mobile`、`mobile/light` 变体路径
2. 文档与验收统一以 canonical 路径为准

### 2.2 API 路由

当前 API 路由如下：

1. `GET /api/v1/account/profile`
2. `POST /api/v1/account/profile`
3. `POST /api/v1/account/security/password`
4. `GET /api/v1/account/sessions`
5. `POST /api/v1/account/sessions/{sessionID}/revoke`
6. `POST /api/v1/account/sessions/revoke-others`
7. `POST /api/v1/account/password-reset/request`
8. `POST /api/v1/account/password-reset/confirm`

安全边界：

1. `/api/v1/account/profile`、`/api/v1/account/security/password`、`/api/v1/account/sessions*` 需要登录态
2. `/api/v1/account/password-reset/*` 为匿名可访问接口
3. 所有非 `GET/HEAD/OPTIONS/TRACE` 请求都受全局 CSRF 中间件保护

## 3. 接口契约

### 3.1 Profile

#### 读取资料

- 接口：`GET /api/v1/account/profile`
- 成功返回：
  1. `user.id`
  2. `user.username`
  3. `user.display_name`
  4. `user.role`
  5. `user.status`
  6. `profile.display_name`
  7. `profile.avatar_url`
  8. `profile.bio`

#### 更新资料

- 接口：`POST /api/v1/account/profile`
- 请求字段：
  1. `display_name`
  2. `avatar_url`
  3. `bio`

当前错误码：

1. `unauthorized`
2. `service_unavailable`
3. `invalid_payload`
4. `profile_update_failed`

当前校验：

1. `display_name` 最长 64 字符，且不允许控制字符
2. `avatar_url` 必须为合法 `http/https` URL
3. `bio` 最长 500 字符

当前审计：

1. 成功更新后记录 `account_profile_update`

### 3.2 Password 修改

- 接口：`POST /api/v1/account/security/password`
- 请求字段：
  1. `current_password`
  2. `new_password`
  3. `revoke_other_sessions`

当前错误码：

1. `unauthorized`
2. `service_unavailable`
3. `invalid_payload`
4. `invalid_revoke_other_sessions`
5. `invalid_current_password`
6. `password_update_failed`
7. `session_revoke_failed`
8. `session_refresh_failed`

当前成功返回字段：

1. `ok`
2. `revoke_other_sessions`
3. `revoked_count`

当前行为约束：

1. 必须校验当前密码
2. 新密码长度至少 8
3. 新旧密码不得相同
4. 修改完成后会重新签发当前会话
5. 当 `revoke_other_sessions=true` 时，会联动：
   - 撤销其他会话记录
   - 更新 `force_logout_at`
   - 刷新当前浏览器会话

当前审计：

1. 成功修改后记录 `account_password_change`

### 3.3 Sessions

#### 列出会话

- 接口：`GET /api/v1/account/sessions`
- 成功返回字段：
  1. `current_session_id`
  2. `session_issued_at`
  3. `session_expires_at`
  4. `items[]`
  5. `total`

`items[]` 当前字段：

1. `session_id`
2. `user_agent`
3. `issued_ip`
4. `last_seen`
5. `expires_at`
6. `is_current`

#### 撤销单个会话

- 接口：`POST /api/v1/account/sessions/{sessionID}/revoke`

当前错误码：

1. `unauthorized`
2. `service_unavailable`
3. `invalid_session_id`
4. `cannot_revoke_current_session`
5. `session_not_found`
6. `session_revoke_failed`

当前规则：

1. 当前会话不可被单独撤销
2. 仅允许撤销属于当前用户的活跃会话
3. 成功后记录 `account_session_revoke`

#### 撤销其他会话

- 接口：`POST /api/v1/account/sessions/revoke-others`

当前成功返回字段：

1. `ok`
2. `revoked_count`

当前行为语义：

1. 先尝试撤销“其他会话”的服务端记录
2. 再更新当前用户的 `force_logout_at`
3. 最后为当前浏览器重新签发新会话
4. 因此该操作的安全语义是“旧会话整体失效，当前浏览器刷新为新会话”
5. 成功后记录 `account_session_revoke_others`

### 3.4 Password Reset

#### 请求重置

- 页面：`POST /account/password-reset/request`
- API：`POST /api/v1/account/password-reset/request`
- 请求字段：`username`

当前 API 错误码：

1. `service_unavailable`
2. `invalid_payload`
3. `too_many_requests`
4. `password_reset_request_failed`

当前行为：

1. 对不存在账号返回泛化成功语义，避免枚举
2. API 在命中速率限制时返回 `429 too_many_requests`
3. 页面流对未知账号与限流都统一返回泛化提示

#### 确认重置

- 页面：`POST /account/password-reset/confirm`
- API：`POST /api/v1/account/password-reset/confirm`
- 请求字段：
  1. `token`
  2. `new_password`

当前 API 错误码：

1. `service_unavailable`
2. `invalid_payload`
3. `invalid_reset_token`
4. `expired_reset_token`
5. `used_reset_token`
6. `password_reset_confirm_failed`
7. `session_start_failed`

当前行为：

1. token 为空时视为无效 token
2. token 一次性使用，成功确认后写入 `used_at`
3. token 过期后不可再次使用
4. 成功重置后：
   - 更新密码 hash
   - 将账号状态恢复/保持为 `active`
   - 写入 `force_logout_at`
   - 自动为当前浏览器启动新会话

## 4. 安全与状态约束

### 4.1 会话模型

当前账号中心依赖以下联合机制：

1. 签名 Cookie：`skillsindex_session`
2. 服务端会话表：`user_sessions`
3. 用户级强退时间：`users.force_logout_at`

### 4.2 当前有效性判断

会话有效至少同时满足：

1. cookie 签名正确且未过期
2. 若含 `session_id`，则服务端会话记录未撤销且未过期
3. 对应用户状态为 `active`
4. cookie `issued_at` 不早于 `force_logout_at`

### 4.3 密码重置安全约束

当前参数：

1. token TTL：30 分钟
2. 频率限制窗口：15 分钟
3. 每用户窗口：5 次
4. 每 IP 窗口：40 次

当前数据落点：

1. token 以 `token_hash` 存储
2. 记录 `issued_ip`
3. 使用后回写 `used_at`

## 5. 审计覆盖与缺口

当前已审计：

1. `account_profile_update`
2. `account_password_change`
3. `account_session_revoke`
4. `account_session_revoke_others`

当前未审计：

1. `password reset request`
2. `password reset confirm`

后续补齐建议：

1. 为忘记密码链路增加审计事件
2. 为敏感动作补充 `request_id`、`result`、`reason`、`ip` 等结构化字段
3. 统一页面与 API 的错误码映射文档

## 6. 后续扩展点

以下能力属于下一阶段补齐项：

1. 用户自助停用与恢复说明
2. 更丰富的设备指纹与异常登录提示
3. 密码重置投递通道标准化
4. 字段级错误模型与国际化错误码
