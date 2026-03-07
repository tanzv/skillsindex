# 数据模型与约束需求（当前实现基线）

## 1. 核心实体

### 1.1 当前已实现实体

1. `User`
2. `UserSession`
3. `PasswordResetToken`
4. `Skill`
5. `Tag`
6. `SkillFavorite`
7. `SkillRating`
8. `SkillComment`
9. `APIKey`
10. `OAuthGrant`
11. `AuditLog`
12. `Organization`
13. `OrganizationMember`

### 1.2 目标扩展实体

以下实体仍属于目标态或部分覆盖扩展：

1. `SyncPolicy`
2. `SyncRun`
3. `SkillVersion`
4. `SkillChangeLog`

## 2. 当前关键约束

### 2.1 User

当前关键字段与约束：

1. `username` 唯一，长度上限由模型和业务校验共同约束
2. `role` 当前枚举为：`viewer|member|admin|super_admin`
3. `status` 当前枚举为：`active|disabled`
4. `force_logout_at` 可空，用于统一使历史会话失效
5. `display_name` 最大 64 字符
6. `avatar_url` 最大 512 字符
7. `bio` 最大 500 字符

当前业务语义：

1. `status=disabled` 时账号不可继续作为有效登录态使用
2. `force_logout_at` 不是状态字段，而是会话强退控制点
3. `locked` 不是当前已实现字段语义

### 2.2 UserSession

`UserSession` 当前是账号安全治理的关键实体。

当前字段：

1. `user_id`
2. `session_id`
3. `user_agent`
4. `issued_ip`
5. `expires_at`
6. `last_seen_at`
7. `revoked_at`
8. `created_at`
9. `updated_at`

当前约束：

1. `session_id` 唯一
2. `user_id` 非空
3. `expires_at` 非空且参与活跃会话判定
4. `revoked_at` 为空表示未显式撤销
5. `last_seen_at` 用于最近活动时间展示与排序

当前业务语义：

1. cookie 中的 `session_id` 会与本表联动校验
2. 活跃会话判定条件为：`revoked_at IS NULL AND expires_at > now`
3. 撤销单会话通过更新 `revoked_at` 实现
4. 撤销其他会话通过批量更新 `revoked_at` 实现

### 2.3 PasswordResetToken

当前字段：

1. `user_id`
2. `token_hash`
3. `issued_ip`
4. `expires_at`
5. `used_at`
6. `created_at`
7. `updated_at`

当前约束：

1. `token_hash` 唯一
2. `user_id` 非空
3. `expires_at` 非空
4. `used_at` 为空表示尚未使用

当前业务语义：

1. token 只存 hash，不存明文
2. 每个 token 只可使用一次
3. 过期或已使用 token 不可再次确认
4. 确认成功后会更新 `used_at`

### 2.4 Skill

1. `owner_id` 非空
2. `visibility` 当前约束为 `public|private`
3. `source_type` 当前约束为 `manual|upload|repository|skillmp`
4. 标签通过多对多关系 `skill_tags` 关联

### 2.5 Favorite / Rating

1. `SkillFavorite` 主键为 `(skill_id, user_id)`
2. `SkillRating` 主键为 `(skill_id, user_id)`
3. `SkillRating.score` 业务上限定为 1~5

### 2.6 Comment

1. `skill_id`、`user_id` 非空
2. 内容业务长度上限为 3000

### 2.7 APIKey

当前字段：

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

当前约束：

1. `key_hash` 唯一
2. `user_id` 非空
3. `name` 非空
4. `purpose` 当前长度上限 255
5. `prefix` 有独立索引，用于展示识别
6. `revoked_at` 非空表示密钥已撤销
7. `expires_at` 可空；非空且过期后视为无效
8. `scopes` 当前以逗号分隔字符串存储，不是单独关联表

当前业务语义：

1. 创建时若未显式传 scope，默认写入 `skills.search.read,skills.ai_search.read`
2. 明文 key 仅在创建与轮换成功时返回一次
3. `last_used_at` 在成功鉴权后更新
4. `last_rotated_at` 在轮换新 key 时记录到新记录上
5. 当前静态 key 与空 scope 的兼容行为不由 schema 限制，属于实现层风险

