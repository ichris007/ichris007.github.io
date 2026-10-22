---
title:
aliases:
description:
draft:
publish: "true"
enableToc: "true"
tags:
cssclasses:
created: 2026-09-29 19:46
modified: 2026-09-30 01:38
socialImage:
socialDescription:
comments: "true"
permalink:
lang:
---



# 1 Sample notes for the demo

Drop these notes into an Obsidian vault (any folder) to demonstrate the **note selector**,
the **Property values** filter, and — with the last note — the **`link` frontmatter property**
plus **wikilinks inside task descriptions**. They use a `project` frontmatter property plus
Tasks-plugin task syntax, so they pair directly with the walkthrough in `../README.md` and the
advanced query in `../query-examples.md` (Example 3).

## 1.1 What each note demonstrates

| File | `project` value | Purpose in the demo |
| --- | --- | --- |
| `Project Alpha - Planning.md` | `alpha` | One of two `alpha` notes → shows the dropdown can list several notes. |
| `Project Alpha - Backlog.md` | `alpha` | Second `alpha` note. |
| `Project Beta - Launch.md` | `beta` | A different value, to show filtering by `Property values`. |
| `Project Gamma - Research.md` | `gamma` | A third value, excluded unless selected. |
| `Project Cross - Alpha & Beta.md` | `[alpha, beta]` | Multi-value property → matches when *either* value is selected. |
| `Project Delta - Linked.md` | `delta` | Demonstrates the **`link` property** (note frontmatter) and **wikilinks in task descriptions** — tasks here surface when *Project Alpha - Planning* is selected via Example 3's clauses ③ and ②. |

### 1.1.1 `Project Delta - Linked.md` — `link` property + wikilinks (advanced)

This note exists to show Example 3 (the advanced `filter by function`) pulling in tasks that
merely *relate* to the selected note, instead of living in it. Set the group's **Note selector
property** to `project`, pick **Project Alpha - Planning** in the dropdown, and use **Example 3**
as the tab query. Two mechanisms make Delta's tasks appear:

- **`link` frontmatter property → clause ③.** The note's YAML has
  `link: "[[Project Alpha - Planning]]"`. Tasks reads that as an outlink stored in the file's
  *properties*, so every task in this note satisfies
  `task.file.outlinksInProperties.some(link => link.linksTo(query.file))` — even though the task
  text never names Alpha.
- **Wikilink in the description → clause ②.** Tasks whose text contains
  `[[Project Alpha - Planning]]` satisfy `task.outlinks.some(link => link.linksTo(query.file))`.

> The property value must be a real wikilink (`[[...]]`), not bare text — only then does Tasks
> treat it as an outlink. Any property name works; the note uses `link` to mirror the clause
> name.

(An optional `Scratch - No Project.md` with **no** `project` key would be excluded from the
dropdown — left out here, but easy to add if you want to show the empty-result case.)

## 1.2 Demo setup (recap)

1. Edit a group → set **Note selector property** = `project`.
2. (Optional) Set **Property values** to `alpha` (or `alpha, beta`) to narrow the list.
3. Save. The view now shows a note dropdown.
4. Create a tab whose query is something like:

   ````markdown
   ```tasks
   not done
   filter by function task.file.path === query.file.path
   sort by due
   ```
   ````

   Here `query.file` resolves to the **selected note** (the view passes the note path as the
   render source), so each tab shows only that note's tasks. Note that `query.file` is a Tasks
   *Query Property*, not a standalone instruction — a bare `query.file` line makes Tasks error
   out, so always use it inside `filter by function` (as above) or as a placeholder like
   `filename includes {{query.file.filename}}`.
   More copy-paste examples (including an advanced `filter by function`) are in
   [../query-examples.md](../query-examples.md).
5. Open the dropdown, pick a note → every tab reloads for that note.
6. Set a **Limit** (group config or the on-view box) to cap the results.
7. **Link property + wikilinks demo.** Pick **Project Alpha - Planning** in the dropdown and
   switch the tab query to **Example 3** from `../query-examples.md`. Tasks from
   `Project Delta - Linked.md` now appear via clause ③ (its `link` frontmatter property) and
   clause ② (the `[[Project Alpha - Planning]]` wikilinks in their descriptions) — without
   Delta ever being the selected note.

## 1.3 Notes on the frontmatter

- The property name is matched case-insensitively, so `Project` would also work.
- A single value (`project: alpha`) and a YAML list (`project: [alpha, beta]`) are both
  accepted; a note matches if **any** of its values is in the selected set (or if no values
  are selected, any non-empty value matches).
