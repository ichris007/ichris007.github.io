import { pathToRoot } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"

const PageTitle: QuartzComponent = ({ fileData, cfg, displayClass }: QuartzComponentProps) => {
  const title = cfg?.pageTitle ?? i18n(cfg.locale).propertyDefaults.title
  const baseDir = pathToRoot(fileData.slug!)
  
  // 通过 fileData 判断当前语言
  const isEn = fileData?.slug?.startsWith("en/") || fileData?.slug === "en"
  const currentLang = isEn ? "en" : "zh"
  
  return (
    <div class={classNames(displayClass, "page-title-container")}>
      <h2 class="page-title">
        <a href={baseDir}>
          <img 
            src="/static/icon.png" 
            alt="Logo" 
            class="page-title-logo"
          />
          {title}
        </a>
      </h2>
      <div class="language-switch">
        <a href="/" class={currentLang === "zh" ? "active" : ""}>中文</a>
        <span class="separator">|</span>
        <a href="/en" class={currentLang === "en" ? "active" : ""}>English</a>
      </div>
    </div>
  )
}

PageTitle.css = `
.page-title-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  width: 100%;
}

.page-title {
  font-size: 1.75rem;
  margin: 0;
  font-family: var(--titleFont);
}

.page-title a {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  text-decoration: none;
}

.page-title-logo {
  height: 2rem;
  width: auto;
}

.language-switch {
  display: flex;
  gap: 0.5rem;
  font-size: 0.85rem;
  align-items: center;
}

.language-switch a {
  text-decoration: none;
  color: var(--darkgray);
  padding: 0.2rem 0.3rem;
  border-radius: 4px;
  transition: color 0.2s ease;
}

.language-switch a:hover {
  color: var(--secondary);
}

.language-switch a.active {
  color: var(--secondary);
  font-weight: bold;
}

.language-switch .separator {
  color: var(--lightgray);
}

@media (max-width: 600px) {
  .language-switch {
    font-size: 0.7rem;
    gap: 0.3rem;
  }
}
`

export default (() => PageTitle) satisfies QuartzComponentConstructor