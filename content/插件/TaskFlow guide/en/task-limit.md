---
title:
aliases:
description:
draft:
publish: "true"
enableToc: "true"
tags:
cssclasses:
created: 2026-09-29 19:43
modified: 2026-09-30 00:20
socialImage:
socialDescription:
comments: "true"
permalink:
lang:
---


TaskFlow lets you cap how many tasks a group displays. There are two ways to set the cap; both
write to the same underlying value on the group.

## 0.1 A. Group-level limit (always effective)

- Configured in the group edit modal via the **Limit** field (see
  [group-configuration.md](group-configuration.md)).
- Stored on the group as `taskLimit`.
- **Overrides each tab's own `limit`:** when rendering, TaskFlow appends `limit N` to the end
  of every tab's query text. Because it is the last directive, it wins over any `limit` already
  inside the query.
  - Example: a tab query says `limit 20`, the group limit is `5` → the group shows 5 tasks.
- This is the recommended way to enforce a consistent cap across a whole group.

## 0.2 B. On-view limit box (optional, off by default)

- **Setting:** *"Show the task-limit box on the view"* (plugin settings).
- **Description (EN):** *"When a group has a task limit, whether to show an editable limit
  box at the top of the view. Off by default; the limit from the group config still applies."*
- When enabled, groups that have a limit show an editable **Limit** input at the top of the
  view.
- Editing it updates the group's limit **live** — the tasks re-render immediately — and the
  value is saved.
- When disabled, the limit still applies (from the group config); the box is simply hidden.

## 0.3 Why two controls?

The group-config field is the source of truth and always works. The on-view box is a
convenience for quickly tuning the cap while looking at the tasks, without opening the group
modal. They edit the same number.

## 0.4 Demo steps

1. In a group config, set **Limit** to `5`. The group is now capped at 5 tasks everywhere.
2. (Optional) Enable **Show the task-limit box on the view** in settings.
3. On the board, change the number in the top **Limit** box to `10` — tasks re-render at once.
4. Open any tab whose query had `limit 20`; confirm the group limit (`10`) still wins.
