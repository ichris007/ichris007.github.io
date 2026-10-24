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
          children: opts.brand,
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
  font-size: 1rem;
  font-weight: 500;
  color: var(--dark);
  text-decoration: none;
  white-space: nowrap;
}
.site-nav-brand:hover {
  color: var(--secondary);
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
