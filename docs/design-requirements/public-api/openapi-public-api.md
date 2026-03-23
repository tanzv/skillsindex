# OpenAPI 与公开 API 需求（当前实现基线）

## 1. 文档定位

本文件以当前仓库实现为基线，收口 `FR-API-001~010` 的真实 API 家族、鉴权边界、错误语义与 OpenAPI 覆盖范围。

当前结论：

1. `FR-API` 主体已进入 `已覆盖`
2. Window A 已收口 API Key 最小权限边界与公开 marketplace private 模式的核心契约
3. 当前剩余差距主要在 scope 覆盖范围与统一错误字典演进，不再是 P0 绕过问题

## 2. 文档与入口

### FR-API-001 OpenAPI 文档入口

当前已实现入口：

1. `GET /openapi.json`
2. `GET /openapi.yaml`
3. `GET /docs/swagger`
4. `GET /docs/api`
5. `GET /docs/openapi.json`
6. `GET /docs/openapi.yaml`

说明：

1. `/docs/openapi.*` 为兼容入口
2. OpenAPI 输出同时覆盖公开 API、会话型 API 与后台治理 API

### FR-API-002 OpenAPI 一致性要求

当前口径要求：

1. OpenAPI 中出现的路径必须在真实路由中可访问
2. 需求文档中的鉴权模型必须与 OpenAPI `security` 描述一致
3. 路由别名与兼容入口必须被显式记录

## 3. 当前 API 家族边界

### FR-API-003 匿名公开只读 API

当前真实的匿名公开只读 API 包括：

1. `GET /api/v1/public/marketplace`
2. `GET /api/v1/public/skills/{skillID}`

#### 3.1 `/api/v1/public/marketplace`

当前参数：

1. `q`
2. `tags`
3. `category`
4. `subcategory`
5. `sort`
6. `mode`
7. `page`

当前行为：

1. `sort` 当前支持 `recent|stars|quality`
2. `mode` 当前支持 `keyword|ai`
3. 关键字模式使用分页查询，页面大小当前固定为 24
4. `mode=ai` 且 `q` 非空时，返回单页语义结果，当前内部最多取 48 条
5. 返回体当前包含：
   - `filters`
   - `stats`
   - `pagination`
   - `categories`
   - `top_tags`
   - `filter_options`
   - `items`
   - `session_user`
   - `can_access_dashboard`
6. 即使是匿名接口，当存在有效 session cookie 时，仍会附带当前会话用户上下文
7. 当 `marketplace_public_access=false` 时，匿名请求当前返回 `401 unauthorized`

当前错误语义：

1. `401 unauthorized`（仅在 `marketplace_public_access=false` 且匿名访问时触发）
2. `503 service_unavailable`
3. `500 summary_query_failed`
4. `500 category_query_failed`
5. `500 search_failed`
6. `500 ai_search_failed`

#### 3.2 `/api/v1/public/skills/{skillID}`

当前行为：

1. 仅返回当前可见的技能详情
2. 返回体当前包含：
   - `skill`
   - `stats`
   - `viewer_state`
   - `comments`
   - `comments_limit`
3. `comments_limit` 当前固定为 80
4. 若存在有效 session，`viewer_state` 会补充当前用户互动状态
5. `viewer_state.can_interact` 取决于当前用户是否具备后台访问能力
6. 当 `marketplace_public_access=false` 时，匿名请求当前返回 `401 unauthorized`

当前错误语义：

1. `401 unauthorized`（仅在 `marketplace_public_access=false` 且匿名访问时触发）
2. 参数非法或技能不存在时返回 `404 skill_not_found`
3. 详情查询内部失败时返回 `500 detail_query_failed`
4. 服务不可用时返回 `503 service_unavailable`

### FR-API-004 API Key 保护的公开检索 API

当前只有以下两类公开检索 API 走 API Key 鉴权：

1. `GET /api/v1/skills/search`
2. `GET /api/v1/skills/ai-search`

#### 3.3 `/api/v1/skills/search`

当前参数：

1. `q`
2. `tags`
3. `category`
4. `subcategory`
5. `sort`
6. `page`
7. `limit`
8. `api_key`（query 方式时）

当前行为：

