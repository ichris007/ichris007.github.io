// llms-txt —— 生成供 AI 阅读的全站索引 /llms.txt（llms.txt 标准，llmstxt.org）
//
// 这是一个 Quartz v5 的 emitter 插件。构建时它会遍历所有已发布页面，
// 输出纯文本文件 public/llms.txt，结构为：
//   # 站点标题
//   > 一句话简介
//   ## 分组（按顶层文件夹）
//   - [页面标题](URL): 描述
//
// 可选：includeFullLink 在末尾给出 llms-full.txt 的链接；
//       generateFull: true 时额外生成 llms-full.txt（全站正文拼接，体积较大）。
//
// 设计要点（与官方 @quartz-community/content-index 一致）：
//   - emitter 接收 (ctx, content)，content 为 [tree, vfile][] ；
//   - 每个 vfile.data 含 slug / title / description / unlisted / frontmatter 等；
//   - 用 fs 直接写入 ctx.argv.output 根目录（与 helpers.write 内部实现相同）。

import fs from "fs/promises"
import path from "path"

const defaultOptions = {
  // 写进 llms.txt blockquote 的站点一句话简介；留空则尝试取首页 description
  summary: "",
  // 是否在 llms.txt 末尾附上 llms-full.txt 的链接（当 generateFull=false 时仅作提示）
  includeFullLink: true,
  // 是否真正生成 llms-full.txt（全站正文拼接，体积可能很大）
  generateFull: false,
  // 跳过这些顶层文件夹（填 slug 的第一段），例如 ["tags"] 或 ["en"]
  excludeFolders: [],
  // 手动追加的链接（常用于站外或独立页面），每项 { title, url, description }
  extraLinks: [],
}

// ---------- 与 Quartz 内部一致的小工具（避免额外依赖） ----------

function joinSegments(...segments) {
  return segments.filter((s) => (s ?? "").length > 0).join("/").replace(/\/+/g, "/")
}

function firstSegment(slug) {
  return (slug ?? "").split("/")[0] ?? ""
}

// 把完整 slug 转成 URL 路径：去掉末尾 index，去掉前导 /
function simplifySlug(slug) {
  let s = (slug ?? "").replace(/\/index$/, "").replace(/^index$/, "")
  s = s.replace(/^\/+/, "")
  return s.length === 0 ? "/" : s
}

function pageUrl(base, slug) {
  const proto = base.startsWith("http") ? "" : "https://"
  const p = simplifySlug(slug) // "/" 或 "seg/seg"
  const sep = p.startsWith("/") ? "" : "/"
  return proto + base + sep + p
}

function resolveTitle(data) {
  const t = data.title || (data.frontmatter && data.frontmatter.title) || data.slug
  return (t ?? "").toString().trim()
}

// 把描述截断为简洁摘录（llms.txt 的标准要求“可选短描述”）
function truncate(str, n) {
  str = (str ?? "").toString().replace(/\s+/g, " ").trim()
  if (str.length <= n) return str
  return str.slice(0, n).replace(/\s+\S*$/, "") + "…"
}

function resolveDescription(data) {
  return (data.description || "").toString().split("\n")[0].trim()
}

// ---------- 主逻辑 ----------

export const Llmstxt = (opts = {}) => {
  const options = { ...defaultOptions, ...opts }

  const emitAll = async (ctx, content) => {
    const cfg = ctx.cfg.configuration
    const base = cfg.baseUrl
    const pageTitle = cfg.pageTitle

    // 1) 收集所有已发布页面
    const pages = []
    for (const [, file] of content) {
      const data = (file && file.data) || {}
      if (data.unlisted === true) continue
      const slug = data.slug
      if (!slug) continue
      const folder = firstSegment(slug)
      if (options.excludeFolders.includes(folder)) continue
      pages.push({
        slug,
        folder,
        title: resolveTitle(data),
        description: resolveDescription(data),
        url: pageUrl(base, slug),
      })
    }

    // 首页优先，其余按标题（中文）排序
    pages.sort((a, b) => {
      if (a.slug === "index") return -1
      if (b.slug === "index") return 1
      return a.title.localeCompare(b.title, "zh-Hans-CN")
    })

    // 2) 按顶层文件夹分组
    const groups = new Map()
    const rootPages = []
    for (const p of pages) {
      if (p.slug === "index") {
        if (!groups.has("站点")) groups.set("站点", [])
        groups.get("站点").push(p)
      } else if (p.folder && p.folder !== p.slug) {
        if (!groups.has(p.folder)) groups.set(p.folder, [])
        groups.get(p.folder).push(p)
      } else {
        rootPages.push(p)
      }
    }
    if (rootPages.length) groups.set("页面", rootPages)

    // 3) 站点简介
    let summary = options.summary
    if (!summary) {
      const home = pages.find((p) => p.slug === "index")
      if (home && home.description) summary = truncate(home.description, 300)
    }

    // 4) 渲染 llms.txt
    const lines = []
    lines.push(`# ${pageTitle}`)
    lines.push("")
    if (summary) {
      lines.push(`> ${summary}`)
      lines.push("")
    }
    lines.push(`> 本文件是供 AI 阅读的站点索引（llms.txt 标准）。完整站点：https://${base}/`)
    lines.push("")

    for (const [groupName, items] of groups) {
      lines.push(`## ${groupName}`)
      lines.push("")
      for (const it of items) {
        const desc = it.description ? `: ${truncate(it.description, 160)}` : ""
        lines.push(`- [${it.title}](${it.url})${desc}`)
      }
      lines.push("")
    }

    if (Array.isArray(options.extraLinks) && options.extraLinks.length) {
      lines.push(`## 其他资源`)
      lines.push("")
      for (const l of options.extraLinks) {
        const desc = l.description ? `: ${l.description}` : ""
        lines.push(`- [${l.title}](${l.url})${desc}`)
      }
      lines.push("")
    }

    if (options.includeFullLink) {
      lines.push(`## 可选：全量内容`)
      lines.push("")
      lines.push(`- [llms-full.txt](https://${base}/llms-full.txt): 全站正文拼接（如已启用）`)
      lines.push("")
    }

    const txt = lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n"

    // 5) 写出 llms.txt
    const outFile = joinSegments(ctx.argv.output, "llms.txt")
    await fs.mkdir(path.dirname(outFile), { recursive: true })
    await fs.writeFile(outFile, txt, "utf8")
    const outputs = [outFile]

    // 6)（可选）llms-full.txt：把每个页面的正文拼接
    if (options.generateFull) {
      const full = [`# ${pageTitle} (full)`, ""]
      for (const [, file] of content) {
        const data = (file && file.data) || {}
        if (data.unlisted === true) continue
        const slug = data.slug
        if (!slug || options.excludeFolders.includes(firstSegment(slug))) continue
        const title = resolveTitle(data)
        const url = pageUrl(base, slug)
        const body = (data.text || "").toString().trim()
        full.push(`## ${title}`)
        full.push(`Source: ${url}`)
        full.push("")
        if (body) full.push(body)
        full.push("")
      }
      const fullFile = joinSegments(ctx.argv.output, "llms-full.txt")
      await fs.writeFile(fullFile, full.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n", "utf8")
      outputs.push(fullFile)
    }

    return outputs
  }

  return {
    name: "Llmstxt",
    emit: (ctx, content) => emitAll(ctx, content),
    partialEmit: (ctx, content) => emitAll(ctx, content),
  }
}

export default Llmstxt
