# API Key 细粒度授权治理（当前实现 + 差距）

## 1. 目标与状态

本文件收口 `FR-KEY-001~008` 的当前真实实现、scope 模型、生命周期接口与剩余差距。

当前状态：`部分覆盖（Window A 已收口 P0）`

原因：

1. API Key 生命周期、scope 更新与 `401/403` 分流已经存在
2. Window A 已完成最小权限边界硬化：空 scope、非法 scope、静态兼容 key 在受保护路由上不再宽松放行
3. 当前剩余差距主要在 scope 覆盖面与治理深度，而不是 P0 绕过风险

## 2. 当前生命周期接口

### 2.1 管理接口

当前已实现接口：

1. `GET /api/v1/admin/apikeys`
2. `POST /api/v1/admin/apikeys`
3. `GET /api/v1/admin/apikeys/{keyID}`
4. `POST /api/v1/admin/apikeys/{keyID}/revoke`
5. `POST /api/v1/admin/apikeys/{keyID}/rotate`
6. `POST /api/v1/admin/apikeys/{keyID}/scopes`

### 2.2 当前权限边界

当前权限规则不是“只有超管可用”，而是：

1. `member` / `admin`：可管理自己的 API Key
2. `super_admin`：可管理任意用户的 API Key
3. `viewer`：当前无权管理 API Key

依据：

1. `User.CanManageAPIKeys(targetUserID)` 允许“本人且可访问后台”
2. `super_admin` 通过 `CanManageUsers()` 获得跨账号治理能力

### 2.3 当前列表与过滤

`GET /api/v1/admin/apikeys` 当前支持：

1. `status=all|active|revoked|expired`
2. `owner=<username or id>`
3. `limit`

当前规则：

1. 非 `super_admin` 仅能列出自己的 key
2. 非 `super_admin` 若传入他人 owner 过滤，返回 `403 permission_denied`
3. `limit` 默认 200，接口层最大 1000

## 3. 当前 Scope 模型

### 3.1 当前支持的 scope 名称

当前实现支持以下 scope：

1. `*`
2. `skills.read`
3. `skills.search.read`
4. `skills.ai_search.read`
5. `skills:*`

说明：

1. 这是当前真实命名，不是旧文档中的 `skills.search:read` 风格
2. 文档、OpenAPI 与测试用例应统一以当前下划线/点号命名为准

### 3.2 当前默认 scope

创建 key 时：

1. 若未显式传入 `scopes`
2. 当前系统默认授予：
   - `skills.search.read`
   - `skills.ai_search.read`

### 3.3 当前路径与 required scope 映射

当前仅有两条路径进行了 scope 绑定：

1. `/api/v1/skills/search` -> `skills.search.read`
2. `/api/v1/skills/ai-search` -> `skills.ai_search.read`

### 3.4 当前 wildcard 语义

当前实现下：

1. `*` 代表全部 API Key 能力
2. `skills:*` 代表 `skills.` 命名空间下的通配能力
3. `skills.read` 当前也会被视为 `skills.` 命名空间的通配读取能力

## 4. 当前存储模型与返回契约

### 4.1 数据模型

`APIKey` 当前字段包括：

1. `user_id`
2. `name`
3. `purpose`
4. `created_by`
5. `prefix`
6. `key_hash`
7. `scopes`
8. `revoked_at`
9. `expires_at`
10. `last_rotated_at`
11. `last_used_at`
12. `created_at`
13. `updated_at`

当前实现特征：

1. `scopes` 以逗号分隔字符串存储，不是单独的 `scope_set` 表
2. `key_hash` 唯一，明文不落库
3. `prefix` 为明文 token 的截断前缀，用于展示识别
4. `last_used_at` 在成功鉴权时更新

### 4.2 明文返回规则

当前只有以下两种场景会返回 `plaintext_key`：

1. 创建 key 成功时
2. 轮换 key 成功时

当前不会在以下场景返回明文：

1. 列表
2. 详情
3. scope 更新
4. 撤销

### 4.3 当前返回字段

管理接口中的 `item` 当前至少包含：

