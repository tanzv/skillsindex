# 2026-03-22 Skill 管理平台后端接口覆盖矩阵

## 1. 文档目的

本文件用于把当前后端能力进一步细化为接口覆盖矩阵，回答以下问题：

1. 当前每个核心模块是否已经提供接口
2. 这些接口由哪些 handler / service / model 承接
3. 当前状态是已完成度较高、已有能力但未闭环，还是仍待完善
4. 后续继续收口时应优先补哪些边界

本文件是以下文档的接口级补充：

1. `docs/plans/2026-03-21-skill-management-backend-requirement-review.md`
2. `docs/plans/2026-03-21-skill-management-backend-gap-closure-checklist.md`
3. `docs/plans/2026-03-22-skill-management-backend-completeness-status.md`

说明：

1. 本矩阵聚焦后端 API 与核心业务接口族
2. 不展开纯页面跳转型 web route
3. 完整公开路径基线以 `backend/internal/web/openapi_test.go` 为参考

---

## 2. 状态定义

### 已完成度较高

表示：

1. 有接口
2. 有真实 service / model 承接
3. 主成功路径和主要权限边界已存在
4. 当前不属于平台主闭环风险点

### 已有能力但未闭环

表示：

1. 有接口与实现
2. 但治理规则、对象关系、失败路径或验收口径仍未完全收口

### 仍待完善

表示：

1. 虽有部分入口，但强发布口径仍不稳定，或
2. 缺乏足够治理证据与规则闭环

---

## 3. 接口覆盖矩阵

