# 本地开发速查卡

## 0. 推荐入口

最短命令入口：

```bash
make init-local
make dev
make dev-status
```

如需分别启动：

```bash
make dev-backend
make dev-frontend
```

底层实际仍然使用 `lcode` profile；如果当前仓库已存在运行中的同名会话，`make dev*` 会直接复用。
在启动前，仓库会自动把 profile 配置同步为仓库约定，避免本机残留旧配置。

## 1. 环境文件

前端：

```bash
frontend-next/.env
```

前端环境变量必须至少包含：

```bash
SKILLSINDEX_SERVER_API_BASE_URL=http://127.0.0.1:38180
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:38180
```

后端：

```bash
backend/.env
```

## 2. 固定 profile

```bash
skillsindex-frontend
skillsindex-backend
```

## 3. 启动命令

推荐直接执行：

```bash
make dev
```

分别启动：

```bash
make dev-backend
make dev-frontend
```

对应底层命令：

```bash
python3 scripts/dev/ensure_lcode_profiles.py
python3 scripts/dev/check_frontend_backend_env.py
lcode config run --name skillsindex-backend
lcode config run --name skillsindex-frontend
```

约束：

1. 常驻服务统一使用 `lcode` 或 `make dev*`
2. `go run ./cmd/bootstrap` 仅用于一次性初始化
3. 不要把裸 `npm run dev`、`next start`、`go run ./cmd/api`、`go run ./cmd/server` 当作系统常驻启动方式

## 4. 默认地址

前端：

```bash
http://127.0.0.1:3400
```

后端：

```bash
http://127.0.0.1:38180
```

说明：

1. 前端本地访问统一使用 `127.0.0.1:3400`
2. 不要混用 `localhost:3400` 和 `127.0.0.1:3400`

## 5. 查看当前运行中的会话

```bash
lcode running --json
```

## 6. 查看 profile 配置

```bash
lcode config show --name skillsindex-frontend --json
lcode config show --name skillsindex-backend --json
```

## 7. 查看状态

```bash
lcode status <session_id> --json
```

## 8. 查看日志

查看最近日志：

```bash
lcode logs <session_id> --tail 120
```

持续跟随日志：

```bash
lcode logs <session_id> --follow
```

查看状态和日志摘要：

```bash
lcode inspect <session_id> --tail 120
```

## 9. 停止服务

```bash
lcode stop <session_id> --json
```

## 10. 推荐顺序

推荐最短路径：

```bash
make init-local
make dev
```

展开后的底层命令：

```bash
docker compose up -d postgres
cp backend/.env.example backend/.env
cp frontend-next/.env.example frontend-next/.env
go run ./cmd/bootstrap
python3 scripts/dev/ensure_lcode_profiles.py
python3 scripts/dev/check_frontend_backend_env.py
lcode config run --name skillsindex-backend
lcode config run --name skillsindex-frontend
```

## 11. 常见检查

前端打不开：

```bash
lcode running --json
lcode logs <frontend_session_id> --tail 120
```

后端异常：

```bash
lcode logs <backend_session_id> --tail 120
lcode inspect <backend_session_id> --tail 120
```

环境变量修改后未生效：

```bash
lcode stop <session_id> --json
python3 scripts/dev/check_frontend_backend_env.py
lcode config run --name skillsindex-frontend
lcode config run --name skillsindex-backend
```

前端连错后端或页面表现不一致：

```bash
python3 scripts/dev/check_frontend_backend_env.py
```

要求：

```bash
SKILLSINDEX_SERVER_API_BASE_URL == NEXT_PUBLIC_API_BASE_URL
```
