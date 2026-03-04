# 原型交互路由映射表（2026-02-28）

## 1. 说明
- 文件：`prototypes/skillsindex_framework/skillsindex_framework.pen`
- 目标：将关键按钮/动作与目标页面ID或路由建立对照，供实现联调。
- 状态定义：`confirmed`=原型中显式可读；`inferred`=按页面语义推断；`pending`=需产品确认。
- 当前统计：状态跳转 `12` 条、后台导航 `18` 条、关键动作 `15` 条（其中 `confirmed=15`）。

## 2. 状态页跳转（Confirmed）
| 源页面ID | 源页面 | 动作ID | 按钮文案 | 目标页面ID | 目标页面 | 状态 |
|---|---|---|---|---|---|---|
| `UVa13` | SkillsIndex / Admin Audit Access Denied Dark | `y1tAy` | Back to Empty (cNClt) | `cNClt` | SkillsIndex / Admin Import Empty Queue Dark | `confirmed` |
| `JDjbs` | SkillsIndex / Admin Audit Access Denied Mobile Dark | `isRLw` | Back to Empty (jtEAp) | `jtEAp` | SkillsIndex / Admin Import Empty Queue Mobile Dark | `confirmed` |
| `cNClt` | SkillsIndex / Admin Import Empty Queue Dark | `HS7xj` | Open Error (cFKnN) | `cFKnN` | SkillsIndex / Admin Import Error State Dark | `confirmed` |
| `jtEAp` | SkillsIndex / Admin Import Empty Queue Mobile Dark | `XFHj6` | Open Error (uUAiF) | `uUAiF` | SkillsIndex / Admin Import Error State Mobile Dark | `confirmed` |
| `cFKnN` | SkillsIndex / Admin Import Error State Dark | `syGuL` | Open Access Denied (UVa13) | `UVa13` | SkillsIndex / Admin Audit Access Denied Dark | `confirmed` |
| `uUAiF` | SkillsIndex / Admin Import Error State Mobile Dark | `mMl3c` | Open Denied (JDjbs) | `JDjbs` | SkillsIndex / Admin Audit Access Denied Mobile Dark | `confirmed` |
| `KNTJu` | SkillsIndex / Search Empty State Light | `R5B10` | Open Error (WKIUj) | `WKIUj` | SkillsIndex / Search Error State Light | `confirmed` |
| `d2Gcr` | SkillsIndex / Search Empty State Mobile Light | `qnrw2` | Open Error (BL2qQ) | `BL2qQ` | SkillsIndex / Search Error State Mobile Light | `confirmed` |
| `WKIUj` | SkillsIndex / Search Error State Light | `ixFNG` | Open Access Denied (humkU) | `humkU` | SkillsIndex / Skill Detail Access Denied Light | `confirmed` |
| `BL2qQ` | SkillsIndex / Search Error State Mobile Light | `aK0nj` | Open Denied (xnImN) | `xnImN` | SkillsIndex / Skill Detail Access Denied Mobile Light | `confirmed` |
| `humkU` | SkillsIndex / Skill Detail Access Denied Light | `8eOrD` | Back to Empty (KNTJu) | `KNTJu` | SkillsIndex / Search Empty State Light | `confirmed` |
| `xnImN` | SkillsIndex / Skill Detail Access Denied Mobile Light | `Iwd9U` | Back to Empty (d2Gcr) | `d2Gcr` | SkillsIndex / Search Empty State Mobile Light | `confirmed` |

