import { h } from "preact"
import {
  formatDate,
  getDate,
  htmlToJsx,
  isFolderPath,
  joinSegments,
  resolveRelative,
} from "@quartz-community/utils"

/**
 * folder-listing —— 文件夹页类型插件
 *
 * 替代 @quartz-community/folder-page，列表样式对齐 ssp.sh/brain：
 *   日期（左列） | 标题链接
 *                | 描述（frontmatter description 或正文首段摘录）
 *                | #标签（pill 样式）
 *
 * generate/match/generate 中的文件夹收集逻辑沿用 folder-page v1.0.0 的等价实现，
 * 行为（虚拟文件夹页、标题回填、子文件夹聚合日期）保持一致，仅替换列表呈现。
 */

const defaultOptions = {
  showFolderCount: true,
  showSubfolders: true,
  showDescription: true,
  showTags: true,
  tagPrefix: "#",
  prefixFolders: false,
}

// ---------- 路径小工具（避免引入 node:path） ----------

function dirname(p) {
  const idx = (p ?? "").lastIndexOf("/")
  return idx === -1 ? "." : p.slice(0, idx)
}

function getFolders(slug) {
  let folderName = dirname(slug ?? "")
  const parentFolderNames = [folderName]
  while (folderName !== ".") {
    folderName = dirname(folderName ?? "")
    parentFolderNames.push(folderName)
  }
  return parentFolderNames
}

// ---------- 文件夹内页面收集（沿用 folder-page 实现） ----------

function mostRecentDatesFromChildren(children) {
  let maybeDates
  for (const child of children) {
    const childDates = child.data?.dates
    if (childDates) {
      if (!maybeDates) {
        maybeDates = { ...childDates }
      } else {
        if (childDates.created > maybeDates.created) maybeDates.created = childDates.created
        if (childDates.modified > maybeDates.modified) maybeDates.modified = childDates.modified
        if (childDates.published > maybeDates.published)
          maybeDates.published = childDates.published
      }
    }
  }
  return maybeDates ?? { created: new Date(), modified: new Date(), published: new Date() }
}

function mostRecentDatesFromEntries(entries) {
  let maybeDates
  for (const entry of entries) {
    if (entry.dates) {
      if (!maybeDates) {
        maybeDates = { ...entry.dates }
      } else {
        if (entry.dates.created > maybeDates.created) maybeDates.created = entry.dates.created
        if (entry.dates.modified > maybeDates.modified) maybeDates.modified = entry.dates.modified
        if (entry.dates.published > maybeDates.published)
          maybeDates.published = entry.dates.published
      }
    }
  }
  return maybeDates ?? { created: new Date(), modified: new Date(), published: new Date() }
}

function pagesFromTrie(folder, showSubfolders) {
  return folder.children
    .map((node) => {
      const nodeData = node.data
      if (nodeData) {
        if (nodeData.unlisted === true) return undefined
        return nodeData
      }
      if (node.isFolder && showSubfolders) {
        return {
          slug: node.slug,
          dates: mostRecentDatesFromChildren(node.children),
          frontmatter: { title: node.displayName, tags: [] },
        }
      }
      return undefined
    })
    .filter((page) => page !== undefined)
}

function pagesFromAllFiles(allFiles, folderSlug, showSubfolders) {
  const folderPrefix = folderSlug.endsWith("/index")
    ? folderSlug.slice(0, -"index".length)
    : folderSlug.endsWith("/")
      ? folderSlug
      : folderSlug + "/"
  const directChildren = []
  const subfolderFiles = new Map()
  for (const file of allFiles) {
    if (file.unlisted === true) continue
    const fileSlug = file.slug
    if (!fileSlug || !fileSlug.startsWith(folderPrefix)) continue
    const relativePath = fileSlug.slice(folderPrefix.length)
    if (!relativePath || relativePath === "index") continue
    const segments = relativePath.split("/")
    if (segments.length === 1) {
      directChildren.push(file)
    } else if (showSubfolders) {
      const subfolderName = segments[0]
      if (!subfolderFiles.has(subfolderName)) {
        subfolderFiles.set(subfolderName, [])
      }
      subfolderFiles.get(subfolderName).push(file)
    }
  }
  for (const [subfolderName, files] of subfolderFiles) {
    const indexFile = files.find((f) => f.slug === `${folderPrefix}${subfolderName}/index`)
    if (indexFile) continue
    directChildren.push({
      slug: `${folderPrefix}${subfolderName}/index`,
      dates: mostRecentDatesFromEntries(files),
      frontmatter: { title: subfolderName, tags: [] },
    })
  }
  return directChildren
}

