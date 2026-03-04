# 数据模型与约束需求

## 1. 核心实体

1. `User`
2. `Skill`
3. `Tag`
4. `SkillFavorite`
5. `SkillRating`
6. `SkillComment`
7. `APIKey`
8. `OAuthGrant`
9. `AuditLog`
10. `Organization`（预留协作域）
11. `OrganizationMember`（预留协作域）
12. `SyncPolicy`（目标态，定时同步策略）
13. `SyncRun`（目标态，每次同步执行记录）
14. `SkillVersion`（目标态，技能版本快照）
15. `SkillChangeLog`（目标态，变更明细）

## 2. 主约束

### 2.1 User

1. `username` 唯一
2. `role` 限制为平台角色枚举

### 2.2 Skill

1. `owner_id` 非空
2. `visibility` 仅 `public|private`
3. `source_type` 仅 `manual|upload|repository|skillmp`
4. 标签通过多对多关系 `skill_tags`

### 2.3 Favorite / Rating

1. `SkillFavorite` 主键 `(skill_id, user_id)`
2. `SkillRating` 主键 `(skill_id, user_id)`
3. `SkillRating.score` 业务上限定 1~5

### 2.4 Comment

1. `skill_id`、`user_id` 非空
2. 内容业务长度 <= 3000

### 2.5 APIKey

1. `key_hash` 唯一
2. 存储 hash，不落明文
3. `revoked_at` 非空表示撤销
4. `expires_at` 过期后视为无效

### 2.6 OAuthGrant

1. `(provider, user_id)` 唯一
2. `(provider, external_user_id)` 唯一
3. `access_token` 与 `expires_at` 必填

### 2.7 AuditLog

1. `actor_user_id`、`action`、`target_type` 必填
2. 审计日志只追加，不允许业务层修改历史

### 2.8 SyncPolicy（目标态）

1. `policy_name` 非空
2. `source_type` 限制为 `repository|skillmp`
3. `enabled` 与调度表达式字段必须一致有效

### 2.9 SyncRun（目标态）

1. `skill_id`、`status`、`trigger_type` 必填
2. `status` 限制为 `pending|running|succeeded|failed|canceled`
3. `started_at/finished_at` 用于计算耗时

### 2.10 SkillVersion（目标态）

1. `(skill_id, version_no)` 唯一
2. 快照需保存内容与标签
3. 成功同步或回滚时生成新版本，不覆盖历史

### 2.11 SkillChangeLog（目标态）

1. `skill_id`、`version_from`、`version_to` 必填
2. 结构化记录 `changed_fields/before_digest/after_digest`
3. 仅追加写入，不允许回改

## 3. 关系与级联

1. 删除用户可级联清理其技能、互动、授权、APIKey
2. 删除技能可级联清理收藏、评分、评论、标签关联
3. `organization_id` 在技能上可为空（预留组织共享能力）
4. 删除技能时，版本与变更日志按归档策略处理，不建议直接物理删除

## 4. 质量要求

1. 模型迁移必须可重复执行（AutoMigrate）
2. 唯一约束冲突需返回明确错误而非静默失败
3. 关键索引字段应覆盖检索和过滤路径
