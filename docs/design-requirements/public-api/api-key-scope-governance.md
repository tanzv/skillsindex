# API Key 细粒度授权治理（目标态）

## 1. 目标

在现有 API Key 生命周期基础上，增加 scope 细粒度授权，解决“同一 Key 权限过大”的风险。

## 2. Scope 模型

建议 scope 采用字符串枚举，支持多选：

1. `skills.search:read`
2. `skills.ai-search:read`
3. `skills.detail:read`
4. `interactions:write`
5. `admin.apikeys:write`
6. `admin.audit:read`

默认策略：

1. 最小权限默认仅授予 `skills.search:read`
2. 高风险 scope 必须显式勾选

## 3. Key 创建与存储

创建请求新增：

1. `scopes`（数组）
2. `purpose`（可选）

存储要求：

1. 保留现有 `key_hash` 机制
2. 新增 `scope_set` 字段（序列化存储）
3. 新增 `created_by` 与 `last_rotated_at`

## 4. 鉴权执行链

鉴权流程：

1. 验证 key 是否有效（未撤销、未过期）
2. 验证请求路径是否匹配 required scopes
3. 不满足 scope 返回 403（区分 401）

错误约定：

1. 401：`api_key_invalid`
2. 403：`api_key_scope_denied`

## 5. 轮换与撤销策略

1. 支持“滚动轮换”：创建新 key 后再撤销旧 key
2. 高风险 key 建议 90 天强制轮换
3. 泄露事件可批量撤销同 scope key

## 6. 审计要求

必须审计：

1. `api_key_scope_create`
2. `api_key_scope_update`
3. `api_key_rotate`
4. `api_key_revoke_batch`

## 7. 验收标准

1. 无 scope key 调用高权限接口被拒绝
2. 轮换期间新旧 key 切换无中断
3. scope 变更后鉴权行为立即生效
4. 审计可追踪 scope 生命周期
