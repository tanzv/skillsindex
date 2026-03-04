# 钉钉授权指南

## 1. 前置条件

管理员需在环境变量中配置：

1. `DINGTALK_CLIENT_ID`
2. `DINGTALK_CLIENT_SECRET`
3. `DINGTALK_REDIRECT_URL`

## 2. 授权流程

1. 登录系统
2. 进入后台 Integrations 分区
3. 点击“授权钉钉”
4. 跳转钉钉完成授权
5. 回跳后提示授权成功

路由：

1. `GET /auth/dingtalk/start`
2. `GET /auth/dingtalk/callback`

## 3. 查看授权结果

登录后可调用：

- `GET /api/v1/dingtalk/me`

返回信息包括：

1. 授权过期时间
2. 钉钉 profile 基本信息

## 4. 撤销授权

1. 在 Integrations 分区点击撤销
2. 或调用 `POST /auth/dingtalk/revoke`

## 5. 常见问题

1. 提示未配置：检查钉钉环境变量
2. 授权过期：重新执行授权流程
3. state 校验失败：清理浏览器 Cookie 后重试
