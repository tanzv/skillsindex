# 部署、升级与重启操作说明

## 1. 适用范围

本文档面向管理员或运维人员，说明当前 SkillsIndex 在源码运行模式下的部署、升级、重启与 bootstrap 顺序。

本文档重点回答以下问题：

1. 什么时候需要执行 `bootstrap`
2. 什么时候只需要重启服务
3. 本地开发推荐使用什么启动方式
4. 升级后应该如何验证

当前后端命令已经按职责拆分：

1. `go run ./cmd/bootstrap`
   - 执行数据库迁移
   - 初始化默认管理员
   - 初始化注册开关与同步策略
   - 写入引导/示例数据
2. `go run ./cmd/server`
   - 启动 Web 服务
   - 不再默认执行系统状态初始化
3. `go run ./cmd/api`
   - 启动 API-only 服务
   - 不再默认执行系统状态初始化

当前本地开发推荐方式则已经统一为：

1. 前端使用 `make dev-frontend`（底层为 `lcode config run --name skillsindex-frontend`）
2. 后端使用 `make dev-backend`（底层为 `lcode config run --name skillsindex-backend`）
3. 前端环境来自 `frontend-next/.env`
4. 后端环境来自 `backend/.env`
5. 仓库根目录 `Makefile` 提供初始化、启动与状态查询的统一入口，并默认复用当前仓库已运行的同名会话

这意味着：

1. “初始化系统状态”与“运行服务”已经不是同一个步骤
2. 常规重启 `server` 或 `api` 不会自动补默认管理员或示例数据
3. 需要显式初始化时，应执行 `cmd/bootstrap`
4. `lcode` 负责启动进程，业务环境变量默认来自 `.env` 文件

## 2. 首次部署

推荐顺序：

1. 准备 PostgreSQL
2. 准备环境变量
3. 执行 bootstrap
4. 启动服务

推荐最短命令：

```bash
make init-local
make dev
```

展开后的底层命令：

```bash
docker compose up -d postgres
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend-next/.env.example frontend-next/.env
go run ./cmd/bootstrap
lcode config run --name skillsindex-backend
lcode config run --name skillsindex-frontend
```

如果是 API-only 运行：

```bash
go run ./cmd/bootstrap
lcode config run --name skillsindex-backend
```

如果是纯后端源码运行而不启动前端，也可以使用：

```bash
go run ./cmd/api
```

## 3. 日常重启

大多数日常重启不需要重新执行 bootstrap。

推荐做法：

1. 停止旧服务
2. 确认环境变量无误
3. 直接重新启动服务进程

本地开发推荐：

```bash
make dev
```

对应底层命令：

```bash
lcode config run --name skillsindex-backend
lcode config run --name skillsindex-frontend
```

源码运行推荐：

```bash
go run ./cmd/server
```

适用场景：

1. 仅进程异常重启
2. 仅配置未变化的常规发布
3. 不需要补管理员或示例数据

## 4. 升级顺序

推荐升级顺序：

1. 拉取新代码
2. 更新环境变量或配置文件
3. 执行 `go run ./cmd/bootstrap`
4. 启动后端与前端服务
5. 执行基本验证

推荐原因：

1. 迁移和初始化先完成，再提供流量
2. 常规服务命令本身不再承担初始化职责
3. 升级路径更可预测，便于回滚

推荐命令顺序：

```bash
git pull
make bootstrap
make dev
```

对应底层命令：

```bash
git pull
go run ./cmd/bootstrap
lcode config run --name skillsindex-backend
lcode config run --name skillsindex-frontend
```

## 5. 什么时候需要执行 bootstrap

建议在以下场景执行：

1. 第一次部署
2. 数据库结构发生变化后
3. 需要重新补默认管理员时
4. 需要重新写入引导/示例数据时
5. 需要重建注册开关或同步策略默认值时
6. 升级说明明确要求重跑初始化流程时

不建议在以下场景把 bootstrap 当作常规重启步骤：

1. 仅服务进程重启
2. 仅查看日志或排查端口问题
3. 日常前端样式或页面层变更后重启服务

## 6. 升级后验证清单

建议至少确认以下内容：

1. 首页可访问
2. 前端登录页可访问
2. `/docs/api` 或 `/docs/swagger` 可访问
3. 管理员可登录后台
4. 管理后台 `/admin` 可打开
5. 关键写操作可正常提交
6. 后端日志中无持续报错

如果使用 `lcode` 管理服务，建议再检查：

1. `lcode running --json` 中前后端均为 `running`
2. 前端日志中出现 `http://127.0.0.1:3400`
3. 后端日志中出现 `http://127.0.0.1:38180`

如果当前部署依赖 API-only 模式，还应验证：

1. API 根路径可访问
2. OpenAPI 文档可访问
3. API Key 调用返回符合预期

## 7. 回滚注意事项

回滚时建议：

1. 先确认本次升级是否已执行数据库迁移
2. 如果迁移已执行，先评估旧版本是否兼容当前数据库结构
3. 不要仅回滚代码而忽略数据库状态
4. 如需再次补系统初始化，使用 `cmd/bootstrap`，不要期待 `cmd/server` 自动恢复

## 8. 常见操作建议

### 8.1 想重新生成默认管理员

执行：

```bash
go run ./cmd/bootstrap
```

并确认以下环境变量已设置正确：

1. `ADMIN_USERNAME`
2. `ADMIN_PASSWORD`
3. `ADMIN_ROLE`

### 8.2 想重新补示例数据

执行：

```bash
go run ./cmd/bootstrap
```

注意：常规 `cmd/server` 或 `cmd/api` 不会自动补示例数据。

### 8.3 想只启动服务不改数据

执行：

```bash
go run ./cmd/server
```

或：

```bash
go run ./cmd/api
```

如果是本地开发，推荐直接使用：

```bash
make dev
```

对应底层命令：

```bash
lcode config run --name skillsindex-backend
lcode config run --name skillsindex-frontend
```

### 8.4 想查看当前运行状态与日志

```bash
lcode running --json
lcode inspect <session_id> --tail 120
lcode logs <session_id> --follow
```

## 9. 生产建议

当前建议：

1. 将 `cmd/bootstrap` 视为显式运维动作
2. 将 `cmd/server` / `cmd/api` 视为纯运行命令
3. 在发布脚本或部署流水线中，把 bootstrap 与服务启动拆成两个独立步骤
4. 对 bootstrap 执行结果保留日志或审计记录

如果后续接入容器编排、systemd 或 CI/CD，可在本说明基础上再补平台级执行模板。
