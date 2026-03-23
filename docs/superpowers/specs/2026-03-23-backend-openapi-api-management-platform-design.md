# Backend OpenAPI API Management Platform Design

## Metadata

- Date: 2026-03-23
- Scope: Backend only
- Decision: OpenAPI-first API management platform
- Status: Approved for planning

## Objective

为当前项目后端增加一套完整的 OpenAPI 接口管理机制平台，并将 OpenAPI 规范作为 API 契约的唯一事实源。该平台首期只提供后端能力，不包含管理台界面，但需要覆盖以下能力：

1. OpenAPI 规范注册与版本管理
2. 契约校验与发布流程
3. Operation 级鉴权策略治理
4. Mock 响应能力
5. 外部导出能力
6. 已发布规范驱动的运行时契约校验

## Context

当前仓库后端已经存在一套手写的 OpenAPI 输出能力，主要位于 `backend/internal/web/openapi*.go`。这套机制可以生成 `openapi.json`、`openapi.yaml` 和 Swagger 页面，但存在以下问题：

1. OpenAPI 规范并不是唯一事实源，实际仍由 web 层代码拼装输出
2. 缺少规范版本、发布、回滚和审计机制
3. 缺少 Operation 级的统一策略管理
4. Mock、外部导出、兼容性变更识别均未平台化
5. 新增接口仍然容易回到 code-first 文档补录模式

因此需要从“文档生成”升级为“接口资产治理平台”。

## Decision Summary

采用内嵌式 API 管理平台方案，保持当前 Go 后端为单一运行时，不引入额外 API 网关作为首期前提。

平台整体采用以下策略：

1. OpenAPI-first
   - 仓库内多文件 OpenAPI 规范是唯一事实源
2. Embedded Control Plane + Runtime Plane
   - API 管理控制平面与契约运行平面都内嵌在当前 Go 后端
3. Tool-assisted but Runtime-owned
   - 允许使用第三方工具参与 lint、bundle、codegen 和可选 mock
   - 运行时的契约校验、发布切换、策略执行和默认 mock 仍由当前后端拥有
4. Incremental Migration
   - 新能力从第一天开始严格 OpenAPI-first
   - 旧接口能力逐步迁移，不做一次性重写

## Options Considered

### Option A: Embedded API Management Platform

当前后端同时承担 API 管理控制平面与运行平面。仓库保存 OpenAPI 源文件，发布后生成 bundle 产物，运行时加载当前发布版进行校验、导出、mock 和策略执行。

优点：

1. 贴合现有仓库和分层结构
2. 不引入额外基础设施
3. 能渐进接管现有手写 OpenAPI 机制
4. 运行时权限与业务上下文可直接复用当前系统能力

缺点：

1. 平台能力需要自己实现
2. 首期工作量高于纯外部工具拼装方案

### Option B: Backend Control Plane + API Gateway Runtime

后端负责规范资产、策略和发布记录，运行时由独立 API 网关承接。

优点：

1. 网关能力成熟
2. 统一限流和鉴权扩展空间大

缺点：

1. 当前项目会变成双运行时系统
2. 权限语义、调试和部署复杂度显著提高
3. 首期收益不匹配项目现状

### Option C: Registry + External Tool Chain

后端只负责资产登记，核心 mock、bundle、导出主要依赖外部 Node 工具。

优点：

1. 起步快
2. 外部生态成熟

缺点：

1. 平台一致性弱
2. 核心流程依赖外部工具链，运行时可控性不足
3. 不利于长期治理

## Chosen Approach

选择 Option A，并保留第三方工具作为可插拔辅助组件。

具体工具栈如下：

1. `github.com/getkin/kin-openapi`
   - 解析 OpenAPI 文档
   - 运行时 request/response validation
   - 支撑 operation 匹配和规范加载
2. `github.com/oapi-codegen/oapi-codegen/v2`
   - 用于新接口和平台接口的 Go 合同层代码生成
