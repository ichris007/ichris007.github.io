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

The **group edit modal** (Settings → Groups → Edit) gained three new controls that work together
to scope a group to a set of notes and cap its output on the front-end.

```
ID
Name / label
Icon / icon
Note selector property / 笔记筛选属性   ← new
Property values / 属性值筛选            ← new (multi-select, with search)
Limit / 上限                           ← new
```

## 0.1 Note selector property

- **Label:** "Note selector property"
- **Description (EN):** *"When set, this group shows a dropdown of notes matching this
  frontmatter property. The task query will use the selected note as `query.file`."*
- **Example placeholder:** `project`
- When set (non-empty), the group gets a [note selector](note-selector.md) on the view.
- **Changing this property clears the previously chosen Property values**, because the
  eligible values now come from a different frontmatter key.

## 0.2 Property values

- **Label:** "Property values"
- **Description (EN):** *"Only show notes whose property contains one of the selected values.
  Leave empty to match any non-empty value."*
- A **multi-select** list. Each value has a checkbox; the summary line shows the selected
  values, or *"Any non-empty value"* when nothing is ticked.
- **Search box:** when the value list is long, a search field at the top filters the options
  live as you type (non-matching items are hidden, not removed).
- If the property has no values anywhere in the vault, the list shows *"No notes use this
  property"*.
- Previously saved values remain visible even if no current note uses them, so a configured
  value is never lost after a refactor.

## 0.3 Limit

- **Label:** "Limit"
- **Description (EN):** *"Maximum number of tasks per query in this group (empty uses the
  query's own limit)."*
- A number. When set, it is appended as `limit N` to **every tab's query** in the group,
  overriding any `limit` already written inside those queries. See [task-limit.md](task-limit.md).

## 0.4 Demo steps

1. Edit a group → set **Note selector property** to `project` (`project` is an existing
   property item name).
2. Open **Property values**, type in the search box to find a value and tick it.
   (The values here are the property's values.)
3. Set **Limit** to `5`.
4. Save and watch the board: the note dropdown appears, and every tab in the group is capped
   at 5 tasks.