1. `id`
2. `user_id`
3. `created_by`
4. `owner_username`
5. `name`
6. `purpose`
7. `prefix`
8. `scopes`
9. `status`
10. `revoked_at`
11. `expires_at`
12. `last_rotated_at`
13. `last_used_at`
14. `created_at`
15. `updated_at`

管理接口的 JSON 响应当前还会返回：

1. `supported_scopes`
2. `default_scopes`

适用场景：

1. `GET /api/v1/admin/apikeys`
2. `GET /api/v1/admin/apikeys/{keyID}`
3. `POST /api/v1/admin/apikeys`
4. `POST /api/v1/admin/apikeys/{keyID}/rotate`
5. `POST /api/v1/admin/apikeys/{keyID}/scopes`

## 5. 当前鉴权执行链

### 5.1 校验流程

当前 API Key 鉴权流程如下：

1. 读取 query `api_key` 或 `Authorization: Bearer`
2. 先解析路径是否存在 required scope
3. 若命中静态配置 `a.apiKeys`：
   - 无 required scope 时放行
   - 有 required scope 时返回 `403 api_key_scope_denied`
4. 否则走数据库校验：
   - `key_hash` 命中
   - `revoked_at IS NULL`
   - `expires_at IS NULL OR expires_at > now`
5. 数据库校验通过后，更新 `last_used_at`
6. 若路径要求 scope，则调用 `APIKeyHasScope(...)` 做 scope 判断
7. 缺 scope 返回 `403 api_key_scope_denied`
8. 其他失败返回 `401 api_key_invalid`

### 5.2 当前兼容行为与当前策略

Window A 后当前策略如下：

1. 静态配置 key 仅可访问无 scope 约束的兼容路径，不再可用于受保护公开检索接口
2. 当已存储 key 的 scope 为空或无法被规范化解析时，`APIKeyHasScope(...)` 按 deny-by-default 处理
3. `skills.read`、`skills:*` 与 `*` 的显式通配语义仍保留
4. legacy key 若未显式修正 scope，将在受保护路由上收到 `403 api_key_scope_denied`

这意味着：

1. 受保护公开检索接口已经收口为“鉴权成功但缺 scope 则 403”
2. 老 key 或异常 scope 数据不会再以兼容方式穿透最小权限边界

## 6. 当前错误码与审计

### 6.1 当前错误码

#### 公开 API 鉴权

1. `401 api_key_invalid`
2. `403 api_key_scope_denied`

#### 管理接口

1. `unauthorized`
2. `service_unavailable`
3. `invalid_key_id`
4. `api_key_not_found`
5. `permission_denied`
6. `invalid_payload`
7. `create_failed`
8. `revoke_failed`
9. `rotate_failed`
10. `scopes_required`
11. `invalid_scope`
12. `scope_update_failed`
13. `user_not_found`

### 6.2 当前审计动作

当前已审计动作：

1. `api_admin_api_key_create`
2. `api_admin_api_key_revoke`
3. `api_admin_api_key_rotate`
4. `api_admin_api_key_scope_update`

说明：

1. 审计已经覆盖创建、撤销、轮换、scope 更新
2. 当前未实现“按 scope 批量撤销”对应的审计动作

## 7. 当前未闭环差距

### 7.1 Window A 已关闭的 P0 差距

1. 静态 key 兼容路径不再绕过受保护公开检索的 scope 校验
2. 空 scope / 非法 scope 不再以兼容方式宽松放行
3. `401 api_key_invalid` 与 `403 api_key_scope_denied` 的分流已在实现、测试与 OpenAPI 中统一

### 7.2 P1 功能差距

1. 当前 scope 仅覆盖搜索类接口，未覆盖详情读取、互动写入、审计读取等能力
2. 当前没有 scope 注册表、版本化或废弃策略
3. 当前没有按 scope、owner、风险等级的批量撤销接口
4. 当前没有“强制轮换周期”或泄露事件处置流程
5. legacy key 的批量补 scope / 回收流程仍需运维治理配套

## 8. 目标补齐方向

下一阶段建议按以下顺序补齐：

1. 把静态 key 与空 scope 兼容行为收紧为可控策略
2. 明确 legacy key 迁移与回收规则
3. 扩展 scope 到公开详情、后台只读与更细粒度能力
4. 增加批量撤销、风险处置和轮换门禁