1. 仅检索 `visibility=public` 技能
2. `page` 默认 1
3. `limit` 默认 20，最大 100
4. `sort` 当前支持 `recent|stars|quality`
5. 不支持的 `sort` 当前会自动回落到 `recent`，不会返回 400
6. 返回体当前为：`items/page/limit/total`
7. 当前所需 scope：`skills.search.read`

当前错误语义：

1. `401 api_key_invalid`
2. `403 api_key_scope_denied`
3. `500 search_failed`

#### 3.4 `/api/v1/skills/ai-search`

当前参数：

1. `q`
2. `limit`
3. `api_key`（query 方式时）

当前行为：

1. 当前所需 scope：`skills.ai_search.read`
2. `limit` 默认 20，最大 100
3. 当前不提供分页，仅返回 `items/total`
4. 当 `q` 为空时，当前实现返回 200 与空结果，而不是 400
5. 仅检索 `visibility=public` 技能

当前错误语义：

1. `401 api_key_invalid`
2. `403 api_key_scope_denied`
3. `500 ai_search_failed`

### FR-API-005 会话型 API（不走 API Key）

以下接口属于“登录会话 + CSRF”模型，不走 API Key：

1. `/api/v1/auth/logout`
2. `/api/v1/account/*`
3. `/api/v1/dingtalk/me`
4. `/api/v1/skills/{skillID}/favorite`
5. `/api/v1/skills/{skillID}/rating`
6. `/api/v1/skills/{skillID}/comments`
7. `/api/v1/skills/{skillID}/comments/{commentID}/delete`
8. `/api/v1/admin/apikeys*`
9. `/api/v1/admin/accounts*`
10. `/api/v1/admin/ops/*`

当前安全要求：

1. 必须存在有效登录会话
2. 所有非安全方法必须通过全局 CSRF 校验
3. 资源级权限仍由会话用户角色与归属关系决定

## 4. 当前鉴权边界

### FR-API-006 API Key 传递与校验链路

当前 API Key 支持两种传递方式：

1. `?api_key=<token>`
2. `Authorization: Bearer <token>`

当前校验顺序：

1. 先从 query 读取 `api_key`
2. 若不存在，则尝试读取 `Authorization: Bearer`
3. 先解析当前路径是否存在 required scope
4. 若命中静态配置 key 集合 `a.apiKeys`：
   - 无 required scope 时放行
   - 有 required scope 时返回 `403 api_key_scope_denied`
5. 否则走数据库 key 校验：必须未撤销且未过期
6. 若路径存在 required scope，则继续校验 scope
7. 空 scope、非法 scope 或 scope 不满足时返回 `403 api_key_scope_denied`
8. 其余失败返回 `401 api_key_invalid`

### FR-API-007 当前已知边界与兼容行为

当前已知边界：

1. 静态配置 key 仍保留为兼容入口，但不能再访问受保护公开检索接口
2. API Key 作用范围目前只绑定两条检索接口，不覆盖会话型 API
3. 匿名公开只读 API 与 API Key 公开检索 API 已分离，不应混写成一个安全模型

### FR-API-008 可见性与上下文约束

当前规则：

1. 公开检索与公开详情默认只暴露公共可见技能
2. 匿名只读 API 可附带 session 上下文；但当 `marketplace_public_access=false` 时，公开只读 API 会拒绝匿名请求
3. 会话型 API 则必须通过 `currentUser` 解析与会话有效性校验

## 5. 当前兼容与错误码口径

### FR-API-009 当前兼容策略

1. 当前公开检索 API 仍以“向后兼容新增字段”为默认策略
2. OpenAPI 文档中已显式区分 `401` 与 `403`
3. 匿名公开 API 与 API Key 保护 API 已在路径级区分
4. `POST /api/v1/auth/login` 当前包含失败登录限流，OpenAPI 需保留 `429`

### FR-API-010 当前剩余差距

以下问题仍属于共享契约差距，而非本文已闭环能力：

1. 搜索接口尚未定义统一非法参数错误模型
2. 更细粒度公开 API scope 仍未展开到详情、互动或审计读取能力
3. 企业 SSO、后台 API 与公开 API 的统一错误码字典仍需进一步收束
