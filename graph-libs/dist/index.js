// graph-libs：把 @quartz-community/graph 运行时动态插入的 jsdelivr 脚本
// 重定向到站内副本（quartz/static/vendor-libs/），使图谱不依赖外网 CDN。
//
// 背景：graph 插件的 afterDOMLoaded 脚本用 document.head.appendChild
// 动态加载 https://cdn.jsdelivr.net/npm/d3@7|pixi.js@8，国内网络不可达时
// 图谱显示 "Graph could not load"。本插件在 beforeDOMReady 阶段 patch
// appendChild，将这两个 URL 改写为站内相对路径。
//
// 站内副本来源：npm d3@7.9.0 dist/d3.min.js、pixi.js@8.22.0 dist/pixi.min.js
// （与 jsdelivr 同源同版本，仅压缩档名不同）。
const PATCH = `
if (!window.__graphLibsPatched) {
  window.__graphLibsPatched = true
  var MAP = {
    "https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js": "d3.min.js",
    "https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.js": "pixi.min.js"
  }
  var origAppend = document.head.appendChild.bind(document.head)
  document.head.appendChild = function (el) {
    try {
      if (el && el.tagName === "SCRIPT" && el.src && MAP[el.src]) {
        var base = ""
        var ps = document.querySelector('script[src*="postscript"]')
        if (ps && ps.src) {
          base = ps.src.replace(/[^/]*$/, "")
        } else {
          base = location.origin + "/"
        }
        el.src = base + "static/vendor-libs/" + MAP[el.src]
      }
    } catch (e) {}
    return origAppend(el)
  }
}
`

const GraphLibs = () => ({
  name: "GraphLibs",
  markdownPlugins() {
    return []
  },
  htmlPlugins() {
    return []
  },
  externalResources() {
    return {
      js: [
        {
          loadTime: "beforeDOMReady",
          contentType: "inline",
          script: PATCH,
        },
      ],
    }
  },
})

export default GraphLibs