3. `@redocly/cli`
   - 用于 lint、bundle、发布前静态治理
4. `@stoplight/prism-cli`
   - 可选外部 mock adapter，不作为首期核心运行时依赖

## Architecture

### Layer Mapping

实现必须遵循当前仓库后端分层：

1. `backend/cmd/**`
   - 进程入口
2. `backend/internal/bootstrap/**`
   - 依赖装配、运行时初始化、发布快照加载
3. `backend/internal/web/**`
   - 管理平台 API 路由、输入解析、响应映射、契约中间件接入
4. `backend/internal/services/**`
   - API 管理核心服务层
5. `backend/internal/models/**`
   - API 管理领域模型和稳定契约对象
6. `backend/internal/db/**`
   - 数据迁移、持久化和 bundle 文件索引支持

### New Source of Truth Layout

新增 OpenAPI 仓库目录：

```text
backend/api/openapi/
  root.yaml
  paths/
    public/
    account/
    admin/
  components/
    schemas/
    security/
    parameters/
    responses/
```

设计原则：

1. 多文件组织
2. 按域拆分
3. 通过 bundle 形成发布产物
4. 运行时只消费发布快照

### Core Service Boundaries

#### APISpecRegistryService

职责：

1. 导入和登记草稿规范
2. 解析引用
3. 生成 bundle 输入
4. 建立 operation 索引
5. 管理规范元数据

不负责：

1. 发布切换
2. 运行时策略执行

#### APIPublishService

职责：

1. 校验草稿
2. 执行 diff
3. 识别 breaking change
4. 发布和回滚
5. 维护 current pointer

#### APIPolicyService

职责：

1. 管理 operation 级策略
2. 解析 contract-level security 与 runtime-level policy
3. 提供运行时可执行的权限决策输入

#### APIContractRuntimeService

职责：

1. 加载已发布规范
2. 匹配 operation
3. 校验请求和响应
4. 暴露运行时索引查询接口

#### APIMockService

职责：

1. 根据发布版规范生成 mock 响应
2. 管理 mock profile
3. 支持 override、example、schema fallback

#### APIExportService

职责：

1. 导出 JSON/YAML
2. 导出 public subset
3. 导出 SDK 输入产物
4. 记录导出事件和产物信息

## Data Model

### api_specs

用于表示一份 API 规范资产版本。

建议字段：

1. `id`
2. `name`
3. `slug`
4. `source_type`
5. `status`
6. `semantic_version`
7. `is_current`
8. `source_path`
9. `bundle_path`
10. `checksum`
11. `created_by`
12. `published_by`
13. `published_at`

### api_operations

用于保存从规范中解析出的 operation 清单。

建议字段：

1. `id`
2. `spec_id`
3. `operation_id`
4. `method`
5. `path`
6. `tag_group`
7. `summary`
8. `deprecated`
9. `visibility`

### api_operation_policies

用于保存运行时治理策略。

建议字段：

1. `id`
2. `spec_id`
3. `operation_id`
4. `auth_mode`
5. `required_roles`
6. `required_scopes`
7. `enabled`
8. `mock_enabled`
9. `export_enabled`

### api_mock_profiles

用于保存 mock profile。

建议字段：

1. `id`
2. `name`
3. `spec_id`
4. `mode`
5. `is_default`
6. `created_by`

### api_mock_overrides

用于保存 operation 级 mock 覆盖行为。

建议字段：

1. `id`
2. `profile_id`
3. `operation_id`
4. `status_code`
5. `content_type`
6. `example_name`
7. `body_payload`
8. `headers_payload`
9. `latency_ms`

### api_publish_events

用于保存发布与回滚审计轨迹。

建议字段：

1. `id`
2. `spec_id`
3. `event_type`
4. `from_version`
5. `to_version`
6. `diff_summary`
7. `created_by`
8. `created_at`

