// quartz/plugins/filters/publishFilter.ts
import { QuartzFilterPlugin } from "../types"

export const PublishFilter: QuartzFilterPlugin = () => ({
  name: "PublishFilter",
  shouldPublish(_ctx, content) {
    return content.frontmatter?.publish === true
  },
})