# API 使用指南

## 1. 获取个人 API 凭证

个人 API 凭证入口位于用户中心下拉菜单：

1. 登录系统
2. 打开右上角用户中心下拉菜单
3. 点击 `API 凭证`
4. 进入 `/account/api-credentials`

创建凭证时可配置：

1. 名称
2. 用途说明
3. 过期时间
4. scopes

注意事项：

1. 明文 token 只会在创建或轮换成功时显示一次
2. 关闭页面后无法再次查看明文，请在创建后立即保存
3. 如凭证泄露，应立即在账户中心执行“撤销”或“轮换”

当前页面会返回可选 scopes，常见值包括：

1. `skills.search.read`
2. `skills.ai_search.read`
3. `skills.read`
4. `skills:*`
5. `*`

默认 scopes 为：

1. `skills.search.read`
2. `skills.ai_search.read`

## 2. 鉴权方式

公开 API 需要 API Key，支持两种方式：

1. Query 参数：`?api_key=...`
2. Header：`Authorization: Bearer <api_key>`

## 3. 公开接口

### 3.1 关键词搜索

- `GET /api/v1/skills/search`

参数：

1. `q`
2. `tags`
3. `category`
4. `subcategory`
5. `sort`
6. `page`
7. `limit`

示例：

```bash
curl -H "Authorization: Bearer sk_live_demo" \
  "http://localhost:8080/api/v1/skills/search?q=go&category=development&sort=stars"
```

### 3.2 AI 搜索

- `GET /api/v1/skills/ai-search`

示例：

```bash
curl -H "Authorization: Bearer sk_live_demo" \
  "http://localhost:8080/api/v1/skills/ai-search?q=incident%20response%20runbook"
```

## 4. 推荐调用流程

1. 在账户中心创建个人 API 凭证
2. 按最小权限原则选择 scopes
3. 先通过 `/openapi.json` 或 `/docs/swagger` 查看接口契约
4. 使用 `Authorization: Bearer <api_key>` 发起请求
5. 定期轮换凭证，并清理不再使用的旧凭证

## 5. 文档入口

1. `GET /openapi.json`
2. `GET /openapi.yaml`
3. `GET /docs/openapi.json`
4. `GET /docs/openapi.yaml`
5. `GET /docs/swagger`

## 6. 常见错误

1. `401 unauthorized`：缺少或无效 API Key
2. `500`：服务端异常，检查服务日志
