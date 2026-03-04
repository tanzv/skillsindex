# 互动系统需求（收藏/评分/评论）

## 1. 总体约束

1. 所有互动写操作必须登录
2. 角色必须具备 dashboard 访问能力（member/admin/super_admin）
3. 目标技能必须对当前用户可见

## 2. 收藏

### FR-INT-001 收藏切换

入口：`POST /skills/{skillID}/favorite`

规则：

1. 显式值支持 `on/off/true/false/1/0`
2. 未传有效值时按“当前状态取反”
3. `(skill_id, user_id)` 唯一

验收标准：

1. 重复收藏不创建重复记录
2. 取消收藏后计数正确回落

## 3. 评分

### FR-INT-002 评分提交

入口：`POST /skills/{skillID}/rating`

规则：

1. 分值区间严格限定为 1~5
2. 重复评分覆盖历史分值（upsert）
3. `(skill_id, user_id)` 唯一

验收标准：

1. 越界分值返回错误提示
2. 均分与评分人数统计准确

## 4. 评论

### FR-INT-003 评论发布

入口：`POST /skills/{skillID}/comments`

规则：

1. 内容非空
2. 最大长度 3000 字符

### FR-INT-004 评论删除

入口：`POST /skills/{skillID}/comments/{commentID}/delete`

删除权限：

1. 评论作者本人
2. admin/super_admin（全局治理）

验收标准：

1. 无权限删除返回 Permission denied
2. 不存在评论返回 Comment not found

## 5. 详情页聚合

### FR-INT-005 互动数据展示

详情页需展示：

1. 收藏总数
2. 评分总数与均分
3. 评论列表（按创建时间倒序）
4. 当前用户的收藏状态和个人评分

### FR-INT-006 评论拉取上限

- 详情页拉取评论上限为 80（页面场景）
- 服务层默认 20，最大 100

### FR-INT-007 行为反馈

- 所有互动提交均通过重定向反馈消息（成功或失败）
