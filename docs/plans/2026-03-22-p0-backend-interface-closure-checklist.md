# 2026-03-22 P0 后端接口逐项整改清单

## 1. 文档目的

本文件用于把当前后端最高优先级的整改目标，从“模块结论”继续下钻为“可直接执行的接口整改清单”。

目标是明确：

1. 当前 P0 不是什么
2. 当前 P0 真正集中在哪几类接口
3. 每类接口当前卡点是什么
4. 目标态应该收口成什么样
5. 需要修改哪些文件
6. 需要补哪些测试与验收证据

本文件基于：

1. `docs/plans/2026-03-21-skill-management-backend-gap-closure-checklist.md`
2. `docs/plans/2026-03-22-sync-governance-unification-implementation-plan.md`
3. `docs/plans/2026-03-22-skill-management-backend-completeness-status.md`
4. `docs/plans/2026-03-22-backend-interface-coverage-matrix.md`

---

## 2. 当前 P0 的边界

当前 P0 不是：

1. 从零补一批新页面
2. 从零造一套交易或购买系统
3. 大规模重写全部历史后端结构

当前 P0 的真实目标是：

**把 `sync policy / async job / sync run / skill version / audit` 收口为一条稳定、可追踪、可验收的治理链路。**

因此本轮 P0 重点接口族应聚焦于：

1. sync runs 查询契约
2. async jobs 与 governance 统一规则
3. sync policies 的通用化治理
4. version / run / audit 联合查询与证据输出

---

## 3. P0 整改总览

| P0 编号 | 接口族 | 当前状态 | 核心问题 | 目标结果 |
| --- | --- | --- | --- | --- |
| P0-1 | admin / skill sync runs 查询 | 已有能力但未闭环 | 查询契约虽已独立，但治理视角还不够强 | 输出稳定 run 治理视图 |
| P0-2 | async jobs 与 governance 统一规则 | 已有能力但未闭环 | sync 类型已部分接入，但仍有统一规则继续外显化空间 | job 与 run 生命周期统一 |
| P0-3 | sync policies 通用治理 | 已有能力但未闭环 | 仍偏 repository alias 过渡态 | 形成更通用的 policy 模型与接口语义 |
| P0-4 | version / run / audit 联合治理视图 | 已有能力但未闭环 | 版本已可记录 run，但查询与验收口径未完全统一 | 成功/失败同步都能稳定追踪到证据链 |

---

## 4. 逐项整改清单

## 4.1 P0-1：admin / skill sync runs 查询契约继续增强

### 当前问题

已经完成的基础：

1. `admin sync-runs` 已有真实 handler
2. `skill sync-runs` 已有接口
3. `SyncJobRun` 已扩展为真实 run 合同
4. 已支持部分过滤：
   - `owner_id`
   - `policy_id`
   - `job_id`
   - `target_skill_id`
   - `status`
   - `trigger_type`
   - `include_errored`

仍存在的问题：

1. admin 侧与 skill 侧返回口径仍可继续统一
2. run 列表更偏基础查询，治理视图仍不够强
3. 缺少更明确的失败分布、关联 version / audit 摘要字段
4. 查询契约虽然成型，但还没有稳定地服务于“治理分析”而不是“列表查看”

### 目标态

需要达到：

1. admin / skill 两侧 run DTO 共享稳定核心字段集合
2. run detail 能明确看到：
   - policy
   - job
   - trigger
   - attempt
   - source revision
   - error code / error message
   - version linkage
   - audit linkage summary
3. list / detail 语义统一，不再有 alias 感
4. OpenAPI 与 handler 返回字段一致

### 主要文件

1. `backend/internal/services/sync_job_service.go`
2. `backend/internal/services/sync_run_contracts.go`
3. `backend/internal/web/app_admin_api_sync_runs_handlers.go`
4. `backend/internal/web/app_skill_sync_runs_api.go`
5. `backend/internal/web/app_sync_runs_alias_api.go`
6. `backend/internal/web/openapi_paths_*sync*.go`
7. `backend/internal/web/openapi_schemas_*.go`

