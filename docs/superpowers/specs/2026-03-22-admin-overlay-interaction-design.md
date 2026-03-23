# 后台管理页面 Overlay 交互设计规范

日期：2026-03-22

## 背景

当前后台管理页面已经部分引入抽屉式详情表面（drawer surface），但整体仍存在明显不一致：

1. `adminIngestion` 仍以页面内嵌创建表单为主，主列表与操作表单耦合过深。
2. `adminAccounts`、`adminApiKeys`、`adminModeration`、`adminOrganizations` 等模块虽已局部使用抽屉，但状态建模、打开/关闭语义、详情入口、确认动作承载方式不统一。
3. 同类后台页面对“新增”“查看详情”“编辑”“危险确认”的承载容器不一致，导致交互学习成本偏高。
4. 现有共享能力 `DetailFormSurface` 已经存在，但缺少更贴近后台工作台的页面交互规范与统一接入契约。

## 目标

为 `frontend-next` 后台管理区域建立统一的页面交互规范，使所有类似子页面遵循一致的 in-context workflow：

1. 页面主区域保留列表、筛选、指标和上下文信息，不再被大块内嵌表单挤占。
2. 新增、创建、详情、编辑、审查等单记录工作流默认通过抽屉承载。
3. 删除、取消、重试、撤销等阻断型动作默认通过浮窗确认承载。
4. 所有 admin 类似页面采用统一的本地 overlay 状态建模，不通过 URL 记录打开状态。
5. 保持现有共享壳层、主题 token、可访问性行为和 feature ownership 边界稳定。

## 非目标

本次规范不包含以下内容：

1. 不引入全局 overlay 总线或全局页面级状态管理器。
2. 不把 drawer / modal 状态编码进 URL、search params 或 route segment。
3. 不重做后台信息架构或导航结构。
4. 不要求所有后台页面一夜之间完全重构为表格式布局。
5. 不让共享 overlay 组件直接持有业务副作用、表单 schema 或记录查询逻辑。

## 范围

本规范适用于 admin 下具备以下任一特征的页面：

1. 列表 + 创建
2. 列表 + 详情
3. 列表 + 编辑
4. 审批 / 审查 / 处置
5. 任务 / 作业 / 同步运行详情查看

优先覆盖：

1. `adminIngestion`
2. `adminAccounts`
3. `adminApiKeys`
4. `adminGovernance/AdminModeration`
5. `adminGovernance/AdminOrganizations`
6. 后续新增的后台管理型 workbench 页面

## 用户确认结论

本轮已确认以下约束：

1. 范围是 admin 所有类似子页面，而不是只做 ingestion。
2. 所有“新增或创建”都需要通过抽屉或浮窗完成。
3. 所有“详情”都需要进入统一 overlay 承载，而不是跳转独立详情页。
4. overlay 打开状态不进入 URL，只保留 feature 本地状态。
5. 需要补充明确的后台页面交互设计规范，再进入实现。

## 设计原则

### 1. 主页面保留上下文

后台页面首先是工作台，不是表单页。列表、筛选、摘要指标和右侧上下文信息必须尽量留在当前页面，使用户能够在处理单条记录时不丢失当前工作上下文。

### 2. 单记录操作进入 overlay

只要用户正在处理“一条记录”或“一次动作”，就应优先进入 overlay，而不是把表单塞回主页面主体中。这样可以稳定形成“总览在页内，操作在浮层”的后台认知模型。

### 3. Drawer 默认，Modal 例外

抽屉是默认细节工作流容器；浮窗只用于短流程、阻断型或高风险确认，不应用来承载长表单或复杂详情视图。

### 4. Feature 本地拥有状态

共享层只负责承载、焦点和视觉 contract；业务 feature 负责选中记录、草稿、提交、刷新和关闭策略。不能把 feature 业务状态偷偷上移到共享组件内部。

### 5. 统一交互语义优先于局部便利

相同的后台工作流要尽量表现一致：

1. Create -> 打开创建抽屉
2. Open detail -> 打开详情抽屉
3. Edit -> 进入编辑抽屉或详情抽屉内切换编辑视图
4. Dangerous action -> 打开确认浮窗

## 统一页面交互模型

### 页面主区域职责

主页面必须负责：

1. 指标卡片
2. 筛选与搜索
3. 列表 / 卡片 / 记录索引
4. 辅助说明与上下文摘要
5. 打开 overlay 的入口操作

