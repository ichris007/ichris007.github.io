---
project: delta
link: "[[Project Alpha - Planning]]"
title:
aliases:
description:
draft:
publish: "true"
enableToc: "true"
tags:
cssclasses:
created: 2026-09-29 22:51
modified: 2026-09-30 00:19
socialImage:
socialDescription:
comments: "true"
permalink:
lang:
---



# 1 Project Delta — Linked

这篇笔记演示**进阶**的笔记选择器查询（`../Tasks 查询示例.md` 中的示例 3）如何把*与选中笔记
相关*、却不住在它里面的任务也拉进来：

- `link` frontmatter 属性指向 [[Project Alpha - Planning]]，所以这里的每条任务都满足
  **子句 ③**（`task.file.outlinksInProperties` —— 存放在笔记*属性*里的链接）。
- 下面有几条任务的描述里也含有 `[[Project Alpha - Planning]]` 双链，从而满足
  **子句 ②**（`task.outlinks` —— 存放在*任务正文*里的链接）。

想看实际效果：把分组的**笔记筛选属性**设为 `project`，打开下拉框，选 **Project Alpha -
Planning**，再把标签页查询切换成**示例 3**。下面这些任务会出现，尽管它们住在本笔记里——因为
它们都链接到了 Alpha Planning。

## 1.1 通过 `link` frontmatter 属性（子句 ③）

因为整篇笔记的 `link` 属性都指向 Alpha Planning，这些任务即便正文从未提到 Alpha 也能匹配：

- [ ] 将 Alpha Planning 规范引入 Delta 🔼 📅 2026-10-02
- [ ] 安排 Delta ↔ Alpha 同步会议 ⏫ 📅 2026-10-07

## 1.2 通过描述里的双链（子句 ②）

这些任务在正文中直接写明 [[Project Alpha - Planning]]：

- [ ] 复用 Alpha Planning 启动会纪要 [[Project Alpha - Planning]] 🔼 📅 2026-10-04
- [x] 在 Delta 简报中引用 Alpha Planning 里程碑 [[Project Alpha - Planning]] ✅ 2026-09-22
