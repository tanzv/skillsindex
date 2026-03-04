# 导入与同步异步任务编排设计（目标态）

## 1. 目标

将当前同步请求模型升级为任务化执行，提升稳定性与可观测性，适配大规模导入场景。

## 2. 任务类型

1. `import_manual`
2. `import_upload`
3. `import_repository`
4. `import_skillmp`
5. `sync_repository`
6. `sync_skillmp`

## 3. 任务状态机

状态枚举：

1. `pending`
2. `running`
3. `succeeded`
4. `failed`
5. `canceled`

状态规则：

1. `pending -> running -> succeeded|failed`
2. `failed` 可重试回到 `pending`
3. `running` 超时可自动转 `failed`

## 4. 数据字段建议

任务记录最少字段：

1. `job_id`
2. `job_type`
3. `status`
4. `owner_user_id`
5. `target_skill_id`（可空）
6. `attempt`
7. `max_attempts`
8. `started_at`
9. `finished_at`
10. `error_code`
11. `error_message`
12. `payload_digest`

## 5. 接口与后台页面

建议新增：

1. `GET /admin/jobs`
2. `GET /admin/jobs/{jobID}`
3. `POST /admin/jobs/{jobID}/retry`
4. `POST /admin/jobs/{jobID}/cancel`

导入入口行为调整：

1. 提交后立即返回 job_id
2. 前端通过轮询或 SSE 查询进度

## 6. 重试与幂等

1. repository/skillmp 默认最多 3 次重试
2. 指数退避：5s、30s、120s
3. 以 `payload_digest` + 资源锁防重复执行
4. 重试不覆盖最后一次成功版本

## 7. 安全与审计

1. 任务 payload 中敏感信息（token）必须脱敏存储
2. 任务创建、重试、取消都必须审计
3. 非任务所有者不可查看敏感任务详情（admin/super_admin 例外）

## 8. 验收标准

1. 单次外部网络故障可自动重试并恢复
2. 重复提交同任务不会产生重复数据
3. 失败任务可定位到明确错误码
4. 后台可查看任务状态与耗时分布

## 9. 与定时同步和版本历史联动

1. 定时策略触发后必须进入同一任务编排链路
2. 成功同步后由任务链路触发 `SkillVersion` 快照生成
3. 同步任务与版本记录通过 `run_id` 建立可追溯关联
4. 联动设计详见 `ingestion-sync/scheduled-sync-version-history.md`
