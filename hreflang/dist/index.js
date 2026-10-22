import { h } from "preact"

/**
 * hreflang 本地插件
 *
 * 背景：Quartz v4 支持在 quartz.config.ts 的 configuration.head 里
 * 注入任意 <head> 标签（本站用它声明中英双语 hreflang alternate）。
 * v5 移除了 configuration.head 配置字段，因此用这个本地插件实现同等效果：
 * transformer 通过 externalResources.additionalHead 注入的元素，
 * 会被内部 Head 组件渲染进 <head>。
 *
 * 本地插件源（./hreflang）会被 `npx quartz plugin install` 以 symlink
 * 形式链入 .quartz/plugins/，升级 Quartz 时不受影响。
 */
const Hreflang = () => ({
  name: "Hreflang",
  // 不做任何 Markdown 转换，只为满足 transformer 类别校验
  markdownPlugins() {
    return []
  },
  htmlPlugins() {
    return []
  },
  externalResources() {
    return {
      additionalHead: [
        h("link", { rel: "alternate", hreflang: "zh", href: "https://lifein.vip/" }),
        h("link", { rel: "alternate", hreflang: "en", href: "https://lifein.vip/index.en" }),
      ],
    }
  },
})

export default Hreflang
