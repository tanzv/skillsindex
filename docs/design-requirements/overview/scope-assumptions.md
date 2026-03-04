# 范围与假设

## 1. In Scope

1. Web 页面：`/`、`/categories`、`/timeline`、`/docs`、`/docs/api`、`/about`
2. 技能详情与互动：`/skills/{skillID}` + 收藏/评分/评论
3. 账号登录注册、会话管理、角色权限控制
4. 后台管理：导入、记录治理、集成、API Key、用户管理、审计（`/admin/*` 与 `/dashboard/*`）
5. 公开 API：`/api/v1/skills/search`、`/api/v1/skills/ai-search`
6. OpenAPI 文档与 Swagger 入口（含兼容路径 `/docs/openapi.json`、`/docs/openapi.yaml`）
7. 钉钉 OAuth 入口、回调、授权撤销、个人资料查询
8. 本地化别名：`/zh`、`/zh/*`、`/skillsmp`

## 2. Out of Scope

1. 多租户隔离（租户级数据分库分域）
2. 审核流引擎（内容审批、合规工单）
3. 复杂推荐系统（召回/排序模型在线学习）
4. 外部身份平台通用 SSO（除钉钉外）

说明：

1. 本节描述“当前上线范围”而非“最终目标态范围”
2. 对应目标态设计已补充在：
   - `admin-governance/content-moderation-governance.md`
   - `integrations/enterprise-sso-extension.md`
   - `admin-governance/organization-workspace-governance.md`

## 3. 基线假设

1. 数据库为 PostgreSQL，ORM 为 GORM
2. 服务端渲染模板为主，前端为轻量增强
3. 技能内容主体为 Markdown 文本
4. 公开 API 仅暴露公开技能（`visibility=public`）
5. 生产环境可通过环境变量开启 Cookie Secure

## 4. 约束条件

1. 当前实现中搜索和 AI 语义检索都依赖数据库与本地算法，不依赖外部向量服务
2. CSRF 校验对所有非安全 HTTP 方法生效
3. API 鉴权支持 query(`api_key`) 与 Bearer 双通道
4. 仓库同步依赖本机 `git` 命令可用
