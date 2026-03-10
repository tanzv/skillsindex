# 后台治理需求

## 1. 后台信息架构

后台路由：

1. 主入口：`/admin`、`/admin/{section}`
2. 兼容别名：`/dashboard`、`/dashboard/{section}`（行为与 admin 路由一致）

分区定义：

1. `overview`：总览
2. `ingestion`：导入中心
3. `records`：记录治理
4. `integrations`：集成状态
5. `apikeys`：API Key 管理
6. `users`：用户角色管理（仅 super_admin）
7. `audit`：审计日志

## 2. 分区需求

### FR-ADM-001 Overview

展示指标：

1. 技能总数
2. public 数量
3. private 数量
4. syncable 数量（repository + skillmp）

### FR-ADM-002 Ingestion

提供四类导入表单（见 `ingestion-sync`）。

### FR-ADM-003 Records

支持：

1. 列表查看（member 仅本人，admin/super_admin 全站）
2. 可见性切换
3. 远程同步
4. 删除

### FR-ADM-004 Integrations

展示钉钉授权状态并支持撤销授权。

### FR-ADM-005 API Keys

1. member/admin 管理本人 API Key
2. super_admin 可按 owner + status 跨账号筛选
3. 支持创建与撤销

### FR-ADM-006 Users

仅 super_admin 可访问，支持角色变更。

### FR-ADM-007 用户角色变更接口

入口：`POST /admin/users/{userID}/role`

规则：

1. 仅 `super_admin` 可调用
2. 角色值仅允许 `viewer|member|admin|super_admin`
3. 目标用户不存在时返回失败
4. 禁止将最后一个 `super_admin` 降级
5. 变更成功必须记录审计日志

验收标准：

1. 非 super_admin 提交返回权限拒绝
2. 非法 role 值返回错误
3. “最后一个 super_admin”降级被拦截

### FR-ADM-008 Audit

- 审计日志倒序展示
- 非全站管理员仅能查看本人操作日志

## 3. API Key 生命周期治理

### FR-ADM-009 创建

入口：`POST /admin/apikeys/create`

规则：

1. token 仅创建时明文返回一次
2. 默认名称 `Default Token`
3. 支持可选过期天数

### FR-ADM-010 撤销

入口：`POST /admin/apikeys/{keyID}/revoke`

规则：

1. 只能撤销目标用户的有效 key
2. 撤销后立即失效

### FR-ADM-011 审计覆盖

以下后台动作必须审计：

1. 技能创建/导入/同步/删除/可见性变更
2. API Key 创建与撤销
3. 用户角色变更
4. 钉钉授权与撤销

## 4. 原型管理子页导航一致性契约（2026-03-07）

适用范围：

1. 基于 `WorkspacePrototypePageShell` 的后台治理子页
2. 组织管理子页（账号、权限、角色）
3. 导入与记录治理子页（代码仓库、同步记录、导入记录）

强制规则：

1. 顶部导航必须显示完整一级菜单集合，不得因当前子页变化而增减数量
2. 一级菜单标准集合固定为：
   1. `Skill Management`
   2. `User Management`
   3. `System Settings`
   4. `Workspace Panel`
3. 左侧侧边栏仅显示“当前一级菜单”对应的二级菜单，不显示跨一级菜单项目
4. 当路由属于组织管理域（如 `/admin/accounts`、`/admin/access`、`/admin/roles`）时，左侧仅显示 `User Management` 二级菜单
5. 当路由属于导入/记录治理域（如 `/admin/ingestion/*`、`/admin/records/*`）时，左侧仅显示 `Skill Management` 二级菜单
6. 顶部与左侧必须上下联动：当前激活菜单在两处状态一致（`aria-current` 与高亮语义一致）

验收要求：

1. 路由切换时顶部一级菜单数量保持稳定（不可抖动）
2. 子页切换时左侧菜单集合仅在“所属一级菜单”内变化
3. 组织管理与导入/记录治理页面需具备自动化回归覆盖（unit + e2e）
