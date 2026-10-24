import { h } from "preact"
import {
  formatDate,
  getAllSegmentPrefixes,
  getDate,
  htmlToJsx,
  isFolderPath,
  joinSegments,
  resolveRelative,
  simplifySlug,
} from "@quartz-community/utils"

/**
 * tag-listing —— 标签页类型插件
 *
 * 替代 @quartz-community/tag-page，列表样式对齐参考图：
 *   日期（左列） | 标题链接
 *                | 标签（标题下方一行纯文本，空格分隔）
 *   条目之间一条细分割线
 *
 * generate/match/标签收集/排序逻辑沿用 tag-page v1.0.0 的等价实现，
 * 行为（虚拟标签页、tags/index 总览、层级标签前缀）保持一致，仅替换列表呈现。
 */

const defaultOptions = {
  numPages: 10,
  prefixTags: true,
  showCount: true,
  showTags: true,
  tagPrefix: "",
}

// ---------- 页面收集与排序（沿用 tag-page 实现） ----------

function isListed(file) {
  return file.unlisted !== true
}

function pagesWithTag(allFiles, tag) {
  return allFiles
    .filter(isListed)
    .filter((file) => (file.frontmatter?.tags ?? []).flatMap(getAllSegmentPrefixes).includes(tag))
}

// 与 tag-page 的 PageList 默认排序一致：文件夹优先 → 日期倒序 → 标题
function sortPages(f1, f2) {
  const f1IsFolder = isFolderPath(f1.slug ?? "")
  const f2IsFolder = isFolderPath(f2.slug ?? "")
  if (f1IsFolder && !f2IsFolder) return -1
  if (!f1IsFolder && f2IsFolder) return 1
  if (f1.dates && f2.dates) {
    return (getDate(f2)?.getTime() ?? 0) - (getDate(f1)?.getTime() ?? 0)
  } else if (f1.dates && !f2.dates) {
    return -1
  } else if (!f1.dates && f2.dates) {
    return 1
  }
  const f1Title = f1.frontmatter?.title?.toLowerCase() ?? ""
  const f2Title = f2.frontmatter?.title?.toLowerCase() ?? ""
  return f1Title.localeCompare(f2Title)
}

// ---------- 文案（与站内 zh-CN i18n 保持一致） ----------

function isZh(locale) {
  return (locale ?? "zh-CN").toLowerCase().startsWith("zh")
}

function tagWord(locale) {
  return isZh(locale) ? "标签" : "Tag"
}

function tagIndexTitle(locale) {
  return isZh(locale) ? "标签索引" : "Tag Index"
}

function itemsUnderTagMessage(count, locale) {
  if (isZh(locale)) {
    return `此标签下有${count}条笔记。`
  }
  return count === 1 ? "1 item with this tag." : `${count} items with this tag.`
}

function totalTagsMessage(count, locale) {
  if (isZh(locale)) {
    return `总共有${count}个标签。`
  }
  return count === 1 ? "Total 1 tag." : `Total ${count} tags.`
}

function showingFirstMessage(count, locale) {
  if (isZh(locale)) {
    return `显示前${count}个标签。`
  }
  return `Showing first ${count}.`
}

// ---------- 列表组件 ----------

