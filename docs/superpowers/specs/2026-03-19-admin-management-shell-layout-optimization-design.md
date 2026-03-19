# 后端管理壳层布局优化设计

日期：2026-03-19

## 背景

当前后端管理区域（`workspace`、`admin`、`account`）已经复用了受保护壳层组件，但整体体验仍存在以下问题：

1. 顶部导航由多层共享样式和路由样式叠加控制，出现视觉错乱、状态不一致、换行挤压后秩序感较弱的问题。
2. 左侧导航受“强居中内容容器”影响，与屏幕左边缘距离过大，不符合后台工作台的高密度操作场景。
3. 响应式仅完成基础堆叠与换行，未形成“桌面侧栏 + 窄屏抽屉”的后台壳交互模型。
4. `workspace`、`admin`、`account` 三套路由在壳层主题上已经共享，但结构样式 ownership 仍分散，后续维护成本较高。

## 目标

在不改变路由结构、导航数据结构和业务页面内容结构的前提下，完成整个后端管理壳层的统一优化：

1. 统一顶部导航视觉与交互契约，消除样式冲突与状态混乱。
2. 将桌面端整体布局调整为偏左贴边的工作台布局，缩小无效左侧留白。
3. 为平板和手机引入真正的抽屉式侧栏，而不是单纯依赖流式堆叠。
4. 明确共享壳层样式与路由主题样式的边界，降低后续扩展和回归风险。

## 非目标

本次不做以下事项：

1. 不调整 `workspace`、`admin`、`account` 的路由映射关系。
2. 不新增、删除或重命名导航项。
3. 不调整页面业务数据、业务信息架构或页面内容卡片结构。
4. 不引入新的复杂动画、可折叠桌面侧栏或全局搜索功能。
5. 不进行后台模块级视觉重设计，仅治理壳层、导航、侧栏和响应式框架。

## 用户确认结论

本轮已确认以下方向：

1. 范围覆盖整个后端管理区域，而不是仅修 `workspace`。
2. 窄屏导航采用 **抽屉式侧栏**。
3. 桌面端采用 **更偏左贴边的工作台布局**。
4. 方案选择采用 **A：Workbench Left-Attached Shell**。

## 设计原则

### 1. 共享壳层优先

后台管理体验必须由统一的共享壳层驱动，`WorkspaceShell`、`AdminShell`、`AccountShell` 只负责注入导航内容、文案和局部主题，不再重复承担结构布局职责。

### 2. 工作台优先于展示页

后台布局应优先服务操作效率与信息密度，而不是沿用展示页式的强居中容器。桌面端需将侧栏稳定地靠近左侧，保证导航和主工作区的空间分配更符合管理台使用习惯。

### 3. 响应式应是后台式响应

后台管理区的小屏策略应是“主内容优先 + 侧栏抽屉化”，而不是简单堆叠所有区域。抽屉菜单需要具备明确的打开、关闭、遮罩和键盘交互能力。

### 4. 结构与主题分离

共享层负责布局、交互和组件 contract；路由层负责主题差异和极少量局部外观。任何结构性规则都不应散落在 `workspace`、`admin`、`account` 的单独样式文件中重复实现。

## 目标架构

### 组件边界

#### `ProtectedConsoleShell`

统一负责：

1. sticky header 外框
2. desktop sidebar + main grid
3. tablet/mobile drawer 容器与遮罩
4. frame gutter、最大宽度、breakpoint 和壳层布局节奏

#### `ProtectedTopbar`

统一负责：

1. brand 区
2. primary navigation groups
3. overflow 面板
4. utility 区
5. account trigger
6. mobile menu trigger

#### `WorkspaceShell` / `AdminShell` / `AccountShell`

仅负责：

1. 提供 topbar 配置
2. 提供 sidebar 内容
3. 注入 route-specific copy
4. 维持与各自路由域相关的主题差异

### 样式 ownership

#### 共享壳层层

由以下文件负责：

1. `frontend-next/app/protected-shell-layout.css`
2. `frontend-next/app/protected-shell.css`

职责：

1. frame 宽度与 gutter
2. grid / sidebar / main 结构
3. topbar 统一视觉 contract
4. drawer、遮罩、断点规则
5. 通用交互状态（hover / active / focus-visible）

#### 路由主题层

由以下文件负责：

1. `frontend-next/app/workspace-shell.css`
2. `frontend-next/app/admin-shell.css`
3. `frontend-next/app/account-shell.css`

职责：

1. route-specific surface tone
2. 轻量主题差异
3. 少量局部尺寸微调

不再负责：

1. 重复定义壳层 grid
2. 重复定义 sticky sidebar 结构
3. 重复定义顶栏核心交互规则

## 布局方案

### 桌面端（>= 1200px）

采用左贴边工作台布局：

1. 整体 frame 仍保留合理最大宽度，避免超大屏无边界拉伸。
2. 左右 gutter 显著缩小，尤其减少左侧无效留白。
3. 侧栏宽度固定，主内容区使用剩余空间。
4. 顶栏优先保持单行，确保品牌、一级导航、utility 区之间具有稳定秩序。

预期结果：

1. 侧栏视觉起点更靠近左边缘。
2. 主内容区可用宽度更大。
3. 顶栏不再出现看似“居中页头 + 后台侧栏”的风格冲突。

