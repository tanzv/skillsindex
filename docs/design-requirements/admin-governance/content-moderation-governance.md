# 内容治理与审核需求（目标态）

## 1. 目标

为评论与用户生成内容建立治理闭环，降低违规内容与滥用风险。

## 2. 治理对象

1. 技能评论内容
2. 技能描述与标签（高风险词）
3. 用户举报记录

## 3. 审核流程

### 3.1 举报入口

建议新增：

1. `POST /skills/{skillID}/comments/{commentID}/report`
2. `POST /skills/{skillID}/report`

举报字段：

1. `reason_code`
2. `reason_detail`（可选）

### 3.2 审核队列

后台新增 `moderation` 分区：

1. `GET /admin/moderation`
2. `POST /admin/moderation/{caseID}/resolve`
3. `POST /admin/moderation/{caseID}/reject`

### 3.3 内容状态

1. `normal`
2. `flagged`
3. `hidden`
4. `deleted`

## 4. 权限模型

1. `member` 可举报，不可审核
2. `admin/super_admin` 可审核与执行治理动作
3. `super_admin` 可执行高风险批量治理

## 5. 自动化策略（可选）

1. 敏感词命中自动标记 `flagged`
2. 高频举报触发优先审核
3. 重复违规用户触发临时禁言

## 6. 审计与申诉

必须审计：

1. 举报提交
2. 审核通过/驳回
3. 内容隐藏/删除
4. 用户禁言/解禁

建议支持申诉：

1. 被处理用户可提交一次申诉
2. 申诉处理结果必须可追溯

## 7. 验收标准

1. 举报后可进入审核队列
2. 审核动作可改变内容可见性
3. 治理动作均有审计记录
4. 未授权用户无法访问审核接口