const TagListing = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }

  const TagListingComponent = (props) => {
    const { tree, fileData, allFiles, cfg } = props
    const fd = fileData
    const slug = fd?.slug
    const locale = cfg?.locale ?? "zh-CN"
    if (!(typeof slug === "string" && (slug.startsWith("tags/") || slug === "tags"))) {
      throw new Error(`Component "TagListing" tried to render a non-tag page: ${slug}`)
    }
    const tag = simplifySlug(slug.slice("tags/".length))

    // 页面自身内容（content/tags/<tag>.md 存在时渲染，虚拟页回退到 description）
    const hastRoot = tree
    const content =
      hastRoot && hastRoot.children && hastRoot.children.length > 0
        ? htmlToJsx(hastRoot)
        : fd?.description

    const cssClasses = fd?.frontmatter?.cssclasses ?? []
    const classes = cssClasses.join(" ")

    const renderItem = (page) => {
      const date = getDate(page)
      const title = page.frontmatter?.title ?? "Untitled"
      const tags = page.frontmatter?.tags ?? []

      return h("li", {
        class: "tag-listing-item",
        children: [
          h("div", {
            class: "tag-listing-date",
            children: date
              ? h("time", {
                  datetime: date.toISOString(),
                  children: formatDate(date, locale),
                })
              : null,
          }),
          h("div", {
            class: "tag-listing-body",
            children: [
              h("h3", {
                class: "tag-listing-title",
                children: h("a", {
                  href: resolveRelative(slug, page.slug),
                  class: "internal",
                  children: title,
                }),
              }),
              opts.showTags && tags.length > 0
                ? h("ul", {
                    class: "tag-listing-tags",
                    children: tags.map((t) =>
                      h("li", {
                        children: h("a", {
                          // 只用 internal，不挂 tag-link：
                          // 站内既有样式 a.internal.tag-link 会加 pill 背景和 "#" 前缀
                          // （那是笔记页底部标签芯片的样式），参考图要的是纯文本标签
                          class: "internal",
                          href: resolveRelative(slug, joinSegments("tags", t)),
                          children: `${opts.tagPrefix}${t}`,
                        }),
                      }),
                    ),
                  })
                : null,
            ],
          }),
        ],
      })
    }

    const renderList = (pages, limit) => {
      const list = [...pages].sort(sortPages)
      const visible = limit ? list.slice(0, limit) : list
      return h("ul", {
        class: "tag-listing-list",
        children: visible.map(renderItem),
      })
    }

    if (tag === "/") {
      // tags/index —— 所有标签总览（结构沿用 tag-page：每个标签一节）
      const tags = [
        ...new Set(
          allFiles
            .filter(isListed)
            .flatMap((data) => data.frontmatter?.tags ?? [])
            .flatMap(getAllSegmentPrefixes),
        ),
      ].sort((a, b) => a.localeCompare(b))

      return h("div", {
        class: "popover-hint",
        children: [
          h("article", {
            class: classes,
            children: h("div", {
              class: "markdown-preview-view markdown-rendered",
              children: content,
            }),
          }),
          h("p", {
            class: "tag-listing-count",
            children: totalTagsMessage(tags.length, locale),
          }),
          ...tags.map((t) => {
            const pages = pagesWithTag(allFiles, t)
            const contentPage = allFiles.find((file) => file.slug === joinSegments("tags", t))
            const root = contentPage?.filePath ? contentPage?.htmlAst : undefined
            const tagDesc =
              !root || root.children.length === 0 ? contentPage?.description : htmlToJsx(root)
            const overflow = pages.length > opts.numPages
            return h("section", {
              class: "tag-listing-group",
              children: [
                h("h2", {
                  class: "tag-listing-group-title",
                  children: h("a", {
                    class: "internal",
                    href: resolveRelative(slug, joinSegments("tags", t)),
                    children: t,
                  }),
                }),
                tagDesc ? h("p", { class: "tag-listing-desc", children: tagDesc }) : null,
                opts.showCount
                  ? h("p", {
                      class: "tag-listing-count",
                      children: [
                        itemsUnderTagMessage(pages.length, locale),
                        overflow ? ` ${showingFirstMessage(opts.numPages, locale)}` : "",
                      ],
                    })
                  : null,
                renderList(pages, opts.numPages),
              ],
            })
          }),
        ],
      })
    }

    // 单个标签页：显示全部条目（与 tag-page 一致，不截断）
    const pages = pagesWithTag(allFiles, tag)
    return h("div", {
      class: "popover-hint",
      children: [
        h("article", {
          class: classes,
          children: h("div", {
            class: "markdown-preview-view markdown-rendered",
            children: content,
          }),
        }),
        h("div", {
          class: "page-listing tag-listing",
          children: [
            opts.showCount
              ? h("p", {
                  class: "tag-listing-count",
                  children: itemsUnderTagMessage(pages.length, locale),
                })
              : null,
            renderList(pages),
          ],
        }),
      ],
    })
  }

  TagListingComponent.css = `
.tag-listing {
  margin-top: 1.25rem;
}

.tag-listing-count {
  margin: 0 0 1.1rem 0;
  color: var(--darkgray);
  font-size: 0.9rem;
}

.tag-listing-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.tag-listing-item {
  display: grid;
  grid-template-columns: fit-content(9em) minmax(0, 1fr);
  column-gap: 1.5rem;
  align-items: baseline;
  padding: 0.7rem 0;
}

/* 参考样式：条目之间一条细分割线 */
.tag-listing-item + .tag-listing-item {
  border-top: 1px solid var(--lightgray);
}

.tag-listing-date {
  color: var(--darkgray);
  font-size: 0.85rem;
  white-space: nowrap;
}

.tag-listing-body {
  min-width: 0;
}

.tag-listing-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.4;
}

.tag-listing-title a {
  color: var(--secondary);
  text-decoration: none;
}

.tag-listing-title a:hover {
  text-decoration: underline;
}

/* 参考样式：标题下方一行纯文本标签，空格分隔 */
.tag-listing-tags {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.15rem 1rem;
  margin: 0.3rem 0 0 0;
  padding: 0;
}

/* 覆盖 Quartz 核心 a.internal 的链接底色/圆角/内边距，标签保持纯文本 */
.tag-listing-tags a.internal {
  background-color: transparent;
  border-radius: 0;
  padding: 0;
}

.tag-listing-tags a {
  color: var(--darkgray);
  font-size: 0.82rem;
  line-height: 1.5;
  text-decoration: none;
}

.tag-listing-tags a:hover {
  color: var(--secondary);
  text-decoration: underline;
}

/* tags/index 总览：每个标签一节 */
.tag-listing-group {
  margin-bottom: 2.2rem;
}

.tag-listing-group-title {
  margin: 0 0 0.3rem 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.tag-listing-group-title a.internal {
  color: var(--secondary);
  text-decoration: none;
  /* 分组标题是章节标题而非行内链接，同样抹掉 a.internal 的链接底色 */
  background-color: transparent;
  border-radius: 0;
  padding: 0;
}

.tag-listing-group-title a:hover {
  text-decoration: underline;
}

.tag-listing-desc {
  margin: 0 0 0.6rem 0;
  color: var(--darkgray);
  font-size: 0.92rem;
}

@media all and (max-width: 600px) {
  .tag-listing-item {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 0.15rem;
  }
}
`

  return TagListingComponent
}

