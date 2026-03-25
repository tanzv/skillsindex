# 快速开始

## 1. 环境准备

1. 准备 PostgreSQL 数据库
2. 复制环境变量文件并按需修改
3. 首次初始化系统状态
4. 使用 `lcode` 启动本地开发服务
5. 启动服务后访问 Web 页面

推荐优先使用仓库根目录的 `Makefile`：

```bash
make init-local
make dev
```

注意：

1. 系统常驻运行统一使用 `lcode` 或 `make dev*`
2. `go run ./cmd/bootstrap` 只是一次性初始化，不属于常驻服务
3. 不要手动长期运行 `npm run dev`、`next start`、`go run ./cmd/api`、`go run ./cmd/server`

展开后的底层命令：

```bash
docker compose up -d postgres
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend-next/.env.example frontend-next/.env
go run ./cmd/bootstrap
python3 scripts/dev/ensure_lcode_profiles.py
lcode config run --name skillsindex-backend
lcode config run --name skillsindex-frontend
```

默认访问地址：

- 前端：`http://127.0.0.1:3400`
- 后端：`http://127.0.0.1:38180`

如果只需要启动 API-only 服务，可使用：

```bash
make dev-backend
```

对应底层命令：

```bash
lcode config run --name skillsindex-backend
```

如需查看 `lcode` 启动、日志和停止方式，请继续阅读：

- `docs/user-docs/local-development-launch-code.md`

如需查看管理员视角的部署、升级、重启与 bootstrap 顺序，请继续阅读：

- `docs/user-docs/deployment-upgrade-operations.md`

## 2. 启动命令说明

推荐记忆方式：

1. `make init-local`：准备环境、启动 PostgreSQL、执行 bootstrap
2. `make dev`：启动或复用前后端并输出当前会话状态
3. `make dev-backend` / `make dev-frontend`：分别启动单个服务
4. `make dev-status`：查看当前 `lcode` 会话
5. `make sync-lcode-profiles`：把仓库约定的 profile 同步到本机 `lcode`


当前后端命令已经按职责拆分：

1. `go run ./cmd/bootstrap`
   - 执行数据库迁移
   - 初始化默认管理员
   - 初始化注册开关与同步策略
   - 写入引导/示例数据
2. `go run ./cmd/server`
   - 启动 Web 服务
   - 不再默认创建管理员
   - 不再默认写入示例数据
3. `go run ./cmd/api`
   - 启动 API-only 服务
   - 不再默认创建管理员
   - 不再默认写入示例数据

推荐顺序：

1. 第一次部署或需要重新初始化系统状态时，先执行 `go run ./cmd/bootstrap`
2. 平时运行服务时，再执行 `go run ./cmd/server` 或 `go run ./cmd/api`
3. 不要把“运行服务”和“初始化系统状态”视为同一个步骤

## 3. 首次登录方式

### 3.1 使用默认管理员

默认管理员现在只会在执行 `go run ./cmd/bootstrap` 时根据环境变量创建或更新：

1. `ADMIN_USERNAME`
2. `ADMIN_PASSWORD`
3. `ADMIN_ROLE`

默认值：

1. 用户名：`admin`
2. 密码：`Admin123456!`
3. 角色：`super_admin`

### 3.2 注册新账号

当 `ALLOW_REGISTRATION=true` 时可在 `/register` 注册账号。

注册规则：

1. 用户名最少 3 位
2. 密码最少 8 位

## 4. 基本导航

1. 用户端：`/`（市场）
2. 分类页：`/categories`
3. 时间线：`/timeline`
4. API 文档：`/docs/api`、`/docs/swagger`
5. 管理后台：`/admin`（或 `/dashboard`）

## 5. 快速验证清单

1. 已先执行 `go run ./cmd/bootstrap`
2. 能访问首页并看到技能列表
3. 能使用默认管理员登录并进入后台
4. 能创建一条手动技能
5. 能在详情页进行收藏/评分/评论
