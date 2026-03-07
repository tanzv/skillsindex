# 认证、会话与权限需求（当前实现基线）

## 1. 文档定位

本文件以当前仓库实现为基线，收口 `FR-AUTH-001~007` 的真实行为、权限边界与兼容约束。

说明：

1. 本文优先描述当前已实现能力
2. 与当前实现不一致的旧描述已移除
3. 登录失败限流、账号锁定等增强策略保留为目标扩展，不再混入当前态

## 2. 账号认证

### FR-AUTH-001 注册

当前入口：

1. 页面：`GET/POST /register`
2. 兼容页面变体：`/light/register`

当前规则：

1. 注册是否开放受注册开关控制，来源于 `ALLOW_REGISTRATION` / 设置服务
2. `username` 最小长度为 3，写入前统一转小写
3. `password` 最小长度为 8
4. 密码使用 bcrypt 哈希存储
5. 注册成功后立即签发登录会话，并跳转到后台工作区

当前验收口径：

1. 注册关闭时，页面展示 403，提交也被拒绝
2. 注册成功后自动登录
3. 非法表单返回明确错误，不暴露内部栈信息

### FR-AUTH-002 登录

当前入口：

1. 页面：`GET/POST /login`
2. 兼容页面变体：`/light/login`
3. API：`POST /api/v1/auth/login`
4. 登录态读取：`GET /api/v1/auth/me`
5. Provider 列表：`GET /api/v1/auth/providers`

当前规则：

1. 用户名查询统一转小写
2. 用户不存在、密码错误、账号已禁用，统一返回“用户名或密码错误”语义
3. 成功登录后调用 `startUserSession(...)`，同时签发 cookie 并写入服务端会话记录
4. 第三方登录入口由独立文档定义，当前认证基线仅负责会话接入

失败口径：

1. 页面登录失败返回 401 页面错误
2. API 登录失败返回 `401 unauthorized`
3. `disabled` 账号不会返回单独错误类型，避免泄露账号状态

### FR-AUTH-003 注销

当前入口：

1. 页面：`POST /logout`
2. API：`POST /api/v1/auth/logout`

当前行为：

1. 若当前 cookie 中包含 `session_id`，会先尝试撤销对应服务端会话记录
2. 随后清理 `skillsindex_session` cookie
3. 页面端跳转首页；API 返回 `{"ok": true}`

## 3. 会话与 CSRF

### FR-AUTH-004 会话 Cookie 与会话校验链路

当前会话实现不是“纯 Cookie”，而是“签名 Cookie + 服务端会话记录 + 强退时间戳”三层校验。

#### 3.1 Cookie 契约

1. Cookie 名称：`skillsindex_session`
2. TTL：24 小时
3. 属性：`HttpOnly + SameSite=Lax + Secure(可配置)`
4. 当前签名载荷格式：`user_id:expires_at_unix:issued_at_unix:session_id:signature`
5. 整个载荷会先拼接再经过 `base64.RawURLEncoding` 编码写入 cookie

说明：

1. 当前实现已包含 `issued_at_unix` 与 `session_id`
2. 读取逻辑仍兼容历史 3 段 / 4 段格式，以支持旧 token 过渡
3. 因此文档不得再写成旧的 `userID:expiresAt:signature`

#### 3.2 服务端会话记录

登录成功后，系统还会写入 `UserSession` 记录，至少包含：

1. `user_id`
2. `session_id`
3. `user_agent`
4. `issued_ip`
5. `expires_at`
6. `last_seen_at`
7. `revoked_at`

当前作用：

1. 支持列出活跃会话
2. 支持撤销单个会话
3. 支持撤销其他会话
4. 支持在请求进入时校验 `session_id` 是否仍有效

#### 3.3 当前会话校验顺序

请求进入后，当前实现按以下顺序校验：

1. 校验 cookie 是否存在、可解码、签名正确、未过期
2. 若 cookie 含 `session_id` 且服务端会话服务已启用，则校验该 `session_id` 未撤销且未过期
3. 校验通过后刷新该会话的 `last_seen_at`
4. 读取用户实体，要求账号状态仍为 `active`
5. 若 `user.force_logout_at` 存在，且当前 cookie 的 `issued_at` 早于该时间，则立即清理 cookie 并视为未登录

当前失效行为：

1. cookie 非法、过期或签名不通过：视为未登录
2. 会话记录已撤销或不存在：清理 cookie
3. 账号状态为 `disabled`：清理 cookie
4. 命中 `force_logout_at`：清理 cookie

### FR-AUTH-005 CSRF 防护

当前实现为全局 CSRF 中间件，作用于所有非安全方法请求。

当前规则：

1. `GET/HEAD/OPTIONS/TRACE` 不做校验
2. 其余方法统一校验 CSRF
3. token 来源优先级：`X-CSRF-Token` header，其次表单字段 `csrf_token`
4. 配套 cookie 名称为 `skillsindex_csrf`
5. `GET /api/v1/auth/csrf` 可签发当前 token 与 cookie

当前失败口径：

1. 缺失 CSRF cookie：返回 403
2. 缺失 token：返回 403
3. token 不匹配：返回 403
4. 失败响应正文为 `csrf validation failed`

## 4. 角色、状态与权限

### FR-AUTH-006 平台角色与账号状态

当前平台角色枚举：

1. `viewer`
2. `member`
3. `admin`
4. `super_admin`

当前账号状态枚举：

1. `active`
2. `disabled`

说明：

1. 当前实现没有 `locked` 状态
2. 若后续要引入临时锁定，应作为目标扩展单独进入需求与数据模型，不得回写为当前能力

### FR-AUTH-007 当前权限矩阵

| 能力 | viewer | member | admin | super_admin |
| --- | --- | --- | --- | --- |
| 访问后台工作区 | N | Y | Y | Y |
| 创建技能 | N | Y | Y | Y |
| 管理本人技能 | N | Y | Y | Y |
| 管理全站技能 | N | N | Y | Y |
| 全局删除评论 | N | N | Y | Y |
| 管理本人 API Key | N | Y | Y | Y |
| 管理他人 API Key | N | N | N | Y |
| 管理用户角色 | N | N | N | Y |
| 管理账号状态 / 强制下线 / 管理员重置密码 | N | N | N | Y |

当前约束：

1. `viewer` 不具备后台访问与技能创建能力
2. `member` 只能管理自己的技能与评论
3. `admin` 可以治理全站技能与评论，但当前不能管理平台账号状态
4. 平台级账号治理仅 `super_admin` 可执行
5. 禁止降级最后一个 `super_admin`
6. 禁止禁用当前已登录账号自身
7. 禁止禁用最后一个处于活跃状态的 `super_admin`

## 5. 当前缺口与目标扩展

以下能力仍属于目标补齐，不计入当前已覆盖范围：

1. 失败登录限流或临时锁定
2. `locked` 等更细粒度账号状态
3. 基于风险事件的二次验证
4. 更丰富的审计字段（如 `request_id`、`ip`、`result`、`reason`）
