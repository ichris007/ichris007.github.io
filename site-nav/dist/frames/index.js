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
/* 左栏上移与右侧标题齐平：Quartz 核心给 .left.sidebar 设了 102px padding-top
   （为无顶栏布局准备）；本 frame 有 topnav 行（58px 高 + 12px 下 margin），
   左栏首元素因此比右侧 H1 低 68px（实测 172 vs 104）。压缩至 34px 补齐。
   注意：若以后改 topnav 高度或 page-header margin，此值需同步重算。 */
.page[data-frame="top-nav"] .left.sidebar {
  padding-top: 34px;
}
/* 左栏独立滚动（仅桌面端）：长文阅读到中间时，鼠标悬停左栏即可滚动查看
   左栏自身内容；左栏滚到底后滚动事件继续传给页面（浏览器链式传递，
   不设 overscroll-behavior，避免切断用户已有的页面滚动习惯）。
   吸附位置贴顶栏底部（顶栏 sticky 高 59px，若顶栏高度变需同步此值）；
   max-height 为视口减顶栏高与底部留白。移动端单列布局不启用，
   否则左栏会占满视口把正文挤走。 */
@media all and (min-width: 800px) {
  .page[data-frame="top-nav"] .left.sidebar {
    position: sticky;
    top: 59px;
    max-height: calc(100vh - 76px);
    overflow-y: auto;
    scrollbar-width: thin;
  }
  /* 左栏是 flex column 容器，子元素默认 flex-shrink:1，容器被 max-height
     限高时内容会被压扁（scrollHeight 恒等于 clientHeight，永远不溢出）。
     禁止收缩，让内容保持自然高度、超出部分走 overflow 滚动。 */
  .page[data-frame="top-nav"] .left.sidebar > * {
    flex-shrink: 0;
  }
  /* explorer 的 ul.overflow 核心样式自带 max-height:100% + overflow-y:auto，
     是第二层滚动容器——鼠标在列表区域滚动时事件被它截走，滚不到 sidebar。
     本站左栏空间有限，收敛为一层滚动：ul 自然展开，统一由 sidebar 滚。 */
  .page[data-frame="top-nav"] .left.sidebar ul.overflow {
    max-height: none;
    overflow-y: visible;
  }
}
`,
}

export { TopNavFrame }
