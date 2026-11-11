import { Fragment, h } from "preact"
import { resolveRelative } from "@quartz-community/utils/path"

const TopNavFrame = {
  name: "top-nav",
  render({ componentData, header, beforeBody, pageBody: Content, afterBody, left, right, footer }) {
    // 笔记顶部 banner：由 frontmatter 的 banner 字段指定，只写文件名即可
    // （如 banner: lifein_banner_0.png，对应 content/Attachments/ 下的图片）。
    // 附件构建后统一输出到 attachments/ 且文件名为小写；用 resolveRelative
    // 按当前页面深度生成正确的相对路径（首页是 attachments/x，子页是 ../attachments/x）。
    // 也兼容直接写完整 URL 或 /attachments/... 绝对路径；未设置则不渲染任何节点。
    const banner = componentData.fileData.frontmatter?.banner
    const bannerName = typeof banner === "string" ? banner.trim() : ""
    const bannerSrc = bannerName
      ? /^(https?:\/\/|\/)/i.test(bannerName)
        ? bannerName
        : resolveRelative(
            componentData.fileData.slug,
            `attachments/${bannerName.replace(/^\/?attachments\//i, "")}`,
          )
      : null
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
            bannerSrc
              ? h("div", {
                  class: "note-banner",
                  children: h("img", {
                    src: bannerSrc,
                    alt: "",
                    loading: "eager",
                    decoding: "async",
                  }),
                })
              : null,
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
              children: [
                afterBody.map((BodyComponent) => h(BodyComponent, { ...componentData })),
                h("div", {
                  class: "footer-reward",
                  children: h(
                    "a",
                    {
                      href: "/general/打赏作者",
                      class: "internal",
                    },
                    "打赏作者",
                  ),
                }),
              ],
            }),
          ],
        }),
        h("div", {
          class: "right sidebar",
          children: [
            ...right.map((BodyComponent) => h(BodyComponent, { ...componentData })),
            // 打赏作者二维码：永远在右侧栏最底部，点击跳转打赏页
            h("div", {
              class: "sidebar-reward",
              children: [
                h(
                  "a",
                  {
                    href: "/general/打赏作者",
                    title: "打赏作者 · 微信扫码",
                  },
                  h("img", {
                    src: resolveRelative(
                      componentData.fileData.slug,
                      "attachments/wechat_donate_qrcode0.jpg",
                    ),
                    alt: "打赏作者 · 微信收款二维码",
                    loading: "lazy",
                    width: 200,
                  }),
                ),
                h("div", { class: "sidebar-reward-caption" }, "打赏作者"),
              ],
            }),
          ],
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
/* 笔记顶部 Hero banner（frontmatter: banner: 文件名.png）：
   渲染在 .page-header 之前，即面包屑/H1 标题上方。按原图比例自适应
   （width:100% + height:auto，不裁切），圆角与侧栏图片一致。
   alt 留空：这是装饰图，也避开 custom.scss 中 img[alt*="banner"] 的
   150px 固定高度规则（那条只服务正文里的 ![[图|banner]] 写法）。
   深色主题下按用户要求淡化，避免亮色大图在暗色页面里刺眼。 */
.page[data-frame="top-nav"] .note-banner {
  margin: 1.5rem 0 0;
}
.page[data-frame="top-nav"] .note-banner img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 6px;
}
.page[data-frame="top-nav"] .note-banner + .page-header {
  margin-top: 1rem;
}
:root[saved-theme="dark"] .page[data-frame="top-nav"] .note-banner img {
  opacity: 0.78;
  filter: brightness(0.9) saturate(0.92);
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
/* 右栏独立滚动（仅桌面三栏布局 >=1200px）：核心 .sidebar 是 height:100vh +
   sticky + 无 overflow 的 flex column。长文时排在最后的打赏二维码会溢出容器
   底部、落到视口下方，而 sticky 容器滚动时不动，那部分永远滚不到 —— 表现为
   「显示不全、底部被遮挡」。修法：限高 + 右栏独立滚动 + 所有布局子项禁止收缩，
   让各组件按自然高度依次排开，超出部分统一由右栏滚。
   注意：不要中和组件自带的 ul.overflow / .toc 的 overflow-y:hidden ——
   那会让目录内容溢出盒子、后面的图谱与反链上移叠在目录上，且破坏目录折叠。
   组件（TOC flex:0 .5 auto、:has(collapsed) 折叠、ul.overflow 内层滚动）
   保持原样，只补 flex-shrink:0 即可自然排布。
   仅 >=1200px 生效：800–1200px 平板下核心把右栏改成横向 flex row，不能套
   纵向滚动，否则破坏平板/移动端布局。 */
@media all and (min-width: 1200px) {
  .page[data-frame="top-nav"] .right.sidebar {
    position: sticky;
    top: 59px;
    max-height: calc(100vh - 76px);
    overflow-y: auto;
    scrollbar-width: thin;
  }
  /* .desktop-only 是 display:contents，其子元素 .toc 在布局上也是右栏的
     flex item，但 DOM 上不是 .right.sidebar > * —— 必须一并选中。否则 TOC
     仍是 flex:0 .5 auto 会被压缩，盒子矮、内容却被 max-height 放飞而溢出，
     图谱/反链顺着压矮的盒子往上排，正好叠在目录文字上（曾出现的 bug）。 */
  .page[data-frame="top-nav"] .right.sidebar > *,
  .page[data-frame="top-nav"] .right.sidebar .desktop-only > * {
    flex-shrink: 0;
  }
}
/* 侧栏滚动条美化：浏览器默认滚动条（约 15px 实心灰条）在窄侧栏里过于抢眼。
   统一成「细、淡、轨道透明」的样式，颜色全部取自主题令牌，深浅主题自动跟随：
   常态用文字色 --darkgray 的 28% 透明度（与背景对比很弱，几乎只剩一条细线），
   轨道全透明。webkit 路径下 hover 换成 --secondary 的 55%，方便鼠标定位。
   浏览器分支（实测）：Firefox 与 Chrome 121+/Edge 检测到非 auto 的标准属性后，
   优先采用 scrollbar-width/scrollbar-color，会忽略 ::-webkit-scrollbar；
   ::-webkit-scrollbar 是 Safari / 旧版 Chromium 的完整实现（4px 圆角细条）。
   两套配色一致，因此各浏览器观感统一，不必做 UA 分支。
   .sidebar * 一并覆盖右栏 TOC / 反链等内层滚动容器，避免「外层细条、内层粗条」
   的割裂感；只改外观，不改布局尺寸，也不动滚动链（不设 overscroll-behavior）。 */
.page[data-frame="top-nav"] .sidebar,
.page[data-frame="top-nav"] .sidebar * {
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--darkgray) 28%, transparent) transparent;
}
.page[data-frame="top-nav"] .sidebar::-webkit-scrollbar,
.page[data-frame="top-nav"] .sidebar *::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  background: transparent;
}
.page[data-frame="top-nav"] .sidebar::-webkit-scrollbar-track,
.page[data-frame="top-nav"] .sidebar *::-webkit-scrollbar-track {
  background: transparent;
}
.page[data-frame="top-nav"] .sidebar::-webkit-scrollbar-thumb,
.page[data-frame="top-nav"] .sidebar *::-webkit-scrollbar-thumb {
  /* 8px 宽 + 左右各 2px 透明边框 + padding-box 裁剪 → 可见部分仅 4px，
     但 hover 命中区仍是 8px：既低调又好抓 */
  background-color: color-mix(in srgb, var(--darkgray) 28%, transparent);
  background-clip: padding-box;
  border: 2px solid transparent;
  border-radius: 8px;
}
.page[data-frame="top-nav"] .sidebar::-webkit-scrollbar-thumb:hover,
.page[data-frame="top-nav"] .sidebar *::-webkit-scrollbar-thumb:hover {
  background-color: color-mix(in srgb, var(--secondary) 55%, transparent);
}
/* 页脚「打赏作者」链接：与上方 afterBody 内容（如反链）分隔，居中、弱化，
   看起来像页脚元素而非正文。颜色跟随主题 --secondary。 */
.page[data-frame="top-nav"] .page-footer .footer-reward {
  margin-top: 1.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--lightgray);
  text-align: center;
  font-size: 0.9rem;
}
.page[data-frame="top-nav"] .page-footer .footer-reward a {
  color: var(--secondary);
}
/* 右侧栏底部「打赏作者」二维码：与上方组件（反链）分隔，居中，
   看起来像侧栏尾部元素。图片宽度自适应、圆角；外层 <a> 行内块以免
   核心 internal 链接样式给图片加下划线/图标。caption 弱化、跟随主题色。 */
.page[data-frame="top-nav"] .right.sidebar .sidebar-reward {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--lightgray);
  text-align: center;
}
.page[data-frame="top-nav"] .right.sidebar .sidebar-reward a {
  display: inline-block;
}
.page[data-frame="top-nav"] .right.sidebar .sidebar-reward img {
  max-width: 200px;
  width: 100%;
  height: auto;
  border-radius: 6px;
  display: inline-block;
}
.page[data-frame="top-nav"] .right.sidebar .sidebar-reward-caption {
  margin-top: 0.4rem;
  font-size: 0.85rem;
  color: var(--secondary);
}
`,
}

export { TopNavFrame }
