import { h } from "preact"
import { classNames } from "@quartz-community/utils/lang"
import { resolveRelative } from "@quartz-community/utils/path"

const defaultOptions = {
  brand: "Lifein OS",
  links: [],
}

const SiteNav = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }

  const SiteNavComponent = ({ fileData, displayClass }) => {
    const links = (opts.links ?? []).map((link) => {
      const external = /^https?:\/\//.test(link.href)
      const href = external ? link.href : resolveRelative(fileData.slug, link.href)
      const extra = external ? { target: "_blank", rel: "noopener noreferrer" } : {}
      return h("li", { children: h("a", { href, ...extra, children: link.text }) })
    })

    return h("nav", {
      class: classNames(displayClass, "site-nav"),
      children: [
        h("a", {
          class: "site-nav-brand",
          href: resolveRelative(fileData.slug, "index"),
          "aria-label": opts.brand,
          children: [
            // 双主题 logo：Quartz v5 在 <html saved-theme="dark|light"> 上标记主题
            // （prescript 同步设置，无闪烁）；SVG 颜色为硬编码 presentation
            // attribute，img 嵌入不受 Obsidian 式 style 清洗影响
            h("img", {
              class: "site-nav-logo site-nav-logo-dark",
              src: resolveRelative(fileData.slug, "static/logo-dark.svg"),
              alt: opts.brand,
              width: 437,
              height: 158,
            }),
            h("img", {
              class: "site-nav-logo site-nav-logo-light",
              src: resolveRelative(fileData.slug, "static/logo-light.svg"),
              alt: opts.brand,
              width: 437,
              height: 158,
            }),
          ],
        }),
        h("ul", { class: "site-nav-links", children: links }),
      ],
    })
  }

  SiteNavComponent.css = `
.site-nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  min-height: 3rem;
}
.site-nav-brand {
  display: flex;
  align-items: center;
  text-decoration: none;
  white-space: nowrap;
}
.site-nav-logo {
  display: block;
  height: 2rem;
  width: auto;
}
/* 主题切换：dark 版默认显示，light 主题下换浅色版 */
.site-nav-logo-light {
  display: none;
}
html[saved-theme="light"] .site-nav-logo-light {
  display: block;
}
html[saved-theme="light"] .site-nav-logo-dark {
  display: none;
}
@media all and (max-width: 600px) {
  .site-nav-logo {
    height: 1.6rem;
  }
}
.site-nav-links {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.site-nav-links::-webkit-scrollbar {
  display: none;
}
.site-nav-links a {
  font-size: 0.9rem;
  color: var(--darkgray);
  text-decoration: none;
  white-space: nowrap;
}
.site-nav-links a:hover {
  color: var(--secondary);
}
`

  return SiteNavComponent
}

export { SiteNav }
