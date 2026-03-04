# 原型追踪一致性审计报告

- 时间: 2026-02-25 12:11:41
- 审计对象: manifest、预览映射、需求追踪矩阵

## 核心统计
- manifest prototype 数量: **66**
- manifest 唯一 route 数量: **66**
- manifest 唯一 path 数量: **66**
- 追踪矩阵引用节点数量: **92**
- manifest 节点与矩阵交集数量: **66**
- 预览缺失数量: **0**

## 审计结论
- route 重复: **0**
- path 重复: **0**
- 矩阵引用但不在 manifest 导出范围的节点: **26**
- manifest 导出节点但未在矩阵引用的节点: **0**

### 矩阵引用但不在 manifest 导出范围（用于说明：目标态/扩展态页面）
- `1ISD7`
- `1ftLo`
- `4M0zx`
- `9lsym`
- `CN85I`
- `DqDxJ`
- `EaZHT`
- `LCu0c`
- `MqiFK`
- `NAQSD`
- `Onzo0`
- `RJqNj`
- `ReuoM`
- `SjjnF`
- `Tekay`
- `UDipb`
- `Z0Xx0`
- `ajwcM`
- `iTgm0`
- `jf4Li`
- `n9jqt`
- `ox1Pe`
- `r0yUw`
- `vzkFw`
- `yUr4x`
- `zoSer`

### manifest 导出但未在矩阵引用（需要补追踪）
- 无

## 建议动作
1. 若后续新增导出页面，需同步补充到矩阵对应需求行。
2. 对“矩阵引用但不在 manifest 导出范围”的节点标注为目标态或草图态。
3. 持续使用 `preview-node-map.json` 作为导出态唯一映射源。
