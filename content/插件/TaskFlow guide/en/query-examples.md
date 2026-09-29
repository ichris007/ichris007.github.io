---
title:
aliases:
description:
draft:
publish: "true"
enableToc: "true"
tags:
cssclasses:
created: 2026-09-29 19:53
modified: 2026-09-30 00:20
socialImage:
socialDescription:
comments: "true"
permalink:
lang:
---

This page shows the Tasks-plugin query syntax that powers a group's tabs, and specifically
how the **note selector** scopes queries to a single note. It complements
[note-selector.md](note-selector.md).

## 0.1 What `query.file` actually is

`query.file` is a **Query Property** in the Tasks plugin — a *file object* that represents
the file the query runs in. It is **not** a standalone instruction. You use `query.file` in
one of two valid ways:

1. **Inside `filter by function`** (also custom sorting/grouping) — e.g.
   `filter by function task.file.path === query.file.path`.
2. **As a `{{...}}` placeholder** inside a normal instruction — e.g.
   `filename includes {{query.file.filename}}`.

> Version notes: `{{query.file.*}}` placeholders need **Tasks ≥ 4.7.0**. Using
> `query.file.*` directly inside `filter by function` (without `{{ }}`/quotes) needs
> **Tasks ≥ 5.1.0**.

## 0.2 How TaskFlow makes it point at the selected note

TaskFlow renders each tab's query through the Tasks plugin, passing the **currently selected
note's path** as the query's *source file* (`sourcePath` — the 4th argument of Obsidian's
`MarkdownRenderer.render`). Tasks treats that file as "the file containing the query", so
every `query.file` / `{{query.file.*}}` reference resolves to the note you picked in the
dropdown. Write the query once, and it re-scopes to whatever note is selected.

> This only works inside a group that has a **Note selector property** set **and** a note
> actually selected. Otherwise TaskFlow passes an empty `sourcePath`, and `query.file` has
> nothing to bind to. So set the **Note selector property** first, then pick a note.

## 0.3 The scoping forms at a glance

| Form | Behavior | Notes |
| --- | --- | --- |
| `filter by function task.file.path === query.file.path` | Exact match: only tasks whose file **is** the selected note. | **Recommended.** Needs Tasks ≥ 5.1.0. |
| `filter by function task.file.path === '{{query.file.path}}'` | Same, via placeholder. | Works on Tasks ≥ 4.7.0 (quote the placeholder). |
| `filename includes {{query.file.filename}}` | Substring match on the file name. | Simplest; may also match longer file names, so prefer the path form when names overlap. |
| `query.file` on its own line | ❌ Invalid — Tasks errors out. | This was the original bug in this doc. |

## 0.4 Example 1 — Simplest: tasks inside the selected note

```tasks
not done
filter by function task.file.path === query.file.path
sort by due
```

Only the selected note's incomplete tasks, sorted by due date.

> Broadly-compatible alternative (Tasks ≥ 4.7.0): replace the `filter by function` line with
> `filename includes {{query.file.filename}}`. It is a *substring* match, so an exact
> path-equality filter is safer when note names overlap.

## 0.5 Example 2 — Compact grouped view with a cap

```tasks
not done
filter by function task.file.path === query.file.path
short mode
group by filename
limit 10
```

- `filter by function task.file.path === query.file.path` — restrict to the selected note.
- `short mode` — compact task rendering.
- `group by filename` — one section per file (here, just the selected note).
- `limit 10` — at most 10 tasks. (If the group also has a **Limit** set, that value is
  appended last and overrides this — see [task-limit.md](task-limit.md).)

## 0.6 Example 3 — Advanced: relate tasks to the selected note

The `filter by function` below keeps a task if it is *about* the selected note in any of
several ways: it lives under a heading that shares the note's name, it links to the note
(outgoing or inside frontmatter), or its own file name contains the note's name.

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

What each clause does:

- `task.heading && task.heading.toLowerCase().includes(query.file.filenameWithoutExtension)` —
  keep tasks whose heading shares the selected note's name (e.g. a `## Project Alpha` section
  in any note).
- `task.outlinks.some(link => link.linksTo(query.file))` — keep tasks that **link to** the
  selected note.
- `task.file.outlinksInProperties.some(link => link.linksTo(query.file))` — same, but for links
  stored in the task's frontmatter/properties.
- `task.file.filename.toLowerCase().includes(query.file.filenameWithoutExtension)` — keep tasks
  whose own file name contains the selected note's name.

> This example uses `query.file` **inside `filter by function`**, which is valid. Note it needs
> **Tasks ≥ 7.21.0** for `task.outlinks` / `task.file.outlinksInProperties` / `query.file.outlinks`.
>
> In the tab editor, write the `filter by function` expression either as a **single line**, or
> with the backslashes shown above for wrapping.

## 0.7 Example 4 — Advanced: due-soon tasks related to the selected note

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

## 0.8 Tips

- You can combine the scoping filter with any normal Tasks filters (`not done`,
  `priority is high`, `happens`, `tags includes #bug`, etc.).
- Because the query text is identical for every note, switching notes in the dropdown simply
  re-runs the same query against the new note — no editing required.
- Pair these queries with the sample notes in
  [sample-notes/](./sample-notes/) to try the examples end to end.