// 子文件夹优先，其余按日期倒序、同日期按标题字母序（与 folder-page 默认排序一致）
function sortFolderFirst(f1, f2) {
  const f1IsFolder = isFolderPath(f1.slug ?? "")
  const f2IsFolder = isFolderPath(f2.slug ?? "")
  if (f1IsFolder && !f2IsFolder) return -1
  if (!f1IsFolder && f2IsFolder) return 1

  const d1 = getDate(f1)
  const d2 = getDate(f2)
  if (d1 && d2) {
    return d2.getTime() - d1.getTime()
  } else if (d1 && !d2) {
    return -1
  } else if (!d1 && d2) {
    return 1
  }

  const f1Title = (f1.frontmatter?.title ?? "").toLowerCase()
  const f2Title = (f2.frontmatter?.title ?? "").toLowerCase()
  return f1Title.localeCompare(f2Title)
}

function folderCountMessage(count, locale) {
  if ((locale ?? "zh-CN").toLowerCase().startsWith("zh")) {
    return `此文件夹下有${count}条笔记。`
  }
  return count === 1 ? "1 item under this folder." : `${count} items under this folder.`
}

// ---------- 列表组件 ----------

const FolderListing = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }

  const FolderListingComponent = (props) => {
    const { tree, fileData, allFiles, cfg, ctx } = props
    const slug = fileData?.slug
    if (!slug) return null

    const trie = ctx?.trie
    let pagesInFolder
    if (trie) {
      const folder = trie.findNode(slug.split("/"))
      if (!folder) return null
      pagesInFolder = pagesFromTrie(folder, opts.showSubfolders)
    } else {
      pagesInFolder = pagesFromAllFiles(allFiles ?? [], slug, opts.showSubfolders)
    }

    const cssClasses = fileData?.frontmatter?.cssclasses ?? []
    const classes = cssClasses.join(" ")

    // 文件夹自身内容（index.md 有内容时渲染，虚拟页回退到 description）
    const hastRoot = tree
    const content =
      hastRoot && hastRoot.children && hastRoot.children.length > 0
        ? htmlToJsx(hastRoot)
        : fileData?.description

    const items = [...pagesInFolder].sort(sortFolderFirst).map((page) => {
      const date = getDate(page)
      const title = page.frontmatter?.title ?? "Untitled"
      const tags = page.frontmatter?.tags ?? []
      const description = opts.showDescription ? page.description : undefined

      return h("li", {
        class: "folder-listing-item",
        children: [
          h("div", {
            class: "folder-listing-date",
            children: date
              ? h("time", {
                  datetime: date.toISOString(),
                  children: formatDate(date, cfg?.locale ?? "zh-CN"),
                })
              : null,
          }),
          h("div", {
            class: "folder-listing-body",
            children: [
              h("h3", {
                class: "folder-listing-title",
                children: h("a", {
                  href: resolveRelative(slug, page.slug),
                  class: "internal",
                  children: title,
                }),
              }),
              description
                ? h("p", { class: "folder-listing-desc", children: description })
                : null,
              opts.showTags && tags.length > 0
                ? h("ul", {
                    class: "folder-listing-tags",
                    children: tags.map((tag) =>
                      h("li", {
                        children: h("a", {
                          // 只挂 internal：tag-link 类会触发核心 CSS
                          // a.internal.tag-link:before{content:"#"}，与 tagPrefix 叠成 ##
                          class: "internal",
                          href: resolveRelative(slug, joinSegments("tags", tag)),
                          children: `${opts.tagPrefix}${tag}`,
                        }),
                      }),
                    ),
                  })
                : null,
            ],
          }),
        ],
      })
    })

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
          class: "page-listing folder-listing",
          children: [
            opts.showFolderCount
              ? h("p", {
                  class: "folder-listing-count",
                  children: folderCountMessage(pagesInFolder.length, cfg?.locale),
                })
              : null,
            h("ul", { class: "folder-listing-list", children: items }),
          ],
        }),
      ],
    })
  }

  FolderListingComponent.css = `
.folder-listing {
  margin-top: 1.25rem;
}

.folder-listing-count {
  margin: 0 0 1.1rem 0;
  color: var(--darkgray);
  font-size: 0.9rem;
}

.folder-listing-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.folder-listing-item {
  display: grid;
  grid-template-columns: fit-content(9em) minmax(0, 1fr);
  column-gap: 1.5rem;
  align-items: baseline;
  padding: 0.55rem 0;
}

.folder-listing-date {
  color: var(--darkgray);
  font-size: 0.85rem;
  white-space: nowrap;
}

.folder-listing-body {
  min-width: 0;
}

.folder-listing-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.4;
}

.folder-listing-title a {
  color: var(--secondary);
  text-decoration: none;
}

.folder-listing-title a:hover {
  text-decoration: underline;
}

.folder-listing-desc {
  margin: 0.1rem 0 0 0;
  color: var(--darkgray);
  font-size: 0.92rem;
  line-height: 1.5;
}

.folder-listing-tags {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0.45rem 0 0 0;
  padding: 0;
}

/* a.internal 后缀：核心 index.css 有 a.internal{background:var(--highlight);
   border-radius:5px;padding:0 .1rem}，同特异度靠源顺序不稳，升到 (0,2,1) 稳妥压过 */
.folder-listing-tags a.internal {
  display: inline-block;
  padding: 0.05rem 0.55rem;
  border: 1px solid var(--lightgray);
  border-radius: 0.5rem;
  background: var(--light);
  color: var(--darkgray);
  font-size: 0.78rem;
  line-height: 1.6;
  text-decoration: none;
}

.folder-listing-tags a.internal:hover {
  color: var(--secondary);
  border-color: var(--secondary);
}

@media all and (max-width: 600px) {
  .folder-listing-item {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 0.15rem;
  }
}
`

  return FolderListingComponent
}

