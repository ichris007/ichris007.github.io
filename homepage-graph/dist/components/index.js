import { h } from "preact"
import { classNames } from "@quartz-community/utils/lang"
import { Graph as GraphFactory } from "@quartz-community/graph/components"

const defaultOptions = {
  title: "关系图谱",
  caption: "全站关系图谱 · 悬停查看 · 点击跳转",
  height: "420px",
  localGraph: {
    drag: true,
    zoom: true,
    depth: -1,
    scale: 0.9,
    repelForce: 0.5,
    centerForce: 0.2,
    linkDistance: 30,
    fontSize: 0.6,
  },
}

const HomepageGraph = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }
  const inner = GraphFactory({ localGraph: opts.localGraph })

  const HomepageGraphComponent = ({ fileData, cfg }) => {
    if (fileData.slug !== "index") return null
    return h("div", {
      class: classNames("homepage-graph"),
      children: [
        h("h2", { children: opts.title }),
        h("div", {
          class: "homepage-graph-frame",
          children: h(inner, { cfg }),
        }),
        opts.caption ? h("p", { class: "homepage-graph-caption", children: opts.caption }) : null,
      ],
    })
  }

  HomepageGraphComponent.css = `
${inner.css ?? ""}
.homepage-graph {
  margin: 3rem 0 1rem 0;
}
.homepage-graph > h2 {
  font-size: 1.3rem;
  margin: 0 0 1rem 0;
}
.homepage-graph-frame .graph > h3 {
  display: none;
}
.homepage-graph-frame .graph > .graph-outer {
  height: ${opts.height};
  border: 0.5px solid var(--lightgray);
  border-radius: 8px;
}
.homepage-graph-frame .graph > .graph-outer > .global-graph-icon {
  display: none;
}
.homepage-graph-frame .graph > .global-graph-outer {
  display: none;
}
.homepage-graph-caption {
  margin: 0.5rem 0 0 0;
  font-size: 0.8rem;
  color: var(--darkgray);
  text-align: center;
}
`

  HomepageGraphComponent.afterDOMLoaded = inner.afterDOMLoaded

  return HomepageGraphComponent
}

export { HomepageGraph }
