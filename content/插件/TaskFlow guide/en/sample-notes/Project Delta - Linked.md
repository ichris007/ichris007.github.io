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
created: 2026-09-29 20:19
modified: 2026-09-30 00:09
socialImage:
socialDescription:
comments: "true"
permalink:
lang:
---



# 1 Project Delta — Linked Tasks

This note demonstrates the **advanced** note-selector query (Example 3 in
[../query-examples.md](../query-examples.md)) pulling in tasks that *relate* to the selected
note **without living in it**:

- The `link` frontmatter property points to [[Project Alpha - Planning]], so every task here
  satisfies **clause ③** (`task.file.outlinksInProperties` — a link stored in the note's
  *properties*).
- Several tasks below also contain a `[[Project Alpha - Planning]]` wikilink in their
  description, satisfying **clause ②** (`task.outlinks` — a link inside the *task text*).

To see this in action: set the group's **Note selector property** to `project`, open the
dropdown, pick **Project Alpha - Planning**, and switch the tab query to **Example 3**. The
tasks below will appear even though they live in *this* note, because they link to Alpha
Planning.

## 1.1 Via the `link` frontmatter property (clause ③)

Because the whole note's `link` property points at Alpha Planning, these tasks match even
though their text never names Alpha:

- [ ] Adopt the Alpha Planning spec into Delta 🔼 📅 2026-10-02
- [ ] Schedule the Delta ↔ Alpha sync ⏫ 📅 2026-10-07

## 1.2 Via a wikilink in the description (clause ②)

These tasks name [[Project Alpha - Planning]] directly in their text:

- [ ] Reuse the Alpha Planning kickoff notes [[Project Alpha - Planning]] 🔼 📅 2026-10-04
- [x] Quote the Alpha Planning milestone in the Delta brief [[Project Alpha - Planning]] ✅ 2026-09-22
