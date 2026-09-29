---
title:
aliases:
description:
draft:
publish: "true"
enableToc: "true"
tags:
cssclasses:
created: 2026-09-29 22:50
modified: 2026-09-30 01:40
socialImage:
socialDescription:
comments: "true"
permalink:
lang:
---



# 1 演示用样例笔记

把这几篇笔记放进任意 Obsidian 仓库（任何文件夹都行），即可演示**笔记选择器**、
**属性值筛选**，以及（最后一篇）**`link` frontmatter 属性**和**任务描述里的双链**。
它们都使用 `project` 这个 frontmatter 属性加上 Tasks 插件的任务语法，因此可以直接配合
`../增强分组功能使用说明.md` 的演示流程，以及 `../Tasks 查询示例.md` 的进阶查询（示例 3）使用。

## 1.1 每篇笔记演示什么

| 文件 | `project` 值 | 在演示中的作用 |
| --- | --- | --- |
| `Project Alpha - Planning.md` | `alpha` | 两篇 `alpha` 笔记之一 → 演示下拉框可以列出多篇笔记。 |
| `Project Alpha - Backlog.md` | `alpha` | 第二篇 `alpha` 笔记。 |
| `Project Beta - Launch.md` | `beta` | 一个不同的值，用来演示按「属性值」过滤。 |
| `Project Gamma - Research.md` | `gamma` | 第三个值，未选中时会被排除。 |
| `Project Cross - Alpha & Beta.md` | `[alpha, beta]` | 多值属性 → 只要选中的是其中*任一*值就会匹配。 |
| `Project Delta - Linked.md` | `delta` | 演示 **`link` 属性**（笔记 frontmatter）以及**任务描述里的双链**——当通过示例 3 的子句 ③ 和 ② 选中 *Project Alpha - Planning* 时，这里的任务会浮现出来。 |

### 1.1.1 `Project Delta - Linked.md` —— `link` 属性 + 双链（进阶）

这篇笔记用来展示示例 3（进阶的 `filter by function`）把*仅仅与选中笔记相关*、
而不住在它里面的任务也拉进来。把分组的**笔记筛选属性**设为 `project`，在下拉框里选
**Project Alpha - Planning**，并把标签页查询换成**示例 3**。Delta 的任务之所以会出现，靠
两个机制：

- **`link` frontmatter 属性 → 子句 ③。** 笔记的 YAML 里写有
  `link: "[[Project Alpha - Planning]]"`。Tasks 把它读成存放在文件*属性*里的外链，于是本笔记
  里的每条任务都满足
  `task.file.outlinksInProperties.some(link => link.linksTo(query.file))` —— 即使任务正文
  从未提到 Alpha。
- **描述里的双链 → 子句 ②。** 正文中包含 `[[Project Alpha - Planning]]` 的任务，满足
  `task.outlinks.some(link => link.linksTo(query.file))`。

> 属性值必须是真正的双链（`[[...]]`），而不是纯文本——只有这样 Tasks 才会把它当作外链。
> 任何属性名都可以；这篇笔记用 `link` 是为了和子句名对应。

（可选：一篇**不带** `project` 键的 `Scratch - No Project.md` 会被排除在下拉框之外——
这里没放，如果你想演示「空结果」的情形，随时可以加。）

## 1.2 演示设置（回顾）

1. 编辑一个分组 → 把**笔记筛选属性**设为 `project`。
2. （可选）把**属性值**设为 `alpha`（或 `alpha, beta`）来收窄列表。
3. 保存。视图现在会出现一个笔记下拉框。
4. 新建一个标签页，查询写成类似这样：

   ````markdown
   ```tasks
   not done
   filter by function task.file.path === query.file.path
   sort by due
   ```
   ````

   这里的 `query.file` 会解析为**选中的笔记**（视图把笔记路径作为渲染源），所以每个标签页
   只显示那篇笔记的任务。注意 `query.file` 是 Tasks 的*查询属性*（Query Property），不是一条
   可以独立成行的指令——单独写一行 `query.file` 会让 Tasks 报错，因此一定要写在
   `filter by function` 里面（如上），或者用作 `filename includes {{query.file.filename}}`
   这样的占位符。更多可复制的示例（含进阶 `filter by function`）见
   [../Tasks 查询示例.md](../Tasks%20查询示例.md)。
5. 打开下拉框，选一篇笔记 → 每个标签页都为该笔记重新加载。
6. 设一个**上限**（分组配置里或视图内的框）来限制结果数量。
7. **link 属性 + 双链演示。** 在下拉框里选 **Project Alpha - Planning**，并把标签页查询
   切换成 `../Tasks 查询示例.md` 里的**示例 3**。来自 `Project Delta - Linked.md` 的任务现在会
   通过子句 ③（它的 `link` frontmatter 属性）和子句 ②（描述里的
   `[[Project Alpha - Planning]]` 双链）浮现出来——而 Delta 本身从来不是被选中的笔记。

## 1.3 frontmatter 说明

- 属性名匹配时**大小写不敏感**，所以 `Project` 也能用。
- 单个值（`project: alpha`）和 YAML 列表（`project: [alpha, beta]`）都接受；只要笔记的
  值里有**任一**落在选中集合里就匹配（如果没选任何值，则任何非空值都匹配）。
