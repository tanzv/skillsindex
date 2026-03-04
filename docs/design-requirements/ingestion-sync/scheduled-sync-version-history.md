# 定时同步、同步版本与技能全量变更历史（目标态）

## 1. 目标

建立“可计划、可追踪、可回溯”的同步治理体系，满足：

1. 后台可配置定时同步
2. 每次同步都有完整执行记录
3. 每个 Skill 保留完整版本与变更历史
4. 可做差异对比与必要回滚

## 2. 定时同步策略

### FR-ING-013 同步策略配置

建议新增后台入口：

1. `GET /admin/sync-policies`
2. `POST /admin/sync-policies/create`
3. `POST /admin/sync-policies/{policyID}/update`
4. `POST /admin/sync-policies/{policyID}/toggle`
5. `POST /admin/sync-policies/{policyID}/delete`

策略字段：

1. `policy_name`
2. `target_scope`（单 skill/标签集合/来源类型）
3. `source_type`（repository/skillmp）
4. `cron_expr` 或 `interval_minutes`
5. `timezone`
6. `enabled`
7. `max_retry`
8. `retry_backoff`

### FR-ING-014 调度触发规则

1. 仅 `enabled=true` 的策略参与调度
2. 同一 skill 在同一时刻只允许一个同步任务运行
3. 触发后进入异步任务队列（对接 `FR-JOB-*`）
4. 失败任务按策略重试，不得覆盖最近成功版本

### FR-ING-015 手动触发与定时触发并存

1. 支持“立即执行”按钮
2. 手动触发与定时触发共用统一任务执行链
3. 触发来源需记录为 `manual` 或 `scheduled`

## 3. 同步运行记录

### FR-ING-016 同步运行日志

建议新增查询入口：

1. `GET /admin/sync-runs`
2. `GET /admin/sync-runs/{runID}`
3. `GET /skills/{skillID}/sync-runs`

运行记录最少字段：

1. `run_id`
2. `policy_id`（可空，手动触发时为空）
3. `skill_id`
4. `trigger_type`（manual/scheduled/retry）
5. `status`（pending/running/succeeded/failed/canceled）
6. `started_at`
7. `finished_at`
8. `duration_ms`
9. `attempt`
10. `error_code`
11. `error_message`
12. `source_revision`（git commit / remote etag，可选）

### FR-ING-017 可观测与告警

1. 连续失败阈值触发告警（如 3 次）
2. 记录成功率、平均耗时、失败分布
3. 同步异常可按策略、来源、技能维度筛查

## 4. Skill 版本与变更历史

### FR-ING-018 版本快照生成

每次同步成功后自动生成 `skill_version` 快照，至少保存：

1. `version_no`
2. `skill_id`
3. `name/description/content`
4. `tags_snapshot`
5. `source_type/source_url/source_branch/source_path`
6. `synced_at`
7. `run_id`
8. `operator_user_id`（可空，定时触发可为空）

### FR-ING-019 变更明细记录

每次版本变化需记录结构化 diff：

1. `changed_fields`（如 content/tags/description）
2. `before_digest`
3. `after_digest`
4. `change_summary`
5. `risk_level`（low/medium/high，可选）

### FR-ING-020 版本浏览与对比

建议新增入口：

1. `GET /skills/{skillID}/versions`
2. `GET /skills/{skillID}/versions/{versionID}`
3. `GET /skills/{skillID}/versions/compare?from={A}&to={B}`

能力要求：

1. 支持文本差异查看（content diff）
2. 支持标签与元数据差异查看
3. 支持按时间与触发类型过滤

### FR-ING-021 回滚策略（受控）

建议新增入口：

1. `POST /skills/{skillID}/versions/{versionID}/rollback`

约束：

1. 仅 owner/admin/super_admin 可回滚
2. 回滚后生成新版本，不覆盖历史版本
3. 回滚动作必须审计

### FR-ING-022 历史保留策略

1. 每个 skill 至少保留最近 N 个版本（建议 N>=50）
2. 支持按时间/数量归档历史版本
3. 归档记录必须可检索，不允许“无痕删除”

## 5. 审计要求

必须审计：

1. 同步策略创建/修改/启停/删除
2. 同步手动触发与定时触发
3. 同步失败重试与取消
4. 版本回滚操作

## 6. 验收标准

1. 策略到点可自动触发同步任务
2. 每次运行都可追踪到完整 run 记录
3. 同步成功会生成版本快照与变更明细
4. Skill 详情可查看完整历史版本链
5. 回滚后历史连续且可审计