### api_exports

用于保存导出记录。

建议字段：

1. `id`
2. `spec_id`
3. `export_type`
4. `target`
5. `artifact_path`
6. `checksum`
7. `created_by`
8. `created_at`

## Runtime Design

### Startup Flow

1. `bootstrap` 读取当前 `is_current = true` 的已发布规范版本
2. 加载 bundle 后的 OpenAPI 文档
3. 构建 `APIContractRuntimeService`
4. 构建以下内存索引：
   - `operationId -> operation metadata`
   - `method+path -> operation`
   - `operationId -> runtime policy`
   - `operationId -> mock behavior`

### Request Flow

1. 请求进入现有 `chi` 路由
2. 契约中间件尝试匹配 operation
3. 若命中 operation，则执行：
   - 请求参数校验
   - 请求体校验
   - policy 解析
   - 鉴权边界检查
   - mock 短路判断
4. 校验通过后才进入真实 handler

### Response Flow

1. handler 返回响应
2. 统一响应层执行 response validation
3. 非生产环境可暴露调试细节
4. 生产环境仅记录安全错误并输出受控响应

### Documentation Flow

1. `/openapi.json` 和 `/openapi.yaml` 不再拼装 map
2. 统一读取当前发布快照
3. Swagger/ReDoc 页面消费发布版规范

## Publish Workflow

### States

规范状态采用显式状态机：

1. `draft`
2. `validated`
3. `published`
4. `deprecated`
5. `archived`

### Draft Import

1. 从仓库路径加载规范
2. 解析引用并 bundle
3. 生成 checksum
4. 提取 operation 索引并落库

### Validation

1. 执行 lint
2. 执行 schema 校验
3. 校验 security scheme
4. 检查 operationId 唯一性
5. 对比当前发布版并生成 diff
6. 识别 breaking 和 non-breaking change

### Publish

1. 生成并固化 bundle 产物
2. 记录 publish event
3. 清理旧版本 `is_current`
4. 激活新版本 `is_current`
5. 重建运行时 contract registry

### Rollback

1. 选择历史已发布版本
2. 重新切换为 current
3. 写入新的 publish event
4. 不改写历史产物，仅切换指针

## Policy Design

仅依赖 OpenAPI `security` 不足以表达当前系统的 session、API key scope 和 role 语义，因此需要双层策略模型。

### Contract-level Policy

来源：

1. OpenAPI `security`
2. tags
3. 后续可扩展的 vendor extensions

作用：

1. 表达接口天然的认证形态
2. 作为运行时策略的基础语义

### Runtime-level Policy

来源：

1. `api_operation_policies`

作用：

1. 绑定系统内部权限语义
2. 指定是否启用接口
3. 指定 mock/export 行为
4. 绑定 scope、role 和访问模式

建议支持的最小字段：

1. `auth_mode`
2. `required_roles`
3. `required_scopes`
4. `enabled`
5. `mock_enabled`
6. `export_enabled`

## Mock Design

Mock 能力只作用于发布版契约，不直接消费草稿。

### Resolution Order

响应生成优先级如下：

1. operation 级 override body
2. named example
3. default example
4. schema-generated payload
5. empty safe fallback

### Activation Conditions

1. operation policy `mock_enabled = true`
2. 请求命中 mock profile 或 mock runtime 入口
3. 当前 profile 可用

### Capabilities

最小能力包括：

1. 按 operation 返回固定状态码
2. 按 operation 注入 header
3. 支持固定延迟
4. 支持 profile 切换

### Runtime Shape

首期建议采用内嵌 mock 运行模式：

1. 后端内嵌 mock runtime
2. 开发时可选接入 Prism 作为外部适配器
3. 不新增独立 mock 服务进程作为首期要求

## Export Design

导出基于发布版契约，而不是直接复制源规范。

### Supported Export Types

1. `raw-published`
   - 发布版 JSON/YAML
