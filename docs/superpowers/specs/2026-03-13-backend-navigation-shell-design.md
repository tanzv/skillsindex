# 受保护工作台导航壳优化设计

日期：2026-03-13

## 背景

当前受保护工作台壳已经完成架构修复：

- 顶部一级导航常驻
- 左侧只显示当前一级导航下的二级菜单
- 右侧只切换页面内容视图
- 点击一级或二级导航不重建整套页面壳

现阶段问题不再是结构错误，而是视觉表达仍偏原型态，缺少正式管理壳应有的秩序感、权威感和控制台层级。

## 目标

在不改变现有导航架构与路由契约的前提下，将受保护工作台壳升级为“行政控制台”风格：

1. 顶栏成为稳定的全局控制层
2. 一级导航成为统一节奏的主控制带
3. 左侧二级菜单成为清晰的工作域导航面板
4. 主内容区保持退后，不与导航争夺主视觉

## 非目标

本次不做以下事项：

1. 不新增或删除一级导航
2. 不调整二级菜单映射、顺序与归属
3. 不引入三级菜单
4. 不加入 badge、计数、状态点或复杂统计
5. 不新增图标体系
6. 不改页面内容组件的业务逻辑

## 设计原则

### 1. 架构不动，表达升级

继续复用 `ProtectedConsoleShell` 以及其上的 `AdminShell` / `WorkspaceShell` 作为唯一受保护工作台壳，避免再次出现多套受保护壳并存的分叉。

### 2. 控制层强于内容层

顶栏和左侧导航应清晰表达“系统控制”和“当前工作域”，主内容区只承担页面内容承载，不再承担导航层级表达。

### 3. 管理感优先

视觉语言采用深色控制头、浅色工作域侧栏和中性主面板的双层控制台布局，强调稳重和秩序，而不是展示型渐变与高饱和强调。

### 4. 纯导航语义

左侧侧栏只保留导航信息，不引入状态提示、统计数字或额外业务负担。

## 实现方案

### 顶栏

1. 保留品牌区、一级导航区和操作区三段式结构
2. 一级导航增加固定标签区容器，使其更像主控制带
3. 品牌区强调系统身份，弱化展示页式视觉
4. 操作区保持 Home 与用户中心，但整体降噪，避免抢夺主导航注意力

### 左侧二级菜单

1. 为当前工作域增加独立标题区
2. 二级菜单项采用更克制的卡片式导航项
3. 激活态采用边界、背景和结构性强调，而不是高饱和块面
4. 桌面端允许侧栏在视口内保持工作域稳定感，但移动端继续降级为普通流式布局

### 内容面板

1. 保留右侧主面板作为唯一页面内容容器
2. 与左栏共享同一套边界、圆角和阴影语义
3. 保持内容层级退后，不与导航层竞争

## 样式策略

1. 优先消费现有 `--si-color-*` token
2. 使用 `color-mix(...)` 与透明度组合推导后台壳颜色
3. 不额外引入一批新的 theme token，避免本轮扩大 token 面积
4. 为导航 hover、active、focus-visible 提供完整可访问状态

## 代码边界

主要改动范围：

1. `frontend-next/src/components/shared/ProtectedConsoleShell.tsx`
2. `frontend-next/src/components/shared/AdminShell.tsx`
3. `frontend-next/src/components/shared/WorkspaceShell.tsx`
4. `frontend-next/src/components/shared/ProtectedTopbar.tsx`
5. 与受保护壳稳定性相关的测试和截图证据

不改动：

1. `frontend-next/src/lib/routing/adminNavigation.ts` 与 `frontend-next/src/lib/routing/workspaceNavigation.ts` 的导航映射
2. `frontend-next/src/features/admin/renderAdminRoute.tsx` 的后台路由装配职责
3. `frontend-next/src/features/workspace/renderWorkspaceRoute.tsx` 的工作台路由装配职责
4. 业务页面路由与数据请求
5. 页面内容组件的渲染路径

## 扩展点

后续可在不破坏本次结果的前提下扩展：

1. 为一级导航加入图标
2. 为左侧工作域加入 breadcrumb 或简短说明
3. 将后台壳专用颜色与状态进一步沉淀为独立 shell token

## 验证策略

必须验证以下契约：

1. 一级导航集合与顺序不变
2. 一级导航切换不重建后台壳
3. 左侧只显示当前一级下的二级菜单
4. `Workspace`、`Users`、`Operations` 等主 section 行为保持稳定
5. 视觉基线与新版后台壳一致

计划执行的验证：

1. `cd frontend-next && npm run test:unit -- tests/unit/admin-route-rendering.test.ts tests/unit/workbench-config.test.ts tests/unit/protected-topbar-model.test.ts tests/unit/workspace-topbar-model.test.ts`
2. `cd frontend-next && npm run test:e2e -- authenticated-management.spec.ts authenticated-admin-contracts.spec.ts authenticated-routes.spec.ts`
3. `cd frontend-next && npm run build`
4. `./scripts/check_max_lines.sh`

## 风险

1. 顶栏和侧栏视觉调整可能导致既有视觉基线失效
2. 小视口下顶栏换行与左栏流式布局需要回归验证
3. 如果用户中心触发器样式未同步升级，顶栏会出现风格割裂

## 结论

本次应以最小结构改动完成后台壳从“原型风格按钮排布”到“正式后台行政控制台”的升级，同时保持既有导航契约和页面切换架构完全稳定。
