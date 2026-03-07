# 运维、合规与可观测实施要求（当前实现 + 目标补齐）

## 1. 目标与状态

本文件将 `NFR-OPS-*` 从原则层收口到当前真实实现与可执行差距。

当前状态：`部分覆盖`

原因：

1. 运维 API、审计导出、门禁快照、恢复演练、发布记录等能力已经存在
2. 但门禁自动阻断、外部留存、指标真实性与合规证据仍未完全闭环

## 2. 当前路由与权限边界

### 2.1 当前路由

当前已实现运维 API：

1. `GET /api/v1/admin/ops/metrics`
2. `GET /api/v1/admin/ops/alerts`
3. `GET /api/v1/admin/ops/audit-export`
4. `GET /api/v1/admin/ops/release-gates`
5. `POST /api/v1/admin/ops/release-gates/run`
6. `GET /api/v1/admin/ops/recovery-drills`
7. `POST /api/v1/admin/ops/recovery-drills/run`
8. `GET /api/v1/admin/ops/releases`
9. `POST /api/v1/admin/ops/releases`
10. `GET /api/v1/admin/ops/change-approvals`
11. `POST /api/v1/admin/ops/change-approvals`
12. `GET /api/v1/admin/ops/backup/plans`
13. `POST /api/v1/admin/ops/backup/plans`
14. `GET /api/v1/admin/ops/backup/runs`
15. `POST /api/v1/admin/ops/backup/runs`

### 2.2 当前权限边界

当前权限并非“只有超管”，而是：

1. 具备全站查看能力的账号可访问运维 API
2. 当前实现等价于 `admin` 与 `super_admin` 可访问
3. 所有接口均基于 session
4. 所有 POST 接口仍受全局 CSRF 保护

## 3. 当前能力契约

### 3.1 Metrics

`GET /api/v1/admin/ops/metrics` 当前返回：

1. `generated_at`
2. `request_qps`
3. `latency_p50_ms`
4. `latency_p95_ms`
5. `latency_p99_ms`
6. `error_rate_4xx`
7. `error_rate_5xx`
8. `sync_success_rate`
9. `audit_write_failure_rate`
10. `total_audit_logs_24h`
11. `total_sync_runs_24h`
12. `failed_sync_runs_24h`
13. `retention_days`

当前实现说明：

1. `retention_days` 当前基线为 180
2. `sync_success_rate` 由最近 24 小时 sync run 推导
3. `audit_write_failure_rate` 通过审计事件 `audit_write_failed` 计数推导
4. `error_rate_4xx` 与 `error_rate_5xx` 当前仍为占位值 0，不代表真实线上观测

### 3.2 Alerts

`GET /api/v1/admin/ops/alerts` 当前基于 metrics 生成导出型告警，至少包含：

1. `OPS-SYNC-SUCCESS-RATE`
2. `OPS-LATENCY-P95`
3. `OPS-AUDIT-INGESTION`

当前阈值逻辑：

1. 最近 24 小时 sync run >= 10 且成功率 < 95% -> warning
2. 最近 24 小时 sync run >= 10 且成功率 < 80% -> critical
3. `latency_p95_ms > 300000` -> warning
4. 最近 24 小时没有审计记录 -> warning

### 3.3 Audit Export

`GET /api/v1/admin/ops/audit-export` 当前支持：

1. `from`
2. `to`
3. `format=json|csv`

当前规则：

1. 默认导出格式为 `json`
2. 仅支持 `json` 与 `csv`
3. `to < from` 时返回错误
4. 单次导出当前最多 50,000 条审计记录
5. 导出内容来自 `AuditLog` 原始记录，不做额外签名包装

### 3.4 Release Gates

`GET /api/v1/admin/ops/release-gates` 与 `POST /api/v1/admin/ops/release-gates/run` 当前实现的门禁检查包括：

1. `OPS-GATE-SYNC-SUCCESS`
2. `OPS-GATE-NO-CRITICAL-ALERTS`
3. `OPS-GATE-RECOVERY-DRILL`
4. `OPS-GATE-AUDIT-RETENTION`

当前通过规则：

1. Sync 成功率：最近 24 小时 run < 10 时宽松通过，否则需 >= 95%
2. 当前不能存在 critical 级运维告警
3. 最近一次恢复演练需在 31 天内，且满足：
   - `RPO <= 1h`
   - `RTO <= 4h`
4. `retention_days >= 180`

当前写入行为：

1. `POST /run` 会把门禁快照写入审计事件 `ops_release_gate_run`

### 3.5 Recovery Drills

当前接口：

1. `GET /api/v1/admin/ops/recovery-drills`
2. `POST /api/v1/admin/ops/recovery-drills/run`

当前规则：

1. 查询 `limit` 默认 20，最大 200
2. 新增演练时 `rpo_hours`、`rto_hours` 必须大于 0
3. 当前通过条件为 `RPO <= 1h` 且 `RTO <= 4h`
4. 数据物理上存入 `AuditLog`，动作名为 `ops_recovery_drill`

### 3.6 Releases / Change Approvals / Backup Plans / Backup Runs

当前均为“结构化 payload 写入审计日志”的模型，而不是独立业务表。

当前动作名：

1. 发布记录：`ops_release`
2. 变更审批：`ops_change_approval`
3. 备份计划：`ops_backup_plan`
4. 备份运行：`ops_backup_run`

当前规则：

1. `releases`：要求 `version` 与 `environment`，状态规范为 `planned|released|rolled-back|failed`
2. `change approvals`：要求 `ticket_id`，状态规范为 `approved|rejected|pending`
3. `backup plans`：要求 `plan_key`、`backup_type`、`schedule`、`retention_days`，保留 `enabled`
4. `backup runs`：要求 `plan_key`，`size_mb` 与 `duration_minutes` 不可为负

## 4. 当前存储模型

### 4.1 审计日志复用

当前大量运维记录都复用 `AuditLog`：

1. `target_type` 统一为 `ops`
2. `summary` 为人类可读摘要
3. `details` 为 JSON 序列化结构化内容
4. `created_at` 作为事件时间

### 4.2 当前优点

1. 快速形成统一导出入口
2. 无需新增大量运维业务表即可实现基础治理
3. 与现有审计查询链路天然兼容

### 4.3 当前限制

1. 缺少单独的 immutable store / WORM 存储
2. 不具备事件签名或防篡改校验链
3. 结构化字段仍被包裹在 `details` JSON 中，查询粒度有限

## 5. 当前未闭环差距

### 5.1 P0 差距

1. 真实 4xx/5xx 指标尚未接入，当前为占位值
2. 门禁快照尚未接入发布流水线自动阻断
3. 审计导出尚未具备独立完整性校验能力

### 5.2 P1 差距

1. 备份产物校验与恢复自动化未闭环
2. 运维记录与外部 CMDB / 变更系统未打通
3. 告警阈值与留存策略仍缺少环境级配置化能力
4. 发布、审批、备份记录目前依赖 `AuditLog` 复用，长期可演进为独立表或事件总线

## 6. 当前验收建议

进入发布闭环前，至少需要完成以下验证：

1. 审计导出 JSON / CSV 均可成功导出
2. release gate 至少有 1 次成功、1 次失败样例
3. recovery drill 记录可验证 RPO/RTO 判定
4. backup plan 与 backup run 记录可通过 API 创建并回读
5. 告警与门禁结果能被人工复核解释
