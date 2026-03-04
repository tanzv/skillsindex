# 组织与工作空间治理需求（目标态）

## 1. 背景

当前数据模型与服务层已预留组织能力（`Organization`、`OrganizationMember`），但 UI 与治理流程未启用。

本文件定义组织协作完整能力，补齐“团队级管理”设计。

## 2. 功能范围

1. 组织创建与设置
2. 成员邀请与角色管理
3. 组织级技能共享与权限
4. 组织审计与安全边界

## 3. 路由与接口

建议新增：

1. `GET /admin/organizations`
2. `POST /admin/organizations/create`
3. `POST /admin/organizations/{orgID}/members`
4. `POST /admin/organizations/{orgID}/members/{userID}/role`
5. `POST /admin/organizations/{orgID}/members/{userID}/remove`
6. `POST /skills/{skillID}/organization-bind`
7. `POST /skills/{skillID}/organization-unbind`

## 4. 组织角色模型

组织内角色枚举：

1. `owner`
2. `admin`
3. `member`
4. `viewer`

权限矩阵：

1. `owner`：组织配置与成员管理全权
2. `admin`：可管理成员（不含 owner）与组织技能
3. `member`：可在组织内创建/维护本人技能
4. `viewer`：只读访问

## 5. 关键业务规则

1. 组织至少保留 1 个 `owner`
2. 禁止删除最后一个 `owner`
3. 组织级技能对组织成员可见
4. 跨组织访问必须显式拒绝
5. 平台 `super_admin` 具备兜底治理权限

## 6. 与平台角色的叠加关系

1. 平台角色先决：`viewer` 无后台入口
2. 组织权限在平台权限范围内进一步收敛
3. 平台 `admin/super_admin` 可进行组织救援操作（恢复 owner、清理异常成员）

## 7. 审计要求

必须审计：

1. 组织创建与配置变更
2. 成员邀请、移除、角色变更
3. 技能绑定/解绑组织

## 8. 验收标准

1. outsider 不可管理非所属组织成员
2. member 只能维护本人技能，不能管理组织成员
3. owner/admin 可按规则管理成员
4. “最后一个 owner 保护”生效
5. 组织动作审计可追溯