主页面不应默认承担：

1. 长创建表单
2. 大块编辑表单
3. 深度详情内容
4. 阻断式确认动作的完整交互

### Overlay 职责

Overlay 负责承载单记录工作流，包括：

1. 创建表单
2. 详情视图
3. 编辑表单
4. 审查与处置视图
5. 危险动作确认

## Overlay 类型规范

### Drawer 适用场景

默认使用 drawer 的场景：

1. Create
2. Detail
3. Edit
4. Review
5. Schedule / Policy settings
6. Import source configuration
7. 单条 job / run / account / key / organization member 详情

Drawer 特性要求：

1. 保持当前页面上下文可见
2. 支持 Esc 关闭
3. 支持关闭按钮
4. 支持 backdrop 关闭，除非明确需要防误触策略
5. 支持焦点初始落点与滚动锁定

### Modal 适用场景

仅在以下场景使用 modal：

1. 删除确认
2. 取消任务确认
3. 重试高风险动作确认
4. 撤销或覆盖不可逆动作确认
5. 极短且阻断性的二次确认

Modal 不应承载：

1. 长表单
2. 多段详情
3. 需要持续滚动阅读的记录详情
4. 多步骤配置工作流

## 统一状态模型

每个 admin feature 默认采用一个本地 overlay 状态对象，而不是分散的多个布尔值：

```ts
interface AdminOverlayState {
  open: boolean;
  kind: "create" | "detail" | "edit" | "review" | "confirm";
  entity: string;
  entityId: number | string | null;
}
```

推荐约束：

1. `kind` 表示交互意图，而不是 UI 样式。
2. `entity` 表示业务对象类型，如 `skill`、`importJob`、`syncRun`、`apiKey`。
3. `entityId` 为 `null` 时只适用于 create / global action 等无既有记录上下文的场景。
4. 一个页面同一时刻只维护一个主 overlay 状态；额外确认动作可在此之上局部派生 confirm state。

### 不推荐模式

以下模式应逐步收敛：

1. `createDrawerOpen` + `detailDrawerOpen` + `selectedId` 的无界复制
2. 一个页面为每种记录类型单独维护多个 open 布尔值
3. 让列表卡片直接承担编辑表单展开与提交
4. 让右侧辅助摘要区同时兼任正式详情编辑面板

## 共享组件边界规范

### 共享层职责

共享层可以拥有：

1. drawer / modal 容器
2. title / description / actions / footer 结构
3. 焦点管理、Esc 关闭、滚动锁定
4. backdrop 行为
5. token-first 样式与响应式规则

### 共享层不得拥有

共享层不得拥有：

1. feature 业务请求
2. 记录选择逻辑
3. 提交副作用
4. 表单 schema
5. 文案拼装的业务规则

### 推荐共享抽象

在现有 `DetailFormSurface` 基础上，补齐 admin 组合层：

1. `AdminDetailDrawer`
2. `AdminConfirmModal`
3. `AdminOverlaySection`
4. `AdminOverlayMeta`
5. `AdminOverlayFooter`
6. `useAdminOverlayState`

## 页面布局契约

### 布局基线

所有后台管理型页面应尽量满足以下视觉层次：

1. 顶部：页面标题、说明、主动作
2. 中部：指标与筛选
3. 主工作区：列表 / 记录卡片 / 表格
4. 辅助区：说明、摘要、统计、提示
5. 详细操作区：drawer / modal

### 页面内嵌表单治理规则

若主页面内已有大型创建表单，需遵循以下迁移规则：

1. 把创建表单移入 create drawer
2. 页面主体仅保留触发入口、摘要与结果列表
3. 若表单确有“持续并列参考”需求，只保留摘要卡而不保留可编辑完整表单

## 交互语义规范

### Create

1. Create 按钮永远打开 create drawer
2. 成功后关闭 drawer
3. 成功后刷新当前页面数据
4. 成功提示通过页面 message banner 显示
5. 失败时优先在 drawer 内或顶部错误区显示原因

### Detail

1. 点击记录卡片主操作或详情按钮打开 detail drawer
2. detail drawer 可以展示摘要、元信息、最近活动、局部操作
3. 如果支持编辑，可在 detail drawer 内切换到 edit 视图或直接打开 edit drawer

### Edit

1. Edit 属于 detail 的延伸时，优先在同一 drawer 内容切换
2. Edit 与 Detail 差异较大时，可切换为单独 `kind: "edit"`
3. 编辑成功后返回 detail 或直接关闭，按该 feature 的任务流决定，但同一页面内应保持一致