### 2.8 OAuthGrant

1. `(provider, user_id)` 唯一
2. `(provider, external_user_id)` 唯一
3. `access_token` 与 `expires_at` 必填

### 2.9 AuditLog

当前字段：

1. `actor_user_id`
2. `action`
3. `target_type`
4. `target_id`
5. `summary`
6. `details`
7. `created_at`

当前约束：

1. `actor_user_id`、`action`、`target_type` 必填
2. `target_id` 可空
3. `summary` 为简短摘要
4. `details` 为文本型扩展明细
5. 审计日志只追加，不允许业务层回改历史

当前业务语义：

1. 账号、API Key、角色治理、会话治理等安全动作写入本表
2. 多数运维记录当前也复用本表，`target_type` 统一为 `ops`
3. `details` 常承载 JSON 序列化结构化内容
4. 审计导出直接从本表读取，当前单次导出上限 50,000 条

当前结论：

1. 当前审计模型已经强于旧文档中的最小字段描述
2. 但仍未覆盖 `request_id`、`result`、`reason`、`source_ip`、`trace_id` 等更强治理字段
3. 运维记录复用 `AuditLog` 便于统一导出，但会牺牲结构化查询能力

### 2.10 组织协作实体

1. `Organization` 与 `OrganizationMember` 已作为组织治理实体存在
2. `User.OrganizationMemberships` 已建立关联
3. 技能上的 `organization_id` 可为空，用于承接组织共享能力

## 3. 关系与级联语义

### 3.1 用户相关

1. 一个 `User` 可拥有多个 `Skill`
2. 一个 `User` 可拥有多个 `UserSession`
3. 一个 `User` 可拥有多个 `PasswordResetToken`
4. 一个 `User` 可拥有多个 `APIKey`
5. 一个 `User` 可拥有多个 `OrganizationMember` 关系

### 3.2 会话与账号状态联动

1. `UserSession` 负责记录具体登录会话
2. `User.force_logout_at` 负责统一使某时刻之前签发的会话全部失效
3. `User.status=disabled` 时，鉴权中间件会清理现有 cookie
4. 密码重置确认成功时，会同时更新密码、恢复/保持账号为 `active`，并写入新的 `force_logout_at`

### 3.3 安全与运维记录联动

1. API Key 生命周期依赖 `APIKey` 与 `AuditLog` 双重记录
2. 运维 records 当前大量复用 `AuditLog` 作为事实存储，而非独立业务表
3. 审计导出、release gate、recovery drill、backup run 等能力都建立在 `AuditLog` 之上

### 3.4 级联与清理原则

1. 删除用户可级联清理其技能、互动、授权与 APIKey
2. 删除技能可级联清理收藏、评分、评论与标签关联
3. `PasswordResetToken`、`UserSession`、`AuditLog` 等安全记录是否物理删除，应按运维与合规策略执行
4. 删除技能时，版本与变更日志更适合按归档策略处理，而不是简单物理删除

## 4. 目标扩展约束

### 4.1 SyncPolicy（目标态）

1. `policy_name` 非空
2. `source_type` 限制为 `repository|skillmp`
3. 调度表达式与 `enabled` 必须形成有效配置

### 4.2 SyncRun（目标态）

1. `skill_id`、`status`、`trigger_type` 必填
2. `status` 约束为 `pending|running|succeeded|failed|canceled`
3. `started_at/finished_at` 用于计算耗时

### 4.3 SkillVersion（目标态）

1. `(skill_id, version_no)` 唯一
2. 快照需保存内容与标签
3. 成功同步或回滚时生成新版本，不覆盖历史

### 4.4 SkillChangeLog（目标态）

1. `skill_id`、`version_from`、`version_to` 必填
2. 结构化记录 `changed_fields/before_digest/after_digest`
3. 仅追加写入，不允许回改

## 5. 质量要求

1. 模型迁移必须可重复执行（AutoMigrate）
2. 唯一约束冲突需返回明确错误，而不是静默失败
3. 索引应覆盖鉴权、列表、过滤与审计查询路径
4. 文档描述的字段枚举必须与当前模型和解析器一致
5. 安全兼容行为若与最小权限原则冲突，必须在需求与开发计划中显式标注
