# 管理端账号治理实施设计（目标态）

## 1. 目标

本文件补充 `FR-ACC-007~012` 的管理端落地设计，覆盖：

1. 用户列表与状态治理
2. 管理员重置密码
3. 强制下线与安全联动
4. 审计与权限防护

## 2. 管理端路由与分区

建议在后台新增 `accounts` 分区：

1. `GET /admin/accounts`：用户列表页
2. `POST /admin/accounts/{userID}/status`：状态变更
3. `POST /admin/accounts/{userID}/force-signout`：强制退出全部会话
4. `POST /admin/accounts/{userID}/password-reset`：管理员触发密码重置

兼容别名：

1. `GET /dashboard/accounts`

## 3. 状态模型

### 3.1 账号状态

枚举：

1. `active`
2. `disabled`
3. `locked`

状态规则：

1. `disabled`：禁止登录，已登录会话可被强制下线
2. `locked`：由安全策略触发，默认短时锁定，可自动恢复
3. `active`：正常状态

### 3.2 权限约束

1. `admin/super_admin` 可操作 `member/viewer` 账号
2. `admin` 不得变更 `super_admin` 状态
3. `super_admin` 执行高风险操作需二次确认

## 4. 用户列表与筛选

列表最少字段：

1. `user_id`
2. `username`
3. `role`
4. `account_status`
5. `created_at`
6. `last_login_at`
7. `active_session_count`

筛选能力：

1. 用户名关键字
2. 角色过滤
3. 状态过滤

## 5. 管理员密码重置

流程：

1. 管理员发起重置请求
2. 系统生成一次性重置凭证（不展示明文密码）
3. 通知用户通过重置入口完成修改
4. 完成后可选执行“强制下线其他会话”

安全要求：

1. 禁止直接设置可见明文密码
2. 重置凭证需时效 + 一次性
3. 重置动作必须审计

## 6. 强制下线设计

1. 提供“踢出全部会话”能力
2. 支持按风险等级触发（密码重置后、账号禁用后）
3. 操作结果需返回已撤销会话数量

## 7. 审计与告警

必审计动作：

1. `admin_account_status_update`
2. `admin_account_force_signout`
3. `admin_account_password_reset`
4. `admin_account_unlock`

审计字段最少包括：

1. actor_user_id
2. target_user_id
3. old_status/new_status
4. reason
5. request_id

## 8. 验收要点

1. 非授权角色调用返回权限拒绝
2. `admin` 操作 `super_admin` 被拒绝
3. 状态切换后登录行为立即受影响
4. 密码重置不出现明文密码展示
5. 所有关键动作可被审计检索