// ---------- pageType 插件 ----------

const TagListingPage = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }

  return {
    name: "TagListingPage",
    // 高于 @quartz-community/tag-page 的 priority(10)，
    // 也高于 folder-listing 的 priority(20)，保证 tags/ 下真实页
    //（如未来添加 content/tags/xxx.md）由本插件接管；
    // 虚拟标签页在 dispatcher Phase 3 按「生成者 layout」发射，与优先级无关
    priority: 25,
    match: ({ slug }) => typeof slug === "string" && (slug.startsWith("tags/") || slug === "tags"),
    generate({ content, cfg }) {
      const locale = cfg?.locale ?? "zh-CN"
      const allFiles = content.map((c) => c[1].data).filter((d) => d?.unlisted !== true)
      const tags = new Set(
        allFiles.flatMap((data) => data.frontmatter?.tags ?? []).flatMap(getAllSegmentPrefixes),
      )
      tags.add("index")

      const existingTagSlugs = new Set()
      for (const [, file] of content) {
        const slug = file.data?.slug
        if (slug && slug.startsWith("tags/")) {
          existingTagSlugs.add(slug)
        }
      }

      const virtualPages = []
      for (const tag of tags) {
        const slug = joinSegments("tags", tag)
        if (existingTagSlugs.has(slug)) continue
        const title =
          tag === "index"
            ? tagIndexTitle(locale)
            : opts.prefixTags
              ? `${tagWord(locale)}: ${tag}`
              : tag
        virtualPages.push({
          slug,
          title,
          data: {},
        })
      }
      return virtualPages
    },
    layout: "tag",
    body: () => TagListing(opts),
  }
}

export default TagListingPage
export { TagListing }
