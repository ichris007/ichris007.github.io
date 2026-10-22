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

| Feature | Short description |
| --- | --- |
| [Note selector](note-selector.md) | A per-group dropdown that points the group's Tasks queries at a single chosen note (Tasks `query.file`). |
| [Group configuration](group-configuration.md) | The group edit modal adds three fields: *Note selector property*, *Property values* (with search), and *Limit*. |
| [Task limit](task-limit.md) | A group-level task cap that overrides each tab's own `limit`; plus an optional on-view limit box. |

## 0.1 Mental model

TaskFlow organises tasks into **groups** (primary tabs) and **tabs** (secondary tabs). Each tab holds a Tasks plugin query. The new features let you:

1. **Scope a whole group to one note** — pick a note from a dropdown and every tab in that group queries only that note (`query.file`).
2. **Filter which notes are eligible** — restrict the dropdown to notes whose frontmatter property value is in the set of selected **Property values** (configured in group configuration).
3. **Cap how many tasks each group shows** — a single limit applied to every tab in the group, overriding the `limit` written inside each tab's query.

## 0.2 5-minute demo walkthrough

1. Open the board settings and edit a group.
2. Set **Note selector property** to a frontmatter key you use, e.g. `project` (an existing property item in your notes).
3. (Optional) In **Property values**, tick one or two values and watch the search box filter a long list.
4. Save. Then, in the **Tabs** settings, add tabs with task queries (see [Tasks query examples](query-examples.md)). Back on the board, a **note dropdown** appears under the group's primary tab.
5. Click the dropdown, type to filter, and pick a note — the tasks in every tab reload for that note.
6. Back in the group config, set **Limit** to `5`. Every tab in the group now shows at most 5 tasks, even if its query says `limit 20`.
7. (Optional) Enable **Show the task-limit box on the view** in plugin settings; the limit becomes editable directly at the top of the view.

For details on each feature, see the corresponding docs:
- [Group configuration](group-configuration.md)
- [Tasks query examples](query-examples.md)
- [Note selector](note-selector.md)
- [Task limit](task-limit.md)

## 0.3 Demo assets

- [Tasks query examples](query-examples.md) — `query.file` syntax with copy-paste examples (including the advanced `filter by function`), so users see how to scope a tab to the selected note.
- [Sample notes](./sample-notes/) — six demo notes with a `project` frontmatter property and Tasks-format tasks, ready to drop into a vault.
