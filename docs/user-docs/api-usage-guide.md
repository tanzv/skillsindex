# API 使用指南

## 1. 鉴权方式

公开 API 需要 API Key，支持两种方式：

1. Query 参数：`?api_key=...`
2. Header：`Authorization: Bearer <api_key>`

## 2. 公开接口

### 2.1 关键词搜索

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

### 2.2 AI 搜索

- `GET /api/v1/skills/ai-search`

示例：

```bash
curl -H "Authorization: Bearer sk_live_demo" \
  "http://localhost:8080/api/v1/skills/ai-search?q=incident%20response%20runbook"
```

## 3. 文档入口

1. `GET /openapi.json`
2. `GET /openapi.yaml`
3. `GET /docs/openapi.json`
4. `GET /docs/openapi.yaml`
5. `GET /docs/swagger`

## 4. 常见错误

1. `401 unauthorized`：缺少或无效 API Key
2. `500`：服务端异常，检查服务日志
