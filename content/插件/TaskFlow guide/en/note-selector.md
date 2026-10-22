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

## 0.1 What it does

For a group that has a **Note selector property** configured, the view shows a note picker
directly under the group's primary tab. Selecting a note makes **every tab in that group**
run its Tasks query against that note — i.e. the note becomes the `query.file` target of the
query.

This is useful when a group's queries are written as `query.file` + filters and you want to
switch the target note without editing each query.

For example:
- You have 10 project notes, each with many tasks inside it or in other notes linked to this project;
- In the **Tabs** settings you configure task-query categories and query syntax for the project,
  such as todo, waiting, in-progress, done, etc.;
- By configuring an **enhanced group configuration** in the group, you can click a project note in
  the front-end **note selector** to filter and view each project's tasks individually — without
  creating 10 project groups in the group config and repeating the same **Tabs** for each.

## 0.2 How to enable

1. Edit a group (board settings → edit group).
2. Set **Note selector property** (e.g. `project`). See [group-configuration.md](group-configuration.md).
3. Save. The selector only appears for groups that have this property set.

## 0.3 How to use (demo steps)

1. Click the note box (shows the currently selected note, or *"Select {group} note"*).
2. A panel opens with a **search box** and a **list of matching notes**.
   - Matching = notes whose frontmatter property (the *Note selector property*) has a value
     accepted by the group's **Property values** filter.
3. Type to filter the list (when there are many notes), then **click a note** to switch.
   - The whole group re-renders against the chosen note.
4. Click anywhere outside the panel, or just move the mouse away — the panel auto-closes.
   (It stays open while you hover over it or type in the search box.)

## 0.4 Behaviour notes

- **Empty state:** if no note matches the property/values filter, the box shows
  *"No notes use this property"* and the group shows its empty state rather than a broken query.
- **No persistence yet:** the selected note is held in memory for the current session.
  Reopening the vault falls back to the first matching note.
  (Whether to persist the last choice in settings is still to be decided.)
- **Point-select first:** the panel is designed for fast clicking; the search box only
  *assists* filtering — you never have to type to pick.

## 0.5 Tab query syntax (`query.file`)

The dropdown only picks *which note* the queries run against; the queries themselves live in
each tab and are passed verbatim to the Tasks plugin. The key is `query.file`, which TaskFlow
points at the **selected note**. Note that `query.file` is a Tasks **Query Property** (a file
object) — it is **not** a standalone instruction, so you must use it inside `filter by function`,
or via the `{{query.file.*}}` placeholders.

For ready-to-paste examples (a simple scoped query, a compact grouped view, the advanced
`filter by function` below, and a due-soon variant), see
[query-examples.md](query-examples.md).

```tasks
not done
filter by function task.file.path === query.file.path
sort by due
```

This is the minimal form: only the selected note's incomplete tasks, sorted by due date.
