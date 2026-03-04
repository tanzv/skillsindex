# 同步生命周期与记录治理需求

## 1. 记录管理（records 分区）

### FR-ING-008 可见性修改

入口：`POST /skills/{skillID}/visibility`

规则：

1. 仅技能 owner 或可管理全站角色可操作
2. 更新成功后立即影响公开检索结果

### FR-ING-009 技能删除

入口：`POST /skills/{skillID}/delete`

规则：

1. 仅技能 owner 或可管理全站角色可操作
2. 删除成功后详情不可访问
3. 级联清理关联互动数据（由外键策略保证）

## 2. 远程重同步

### FR-ING-010 可同步来源限制

仅 `repository` 与 `skillmp` 类型允许重同步；其余来源返回明确错误。

### FR-ING-011 仓库重同步

入口：`POST /skills/{skillID}/sync`

规则：

1. 重新拉取源仓库并解析元数据
2. 更新字段：`name/description/content/source_*/repo_url/last_synced_at`
3. 替换标签集合（非增量 merge）
4. 记录审计动作 `skill_sync_repository`

### FR-ING-012 SkillMP 重同步

规则同上，但来源为 SkillMP 并记录 `skill_sync_skillmp`。

## 3. 同步一致性要求

1. 同步更新必须在事务内完成（内容与标签一致提交）
2. 同步失败不覆盖旧数据
3. `last_synced_at` 仅在成功后更新
