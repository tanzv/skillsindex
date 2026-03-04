# 认证、会话与权限需求

## 1. 账号认证

### FR-AUTH-001 注册

- 注册入口：`GET/POST /register`
- 受配置项 `ALLOW_REGISTRATION` 控制

规则：

1. `username` 最小长度 3，存储前转小写
2. `password` 最小长度 8
3. 密码使用 bcrypt 哈希存储

验收标准：

1. `ALLOW_REGISTRATION=false` 时页面与提交均拒绝
2. 注册成功自动登录并跳转后台

### FR-AUTH-002 登录

- 登录入口：`GET/POST /login`
- 校验失败返回统一错误，不泄露“用户是否存在”

### FR-AUTH-003 注销

- `POST /logout` 清理会话并跳转首页

## 2. 会话与 CSRF

### FR-AUTH-004 会话 Cookie

- Cookie 名称：`skillsindex_session`
- 内容为 `userID:expiresAt:signature` 的签名载荷
- TTL：24 小时
- 属性：`HttpOnly + SameSite=Lax + Secure(可配置)`

### FR-AUTH-005 CSRF 防护

- 所有非 `GET/HEAD/OPTIONS/TRACE` 请求必须通过 CSRF 校验
- 校验来源：`X-CSRF-Token` header 或表单字段 `csrf_token`

验收标准：

1. 缺失 token 返回 403
2. token 不匹配返回 403
3. 安全方法请求不受影响

## 3. 角色模型与权限

### FR-AUTH-006 平台角色

1. `viewer`
2. `member`
3. `admin`
4. `super_admin`

### FR-AUTH-007 权限矩阵

| 能力 | viewer | member | admin | super_admin |
| --- | --- | --- | --- | --- |
| 访问后台 | N | Y | Y | Y |
| 创建技能 | N | Y | Y | Y |
| 管理本人技能 | N | Y | Y | Y |
| 管理全站技能 | N | N | Y | Y |
| 删除评论（全局） | N | N | Y | Y |
| 管理本人 API Key | N | Y | Y | Y |
| 管理他人 API Key | N | N | N | Y |
| 管理用户角色 | N | N | N | Y |

约束：

1. 禁止将最后一个 `super_admin` 降级
2. `viewer` 不可访问互动写操作（收藏/评分/评论）
3. `member` 删除评论仅限本人评论