### Confirm

1. 危险动作先进入 modal
2. modal 必须明确描述后果
3. modal footer 需区分主次动作与危险动作
4. 成功后关闭 modal，并刷新列表或详情内容

## Admin 页面映射规范

### `adminIngestion`

统一改造后应满足：

1. `manual` 页面：创建技能通过 create drawer；技能记录点击进入 detail drawer
2. `repository` 页面：新增 repository intake、修改 sync policy 均通过 drawer；repository skill、sync run 点击进入 detail drawer
3. `imports` 页面：archive import、SkillMP import 通过 drawer；import job 点击进入 detail drawer；retry / cancel 使用 confirm modal

### `adminAccounts`

1. 账号详情与角色详情统一使用 detail drawer
2. 新建 / 分配 / 编辑权限统一进入 drawer
3. 危险权限变更或移除动作用 confirm modal

### `adminApiKeys`

1. 新建 key 使用 create drawer
2. key detail 使用 detail drawer
3. rotate / revoke 使用 confirm modal
4. scopes 编辑保持在 detail drawer 或 edit drawer 中，不再散落在页面主体

### `adminModeration`

1. 创建 case 使用 create drawer
2. case detail / resolve / reject 使用 detail drawer + confirm modal 组合
3. 任何最终处置动作若为不可逆，应补确认 modal

### `adminOrganizations`

1. 新建组织使用 create drawer
2. 成员分配、成员详情、角色调整统一进入 drawer
3. 移除成员、危险角色变更进入 confirm modal

## 可访问性与交互细节

所有 overlay 必须满足：

1. `role="dialog"` 与正确的标题、描述关联
2. `Esc` 可关闭（除非明确禁止）
3. 可见 focus ring
4. 背景滚动锁定
5. 响应式下 drawer 退化为底部 sheet 风格仍保持可操作性
6. 不依赖颜色单独表达状态

## Token 与视觉约束

1. 继续复用 `DetailFormSurface` 的 token-first 基线
2. 不在 feature 层引入新的硬编码视觉系统
3. 所有新样式优先使用 `*.module.scss`
4. drawer / modal 的 header、body、footer 结构需在 admin 模块中保持一致节奏

## 迁移策略

### 第一阶段

1. 补充共享 overlay 状态/组合层
2. 改造 `adminIngestion`，消除页面内嵌主表单
3. 为 ingestion job / run / record detail 建立统一 drawer 契约

### 第二阶段

1. 收敛 `adminApiKeys`、`adminModeration`、`adminOrganizations` 到统一状态模型
2. 把已有分散的布尔状态收敛为单一 overlay state
3. 为危险动作补齐 confirm modal

### 第三阶段

1. 收敛 `adminAccounts` 等剩余类似子页面
2. 提炼更稳定的 admin overlay primitives
3. 补齐更广覆盖的 e2e 与 visual verification

## 扩展点

后续可在本规范之上扩展：

1. overlay tabs（detail / activity / history）
2. unsaved changes guard
3. 统一的 audit trail 插槽
4. 权限驱动 footer actions
5. entity-aware summary header

## 假设

1. URL 不需要承载 overlay 状态。
2. 后台用户更重视列表上下文保留而非路由可分享性。
3. 当前 `DetailFormSurface` 可作为共享基础继续演进，而非需要被替换。
4. feature 仍是业务 side effect 的唯一 owner。

## 风险

1. 统一状态建模时，可能暴露现有页面对多个分散 open state 的隐式依赖。
2. ingestion 从嵌入式表单迁移到 drawer 后，测试用例需要同步更新。
3. 如果不补 confirm modal 规范，危险动作会继续以页面按钮直触发，形成行为不一致。

## 验证策略

### 单元验证

1. overlay 状态 hook / helper 的切换逻辑
2. detail / create / confirm 容器的 contract
3. ingestion 页面切换到 drawer 后的内容渲染与事件流

### E2E 验证

1. admin ingestion create/detail flow
2. admin api keys create/detail/confirm flow
3. admin governance detail / confirm flow
4. admin accounts detail flow

### 人工验证重点

1. 主页面上下文是否保留
2. drawer / modal 打开与关闭是否一致
3. Esc、backdrop、close button 是否按预期工作
4. 成功提示与失败反馈是否仍然清晰
