# 快速开始

## 1. 环境准备

1. 准备 PostgreSQL 数据库
2. 复制环境变量文件并按需修改
3. 启动服务后访问 Web 页面

示例命令：

```bash
docker compose up -d postgres
cp .env.example .env
set -a && source .env && set +a
go run ./cmd/server
```

默认访问地址：

- `http://localhost:8080`

## 2. 首次登录方式

### 2.1 使用默认管理员

系统启动时会根据环境变量创建/更新引导账号：

1. `ADMIN_USERNAME`
2. `ADMIN_PASSWORD`
3. `ADMIN_ROLE`

默认值：

1. 用户名：`admin`
2. 密码：`Admin123456!`
3. 角色：`super_admin`

### 2.2 注册新账号

当 `ALLOW_REGISTRATION=true` 时可在 `/register` 注册账号。

注册规则：

1. 用户名最少 3 位
2. 密码最少 8 位

## 3. 基本导航

1. 用户端：`/`（市场）
2. 分类页：`/categories`
3. 时间线：`/timeline`
4. API 文档：`/docs/api`、`/docs/swagger`
5. 管理后台：`/admin`（或 `/dashboard`）

## 4. 快速验证清单

1. 能访问首页并看到技能列表
2. 能登录并进入后台
3. 能创建一条手动技能
4. 能在详情页进行收藏/评分/评论
