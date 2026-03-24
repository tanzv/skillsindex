# 本地开发启动说明（lcode）

## 1. 适用范围

本文档面向本地开发人员，说明如何在 SkillsIndex 仓库中使用 `lcode` 启动、查看和停止前后端服务。

当前推荐方式已经统一为：

1. 前端通过 `frontend-next/.env` 读取环境变量
2. 后端通过 `backend/.env` 自动加载环境变量
3. `lcode` profile 只负责启动进程，不再内联业务环境变量
4. 仓库根目录 `Makefile` 作为最短命令入口，对常用 `lcode` / bootstrap 命令做聚合

如果你只需要最短命令清单，请直接看：

- `docs/user-docs/local-development-quick-reference.md`

## 2. 固定 profile 名称

当前工作区已整理为两个固定 profile：

1. 前端：`skillsindex-frontend`
2. 后端：`skillsindex-backend`

推荐直接使用 profile 名称，不依赖临时 session ID。

## 3. 环境变量来源

### 3.1 前端

前端开发服务读取：

- `frontend-next/.env`

当前默认包含：

```bash
SKILLSINDEX_SERVER_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME=SkillsIndex
```

其中：

1. `SKILLSINDEX_SERVER_API_BASE_URL` 供 Next.js 服务端代理与服务端渲染使用
2. `NEXT_PUBLIC_API_BASE_URL` 供浏览器侧请求使用
3. 两者必须保持为同一个后端地址

### 3.2 后端

后端开发服务读取：

- `backend/.env`

后端配置加载逻辑会优先保留显式进程环境变量；如果当前进程没有设置对应变量，则使用 `.env` 中的默认值。

## 4. 启动命令

### 4.1 推荐入口

```bash
make dev
```

它会顺序检查并启动前后端 profile；如果当前仓库已有运行中的同名会话，则直接复用，并输出当前运行中的会话。

### 4.2 分别启动服务

启动前端：

```bash
make dev-frontend
```

启动后端：

```bash
make dev-backend
```

对应底层命令：

```bash
lcode config run --name skillsindex-backend
lcode config run --name skillsindex-frontend
```

在执行 `make dev-frontend` 前，仓库会自动运行：

```bash
python3 scripts/dev/check_frontend_backend_env.py
```

如果两个前端后端地址变量缺失或不一致，启动会被阻止。

默认访问地址：

- 前端：`http://localhost:3000`
- 后端：`http://localhost:8080`

### 4.3 初始化环境

首次本地启动建议优先执行：

```bash
make init-local
```

它会按顺序执行：

1. `make env-init`
2. `make postgres-up`
3. `make bootstrap`

## 5. 查看运行状态

### 5.1 查看当前运行中的会话

```bash
lcode running --json
```

如果只想人工快速查看，也可以使用：

```bash
lcode running
```

### 5.2 查看某个 profile 的配置

```bash
lcode config show --name skillsindex-frontend --json
lcode config show --name skillsindex-backend --json
```

### 5.3 查看某个 session 的状态

先通过 `lcode running --json` 找到 session ID，再执行：

```bash
lcode status <session_id> --json
```

## 6. 查看日志

### 6.1 查看最近日志

```bash
lcode logs <session_id> --tail 120
```

### 6.2 持续跟随日志

```bash
lcode logs <session_id> --follow
```

### 6.3 查看进程状态与日志摘要

```bash
lcode inspect <session_id> --tail 120
```

## 7. 停止服务

```bash
lcode stop <session_id> --json
```

如果你已经知道当前 session ID，也可以分别停止前后端。

## 8. 常见排查

### 8.1 前端启动了但页面打不开

检查：

1. `lcode running --json` 中前端会话是否为 `running`
2. 前端日志是否显示 `http://localhost:3000`
3. `frontend-next/.env` 是否存在
4. 后端 `http://localhost:8080` 是否已启动

### 8.2 后端启动失败

检查：

1. `backend/.env` 是否存在且内容完整
2. PostgreSQL 是否已启动
3. `DATABASE_URL` 是否可连接
4. `lcode inspect <session_id> --tail 120` 中是否有数据库或端口错误

### 8.3 修改环境变量后没有生效

建议：

1. 停止对应 session
2. 修改 `.env`
3. 确认 `SKILLSINDEX_SERVER_API_BASE_URL` 与 `NEXT_PUBLIC_API_BASE_URL` 完全一致
4. 重新执行 `lcode config run --name ...`

## 9. 推荐工作流

日常本地开发建议按下面顺序进行：

```bash
make dev
```

如果希望看展开后的底层行为，对应命令为：

```bash
python3 scripts/dev/check_frontend_backend_env.py
lcode config run --name skillsindex-backend
lcode config run --name skillsindex-frontend
lcode running --json
```

开发完成后：

```bash
lcode stop <backend_session_id> --json
lcode stop <frontend_session_id> --json
```

如果需要进一步排查运行时问题，优先使用：

```bash
lcode inspect <session_id> --tail 120
lcode logs <session_id> --follow
```