| 模块 | 代表接口 | 主要 handler | 主要 service | 主要 model / contract | 当前状态 | 主要缺口 |
| --- | --- | --- | --- | --- | --- | --- |
| 公开市场检索 | `/api/v1/public/marketplace`, `/api/v1/public/rankings`, `/api/v1/public/skills/{skillID}` | `handleAPIPublicMarketplace`, `handleAPIPublicRankings`, `handleAPIPublicSkillDetail` | `skillService` 相关公开查询能力 | Skill 公开详情与聚合响应 DTO | 已完成度较高 | 后续主要是契约稳定与公开数据口径增强 |
| 公开扩展查询 | `/api/v1/public/skills/compare`, `/resources`, `/versions` | `handleAPIPublicSkillCompare`, `handleAPIPublicSkillResources`, `handleAPIPublicSkillVersions` | `skillService`, `skillVersionService` | SkillVersion, 资源聚合 DTO | 已完成度较高 | 可继续增强公开只读 scope 与缓存/性能策略 |
| API Key 搜索能力 | `/api/v1/skills/search`, `/api/v1/skills/ai-search` | `handleAPISearch`, `handleAPIAISearch` | 搜索相关 service + API key 鉴权中间件 | API Key scope contract | 已有能力但未闭环 | scope 覆盖仍偏窄，治理动作仍不足 |
| 认证基础 | `/api/v1/auth/login`, `/auth/providers`, `/auth/csrf`, `/auth/me`, `/auth/logout` | `handleAPIAuthLogin`, `handleAPIAuthProviders`, `handleAPIAuthCSRF`, `handleAPIAuthMe`, `handleAPIAuthLogout` | `authService`, `sessionService` | User, Session contract | 已完成度较高 | 可继续增强异常登录与风险上下文 |
| 账户资料与安全 | `/api/v1/account/profile`, `/api/v1/account/security/password` | `handleAPIAccountProfile`, `handleAPIAccountProfileUpdate`, `handleAPIAccountPasswordUpdate` | `authService`, `userSessionSvc`, `auditService` | User, audit contract | 已有能力但未闭环 | 自助停用、密码重置最终模式仍未定型 |
| 账户会话治理 | `/api/v1/account/sessions`, `/sessions/{sessionID}/revoke`, `/sessions/revoke-others` | `handleAPIAccountSessions`, `handleAPIAccountSessionRevoke`, `handleAPIAccountSessionsRevokeOthers` | `sessionService`, `userSessionSvc` | UserSession | 已有能力但未闭环 | 设备画像、异常会话与风险提醒仍可增强 |
| 账户 API Key 管理 | `/api/v1/account/apikeys`, `/rotate`, `/revoke`, `/scopes` | `handleAPIAccountAPIKeys*` | `apiKeyService`, `auditService` | APIKey | 已有能力但未闭环 | scope 深度与泄露处置能力仍不足 |
| 密码找回 | `/api/v1/account/password-reset/request`, `/confirm` | `handleAPIAccountPasswordResetRequest`, `handleAPIAccountPasswordResetConfirm` | `authService`, `auditService` | Password reset token / audit | 已完成度较高 | 后续主要是交付策略与安全强化 |
| 管理总览 | `/api/v1/admin/overview`, `/api/v1/admin/skills` | `handleAPIAdminOverview`, `handleAPIAdminSkills` | admin 聚合 service / skill 查询 service | 管理聚合 DTO | 已完成度较高 | 可继续丰富聚合指标与治理摘要 |
| 导入：手动 / 上传 | `/api/v1/admin/ingestion/manual`, `/upload` | `handleAPIAdminIngestionManual`, `handleAPIAdminIngestionUpload` | `skillService`, 导入流程 service | Skill, SkillVersion | 已完成度较高 | 主要缺口不在接口，而在统一治理链路 |
| 导入：仓库 / SkillMP | `/api/v1/admin/ingestion/repository`, `/skillmp` | `handleAPIAdminIngestionRepository`, `handleAPIAdminIngestionSkillMP` | `skillService`, `syncGovernanceSvc`, `asyncJobSvc` | AsyncJob, SyncJobRun, SkillVersion | 已有能力但未闭环 | 已接治理链路，但报表/筛选/验收口径仍可增强 |
| records 远程同步与删除 | `/skills/{skillID}/sync`, `/delete`, `/visibility` | `handleRemoteSync` 及相关 content handlers | `skillService`, `syncGovernanceSvc`, `auditService` | Skill, SkillVersion, SyncJobRun | 已有能力但未闭环 | 已接 governance，但还需继续统一更多边界动作 |
| 异步任务列表与详情 | `/api/v1/admin/jobs`, `/api/v1/admin/jobs/{jobID}` | `handleAPIAdminJobs`, `handleAPIAdminJobDetail` | `asyncJobSvc` | AsyncJob | 已有能力但未闭环 | 统一观测模型、规则矩阵仍可继续外显化 |
| 异步任务重试 / 取消 | `/api/v1/admin/jobs/{jobID}/retry`, `/cancel` | `handleAPIAdminJobRetry`, `handleAPIAdminJobCancel` | `asyncJobSvc`, `syncGovernanceSvc` | AsyncJob, SyncJobRun | 已有能力但未闭环 | sync 类型已接 governance，其他 job 类型治理语义仍可继续统一 |
| sync jobs 兼容接口 | `/api/v1/admin/sync-jobs`, `/api/v1/admin/sync-jobs/{runID}` | `handleAPIAdminSyncJobs`, `handleAPIAdminSyncJobDetail` | `syncJobSvc` | SyncJobRun | 已有能力但未闭环 | 兼容入口仍存在，需持续向统一 run 契约收口 |
| admin sync runs | `/api/v1/admin/sync-runs`, `/api/v1/admin/sync-runs/{runID}` | `handleAPIAdminSyncRuns`, `handleAPIAdminSyncRunDetail` | `syncJobSvc` | ListSyncRunsInput, SyncJobRun | 已有能力但未闭环 | 查询维度已增强，但治理报表与稳定契约仍可继续完善 |
| skill 维度 sync runs | `/api/v1/skills/{skillID}/sync-runs`, `/sync-runs/{runID}` | `handleAPISkillSyncRuns`, `handleAPISkillSyncRunDetail` | `syncJobSvc` | SyncJobRun | 已有能力但未闭环 | 与 admin 侧统一口径还可继续加强 |
| sync policy 通用治理 | `/api/v1/admin/sync-policies`, `/create`, `/{policyID}/update`, `/toggle`, `/delete` | `handleAPIAdminSyncPolicies*` | `syncPolicyService` | SyncPolicy / repository alias contract | 已有能力但未闭环 | 当前仍偏 repository alias 过渡态，多来源策略模型仍可深化 |
| repository sync policy 兼容入口 | `/api/v1/admin/sync-policy/repository` | `handleAPIAdminRepositorySyncPolicy`, `handleAPIAdminRepositorySyncPolicyUpdate` | `syncPolicyService` / repository compatibility adapter | RepositorySyncPolicy | 已有能力但未闭环 | 仍是兼容入口，不是最终统一多策略形态 |
| Skill 版本历史 | `/skills/{skillID}/versions`, `/versions/{versionID}`, `/versions/compare` | `handleSkillVersions`, `handleSkillVersionDetail`, `handleSkillVersionCompare` | `skillVersionService` | SkillVersion | 已有能力但未闭环 | 与 run / audit 的统一查询视图仍可增强 |
| Skill 版本回滚 / 恢复 | `/api/v1/skills/{skillID}/versions/{versionID}/rollback`, `/restore` | `handleAPISkillVersionRollback`, `handleAPISkillVersionRestore` | `skillVersionService`, `skillService`, `auditService` | SkillVersion | 已有能力但未闭环 | 回滚治理证据与 run 关联仍可继续加强 |
| 组织管理 | `/api/v1/admin/organizations` | `handleAPIAdminOrganizations`, `handleAPIAdminOrganizationCreate` | `organizationSvc` | Organization | 已有能力但未闭环 | 规则矩阵与平台救援场景仍待固化 |
| 组织成员治理 | `/api/v1/admin/organizations/{orgID}/members`, `/{userID}/role`, `/{userID}/remove` | `handleAPIAdminOrganizationMembers`, `handleAPIAdminOrganizationMemberUpsert`, `handleAPIAdminOrganizationMemberRoleUpdate`, `handleAPIAdminOrganizationMemberRemove` | `organizationSvc` | OrganizationMember | 已有能力但未闭环 | owner/admin/member/viewer 完整策略仍需稳定化 |
| Skill 组织绑定 | `/api/v1/skills/{skillID}/organization-bind`, `/organization-unbind` | `handleAPISkillOrganizationBind`, `handleAPISkillOrganizationUnbind` | `organizationSvc`, `skillService` | Skill, Organization | 已有能力但未闭环 | 组织治理整体规则仍未最终收口 |
| 内容举报 | `/api/v1/skills/{skillID}/report`, `/comments/{commentID}/report` | `handleAPISkillReport`, `handleAPICommentReport` | `moderationSvc` | ModerationCase | 已有能力但未闭环 | 举报后的案件生命周期和内容状态联动仍需深化 |
| 管理端审核 | `/api/v1/admin/moderation`, `/{caseID}/resolve`, `/{caseID}/reject` | `handleAPIAdminModerationList`, `handleAPIAdminModerationCreate`, `handleAPIAdminModerationResolve`, `handleAPIAdminModerationReject` | `moderationSvc`, `auditService` | ModerationCase, resolution contract | 已有能力但未闭环 | case 状态、内容状态、申诉闭环仍未完全稳定 |
| 管理端 API Key 治理 | `/api/v1/admin/apikeys`, `/{keyID}`, `/revoke`, `/rotate`, `/scopes` | `handleAPIAdminAPIKeys*`, `handleAPIAdminAPIKeyDetail`, `handleAPIAdminAPIKeyScopesUpdate` | `apiKeyService`, `auditService` | APIKey | 已有能力但未闭环 | 批量治理、泄露处置、强制轮换仍可继续增强 |
| 管理端账号治理 | `/api/v1/admin/accounts`, `/{userID}/status`, `/force-signout`, `/password-reset`, `/users/{userID}/role` | `handleAPIAdminAccounts`, `handleAPIAdminAccountStatus`, `handleAPIAdminAccountForceSignout`, `handleAPIAdminAccountPasswordReset`, `handleAPIAdminUserRoleUpdate` | `authService`, `userSessionSvc`, `auditService` | User, UserSession | 已有能力但未闭环 | 最终管理员密码重置模式与自助停用仍未完全闭环 |
| User Center 管理接口 | `/api/v1/admin/user-center/accounts`, `/sync`, `/permissions/{userID}` | `handleAPIUserCenterAccounts`, `handleAPIUserCenterSync`, `handleAPIUserCenterPermissionsGet`, `handleAPIUserCenterPermissionsUpdate` | user-center 相关 service / account governance service | User, permission DTO | 已有能力但未闭环 | 与主账号治理的统一口径仍可继续加强 |
| SSO 管理 | `/api/v1/admin/sso/providers`, `/{providerID}/disable`, `/users/sync` | `handleAPIAdminSSOProviders`, `handleAPIAdminSSOProviderCreate`, `handleAPIAdminSSOProviderDisable`, `handleAPIAdminSSOUsersSync` | SSO service / policy helpers | SSO provider contract | 已有能力但未闭环 | 更完整的组织映射、异常同步与策略治理仍可强化 |
| 集成配置 | `/api/v1/admin/integrations` | `handleAPIAdminIntegrations` | integration-related service | Integration DTO | 已完成度较高 | 可继续补更细治理动作 |
| 运维指标与告警 | `/api/v1/admin/ops/metrics`, `/alerts` | `handleAPIAdminOpsMetrics`, `handleAPIAdminOpsAlerts` | `opsService` | Ops metrics / alerts DTO | 已有能力但未闭环 | 指标真实性和发布门禁联动仍可增强 |
| 审计导出 | `/api/v1/admin/ops/audit-export` | `handleAPIAdminOpsAuditExport` | `opsService`, `auditService` | Audit export contract | 已有能力但未闭环 | 审计留存、格式治理和恢复证据链仍可加强 |
| 发布门禁 | `/api/v1/admin/ops/release-gates`, `/run` | `handleAPIAdminOpsReleaseGates`, `handleAPIAdminOpsReleaseGatesRun` | `opsService` | Release gate snapshot | 仍待完善 | 有接口，但离强发布门禁还有差距 |
| 恢复演练 / 发布记录 / 变更审批 / 备份 | `/recovery-drills`, `/releases`, `/change-approvals`, `/backup/plans`, `/backup/runs` | `handleAPIAdminOpsRecoveryDrill*`, `handleAPIAdminOpsReleases*`, `handleAPIAdminOpsChangeApprovals*`, `handleAPIAdminOpsBackup*` | `opsService` | Recovery drill / release / approval / backup records | 仍待完善 | 证据链、真实性与强交付标准仍需强化 |

---

## 4. 当前结论

从接口覆盖矩阵看，当前后端更准确的状态不是“缺接口”或“缺后端”，而是：

1. 大部分核心模块已经有明确接口和真实后端承接
2. 平台主能力已经形成
3. 主要差距集中在治理闭环，而不是从零补接口
4. 同步治理、异步任务治理、版本治理、审计治理之间的统一契约仍是当前 P0

---

## 5. 当前最值得继续推进的接口族

### P0

1. admin / skill 维度 sync runs 查询契约继续增强
2. async jobs 与 sync governance 的统一规则继续扩展
3. sync policies 从 repository alias 继续向通用多策略模型推进
4. version / run / audit 联合查询和验收口径继续统一

### P1

1. API Key scope 与治理动作深化
2. account / user-center / admin account 的统一治理口径继续收口
3. organization / moderation 的规则矩阵固化
4. ops 发布门禁与交付证据增强

---

## 6. 使用建议

后续推进时建议把这份矩阵直接作为执行看板基础：

1. 先从 `已有能力但未闭环` 的 P0 接口族继续收口
2. 每次变更同时补充：
   - service contract
   - handler regression test
   - openapi contract
3. 当某接口族完成后，再把其状态从“已有能力但未闭环”调整为“已完成度较高”