### 中等屏幕（768px - 1199px）

采用过渡式工作台布局：

1. 主内容仍为主视区。
2. 侧栏从固定列切换为抽屉入口。
3. 顶栏展示 menu trigger。
4. primary navigation 根据可用宽度收纳至 overflow。
5. utility 区允许受控换行，但顺序固定，不允许错乱挤压。

### 小屏（< 768px）

采用单列管理台布局：

1. 侧栏完全抽屉化。
2. 页面内容单列排列。
3. 顶栏压缩为：
   - menu trigger
   - brand
   - 当前主要导航入口 / overflow
   - account trigger
4. 所有交互控件需满足触控点击面积要求。

## 交互设计

### 顶部导航

统一导航交互 contract：

1. `active`、`hover`、`focus-visible` 状态只由共享 topbar contract 控制。
2. overflow 展开、收起、外部点击关闭、`Esc` 关闭均保持一致。
3. `workspace` 的旧 topbar 视觉规则需要收敛到 `ProtectedTopbar`，避免双重覆盖。

### 抽屉侧栏

抽屉侧栏需要支持：

1. 点击顶栏 menu trigger 打开
2. 点击遮罩关闭
3. 按 `Esc` 关闭
4. 打开时锁定背景滚动
5. 保持基本键盘可访问性和焦点可见性

### 侧栏导航

桌面端：

1. 保留完整的标题、分组和说明文本
2. 当前路由高亮清晰可辨
3. 说明文本保持辅助信息角色，不与主标签争夺视觉

窄屏抽屉内：

1. 优先保留主标签
2. 说明文本可压缩但不应完全失去信息层次
3. 激活态仍需可辨

## 技术方案

### 主要改动文件

优先改动以下文件：

1. `frontend-next/src/components/shared/ProtectedConsoleShell.tsx`
2. `frontend-next/src/components/shared/ProtectedTopbar.tsx`
3. `frontend-next/src/components/shared/WorkspaceShell.tsx`
4. `frontend-next/src/components/shared/AdminShell.tsx`
5. `frontend-next/src/components/shared/AccountShell.tsx`
6. `frontend-next/app/protected-shell-layout.css`
7. `frontend-next/app/protected-shell.css`
8. `frontend-next/app/workspace-shell.css`
9. `frontend-next/app/admin-shell.css`
10. `frontend-next/app/account-shell.css`
11. 必要时调整 `workspace-topbar*.css`，将其收敛为共享 topbar 的辅助样式，而不是主控样式

### 实现策略

1. 在 `ProtectedConsoleShell` 中引入移动端 drawer 状态及对应结构插槽。
2. 在 `ProtectedTopbar` 中加入 mobile menu trigger，并统一 utility / overflow 的响应式表现。
3. 将 grid、gutter、sticky、drawer、breakpoint 集中到 `protected-shell-layout.css`。
4. 将顶栏视觉 contract 和交互状态集中到 `protected-shell.css`。
5. 精简 `workspace-shell.css` / `admin-shell.css` / `account-shell.css` 中的结构性重复规则。

## 扩展点

本次设计为后续扩展保留以下能力：

1. desktop sidebar collapse
2. drawer state persistence
3. shell density modes
4. global search slot
5. route-level secondary actions

## 假设

本次实现基于以下假设：

1. 三套后台路由均需统一壳层体验。
2. 桌面端默认保留可见侧栏，不做桌面折叠功能。
3. 当前导航数据结构和路由配置保持不变。
4. 本次优先修复壳层结构、间距、响应式和一致性，不主动重排页面业务内容。

## 风险

1. 共享样式收敛可能暴露 `workspace`、`admin`、`account` 现有局部页面对旧壳层样式的隐式依赖。
2. 引入 drawer 后，若缺少回归验证，容易在小屏下出现遮罩、滚动锁定或关闭时序问题。
3. `workspace-topbar` 旧样式与 `ProtectedTopbar` 新 contract 之间存在冲突，需要明确主从关系。

## 验证策略

### 人工验证重点

1. 桌面端顶栏不重叠、不乱序、不异常换行。
2. 左侧栏较现状明显更靠近屏幕左边。
3. 主内容区横向空间更合理。
4. 平板端 sidebar 正常切为 drawer。
5. 手机端 drawer 可开关、无横向溢出、主内容为单列。
6. `workspace`、`admin`、`account` 三套后台壳层表现一致。

### 命令验证

计划执行：

1. `cd frontend-next && npm run lint`
2. `cd frontend-next && npm run test:unit`
3. `cd frontend-next && npm run test:e2e`
4. `cd frontend-next && npm run build`
5. `./scripts/check_max_lines.sh`

若 Playwright 失败，需要记录：

1. 失败 spec 名称
2. `frontend-next/test-results/` 下的产物路径
3. 如有补充截图，记录 `frontend-next/tmp-screens/` 路径

## 结论

本次应以 **A：Workbench Left-Attached Shell** 为唯一实施方向，对整个后端管理区域完成共享壳层治理。核心是将后台体验从“展示页式居中壳 + 分散样式覆盖”升级为“统一工作台壳 + 左贴边桌面布局 + 窄屏抽屉侧栏”，同时保持业务路由与导航数据结构稳定。
