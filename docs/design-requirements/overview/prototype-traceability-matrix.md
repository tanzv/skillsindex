# 原型页面与需求追踪矩阵（FR/NFR -> Route -> Node）

## 1. 目的

本文件用于将需求编号、业务路由、原型页面节点（Dark/Light）与验收测试族建立可核查的一一映射，作为原型验收与发布前评审的统一依据。

## 2. 用户端能力映射

| 需求组 | 关键路由 | 原型页面（Dark） | 原型页面（Light） | 测试族 |
| --- | --- | --- | --- | --- |
| FR-MKT-001~004 | `/` `/categories` `/categories/{categorySlug}` | `j0pbU`（首页） `ajwcM`（分类） | `EbJ9a` `RJqNj` | TC-MKT-* |
| FR-MKT-002~004（检索深化） | `/`（搜索态） | `9lsym`（搜索结果） | `1ISD7` | TC-MKT-* |
| FR-MKT-005 | `/timeline` | `EOqtK`（时间线） | `35DqW` | TC-MKT-* |
| FR-MKT-006~008 | `/skills/{skillID}` | `hEu3i`（技能详情） | `idgqT` | TC-MKT-* |
| FR-MKT（本地化/兼容） | `/zh/*` `/skillsmp` | `j0pbU`（首页导航与路由说明） | `EbJ9a` | TC-MKT-* |
| FR-INT-001~007 | `/skills/{skillID}/favorite` `/rating` `/comments` | `hEu3i`（详情互动区） | `idgqT` | TC-INT-* |

## 3. 认证与账号能力映射

| 需求组 | 关键路由 | 原型页面（Dark） | 原型页面（Light） | 测试族 |
| --- | --- | --- | --- | --- |
| FR-AUTH-001~007 | `/register` `/login` `/logout` | `Z0Xx0`（认证与钉钉闭环） | `4M0zx` | TC-AUTH-* |
| FR-AUTH-UI（登录界面复刻） | `/login` `/light/login` `/mobile/login` `/mobile/light/login`（原型路由） | `YYmVe`（桌面登录） `jf4Li`（平板登录） `WYhYr`（移动登录） | `nBjrt`（桌面登录） `SjjnF`（平板登录） `y0FXe`（移动登录） | TC-AUTH-* |
| FR-DT-001~006 | `/auth/dingtalk/*` `/api/v1/dingtalk/me` | `Z0Xx0` | `4M0zx` | TC-DT-* |
| FR-ACC-001~012（目标态） | `/account/*` `/admin/users/*` | `8fERA`（账号中心目标态） | `IOoGJ` | TC-ACC-* |
| FR-ACC-007~012（后台账号治理） | `/admin/accounts` `/admin/accounts/new` `/admin/accounts/{accountID}/edit`（原型路由） | `1AHaM`（账号列表） `TjCgh`（账号表单） | `QytKJ` `VnXd5` | TC-ACC-* / TC-ADM-* |

## 4. 导入、治理与后台能力映射

