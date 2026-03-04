# 账号中心实施级设计（目标态）

## 1. 目标

本文件将 `FR-ACC-001~006` 从“需求条目”细化为可实施设计，覆盖：

1. 用户端账号中心信息架构
2. 资料、密码、会话、忘记密码全链路
3. 审计、安全与错误处理标准

说明：本文件属于目标态设计，当前仓库尚未完全实现对应路由。

## 2. 页面与路由设计

### 2.1 页面信息架构

账号中心入口建议统一为 `/account`，包含三个一级页：

1. `/account/profile`：基础资料
2. `/account/security`：密码与账号安全
3. `/account/sessions`：会话管理

忘记密码链路为匿名页：

1. `/account/password-reset/request`
2. `/account/password-reset/confirm`

### 2.2 接口清单

1. `GET /account/profile`：读取资料
2. `POST /account/profile`：更新资料
3. `POST /account/security/password`：修改密码
4. `GET /account/sessions`：列出活跃会话
5. `POST /account/sessions/{sessionID}/revoke`：撤销指定会话
6. `POST /account/sessions/revoke-others`：踢出其他会话
7. `POST /account/password-reset/request`：申请重置
8. `POST /account/password-reset/confirm`：提交重置

安全约束：

1. 登录态接口必须校验会话 + CSRF
2. 忘记密码接口必须有频率限制（按账号 + IP）

## 3. 字段与校验规则

### 3.1 Profile 字段

1. `display_name`：1~64 字符，禁止控制字符
2. `avatar_url`：可选，必须是合法 URL
3. `bio`：可选，0~500 字符

验收：

1. 非法字段返回 400 与字段级错误
2. 更新成功后重新读取可见新值

### 3.2 Password 修改

请求字段：

1. `current_password`
2. `new_password`
3. `revoke_other_sessions`（bool，可选）

规则：

1. 必须验证当前密码
2. 新密码长度至少 8，建议包含大小写+数字
3. 新旧密码不得相同

### 3.3 Session 管理

会话列表最少字段：

1. `session_id`
2. `created_at`
3. `last_seen_at`
4. `user_agent`（可选）
5. `ip`（脱敏显示，可选）
6. `is_current`

约束：

1. 当前会话不可被“单会话撤销”误删
2. 执行“撤销其他会话”后，当前会话仍保持有效

### 3.4 忘记密码

重置凭证字段：

1. `reset_token_hash`
2. `expires_at`
3. `used_at`
4. `issued_ip`

规则：

1. 凭证一次性使用，使用后立即失效
2. 默认有效期建议 15~30 分钟
3. 连续失败达到阈值后触发临时冻结策略

## 4. 审计与安全

必审计动作：

1. `account_profile_update`
2. `account_password_change`
3. `account_session_revoke`
4. `account_session_revoke_others`
5. `account_password_reset_request`
6. `account_password_reset_confirm`

安全要求：

1. 重置 token 不落明文，仅存哈希
2. 错误文案避免泄露“账号是否存在”
3. 关键动作写审计日志并携带 request id

## 5. 错误码建议

1. `account_profile_invalid`
2. `account_password_invalid_current`
3. `account_password_policy_violation`
4. `account_session_not_found`
5. `account_reset_token_expired`
6. `account_reset_token_used`
7. `account_rate_limited`

## 6. 与现有需求映射

1. FR-ACC-001：账号中心入口 -> 第 2 章
2. FR-ACC-002：基础资料 -> 第 3.1 章
3. FR-ACC-003：密码修改 -> 第 3.2 章
4. FR-ACC-004：忘记密码 -> 第 3.4 章
5. FR-ACC-005：会话管理 -> 第 3.3 章
6. FR-ACC-006：账号停用（可选）-> 建议并入管理端状态治理（见 `admin-governance/admin-account-operations.md`）