## 3. 后台导航路由索引（Confirmed）
| 源页面ID | 源页面 | 文本节点ID | 路由 | 目标页面ID | 状态 |
|---|---|---|---|---|---|
| `95uPl` | SkillsIndex / Admin Navigation Dashboard | `2101c` | `/admin/sync/*` | `Onzo0, LCu0c` | `confirmed` |
| `95uPl` | SkillsIndex / Admin Navigation Dashboard | `3OuEp` | `/admin/recovery/drills` | `n9jqt` | `confirmed` |
| `95uPl` | SkillsIndex / Admin Navigation Dashboard | `4IjPo` | `/admin/sso/providers` | `EC25R` | `confirmed` |
| `95uPl` | SkillsIndex / Admin Navigation Dashboard | `CexW0` | `/admin/import-center` | `iKq35` | `confirmed` |
| `95uPl` | SkillsIndex / Admin Navigation Dashboard | `DkoKn` | `/admin/ops/*` | `vzkFw` | `confirmed` |
| `95uPl` | SkillsIndex / Admin Navigation Dashboard | `E1fxT` | `/admin/accounts` | `1AHaM` | `confirmed` |
| `95uPl` | SkillsIndex / Admin Navigation Dashboard | `VQvWr` | `/admin/roles` | `QPMwn` | `confirmed` |
| `95uPl` | SkillsIndex / Admin Navigation Dashboard | `eb1A9` | `/admin/release-gates` | `MqiFK` | `confirmed` |
| `95uPl` | SkillsIndex / Admin Navigation Dashboard | `pvw5R` | `/admin/apikeys/scopes` | `UDipb` | `confirmed` |
| `4uI2f` | SkillsIndex / Admin Navigation Dashboard Light | `0jgUQ` | `/admin/release-gates` | `NAQSD` | `confirmed` |
| `4uI2f` | SkillsIndex / Admin Navigation Dashboard Light | `1TQCb` | `/admin/accounts` | `1AHaM` | `confirmed` |
| `4uI2f` | SkillsIndex / Admin Navigation Dashboard Light | `2IwlC` | `/admin/apikeys/scopes` | `zoSer` | `confirmed` |
| `4uI2f` | SkillsIndex / Admin Navigation Dashboard Light | `3Y971` | `/admin/sync/*` | `Onzo0, LCu0c` | `confirmed` |
| `4uI2f` | SkillsIndex / Admin Navigation Dashboard Light | `BvRiZ` | `/admin/recovery/drills` | `Tekay` | `confirmed` |
| `4uI2f` | SkillsIndex / Admin Navigation Dashboard Light | `OPmCf` | `/admin/roles` | `QPMwn` | `confirmed` |
| `4uI2f` | SkillsIndex / Admin Navigation Dashboard Light | `PDtuj` | `/admin/import-center` | `iKq35` | `confirmed` |
| `4uI2f` | SkillsIndex / Admin Navigation Dashboard Light | `VnJ29` | `/admin/ops/*` | `yUr4x` | `confirmed` |
| `4uI2f` | SkillsIndex / Admin Navigation Dashboard Light | `srsXD` | `/admin/sso/providers` | `EC25R` | `confirmed` |

