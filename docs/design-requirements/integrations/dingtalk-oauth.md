# 钉钉 OAuth 集成需求

## 1. 路由与能力

### FR-DT-001 OAuth 启动

入口：`GET /auth/dingtalk/start`

规则：

1. 未配置时跳回登录页并提示
2. 生成一次性 state，并写入短时 Cookie（300 秒）
3. 重定向到钉钉授权地址

### FR-DT-002 OAuth 回调

入口：`GET /auth/dingtalk/callback`

规则：

1. 校验 state 一致性
2. 使用 code 换 access token
3. 拉取当前钉钉用户资料
4. 以 `unionId/openId` 作为外部稳定身份

### FR-DT-003 本地账户映射

1. 若外部身份已绑定，直接定位本地用户
2. 若未绑定，自动创建本地 member 账号并绑定
3. 若外部身份已绑定到其他账号，拒绝覆盖

### FR-DT-004 授权存储与时效

- 授权信息写入 `oauth_grants`
- 记录 `access_token/refresh_token/expires_at/refresh_expires_at/scope`
- `/api/v1/dingtalk/me` 调用前需校验 grant 未过期

### FR-DT-005 个人资料代理

入口：`GET /api/v1/dingtalk/me`（需登录）

返回字段至少包括：

1. `user_id`
2. `provider`
3. `grant_expires_at`
4. `profile_display/open_id/union_id/avatar_url`

### FR-DT-006 授权撤销

入口：`POST /auth/dingtalk/revoke`

规则：

1. 删除当前用户对应授权记录
2. 记录审计日志

## 2. 配置要求

必填配置：

1. `DINGTALK_CLIENT_ID`
2. `DINGTALK_CLIENT_SECRET`
3. `DINGTALK_REDIRECT_URL`

可选配置：

1. `DINGTALK_SCOPE`（默认 `openid`）
2. `DINGTALK_AUTH_BASE_URL`
3. `DINGTALK_API_BASE_URL`

默认超时：

- 钉钉 HTTP 请求默认 10 秒
