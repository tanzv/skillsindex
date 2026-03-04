# 管理后台操作指南

## 1. 进入后台

入口：`/admin` 或 `/dashboard`

可见分区：

1. Overview
2. Ingestion
3. Records
4. Integrations
5. API Keys
6. Users（super_admin）
7. Audit

## 2. Ingestion：四种导入方式

### 2.1 手动创建

接口：`POST /skills/manual`

建议填写：

1. 名称、描述、内容
2. 标签、分类、子分类
3. 可见性

### 2.2 Zip 导入

接口：`POST /skills/upload`

要求：

1. 上传 `.zip`
2. 包内可包含 `skill.json`
3. 无 `skill.json` 时回退 `README.md`

### 2.3 仓库导入

接口：`POST /skills/repo`

输入：

1. 仓库地址
2. 分支（可选）
3. 子路径（可选）

### 2.4 SkillMP 导入

接口：`POST /skills/skillmp`

输入：

1. Skill URL 或 Skill ID
2. 访问 token（可选）

## 3. Records：记录治理

### 3.1 修改可见性

接口：`POST /skills/{skillID}/visibility`

### 3.2 重同步

接口：`POST /skills/{skillID}/sync`

说明：仅 repository/skillmp 类型支持。

### 3.3 删除技能

接口：`POST /skills/{skillID}/delete`

## 4. API Keys

### 4.1 创建

接口：`POST /admin/apikeys/create`

说明：明文 key 仅展示一次。

### 4.2 撤销

接口：`POST /admin/apikeys/{keyID}/revoke`

## 5. Users（仅 super_admin）

### 5.1 角色调整

接口：`POST /admin/users/{userID}/role`

规则：

1. 仅 super_admin 可执行
2. 不可降级最后一个 super_admin

## 6. Audit

可查看关键操作审计记录：

1. 技能创建/同步/删除
2. 可见性调整
3. API Key 操作
4. 角色调整
5. 钉钉授权/撤销
