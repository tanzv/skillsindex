# OpenAPI 与公开 API 需求

## 1. 文档与入口

### FR-API-001 文档入口

系统必须提供：

1. `GET /openapi.json`
2. `GET /openapi.yaml`
3. `GET /docs/swagger`
4. `GET /docs/api`
5. `GET /docs/openapi.json`（兼容入口）
6. `GET /docs/openapi.yaml`（兼容入口）

### FR-API-002 文档一致性

OpenAPI 文档中的路径、参数、响应结构需与真实行为一致。

## 2. 公开检索 API

### FR-API-003 关键词检索 API

入口：`GET /api/v1/skills/search`

参数：

1. `q`
2. `tags`
3. `category`
4. `subcategory`
5. `sort`
6. `page`
7. `limit`

返回：`items/page/limit/total`

### FR-API-004 AI 检索 API

入口：`GET /api/v1/skills/ai-search`

参数：`q`（语义查询） + `limit`

返回：`items/total`

## 3. 会话型 API（非 API Key 公开接口）

### FR-API-005 会话型 API 范围

以下接口属于“登录会话 + CSRF”模型，不走 API Key：

1. `GET /api/v1/dingtalk/me`
2. `POST /skills/{skillID}/favorite`
3. `POST /skills/{skillID}/rating`
4. `POST /skills/{skillID}/comments`
5. `POST /skills/{skillID}/comments/{commentID}/delete`
6. `POST /admin/apikeys/create`
7. `POST /admin/apikeys/{keyID}/revoke`

### FR-API-006 会话型 API 认证与安全约束

1. 必须为已登录用户会话
2. 对 POST 请求必须通过 CSRF 校验
3. 具体资源操作仍需通过角色权限与资源归属校验

## 4. 鉴权

### FR-API-007 API Key 鉴权策略

公开 API 必须鉴权，支持：

1. query 参数 `api_key`
2. `Authorization: Bearer <key>`

校验优先级：

1. 命中静态配置 API key 集合即通过
2. 否则走数据库 key 校验（未撤销且未过期）

失败行为：

- 返回 `401`，错误体 `{error:"unauthorized",message:"Missing or invalid API key"}`

### FR-API-008 可见性约束

公开 API 仅返回 `visibility=public` 技能。

### FR-API-009 兼容性要求

1. 非破坏性变更优先（新增字段可选）
2. 破坏性变更需版本化策略（后续迭代要求）

### FR-API-010 路由覆盖要求

OpenAPI 文档与需求文档应共同覆盖下列两类接口：

1. 公开 API Key 接口（检索类）
2. 会话型接口（互动、集成、后台关键动作）
