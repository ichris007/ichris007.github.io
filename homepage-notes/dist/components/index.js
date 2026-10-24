import { h } from "preact"
import { classNames } from "@quartz-community/utils/lang"
import { resolveRelative, isFolderPath } from "@quartz-community/utils/path"

// 以下三个工具函数原引自 @quartz-community/recent-notes；
// 侧栏 recent-notes 已按用户要求关闭，为避免依赖被禁用的插件，此处内联等价实现
const filterListedPages = (pages) => pages.filter((p) => p.unlisted !== true)
const isTagPageSlug = (slug) => {
  if (!slug) return false
  return slug === "tags" || slug === "tags/index" || slug.startsWith("tags/")
}
const isFolderPageSlug = (slug) => {
  if (!slug) return false
  return isFolderPath(slug)
}

const defaultOptions = {
  title: "最近更新",
  limit: 8,
  newDays: 30,
  showMoreLink: true,
}

function fmtDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

const HomepageNotes = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }

  const HomepageNotesComponent = ({ fileData, allFiles, displayClass }) => {
    if (fileData.slug !== "index") return null

    const now = new Date()
    const pages = filterListedPages(allFiles)
      .filter((p) => !isTagPageSlug(p.slug) && !isFolderPageSlug(p.slug) && p.slug !== "index")
      .filter((p) => p.dates?.modified)
      .sort((a, b) => b.dates.modified.getTime() - a.dates.modified.getTime())
      .slice(0, opts.limit)

    const rows = pages.map((p) => {
      const created = p.dates?.created
      const modified = p.dates.modified
      const ageDays = created ? (now.getTime() - created.getTime()) / 86400000 : Infinity
      const updatedDays = created ? (modified.getTime() - created.getTime()) / 86400000 : 0
      const badge = ageDays <= opts.newDays ? "new" : updatedDays >= 1 ? "upd" : null

      return h("li", {
        class: "homepage-note",
        children: [
          h("a", {
            class: "homepage-note-title",
            href: resolveRelative(fileData.slug, p.slug),
            children: p.frontmatter?.title ?? "Untitled",
          }),
          h("span", {
            class: "homepage-note-meta",
            children: [
              badge === "new"
                ? h("span", { class: "homepage-badge homepage-badge-new", children: "新" })
                : badge === "upd"
                  ? h("span", { class: "homepage-badge homepage-badge-upd", children: "更新" })
                  : null,
              h("time", { datetime: modified.toISOString(), children: fmtDate(modified) }),
            ],
          }),
        ],
      })
    })

    return h("div", {
      class: classNames(displayClass, "homepage-notes"),
      children: [
        h("h2", { children: opts.title }),
        h("ul", { class: "homepage-notes-list", children: rows }),
        opts.showMoreLink
          ? h("p", {
              class: "homepage-notes-more",
              children: h("a", {
                href: resolveRelative(fileData.slug, "tags"),
                children: "查看全部笔记 →",
              }),
            })
          : null,
      ],
    })
  }

  HomepageNotesComponent.css = `
.homepage-notes {
  margin: 3rem 0 1rem 0;
}
.homepage-notes > h2 {
  font-size: 1.3rem;
  margin: 0 0 1rem 0;
}
.homepage-notes-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.homepage-note {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.55rem 0;
  border-bottom: 0.5px solid var(--lightgray);
}
.homepage-note:last-child {
  border-bottom: none;
}
.homepage-note-title {
  color: var(--dark);
  text-decoration: none;
  font-size: 0.95rem;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.homepage-note-title:hover {
  color: var(--secondary);
}
.homepage-note-meta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  flex-shrink: 0;
  font-size: 0.8rem;
  color: var(--darkgray);
}
.homepage-badge {
  display: inline-block;
  padding: 0.05rem 0.5rem;
  border-radius: 99px;
  font-size: 0.7rem;
  line-height: 1.5;
}
.homepage-badge-new {
  background: #EAF3DE;
  color: #27500A;
  border: 0.5px solid #97C459;
}
.homepage-badge-upd {
  background: #FAEEDA;
  color: #633806;
  border: 0.5px solid #EF9F27;
}
.homepage-notes-more {
  margin: 0.75rem 0 0 0;
  font-size: 0.85rem;
}
.homepage-notes-more a {
  color: var(--secondary);
  text-decoration: none;
}
.homepage-notes-more a:hover {
  text-decoration: underline;
}
`

  return HomepageNotesComponent
}

export { HomepageNotes }
