// quartz/components/LanguageSwitch.tsx
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

// 中文路径 -> 英文路径映射
const cnToEnPath: Record<string, string> = {
  "/": "/en",
  "/插件与脚本": "/en/plugins-scripts",
  "/Obsidian资料": "/en/obsidian-guide",
  "/LifeinOS实践与思考": "/en/lifein-practice",
  "/科叔": "/en/about",
}

const enToCnPath: Record<string, string> = Object.fromEntries(
  Object.entries(cnToEnPath).map(([cn, en]) => [en, cn])
)

const getTargetPath = (currentPath: string): string => {
  const cleanPath = currentPath.replace(/\/$/, "")
  const isEn = cleanPath.startsWith("/en")
  
  if (isEn) {
    if (enToCnPath[cleanPath]) return enToCnPath[cleanPath]
    return "/"
  } else {
    if (cnToEnPath[cleanPath]) return cnToEnPath[cleanPath]
    return "/en"
  }
}

const LanguageSwitch: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/"
  const targetPath = getTargetPath(currentPath)
  const isEn = currentPath.startsWith("/en")
  const switchText = isEn ? "中文" : "English"

  // 使用原生的 HTML 元素，不用 React/Preact 的事件类型
  return (
    <a
      href={targetPath}
      class={classNames(displayClass, "language-switch")}
      aria-label="Switch language"
    >
      {switchText}
    </a>
  )
}

LanguageSwitch.css = `
.language-switch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  background: var(--lightgray);
  color: var(--dark);
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  user-select: none;
  margin-left: 0.5rem;
}

.language-switch:hover {
  background: var(--secondary);
  color: white;
  transform: translateY(-1px);
}

@media (max-width: 600px) {
  .language-switch {
    padding: 0.2rem 0.5rem;
    font-size: 0.75rem;
    margin-left: 0.3rem;
  }
}
`

export default (() => LanguageSwitch) satisfies QuartzComponentConstructor