# 后端原型 P1 视觉修复方案（不改功能结构）

## 1. 目标与边界

本方案只处理 P1 视觉问题，不改变页面功能、字段、流程路径与权限模型。

目标：
1. 降低右侧高饱和区块对主流程的抢焦点。
2. 提升亮色主题下的信息可读性与卡片层级清晰度。
3. 保持暗色/亮色管理端的统一视觉语言，降低跨页认知成本。

不做事项：
1. 不增加新功能。
2. 不调整业务状态定义与权限规则。
3. 不改接口命名与页面路由。

## 2. 问题聚类

### 2.1 焦点冲突
- 同步、导入、编排、SSO 等页面右侧动作面板使用高饱和蓝底，视觉权重过高。
- 结果：用户先看“动作说明”，后看“主任务列表”，影响效率。

### 2.2 亮色层级不足
- 亮色页面大量使用非常接近的浅底色，卡片分层不明显。
- 结果：长列表页和配置页阅读负担偏高，扫描路径不稳定。

### 2.3 同类页面辨识度不足
- 同步策略 / 同步台账 / 异步编排等页面骨架接近，但视觉锚点差异弱。
- 结果：在运维场景中容易“看错页面”。

## 3. 设计修复策略

### 3.1 色彩收敛
1. 将“面板级主色”从高亮蓝降为稳态蓝，限制高饱和色只用于 CTA。
2. 将信息提示块由青蓝高对比改为低饱和深蓝体系，避免噪声。
3. 亮色主题提升卡片与画布亮度差，保留最少量强调色。

### 3.2 版式聚焦
1. 缩减右侧列宽，扩大左侧任务区可视面积。
2. 保持左右列结构，但让默认视线从左主区开始。

### 3.3 可读性增强
1. 统一正文、次级文本、标签文本的对比梯度。
2. 保留告警/成功语义色，不把语义色用于大面积背景。

## 4. 执行范围（页面族）

- 管理总览与治理：
  - `SkillsIndex / Admin Navigation Dashboard`
  - `SkillsIndex / Organization Governance List`
  - `SkillsIndex / Organization Workspace Governance Hub`
- 导入/同步/任务编排：
  - `SkillsIndex / Ingestion *`
  - `SkillsIndex / Sync *`
  - `SkillsIndex / Job Orchestration Center`
  - `SkillsIndex / Import Operation Records`
- 身份与审核：
  - `SkillsIndex / Enterprise Identity SSO Gateway`
  - `SkillsIndex / SSO Provider *`
  - `SkillsIndex / Moderation *`
- 安全与运维：
  - `SkillsIndex / API Key Scope Governance`
  - `SkillsIndex / Ops Compliance Observatory`
  - `SkillsIndex / Release Gate Control`
  - `SkillsIndex / Backup Recovery Drill`

暗色与亮色均执行同一策略。

## 5. 验收标准

1. 首屏视线优先落在左侧主任务区而非右侧说明区。
2. 亮色页面卡片边界在 1 秒内可被识别。
3. 三类页面（同步策略/同步台账/异步编排）可在顶部和主体区快速区分。
4. 没有出现遮挡、裁切、重叠等结构问题。

## 6. 交付物

1. 原型文件：`prototypes/skillsindex_framework/skillsindex_framework.pen`
2. 审查结论与执行记录：本文件 + 同日层级清单文件。
