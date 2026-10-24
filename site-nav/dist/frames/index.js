import { Fragment, h } from "preact"

const TopNavFrame = {
  name: "top-nav",
  render({ componentData, header, beforeBody, pageBody: Content, afterBody, left, right, footer }) {
    return h(Fragment, {
      children: [
        header.length > 0
          ? h("div", {
              class: "top-nav-bar",
              children: header.map((HeaderComponent) => h(HeaderComponent, { ...componentData })),
            })
          : null,
        h("div", {
          class: "left sidebar",
          children: left.map((BodyComponent) => h(BodyComponent, { ...componentData })),
        }),
        h("div", {
          class: "center",
          children: [
            h("div", {
              class: "page-header",
              children: h("div", {
                class: "popover-hint",
                children: beforeBody.map((BodyComponent) => h(BodyComponent, { ...componentData })),
              }),
            }),
            h(Content, { ...componentData }),
            h("hr"),
            h("div", {
              class: "page-footer",
              children: afterBody.map((BodyComponent) => h(BodyComponent, { ...componentData })),
            }),
          ],
        }),
        h("div", {
          class: "right sidebar",
          children: right.map((BodyComponent) => h(BodyComponent, { ...componentData })),
        }),
        ...footer.map((FooterComponent) => h(FooterComponent, { ...componentData })),
      ],
    })
  },
  css: `
.page[data-frame="top-nav"] > #quartz-body {
  grid-template-rows: auto auto auto auto;
  grid-template-areas:
    "grid-topnav grid-topnav grid-topnav"
    "grid-sidebar-left grid-header grid-sidebar-right"
    "grid-sidebar-left grid-center grid-sidebar-right"
    "grid-sidebar-left grid-footer grid-sidebar-right";
}
@media all and (min-width: 800px) and (max-width: 1200px) {
  .page[data-frame="top-nav"] > #quartz-body {
    grid-template-rows: auto auto auto auto auto;
    grid-template-areas:
      "grid-topnav grid-topnav"
      "grid-sidebar-left grid-header"
      "grid-sidebar-left grid-center"
      "grid-sidebar-left grid-sidebar-right"
      "grid-sidebar-left grid-footer";
  }
}
@media all and (max-width: 800px) {
  .page[data-frame="top-nav"] > #quartz-body {
    grid-template-rows: auto auto auto auto auto auto;
    grid-template-areas:
      "grid-topnav"
      "grid-sidebar-left"
      "grid-header"
      "grid-center"
      "grid-sidebar-right"
      "grid-footer";
  }
}
.page[data-frame="top-nav"] .top-nav-bar {
  grid-area: grid-topnav;
  /* 固定顶栏：sticky 包含块为 #quartz-body（无 overflow 裁剪，高度=全页），
     滚动时吸附视口顶部；背景必须不透明（var(--light) 经 light-dark() 随主题翻转），
     否则下方内容会透过导航条 */
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--light);
  border-bottom: 0.5px solid var(--lightgray);
  margin: 0 0 0.75rem 0;
  padding: 0 0.5rem;
}
.page[data-frame="top-nav"] .page-header {
  margin-top: 1.5rem;
}
`,
}

export { TopNavFrame }
