# 企业身份与 SSO 扩展设计（目标态）

## 1. 目标

在现有钉钉 OAuth 个人授权基础上，扩展企业级统一身份能力，支持组织化账号治理与生命周期管理。

## 2. 适配范围

1. OIDC（优先）
2. SAML（可选）
3. SCIM 用户同步（可选）

## 3. 路由建议

1. `GET /auth/sso/start/{provider}`
2. `GET /auth/sso/callback/{provider}`
3. `POST /admin/sso/providers/create`
4. `POST /admin/sso/providers/{providerID}/disable`
5. `POST /admin/sso/users/sync`

## 4. 账号映射规则

1. 外部 `sub` / `employee_id` 作为稳定外部标识
2. 映射优先级：external_id -> email -> username（仅一次绑定）
3. 禁止一个外部身份绑定多个本地账号

## 5. 首次登录与自动入组

1. 首次登录可按域名或 IdP 组规则自动入组织
2. 自动分配默认平台角色（建议 `member`）
3. 高权限角色必须人工审批，不可自动授予 `super_admin`

## 6. 退出与离职回收

1. IdP 禁用用户后，本地账号可自动转 `disabled`
2. 可配置“仅禁止登录”或“强制退出全部会话”
3. 回收动作必须审计

## 7. 与钉钉集成关系

1. 保留现有钉钉个人 OAuth 作为轻量集成路径
2. 企业 SSO 与个人 OAuth 可并存，但同一用户需有唯一主身份
3. 配置层需区分“个人授权”和“企业登录”

## 8. 安全要求

1. 强制校验 `state` / `nonce`
2. 校验 token 签名、时效与 issuer
3. 禁止信任未校验邮箱作为唯一身份

## 9. 验收标准

1. 成功完成企业 IdP 登录与本地映射
2. 去重绑定规则生效（不可重复绑定）
3. 离职或禁用后访问立即受限
4. 关键身份动作均可审计追溯
