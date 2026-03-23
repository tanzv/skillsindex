# 2026-03-23 Account Center Menu Quick Edit Design

## 背景

当前受保护壳层中的用户头像下拉菜单将所有入口统一处理为“打开确认弹窗后再跳转”。
这不适合当前用户资料的高频编辑场景，也会让头像下拉无法承担轻量个人中心入口的职责。

## 目标

1. 当前登录用户可在头像下拉中直接弹窗编辑基础资料。
2. 安全、会话、API 凭证等较重流程继续跳转独立页面。
3. 接入真实后端账户接口，而不是新增临时 mock 逻辑。
4. 修复用户头像下拉相关样式一致性与响应式表现问题。

## 方案

### 菜单动作类型化

为头像下拉菜单入口增加动作类型：

- `quick-profile`：打开快捷资料编辑弹窗
- `navigate`：直接跳转页面

默认账户菜单映射：

- Profile → `quick-profile`
- Security → `navigate`
- Sessions → `navigate`
- API Credentials → `navigate`
- Admin 扩展入口 → `navigate`

### 快捷资料编辑弹窗

新增受控组件 `AccountCenterQuickProfileDialog`：

- 使用共享 `DetailFormSurface`
- 提供显示名、头像 URL、简介三项编辑能力
- 保存时调用真实接口 `/api/bff/account/profile`
- 表单约束与后端一致：
  - display name: `maxlength=64`
  - avatar url: `type=url`, `maxlength=512`
  - bio: `maxlength=500`

### 真实接口接入

前端通过通用 BFF 代理：

- `GET /api/bff/account/profile`
- `POST /api/bff/account/profile`

代理会转发到后端：

- `GET /api/v1/account/profile`
- `POST /api/v1/account/profile`

### 状态同步

快捷编辑保存成功后：

1. 更新菜单本地 profile snapshot
2. 更新弹窗内表单状态
3. 调用 `router.refresh()` 同步顶部壳层 session 显示名

### 数据契约修正

将账户 profile payload 的 user 字段按真实后端契约统一为 snake_case：

- `display_name`

并抽取到共享模型：

- `src/lib/account/accountProfile.ts`

## 样式修正

1. 头像下拉菜单增加更稳定的 transition。
2. 菜单卡片支持纵向滚动，避免较小视口溢出。
3. 菜单操作项垂直对齐修正为更稳定的居中布局。
4. 保持 token-first，不引入新的局部视觉系统。

## 扩展点

后续可继续在相同动作模型下扩展：

- 通知偏好快捷编辑
- 头像上传替代纯 URL
- 更多当前用户资料字段
- 更细粒度的危险动作确认
