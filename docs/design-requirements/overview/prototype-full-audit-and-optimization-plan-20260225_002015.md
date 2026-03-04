# 原型完整审查与优化计划

## 审查时间
- 2026-02-25 00:20:15

## 审查范围
- 原型主文件：`prototypes/skillsindex_framework/skillsindex_framework.pen`
- 导出清单：`prototypes/skillsindex_framework/manifest.json`
- 预览资源：`prototypes/skillsindex_framework/previews/`
- 需求追踪：`docs/design-requirements/overview/prototype-traceability-matrix.md`
- 需求状态：`docs/design-requirements/overview/requirement-traceability.md`

## 审查结论（摘要）
- 从“结构可用 + 路由一致 + 导出可解析”角度：当前原型可用。
- 从“完整审核可交付”角度：仍有中高优先级问题，主要集中在预览资产真实性与追踪口径一致性。

## 发现清单（按严重级别）

### 高优先级
1. 预览图存在大规模重复复用，影响“完整审核”可信度。  
   - 证据：`prototypes/skillsindex_framework/previews/` 共 76 张 PNG，其中存在 10 组重复哈希，最大重复组 19 张（同一图复用于多页面）。
   - 影响：评审人无法通过预览准确判断每个原型页面的真实布局与差异，存在“看起来完整，实际不可审计”的风险。

### 中优先级
1. 追踪矩阵与导出清单口径不一致。  
   - 证据：`docs/design-requirements/overview/prototype-traceability-matrix.md:9` 起包含大量节点映射（统计 92 个节点 ID）；`prototypes/skillsindex_framework/manifest.json:5` 的 `prototypes` 数量为 66。  
   - 影响：需求评审与导出验收可能出现“文档说有、导出看不到”的认知偏差。

2. “最终产品完整性”与“原型完整性”口径需明确分层。  
   - 证据：`docs/design-requirements/overview/requirement-traceability.md:27` 起多项标注为“目标态（待实现）”。  
   - 影响：如果不明确口径，容易把“目标态待实现”误判为当前原型缺陷。

### 低优先级
1. 登录链路已完成中文化与字体统一，但建议把“中英术语策略”写入规范。  
   - 证据：当前登录页已统一中文文案与字体，仍保留必要技术缩写（如 RBAC、API）。  
   - 影响：跨页面术语可能再次漂移。

## 已通过检查
- 布局结构：`snapshot_layout(...problemsOnly=true, maxDepth=10)` 返回 `No layout problems.`
- 路由唯一性：`manifest` 重复 `primary_route = 0`
- 导出完整性基础：`manifest path -> previews/{path}.png` 缺失数 `0`
- 字体统一：全局字体集合为 `JetBrains Mono` + `Noto Sans SC`

## 原型优化计划（可执行）

### 阶段 1：预览资产一页一图重建（P0）
- 目标：每个 `manifest.path` 对应真实页面截图，不再使用同图复用。
- 动作：
  1. 建立 `path -> nodeId` 映射表（来源：追踪矩阵与页面命名约定）。
  2. 逐页重新导出预览图并覆盖 `previews/{path}.png`。
  3. 生成哈希审计报告，要求重复仅出现在“确认为同页面别名”的场景。
- 验收标准：
  - 非别名页面重复哈希率 <= 5%
  - 随机抽检 20 页，预览与页面内容一致率 100%

### 阶段 2：追踪口径统一（P1）
- 目标：`traceability`、`manifest`、导出资源三者一致。
- 动作：
  1. 补充“节点是否纳入导出”的标记字段（导出态/评审态/草图态）。
  2. 在 `prototype-traceability-matrix` 中增加 `export_key` 列。
  3. 新增脚本校验：矩阵映射的导出态节点必须可在 `manifest` 找到。
- 验收标准：
  - 三方比对无缺口
  - 审核报告可一键追溯到页面与预览

### 阶段 3：交互完整性深审（P1）
- 目标：不仅有页面，还要有正确交互链路。
- 动作：
  1. 覆盖关键流程：导入中心（列表 -> 选择导入方式 -> 对应浮窗 -> 结果记录）。
  2. 覆盖权限与账号：列表 -> 表单 -> 权限变更 -> 审计追踪。
  3. 覆盖同步与导出：策略 -> 作业 -> 运行记录 -> 导出结果。
- 验收标准：
  - 每条主流程至少 1 条成功路径 + 1 条异常路径
  - 页面间跳转逻辑与文案状态一致

### 阶段 4：视觉与术语规范固化（P2）
- 目标：防止后续迭代风格回退。
- 动作：
  1. 固化色板/字体/按钮/状态徽标规范。
  2. 固化术语词表（中文主术语 + 英文缩写白名单）。
  3. 增加自动检查项：字体白名单、禁用术语、按钮层级一致性。
- 验收标准：
  - 页面抽检无风格回退
  - 术语误用率 <= 2%

## 建议执行顺序
1. 先做阶段 1（预览真实性）
2. 再做阶段 2（口径一致）
3. 然后阶段 3（交互链路）
4. 最后阶段 4（规范固化）