### 测试补点

1. `backend/internal/web/app_admin_api_sync_runs_handlers_test.go`
2. `backend/internal/web/app_skill_sync_runs_api_test.go`
3. `backend/internal/web/app_sync_runs_alias_api_test.go`
4. `backend/internal/web/openapi_test.go`
5. `backend/internal/services/sync_job_service_test.go`

### 验收定义

完成后应满足：

1. admin / skill 两侧 run 查询字段口径一致
2. run detail 可稳定追溯 job / version / audit 关联
3. OpenAPI 与实际返回一致
4. focused test 覆盖过滤、详情、权限、错误分支

---

## 4.2 P0-2：async jobs 与 sync governance 统一规则继续扩展

### 当前问题

已经完成的基础：

1. async job 列表、详情、retry、cancel 已存在
2. `AsyncJob` 已有 `SyncRunID`
3. `SyncGovernanceService` 已支持：
   - start
   - retry
   - complete
   - cancel
4. `sync_repository` / `sync_skillmp` 类型 job 的 retry / cancel 已优先走 governance

仍存在的问题：

1. async jobs 的“治理规则”仍较多散落在 handler 与兼容逻辑中
2. sync 类型与非 sync 类型 job 的差异还没有完全外显为稳定规则矩阵
3. duplicate submit、幂等、状态跃迁、取消边界等规则还能继续固化
4. 外部观察视角仍更像“任务管理”，还不够像“同步治理工作流入口”

### 目标态

需要达到：

1. sync 类型 async job 的生命周期与 run 语义完全统一
2. retry / cancel / invalid transition 行为规则清晰固定
3. job detail 可清晰暴露与 run 的关联结果
4. handler 不再承载过多治理判断，更多转向 service contract

### 主要文件

1. `backend/internal/services/async_job_service.go`
2. `backend/internal/services/sync_governance_service.go`
3. `backend/internal/services/sync_governance_helpers.go`
4. `backend/internal/web/app_async_job_governance_helpers.go`
5. `backend/internal/web/app_admin_api_async_jobs_handlers.go`
6. `backend/internal/web/app_admin_jobs_handlers.go`

### 测试补点

1. `backend/internal/web/app_access_settings_async_jobs_test.go`
2. `backend/internal/services/async_job_service_test.go`
3. `backend/internal/services/sync_governance_service_test.go`
4. 视情况新增更多 invalid transition / duplicate submit 回归用例

### 验收定义

完成后应满足：

1. sync 类型 job 的 retry / cancel / complete 都能稳定落到 run lifecycle
2. governed retry 行为与测试断言一致
3. legacy 非 sync job 行为保持兼容
4. job list / detail 能表达 governance 关联信息

---

## 4.3 P0-3：sync policies 从 repository alias 继续向通用治理推进

### 当前问题

已经完成的基础：

1. `SyncPolicy` 一等模型已建立
2. `syncPolicyService` 已存在
3. admin `sync-policies` CRUD 入口已存在
4. repository 默认策略兼容入口仍可用

仍存在的问题：

1. 当前对外语义仍明显偏 repository alias
2. policy 的 source / target / retry / scheduling 治理模型还未完全外显
3. 多来源策略管理还不够稳定
4. 文档与接口名义上的“通用 policy”，在实际使用上还偏兼容层

### 目标态

需要达到：

1. `sync-policies` 真正代表通用 policy 集合
2. repository 兼容入口降级为兼容层，而不是主语义入口
3. policy list / detail / create / update / toggle / disable 都围绕统一模型
4. OpenAPI 与 service contract 对齐

### 主要文件

1. `backend/internal/models/sync_policy.go`
2. `backend/internal/services/sync_policy_service.go`
3. `backend/internal/services/repository_sync_policy_service.go`
4. `backend/internal/web/app_sync_policies_alias_api.go`
5. `backend/internal/web/app_admin_api_sync_policy_handlers.go`
6. `backend/internal/web/openapi_paths_admin_sync_policies.go`
7. `backend/internal/web/openapi_schemas_sync_policies.go`

