# 里程碑与风险

## 1. 里程碑建议

### M1（基础可用）

1. 市场检索 + 分类 + 详情
2. 账号体系 + 基础 RBAC
3. 手动导入 + Zip 导入

### M2（同步能力完善）

1. 仓库导入与重同步
2. SkillMP 导入与重同步
3. records 治理闭环

### M3（治理与开放）

1. API Key 完整生命周期
2. OpenAPI + Swagger 对齐
3. 审计能力覆盖关键动作

### M4（集成与稳定性）

1. 钉钉 OAuth 全链路
2. 非功能指标优化与发布基线

## 2. 主要风险

1. 语义检索当前为轻量算法，语义准确率受限
2. 仓库拉取依赖外部网络与 git 可用性，失败场景较多
3. 评论缺乏内容审核策略，存在治理风险
4. API Key 管理虽可用，但缺少细粒度 scope 控制
5. 组织协作模型已在数据层预留，UI 与流程尚未启用

## 3. 风险对策文档映射（已补齐设计）

1. 评论治理风险 -> `admin-governance/content-moderation-governance.md`
2. API Key scope 风险 -> `public-api/api-key-scope-governance.md`
3. 组织协作未启用风险 -> `admin-governance/organization-workspace-governance.md`
4. 导入/同步不稳定风险 -> `ingestion-sync/async-sync-job-orchestration.md`
5. 账号安全与恢复风险 -> `auth-rbac/account-center-implementation.md` `admin-governance/admin-account-operations.md`
6. 企业身份接入风险 -> `integrations/enterprise-sso-extension.md`
7. 发布与运维风险 -> `non-functional/operations-compliance-observability.md`
8. 同步不可追溯风险 -> `ingestion-sync/scheduled-sync-version-history.md`

## 4. 待确认事项

1. 是否需要引入异步任务队列处理导入/同步
2. 是否需要公开更多 API（写接口或管理接口）
3. 是否引入企业级 SSO 与统一身份中心
4. 语义检索是否升级为向量检索架构
