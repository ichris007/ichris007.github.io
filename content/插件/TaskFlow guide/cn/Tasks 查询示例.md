---
title:
aliases:
description:
draft:
publish: "true"
enableToc: "true"
tags:
cssclasses:
created: 2026-09-29 21:33
modified: 2026-09-30 00:16
socialImage:
socialDescription:
comments: "true"
permalink:
lang:
---

本页展示驱动分组标签页的 Tasks 插件查询语法，尤其是 **笔记选择器** 如何把一个查询限定到单篇笔记。它与 [笔记选择器](笔记选择器.md) 互为补充。

## 0.1 `query.file` 到底是什么

`query.file` 是 Tasks 插件中的一个 **Query Property（查询属性）** —— 一个代表「查询所运行的文件」的 *文件对象*。它 **不是** 一条可独立成行的指令。你只能在以下两种合法方式之一中使用 `query.file`：

1. **在 `filter by function` 内部**（也适用于自定义排序/分组）—— 例如
   `filter by function task.file.path === query.file.path`。
2. **作为 `{{...}}` 占位符** 嵌入普通指令 —— 例如
   `filename includes {{query.file.filename}}`。

> 版本说明：`{{query.file.*}}` 占位符需要 **Tasks ≥ 4.7.0**。直接在 `filter by function` 中使用 `query.file.*`（不带 `{{ }}`/引号）需要 **Tasks ≥ 5.1.0**。

## 0.2 TaskFlow 如何让它指向选中的笔记

TaskFlow 通过 Tasks 插件渲染每个标签页的查询，把 **当前选中笔记的路径** 作为查询的 *源文件*（`sourcePath` —— Obsidian 的 `MarkdownRenderer.render` 第 4 个参数）传入。Tasks 把该文件视为「包含查询的文件」，于是每个 `query.file` / `{{query.file.*}}` 引用都解析为你在下拉框中选择的笔记。查询只写一次，便会随所选笔记重新限定范围。

> 这只在 **设置了笔记筛选属性** 且 **确实选中了某篇笔记** 的分组内才有效。否则 TaskFlow 会传入空的 `sourcePath`，`query.file` 就无从绑定。因此请先设置 **笔记筛选属性**，再选择笔记。

## 0.3 限定形式一览

| 形式                                                            | 行为                       | 说明                                |
| ------------------------------------------------------------- | ------------------------ | --------------------------------- |
| `filter by function task.file.path === query.file.path`       | 精确匹配：仅文件 **就是** 选中笔记的任务。 | **推荐。** 需 Tasks ≥ 5.1.0。          |
| `filter by function task.file.path === '{{query.file.path}}'` | 同上，经占位符。                 | 在 Tasks ≥ 4.7.0 可用（占位符需加引号）。      |
| `filename includes {{query.file.filename}}`                   | 对文件名做子串匹配。               | 最简单；也可能匹配更长的文件名，因此文件名有重叠时优先用路径形式。 |
| 单独一行的 `query.file`                                            | ❌ 无效 —— Tasks 报错。        | 这正是本文档最初犯过的错误。                    |

## 0.4 示例 1 — 最简：选中笔记内的任务

```tasks
not done
filter by function task.file.path === query.file.path
sort by due
```

仅显示选中笔记的未完成任务，按到期日排序。

> 兼容性更广的替代写法（Tasks ≥ 4.7.0）：把 `filter by function` 那行替换为
> `filename includes {{query.file.filename}}`。它是 *子串* 匹配，因此当笔记名有重叠时，用路径精确相等过滤更安全。

## 0.5 示例 2 — 带上限的紧凑分组视图

```tasks
not done
filter by function task.file.path === query.file.path
short mode
group by filename
limit 10
```

- `filter by function task.file.path === query.file.path` —— 限定到选中笔记。
- `short mode` —— 紧凑的任务渲染。
- `group by filename` —— 每个文件一个分区（这里即只是选中笔记）。
- `limit 10` —— 最多 10 条任务。（若分组也设了 **上限**，该值会在最后追加并覆盖此处 —— 见 [任务上限](任务上限.md)。）

## 0.6 示例 3 — 进阶：把任务关联到选中笔记

下面的 `filter by function` 会在任务以任一方式「匹配」选中笔记时保留它：它位于与笔记同名的标题下、它链接到该笔记（外链或在 frontmatter 内），或其自身文件名包含该笔记名。

```tasks
not done

filter by function (task.heading !== null && task.heading?.toLowerCase().includes(query.file.filenameWithoutExtension.toLowerCase())) || \
task.outlinks.some(link => link.linksTo(query.file)) || \
task.file.outlinksInProperties.some(link => link.linksTo(query.file)) || \
task.file.filename.toLowerCase().includes(query.file.filenameWithoutExtension.toLowerCase())

#short mode
show tree
group by filename
limit 10
```

各子句的作用：

- `task.heading && task.heading.toLowerCase().includes(query.file.filenameWithoutExtension)` ——
  与选中笔记同名的标题下的任务（例如任意笔记中的 `## Project Alpha` 小节下的任务）。
- `task.outlinks.some(link => link.linksTo(query.file))` ——  **链接到** 选中笔记的任务。
- `task.file.outlinksInProperties.some(link => link.linksTo(query.file))` —— 同上，但针对存储在任务所在笔记的 frontmatter/属性里的链接。
- `task.file.filename.toLowerCase().includes(query.file.filenameWithoutExtension)` —— 自身文件名包含选中笔记名的任务。

> 本例在 **`filter by function` 内部** 使用 `query.file`，这是合法的。注意它需要
> **Tasks ≥ 7.21.0** 以支持 `task.outlinks` / `task.file.outlinksInProperties` / `query.file.outlinks`。
>
> 在标签页编辑器中，将 `filter by function` 表达式写成 **单行**，或像上面使用反斜杠换行，均可生效。

## 0.7 示例 4 — 进阶：选中笔记中临近到期的任务

```tasks
not done
due before in 7 days

filter by function (task.heading !== null && task.heading?.toLowerCase().includes(query.file.filenameWithoutExtension.toLowerCase())) || \
task.outlinks.some(link => link.linksTo(query.file)) || \
task.file.outlinksInProperties.some(link => link.linksTo(query.file)) || \
task.file.filename.toLowerCase().includes(query.file.filenameWithoutExtension.toLowerCase())

short mode
group by due
limit 20
```

## 0.8 提示

- 你可以把限定过滤与任意普通 Tasks 过滤器组合（`not done`、`priority is high`、`happens`、`tags includes #bug` 等）。
- 因为每段查询对各篇笔记都完全相同，在下拉框切换笔记只是用新笔记重跑同一查询 —— 无需编辑。
- 把这些查询与 [示例笔记](../示例笔记/) 搭配，即可端到端地试跑各示例。