// ---------- pageType 插件 ----------

const FolderListingPage = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }

  return {
    name: "FolderListingPage",
    // 高于 @quartz-community/folder-page 的 priority(10)，
    // 两者不会同时启用，此处仅作双保险
    priority: 20,
    match: ({ slug }) => typeof slug === "string" && slug.endsWith("/index"),
    generate({ content, cfg }) {
      const locale = cfg?.locale ?? "zh-CN"
      const allFiles = content.map((c) => c[1].data).filter((d) => d?.unlisted !== true)
      const folders = new Set()
      const folderDisplayNames = new Map()

      for (const file of allFiles) {
        const slug = file?.slug
        if (!slug) continue
        const fileFolders = getFolders(slug).filter((f) => f !== "." && f !== "tags")
        for (const f of fileFolders) {
          folders.add(f)
        }
        const relativePath = file?.relativePath
        if (relativePath) {
          const slugParts = dirname(slug).split("/").filter((s) => s !== ".")
          const pathParts = dirname(relativePath).split("/").filter((s) => s !== ".")
          for (let i = 0; i < slugParts.length && i < pathParts.length; i++) {
            const slugPart = slugParts[i]
            const pathPart = pathParts[i]
            if (slugPart && pathPart && !folderDisplayNames.has(slugPart)) {
              folderDisplayNames.set(slugPart, pathPart)
            }
          }
        }
      }

      const foldersWithIndex = new Set()
      for (const [, file] of content) {
        const data = file.data
        if (data?.unlisted === true) continue
        const slug = data?.slug
        if (slug && slug.endsWith("/index")) {
          foldersWithIndex.add(slug.slice(0, -"/index".length))
        }
      }

      // 已有 index.md 但缺标题时，用文件夹显示名回填
      for (const [, file] of content) {
        const slug = file.data?.slug
        if (!slug || !slug.endsWith("/index")) continue
        const frontmatter = file.data.frontmatter
        if (!frontmatter || (frontmatter.title && frontmatter.title !== "index")) continue
        const folder = slug.slice(0, -"/index".length)
        const slugSegment = folder.split("/").pop() ?? folder
        const folderName = folderDisplayNames.get(slugSegment) ?? slugSegment
        frontmatter.title = opts.prefixFolders
          ? `${locale.startsWith("zh") ? "文件夹" : "Folder"}: ${folderName}`
          : folderName
      }

      const virtualPages = []
      for (const folder of folders) {
        if (foldersWithIndex.has(folder)) continue
        const slugSegment = folder.split("/").pop() ?? folder
        const folderName = folderDisplayNames.get(slugSegment) ?? slugSegment
        virtualPages.push({
          slug: joinSegments(folder, "index"),
          title: opts.prefixFolders
            ? `${locale.startsWith("zh") ? "文件夹" : "Folder"}: ${folderName}`
            : folderName,
          data: {},
        })
      }
      return virtualPages
    },
    layout: "folder",
    body: () => FolderListing(opts),
  }
}

export default FolderListingPage
export { FolderListing }