2. `public-subset`
   - 仅公开接口子集
3. `sdk-input`
   - 用于 SDK 生成的 bundle 产物

### Export Rules

1. 草稿默认不可导出为正式产物
2. 公开导出必须移除内部接口和内部 schema
3. 每次导出都要记录 checksum 和 artifact 路径

## Compatibility Strategy

首期默认保持现有接口地址和业务 handler 不变。

### Phase 1 Compatibility

1. 保留现有 handler
2. API 管理平台先接管规范、发布和导出
3. `/openapi.*` 改为读取发布快照
4. 原 `openapi*.go` 暂时保留为兼容层或回退路径

### Phase 2 Compatibility

1. 在关键 API 路由上引入 request validation
2. 引入 operation policy enforcement
3. 优先覆盖 admin 和 account 相关 API

### Phase 3 Compatibility

1. 新接口使用 `oapi-codegen`
2. 老接口逐步迁移
3. 逐步收缩旧手写 OpenAPI 代码

## Implementation Plan by Phase

### Phase 1: Minimal Viable Platform

范围：

1. 规范仓库目录
2. 数据模型与迁移
3. `APISpecRegistryService`
4. `APIPublishService`
5. 基础 admin API
6. `/openapi.json` 和 `/openapi.yaml` 切换为发布快照

完成标准：

1. 可以导入规范草稿
2. 可以校验并发布版本
3. 可以导出当前发布版 JSON/YAML

### Phase 2: Runtime Contract and Policy

范围：

1. `APIContractRuntimeService`
2. `APIPolicyService`
3. operation 索引
4. request validation
5. response validation
6. policy enforcement

完成标准：

1. 部分关键 API 已由发布契约驱动校验
2. 已支持 operation 级权限策略执行

### Phase 3: Mock and Export Enhancement

范围：

1. `APIMockService`
2. mock profile
3. mock overrides
4. public subset export
5. sdk-input export
6. publish/export 审计记录

完成标准：

1. 可基于发布版规范稳定提供 mock
2. 可输出面向外部的受控导出产物

### Phase 4: Code Generation and Legacy Convergence

范围：

1. 平台自身 API 使用 `oapi-codegen`
2. 建立 codegen 脚本
3. 新接口默认走 spec-first + codegen
4. 收缩旧手写 OpenAPI map 构建代码

完成标准：

1. 新接口实现流程彻底转为 OpenAPI-first
2. 旧机制不再是主路径

## Extension Points

后续扩展点包括：

1. 多环境发布
2. Tag 级默认策略模板
3. SDK 自动打包
4. 外部网关同步适配器
5. 发布事件 webhook
6. CI breaking-change gate
7. 多租户或组织级 API 资产隔离

## Assumptions

本设计基于以下假设：

1. 首期只实现后端能力，不实现管理台界面
2. 允许引入第三方库和外部工具作为构建辅助
3. 运行时核心能力仍需由当前 Go 后端掌控
4. 数据库允许新增 API 管理相关表
5. 当前 API 地址默认保持兼容，除非后续明确批准 breaking change

## Risks

1. 旧接口与新规范之间可能存在历史不一致，需要逐步收敛
2. 如果一次性强推 codegen 重写，风险过高，因此必须分阶段实施
3. 契约校验若直接全量启用，可能暴露大量旧接口不一致，需要按域渐进打开
4. 引入 Node 工具链后，需要控制其职责，只让其参与构建和治理，不侵入核心运行时

## Acceptance Criteria

以下结果视为首期设计满足要求：

1. OpenAPI 成为 API 契约唯一事实源
2. 后端具备草稿、校验、发布、回滚能力
3. 后端具备 operation 级策略治理能力
4. 后端具备基于发布版契约的 mock 和导出能力
5. 已发布规范能够驱动 `/openapi.*` 输出
6. 架构实现遵守当前仓库的后端分层标准