## 4. 关键动作按钮（Confirmed）
| 源页面ID | 源页面 | 动作ID | 动作名 | 按钮文案 | 建议目标路由/结果 | 状态 | 备注 |
|---|---|---|---|---|---|---|---|
| `bInf0` | SkillsIndex / Admin Audit & Versions Light | `GaGSV` | `btnRollback` | Request Rollback | `/admin/skills/{id}/versions/{vid}/rollback` | `confirmed` | 节点名已显式标注接口与审批语义 |
| `RlIhh` | SkillsIndex / Admin Audit & Versions Mobile Light | `qBQEj` | `btnRollback` | Request Rollback | `/admin/skills/{id}/versions/{vid}/rollback` | `confirmed` | 节点名已显式标注接口与审批语义 |
| `iihHi` | SkillsIndex / Admin Audit & Versions Tablet Light | `xQ20q` | `btnRollback` | Request Rollback | `/admin/skills/{id}/versions/{vid}/rollback` | `confirmed` | 节点名已显式标注接口与审批语义 |
| `HV80R` | SkillsIndex / Admin Audit Mobile Event Drawer Light | `jp9kR` | `btnRollback` | Request Rollback | `/admin/skills/{id}/versions/{vid}/rollback` | `confirmed` | 节点名已显式标注接口与审批语义 |
| `iKq35` | SkillsIndex / Admin Import Center Dark | `JqHXf` | `syncNowButton` | Sync Now | `POST /admin/sync/runs/trigger` | `confirmed` | 节点名已显式标注接口语义 |
| `iKq35` | SkillsIndex / Admin Import Center Dark | `Z5W6t` | `retryFailedButton` | Retry Failed | `POST /admin/sync/runs/retry-failed` | `confirmed` | 节点名已显式标注接口语义 |
| `osqug` | SkillsIndex / Admin Login Page Prototype Dark | `IpXsq` | `signInButton` | 登录 | `/admin/login -> /admin/import-center` | `confirmed` | 节点名已显式标注登录落地页 |
| `kytwb` | SkillsIndex / Admin Login Page Prototype Light | `54WOj` | `signInButton` | 登录 | `/admin/login -> /admin/import-center` | `confirmed` | 节点名已显式标注登录落地页 |
| `m1fw4` | SkillsIndex / Forgot Password Recovery | `I1BFz` | `resetNextButton` | 下一步：重置密码 | `/account/password/reset` | `confirmed` | 节点名已显式标注下一步路由 |
| `WYhYr` | SkillsIndex / Login Mobile Prototype Dark | `TBByL` | `signInButton` | 登录 | `/login -> /` | `confirmed` | 节点名已显式标注登录落地页 |
| `y0FXe` | SkillsIndex / Login Mobile Prototype Light | `hmQ8z` | `signInButton` | 登录 | `/login -> /` | `confirmed` | 节点名已显式标注登录落地页 |
| `YYmVe` | SkillsIndex / Login Page Prototype Dark | `WHxPh` | `signInButton` | 登录 | `/login -> /` | `confirmed` | 节点名已显式标注登录落地页 |
| `nBjrt` | SkillsIndex / Login Page Prototype Light | `sAU64` | `signInButton` | 登录 | `/login -> /` | `confirmed` | 节点名已显式标注登录落地页 |
| `jf4Li` | SkillsIndex / Login Tablet Prototype Dark | `tuZHU` | `signInButton` | 登录 | `/login -> /` | `confirmed` | 节点名已显式标注登录落地页 |
| `SjjnF` | SkillsIndex / Login Tablet Prototype Light | `jtuT9` | `signInButton` | 登录 | `/login -> /` | `confirmed` | 节点名已显式标注登录落地页 |

## 5. 实现待确认（接口契约）
1. `POST /admin/sync/runs/trigger` 与 `POST /admin/sync/runs/retry-failed` 是否直接采用该路径命名，或需并入统一作业网关。
2. 用户端登录落地页当前统一标注为 `/`，如需切换到 `/search` 或个性化首页需在实现前确定。
3. 回滚动作当前标注含审批语义，是否必须“审批通过后执行”由发布治理策略最终拍板。

## 6. 本轮补充说明
1. 导入链路字段语义已补齐：`source_type: folder` 已在文件夹导入页显式标注。
2. 多源导入路由语义已齐全：`manual/zip/repo/skillmp/url/folder` 均可在原型中检索到对应入口与提交动作文案。

## 7. 异常分支页补充（Confirmed）
| 页面ID | 页面名 | 场景 | 状态 |
|---|---|---|---|
| `WtbeD` | SkillsIndex / Admin Import Validation Error Dark | 导入参数非法（桌面） | `confirmed` |
| `voL5L` | SkillsIndex / Admin Import Validation Error Mobile Dark | 导入参数非法（移动） | `confirmed` |
| `suBkO` | SkillsIndex / SSO Provider Config Missing Dark | SSO 配置缺失（深色） | `confirmed` |
| `iUw1c` | SkillsIndex / SSO Provider Config Missing Light | SSO 配置缺失（浅色） | `confirmed` |
| `ESpfr` | SkillsIndex / Admin Rollback Approval Rejected Light | 回滚审批拒绝（桌面） | `confirmed` |
| `YPe3q` | SkillsIndex / Admin Rollback Approval Rejected Mobile Light | 回滚审批拒绝（移动） | `confirmed` |
