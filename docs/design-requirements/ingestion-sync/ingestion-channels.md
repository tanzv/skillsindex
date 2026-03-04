# 技能导入渠道需求

## 1. 导入总览

导入入口统一在后台 `ingestion` 分区，包含四种来源：

1. 手动创建
2. Zip 导入
3. 仓库导入
4. SkillMP 导入

## 2. 渠道需求

### FR-ING-001 手动创建

入口：`POST /skills/manual`

字段要求：

1. `name` 必填
2. `content` 必填
3. `description/tags/category/subcategory/install_command` 可选
4. `visibility` 支持 `private|public`

默认值：

1. 分类默认 `development/backend`
2. `quality_score` 默认 `8.0`
3. `star_count` 默认 `0`

### FR-ING-002 Zip 导入

入口：`POST /skills/upload`

规则：

1. 上传格式必须是 `.zip`
2. 解压需防 Zip Slip（目录逃逸）
3. 解析优先 `skill.json`，回退 `README.md`
4. 内容为空时导入失败

默认值：

1. 分类默认 `tools/automation-tools`
2. `quality_score` 默认 `8.0`

### FR-ING-003 仓库导入

入口：`POST /skills/repo`

规则：

1. 通过 `git clone --depth 1` 拉取
2. 支持可选 `branch` 与 `path`
3. 指定分支失败时回退默认分支重试
4. `path` 必须在仓库目录内（防路径逃逸）

默认值：

1. 分类默认 `devops/git-workflows`
2. `quality_score` 默认 `8.6`
3. `install_command` 缺省时自动生成 `codex skill install github:<repo>`

### FR-ING-004 SkillMP 导入

入口：`POST /skills/skillmp`

规则：

1. 支持 URL 或 Skill ID 二选一
2. token 来源优先级：表单 token > 系统默认 token
3. 支持 JSON 与文本两类返回体解析

默认值：

1. 分类默认 `data-ai/llm-ai`
2. `quality_score` 默认 `8.8`
3. `install_command` 缺省时自动生成 `codex skill install skillmp:<id>`

## 3. 通用导入规则

### FR-ING-005 元数据标准化

1. 标签统一转小写并去重
2. visibility 非 `public` 一律按 `private`
3. source_type 非法值回退 `manual`

### FR-ING-006 审计

四种导入成功后必须记录审计动作：

1. `skill_create_manual`
2. `skill_create_upload`
3. `skill_create_repository`
4. `skill_create_skillmp`

### FR-ING-007 错误反馈

1. 用户可见错误必须是可理解文案
2. 导入失败不应写入半成品技能记录
