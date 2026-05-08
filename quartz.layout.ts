import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"


// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    // 这里只放全局共享的组件（如果有的话）
    // 为了控制顺序，把 Comments 移到了 defaultContentPageLayout.afterBody
  ],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/jackyzha0/quartz",
      "Discord Community": "https://discord.gg/cRFFHYye7t",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    // Component.TagList(), // 删除，移到底部
  ],
  afterBody: [
    Component.TagList(),  // 1. 先显示标签
    Component.Backlinks(),// 2. 反向链接
    Component.Comments({  // 3. 显示评论区
      provider: "giscus",
      options: {
        repo: "ichris007/ichris007.github.io",
        repoId: "R_kgDOSUGAuw",
        category: "Announcements",
        categoryId: "DIC_kwDOSUGAu84C8VHC",
        mapping: "pathname",
        strict: "0",
        reactionsEnabled: "1",
        emitMetadata: "0",
        inputPosition: "bottom",
        theme: "preferred_color_scheme",
        lang: "zh-CN",
      },
    }),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Graph(),
  ],
}

// components for pages that display lists of pages (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  afterBody: [
    Component.TagList(),  // 列表页也把标签移到底部
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },  // 添加阅读模式按钮
      ],
    }),
    Component.Explorer(),
  ],
  right: [
    Component.DesktopOnly(Component.TableOfContents()),  // 添加目录
    Component.Graph(),  // 添加图谱
  ],
}