| 需求组 | 关键路由 | 原型页面（Dark） | 原型页面（Light） | 测试族 |
| --- | --- | --- | --- | --- |
| FR-ING-001~007 | `/skills/manual` `/skills/upload` `/skills/repo` `/skills/skillmp` | `9sq0k`（导入中心） | `jCKys` | TC-ING-* |
| FR-ING-001 | `/admin/ingestion/manual`（原型路由） | `nzHmQ`（手动导入独立页） | `5m0sj` | TC-ING-* |
| FR-ING-002 | `/admin/ingestion/upload`（原型路由） | `D9L7Q`（Zip 导入独立页） | `N5JDq` | TC-ING-* |
| FR-ING-003 | `/admin/ingestion/repository`（原型路由） | `T1LsV`（仓库导入独立页） | `GTYH2` | TC-ING-* |
| FR-ING-004 | `/admin/ingestion/skillmp`（原型路由） | `7WR7g`（SkillMP 导入独立页） | `gR5Q5` | TC-ING-* |
| FR-ING-008~012 | `/skills/{skillID}/visibility` `/sync` `/delete` | `phuBz`（记录治理） | `mbfPP` | TC-ING-* |
| FR-ING-010~012 + 导出补充场景 | `/admin/records/sync-jobs` `/admin/records/exports`（原型路由） | `sNW38`（同步与导出作业中心） | `GBDSq` | TC-ING-* / TC-ADM-* |
| FR-ING-013~015（定时策略） | `/admin/sync-policies` `/admin/sync-policies/{policyID}`（原型路由） | `Onzo0`（同步策略管理） | `iTgm0` | TC-ING-* |
| FR-ING-016~017（运行台账） | `/admin/sync-runs` `/admin/sync-runs/{runID}`（原型路由） | `LCu0c`（同步运行台账） | `r0yUw` | TC-ING-* |
| FR-ING-018~022（版本历史） | `/skills/{skillID}/versions` `/skills/{skillID}/versions/{versionID}`（原型路由） | `1ftLo`（技能版本与变更历史） | `EaZHT` | TC-ING-* |
| FR-ING-006~012（记录追踪） | `/admin/records/imports` `/admin/records/sync-jobs`（原型路由） | `4sVDF`（导入操作记录） `3JYyI`（同步记录） | `ws5gl` `BShPb` | TC-ING-* / TC-ADM-* |
| FR-JOB-001~010（任务编排） | `/admin/jobs` `/admin/jobs/{jobID}`（原型路由） | `ReuoM`（异步任务编排中心） | `DqDxJ` | TC-JOB-* / TC-ADM-* |
| FR-ADM-004/009/010（集成治理） | `/admin/integrations` `/admin/integrations/list` `/admin/integrations/new` `/admin/integrations/webhooks/logs` | `K943K`（集成分流） `EC25R`（集成列表） `mgMT2`（集成表单） `gimRr`（Webhook 日志） | `xWuAh` `6TdtI` `HaDLR` `n5GZM` | TC-ADM-* |
| FR-ADM-008/011（事件响应与复盘） | `/admin/incidents` `/admin/incidents/list` `/admin/incidents/{incidentID}/response` `/admin/incidents/{incidentID}/postmortem` | `hahZ8`（事件分流） `lSWwe`（事件列表） `QNq52`（事件处置） `oCpV4`（事件复盘） | `PZuxg` `hhChl` `2AtTH` `4I1Pa` | TC-ADM-* |
| FR-ADM-001~011 | `/admin/*` `/dashboard/*` `/admin/users/{userID}/role` | `95uPl`（导航仪表盘） `nyHEe`（权限分流） `QPMwn`（角色列表） `B5hwC`（角色表单） `K943K` `EC25R` `mgMT2` `gimRr` `hahZ8` `lSWwe` `QNq52` `oCpV4` | `4uI2f`（导航仪表盘） `lUYVK` `5SPsP` `SibVw` `xWuAh` `6TdtI` `HaDLR` `n5GZM` `PZuxg` `hhChl` `2AtTH` `4I1Pa` | TC-ADM-* |

## 5. API 与公共能力映射

| 需求组 | 关键路由 | 原型页面（Dark） | 原型页面（Light） | 测试族 |
| --- | --- | --- | --- | --- |
| FR-API-001~010 | `/openapi.json` `/openapi.yaml` `/docs/openapi.*` `/api/v1/skills/*` | `ox1Pe`（API 与文档门户） | `CN85I` | TC-API-* |
| FR-KEY-001~008（细粒度授权） | `/admin/apikeys` `/admin/apikeys/{keyID}/scopes` `/admin/apikeys/{keyID}/rotate`（原型路由） | `UDipb`（API Key Scope 治理） | `zoSer` | TC-KEY-* |
| NFR-OPS-001~012（可观测与合规） | `/admin/ops/metrics` `/admin/ops/alerts` `/admin/ops/audit-export`（原型路由） | `vzkFw`（运维合规与可观测中心） | `yUr4x` | TC-OPS-* |
| NFR-OPS（发布门禁） | `/admin/release-gates` `/admin/releases` `/admin/change-approvals`（原型路由） | `MqiFK`（发布门禁与变更控制） | `NAQSD` | TC-OPS-* |
| NFR-OPS（备份恢复） | `/admin/backup/plans` `/admin/backup/runs` `/admin/recovery/drills`（原型路由） | `n9jqt`（备份恢复与演练中心） | `Tekay` | TC-OPS-* |
| NFR-001~015（发布基线） | P95、错误率、鉴权、审计、可观测 | `SIIOt`（需求追踪与验收总览） | `de8jd` | TC-NFR-* |

## 6. 状态页与异常路径映射

| 场景 | 关键入口 | 原型页面（Dark） | 原型页面（Light） | 测试族 |
| --- | --- | --- | --- | --- |
| Loading | `/states/loading` | `EOqtK`（时间线加载态） | `35DqW` | TC-MKT-* / TC-NFR-* |
| Empty | `/states/empty` | `cNClt` | `KNTJu` | TC-MKT-* |
| Error + Retry | `/states/error` | `cFKnN` | `WKIUj` | TC-NFR-* |
| Permission Denied | `/states/permission-denied` | `UVa13` | `humkU` | TC-AUTH-* / TC-ADM-* |

## 7. 必查兼容路由

发布前必须在原型与需求评审中确认以下路由未遗漏：

1. `/skillsmp`
2. `/docs/openapi.json`
3. `/docs/openapi.yaml`
4. `/dashboard`
5. `/dashboard/{section}`
6. `/admin/users/{userID}/role`

## 8. 审查结论口径

当以下条件同时满足，可判定原型覆盖满足需求评审口径：

1. FR 组在本矩阵中均有对应页面节点（Dark/Light）
2. 关键路由与测试族存在可追踪映射
3. 目标态需求（FR-ACC）已在原型中明确标注“目标态”
4. 兼容路由清单已纳入审查项