### 测试补点

1. `backend/internal/services/sync_policy_service_test.go`
2. `backend/internal/web/app_sync_policies_alias_api_test.go`
3. `backend/internal/web/openapi_test.go`

### 验收定义

完成后应满足：

1. policy 通用字段对外可稳定查询与更新
2. repository alias 仅作为兼容入口存在
3. 新逻辑优先走通用 policy service
4. OpenAPI 与 handler 行为一致

---

## 4.4 P0-4：version / run / audit 联合治理视图继续统一

### 当前问题

已经完成的基础：

1. `SkillVersion` 已有 `RunID`
2. remote sync 成功后版本捕获已在 service 内部统一
3. rollback / restore 会生成新版本，不覆盖历史
4. `SyncGovernanceService.Complete(...)` 已承接成功/失败收口

仍存在的问题：

1. 成功同步虽可追到 version，但查询视图还不够统一
2. 失败同步虽可追到 run / error，但证据输出还可继续增强
3. version detail、run detail、audit detail 仍缺少更稳定的联合分析口径
4. 当前更像“对象都已存在”，还不是“证据链已经完整产品化”

### 目标态

需要达到：

1. 每次成功同步可稳定追到：
   - async job
   - sync run
   - version
   - audit
2. 每次失败同步可稳定追到：
   - async job
   - sync run
   - error summary
   - audit
3. run detail 能看到 version linkage summary
4. 版本列表或详情能看到 run context summary

### 主要文件

1. `backend/internal/models/skill_version.go`
2. `backend/internal/services/skill_version_service.go`
3. `backend/internal/services/skill_service_mutations.go`
4. `backend/internal/services/sync_governance_service.go`
5. `backend/internal/web/app_skill_versions_handlers.go`
6. `backend/internal/web/app_skill_versions_api.go`
7. `backend/internal/web/app_admin_api_sync_runs_handlers.go`
8. `backend/internal/web/app_admin_content_handlers.go`

### 测试补点

1. `backend/internal/services/skill_service_repository_sync_test.go`
2. `backend/internal/services/skill_version_service_test.go`
3. `backend/internal/web/app_admin_content_remote_sync_test.go`
4. `backend/internal/web/app_repository_sync_batch_handler_test.go`
5. `backend/internal/web/app_admin_api_sync_runs_handlers_test.go`

### 验收定义

完成后应满足：

1. 成功同步能在版本侧看到 run context
2. 失败同步能在 run 侧看到稳定错误摘要
3. run / version / audit 的关键关联字段在主要查询接口中可见
4. 关键成功与失败路径都有回归测试

---

## 5. 推荐执行顺序

### 第一阶段

1. P0-2 async jobs 与 governance 统一规则继续扩展
2. P0-1 sync runs 查询契约继续增强

原因：

1. 当前 lifecycle 已基本成型
2. 继续先收 job 与 run，能最快稳定治理主链路

### 第二阶段

1. P0-4 version / run / audit 联合治理视图继续统一

原因：

1. 要在 job / run 足够稳定后，再把 version 与 audit 查询口径一起收紧

### 第三阶段

1. P0-3 sync policies 通用治理深化

原因：

1. 这是“从兼容态走向更完整模型”的问题
2. 重要，但相较于主治理链路不应先行打断当前收口节奏

---

## 6. 每项执行时必须同时完成的配套动作

每推进一个 P0 项，必须同时补齐：

1. service contract 调整
2. transport handler 调整
3. focused regression tests
4. OpenAPI 契约同步
5. 文档状态更新

否则容易出现：

1. 代码先行但文档口径滞后
2. handler 行为改变但 OpenAPI 未同步
3. service 语义变化但测试仍停留在旧行为

---

## 7. 当前建议的下一步直接执行项

如果继续按最小闭环推进，建议下一步直接进入：

1. **P0-1 + P0-4 联动收口**
   - 让 sync run detail 稳定暴露 version / audit 关联摘要
   - 让 version detail 稳定暴露 run context 摘要

这是当前最容易把“已有对象”提升为“完整治理证据链”的一步。

