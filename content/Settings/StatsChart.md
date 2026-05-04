```datacorejsx
/*
🚀 高性能统计图表 - 配置化版本
================================================================================
功能说明：
  - 统计指定 frontmatter 属性的分布情况
  - 支持饼图可视化 + 图例列表（带分页）
  - 支持排除目录和排除特定值
  - 大小写不敏感合并统计
  - 响应式布局，自动适配窗口大小
  - 饼图与图例双向交互（悬停高亮）

使用方法：
  1. 直接修改下方 CONFIG 对象中的参数
  2. 将本文件保存为 .dcjsx 文件
  3. 在 Obsidian 文档中使用 ![[文件名]] 嵌入

多图表使用：
  - 如需多个图表，复制本文件并修改每个文件的 CONFIG 即可
================================================================================
*/

// ================== 1. 手动配置区域 ==================
// ⚠️ 请直接修改这里的参数值来配置图表 ⚠️
const CONFIG = {
    // 基础配置
    prop: "tags",                    // 要统计的 frontmatter 属性名（如：tags, area, status）
    label: "标签",                  // 图表显示的标题
    
    // 过滤配置
    excludedFolders: ["Templates", "Settings", "00Dashboard"],  // 排除的目录（不统计这些文件夹内的文件）
    excludedValues: ["日常", "归档"],   // 排除的属性值（不区分大小写，如排除"日常"标签）
    
    // 显示配置
    maxDisplayItems: 30,               // 饼图最大显示项数（超出部分归入"其他"）
    pageSize: 8                        // 图例每页显示数量
};
// ==========================================================

// ================== 2. 环境适配 ==================
// 兼容不同环境下的 React Hooks（Obsidian 原生 / Datacore）
let _useState, _useMemo, _useEffect, _useRef, _useCallback;
try {
    // 尝试使用 Obsidian 原生 React
    _useState = useState; 
    _useMemo = useMemo; 
    _useEffect = useEffect; 
    _useRef = useRef; 
    _useCallback = useCallback;
} catch (e) {
    try {
        // 降级使用 Datacore 提供的 Hooks
        _useState = dc.useState; 
        _useMemo = dc.useMemo; 
        _useEffect = dc.useEffect; 
        _useRef = dc.useRef; 
        _useCallback = dc.useCallback;
    } catch (e2) {}
}
// 如果都无法获取，显示错误提示
if (!_useState) return <div>❌ 架构限制：需 Hooks 支持。</div>;

// ================== 3. 默认配置常量 ==================
const DEFAULT_MAX_DISPLAY_ITEMS = 30;   // 默认最大显示项数
const DEFAULT_PAGE_SIZE = 8;            // 默认每页显示数量
const DEBOUNCE_DELAY = 300;             // 防抖延迟（毫秒）

// ================== 4. 辅助函数 ==================
/**
 * 标准化字符串
 * 作用：统一转小写、去除特殊字符，用于大小写不敏感的比较
 * @param {string} str - 原始字符串
 * @returns {string} 标准化后的字符串
 */
const normalizeString = (str) => {
    if (!str) return "";
    return String(str)
        .replace(/^#/, '')           // 移除开头的 #（标签格式）
        .replace(/["'(),]/g, '')     // 移除引号、括号、逗号
        .trim()                       // 去除首尾空格
        .toLowerCase();               // 统一转小写
};

// ================== 5. 主组件 ==================
const AdvancedStatsApp = () => {
    // ----- 5.1 状态定义 -----
    // 从 CONFIG 获取初始配置
    const [prop, setProp] = _useState(CONFIG.prop);                           // 统计属性
    const [label, setLabel] = _useState(CONFIG.label);                       // 显示标题
    const [pendingLabel, setPendingLabel] = _useState(CONFIG.label);         // 待确认的标题（设置面板中使用）
    const [excludedFolders, setExcludedFolders] = _useState(CONFIG.excludedFolders); // 排除的目录
    const [excludedValues, setExcludedValues] = _useState(CONFIG.excludedValues);     // 排除的属性值
    const [showConfig, setShowConfig] = _useState(false);                    // 是否显示设置面板
    const [hoverIdx, setHoverIdx] = _useState(-1);                           // 当前悬停的扇形/图例索引（-1 表示无）
    const [isLoading, setIsLoading] = _useState(true);                       // 加载状态
    const [currentPage, setCurrentPage] = _useState(1);                      // 图例当前页码
    const [svgSize, setSvgSize] = _useState(300);                            // SVG 饼图尺寸（动态响应）
    const [maxDisplayItems, setMaxDisplayItems] = _useState(CONFIG.maxDisplayItems || DEFAULT_MAX_DISPLAY_ITEMS); // 最大显示项数
    const [pageSize, setPageSize] = _useState(CONFIG.pageSize || DEFAULT_PAGE_SIZE); // 每页显示数量
    
    // ----- 5.2 Refs（用于 DOM 引用和清理）-----
    const svgContainerRef = _useRef(null);          // SVG 容器引用
    const resizeObserverRef = _useRef(null);        // ResizeObserver 引用（用于清理）
    const debounceTimerRef = _useRef(null);         // 防抖定时器引用

    // ----- 5.3 缓存数据 -----
    // 获取所有 Markdown 文件（使用 useMemo 缓存，文件列表变化时才重新计算）
    const mdFiles = _useMemo(() => Array.from(app.vault.getMarkdownFiles()), []);

    /**
     * 扫描所有 frontmatter 属性
     * 用于设置面板中的下拉选项
     */
    const allProps = _useMemo(() => {
        const keys = new Set();
        for (const file of mdFiles) {
            const cache = app.metadataCache.getFileCache(file);
            if (cache?.frontmatter) {
                const fmKeys = Object.keys(cache.frontmatter);
                for (const k of fmKeys) {
                    keys.add(k);
                    if (keys.size > 100) break; // 限制最多 100 个属性，避免性能问题
                }
            }
        }
        return Array.from(keys).sort();
    }, [mdFiles]);

    /**
     * 获取所有目录列表
     * 用于设置面板中的排除目录选择
     */
    const allFolders = _useMemo(() => {
        const folders = new Set();
        const files = app.vault.getAllLoadedFiles();
        for (const f of files) {
            if (f.children && f.path !== "/") {  // 是文件夹且不是根目录
                folders.add(f.path);
                if (folders.size > 200) break;   // 限制最多 200 个目录
            }
        }
        return Array.from(folders).sort();
    }, []);

    /**
     * 核心统计逻辑
     * 统计指定属性的所有值及其出现次数
     * 支持：数组值、排除目录、排除值、大小写不敏感
     */
    const rawStats = _useMemo(() => {
        let valid = [];
        const folderExcl = excludedFolders;
        
        // 第一步：遍历所有文件，收集符合条件的属性值
        for (let i = 0; i < mdFiles.length; i++) {
            const file = mdFiles[i];
            
            // 检查是否在排除目录中
            let isExcluded = false;
            for (let j = 0; j < folderExcl.length; j++) {
                const f = folderExcl[j];
                if (file.path === f || file.path.startsWith(f + "/")) {
                    isExcluded = true;
                    break;
                }
            }
            if (isExcluded) continue;
            
            // 获取 frontmatter 中的属性值
            const cache = app.metadataCache.getFileCache(file);
            const val = cache?.frontmatter?.[prop];
            if (val !== undefined && val !== null) {
                valid.push({ v: val });
            }
        }

        // 第二步：统计各值的出现次数（大小写不敏感）
        const map = new Map();              // 存储 标准化值 -> 出现次数
        const originalValueMap = new Map(); // 存储 标准化值 -> 原始显示值（保留原始大小写）
        
        for (let i = 0; i < valid.length; i++) {
            const item = valid[i];
            // 支持数组格式的属性值（如 tags: ["tag1", "tag2"]）
            let vals = Array.isArray(item.v) ? item.v : [item.v];
            for (let j = 0; j < vals.length; j++) {
                let v = vals[j];
                const normalized = normalizeString(v);
                if (!normalized) continue;
                
                // 检查是否在排除值列表中
                if (excludedValues.some(ex => normalizeString(ex) === normalized)) {
                    continue;
                }
                
                // 保存原始显示值（第一次遇到时）
                if (!originalValueMap.has(normalized)) {
                    const originalStr = String(v).replace(/["'(),]/g, '').trim();
                    originalValueMap.set(normalized, originalStr);
                }
                
                // 累加计数
                map.set(normalized, (map.get(normalized) || 0) + 1);
            }
        }

        // 第三步：排序并计算总数
        const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]); // 按次数降序
        const totalSum = sorted.reduce((s, [, c]) => s + c, 0) || 1;    // 总计数（防止除零）
        
        // 构建显示名称映射
        const displayNames = new Map();
        for (const [normKey, count] of sorted) {
            const originalName = originalValueMap.get(normKey) || normKey;
            displayNames.set(normKey, originalName);
        }
        
        return { sorted, totalSum, displayNames };
    }, [prop, mdFiles, excludedFolders, excludedValues]);

    /**
     * 生成饼图数据（限制最大显示项数，超出归入"其他"）
     */
    const { paths, currentValues, hasMore, otherCount, originalCount } = _useMemo(() => {
        const { sorted, totalSum, displayNames } = rawStats;
        
        if (!sorted || sorted.length === 0) {
            return { paths: [], currentValues: [], hasMore: false, otherCount: 0, originalCount: 0 };
        }
        
        // 取前 N 项，其余归入"其他"
        const topItems = sorted.slice(0, maxDisplayItems);
        const otherSum = sorted.slice(maxDisplayItems).reduce((s, [, c]) => s + c, 0);
        
        // 计算饼图路径（SVG 弧形路径）
        let startAngle = -90;  // 起始角度（顶部）
        const pts = [];
        
        // 处理前 N 项
        for (let i = 0; i < topItems.length; i++) {
            const [normKey, count] = topItems[i];
            const displayName = displayNames.get(normKey) || normKey;
            const p = count / totalSum;                    // 占比
            const angle = p * 360;                         // 扇区角度
            const s = startAngle * Math.PI / 180;          // 起始弧度
            const e = (startAngle + angle) * Math.PI / 180; // 结束弧度
            
            // 计算路径点
            const cx = svgSize/2;
            const cy = svgSize/2;
            const r = svgSize * 0.4;  // 饼图半径
            const x1 = cx + r * Math.cos(s);
            const y1 = cy + r * Math.sin(s);
            const x2 = cx + r * Math.cos(e);
            const y2 = cy + r * Math.sin(e);
            
            const large = angle > 180 ? 1 : 0;  // 大弧标志
            const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
            const hue = (i * 137.5) % 360;      // 黄金角度配色
            
            startAngle += angle;
            pts.push({ 
                name: displayName,
                normalizedName: normKey,
                count, 
                percent: (p * 100).toFixed(1) + "%", 
                d, 
                hue, 
                isOther: false 
            });
        }
        
        // 添加"其他"项
        if (otherSum > 0) {
            const p = otherSum / totalSum;
            const angle = p * 360;
            const s = startAngle * Math.PI / 180;
            const e = (startAngle + angle) * Math.PI / 180;
            const cx = svgSize/2;
            const cy = svgSize/2;
            const r = svgSize * 0.4;
            const d = `M ${cx} ${cy} L ${cx + r * Math.cos(s)} ${cy + r * Math.sin(s)} A ${r} ${r} 0 ${angle>180?1:0} 1 ${cx + r * Math.cos(e)} ${cy + r * Math.sin(e)} Z`;
            const hue = (pts.length * 137.5) % 360;
            pts.push({ 
                name: "其他", 
                normalizedName: "other",
                count: otherSum, 
                percent: (p * 100).toFixed(1) + "%", 
                d, 
                hue, 
                isOther: true 
            });
        }

        return { 
            paths: pts, 
            currentValues: sorted.map(x => displayNames.get(x[0]) || x[0]).slice(0, 100),
            hasMore: sorted.length > maxDisplayItems,
            otherCount: sorted.slice(maxDisplayItems).length,
            originalCount: sorted.length
        };
    }, [rawStats, svgSize, maxDisplayItems]);

    // 当前悬停的项
    const active = hoverIdx >= 0 && hoverIdx < paths.length ? paths[hoverIdx] : null;
    const total = rawStats.totalSum;

    // 分页数据
    const paginatedPaths = _useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        return paths.slice(start, end);
    }, [paths, currentPage, pageSize]);

    const totalPages = Math.ceil(paths.length / pageSize);

    // 当最大显示项数或每页数量变化时，重置到第一页
    _useEffect(() => {
        setCurrentPage(1);
    }, [maxDisplayItems, pageSize]);

    /**
     * 翻页函数（带防抖）
     */
    const goToPage = _useCallback((page) => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            const targetPage = Math.max(1, Math.min(page, totalPages));
            setCurrentPage(targetPage);
            setHoverIdx(-1);
        }, DEBOUNCE_DELAY);
    }, [totalPages]);

    /**
     * 响应式饼图尺寸
     * 监听容器大小变化，动态调整 SVG 尺寸
     */
    _useEffect(() => {
        if (!svgContainerRef.current) return;
        
        const updateSize = () => {
            if (svgContainerRef.current) {
                const newSize = Math.min(svgContainerRef.current.clientWidth, 350);
                setSvgSize(Math.max(newSize, 180));
            }
        };
        
        updateSize();
        resizeObserverRef.current = new ResizeObserver(updateSize);
        resizeObserverRef.current.observe(svgContainerRef.current);
        
        return () => {
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
            }
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    // 简短的加载延迟（让组件稳定）
    _useEffect(() => {
        setTimeout(() => setIsLoading(false), 100);
    }, []);

    /**
     * 确认配置（仅更新本地状态，不持久化）
     * 如需永久保存，请修改代码顶部的 CONFIG 对象
     */
    const handleConfirmConfig = () => {
        setLabel(pendingLabel);
        setShowConfig(false);
    };

    /**
     * 可搜索的选择器组件
     * 用于设置面板中的目录选择和值排除
     */
    const SearchableSelector = ({ options, selected, onChange, placeholder, id }) => {
        const inputRef = _useRef(null);
        const selectRef = _useRef(null);
        
        _useEffect(() => {
            return () => {
                if (inputRef.current) {
                    inputRef.current.oninput = null;
                }
            };
        }, []);
        
        const handleInput = (e) => {
            const val = e.target.value.toLowerCase();
            const select = selectRef.current;
            if (!select) return;
            const filtered = options.filter(opt => opt.toLowerCase().includes(val) && !selected.includes(opt)).slice(0, 20);
            let html = '<option value="" disabled selected>点击添加...</option>';
            for (const opt of filtered) {
                html += `<option value="${opt.replace(/"/g, '&quot;')}">${opt}</option>`;
            }
            select.innerHTML = html;
        };
        
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {/* 已选标签列表 */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", padding: "6px", background: "var(--background-primary)", border: "1px solid var(--background-modifier-border)", borderRadius: "6px", minHeight: "32px" }}>
                    {selected.length === 0 && <span style={{fontSize: "0.8em", color: "var(--text-muted)", opacity: 0.5}}>无排除项</span>}
                    {selected.map(item => (
                        <span key={item} style={{ background: "var(--interactive-accent)", color: "var(--text-on-accent)", padding: "1px 6px", borderRadius: "4px", fontSize: "0.75em", display: "flex", alignItems: "center", gap: "4px" }}>
                            {item}
                            <span style={{ cursor: "pointer", fontWeight: "bold" }} onClick={() => onChange(selected.filter(i => i !== item))}>×</span>
                        </span>
                    ))}
                </div>
                {/* 搜索 + 添加 */}
                <div style={{ display: "flex", gap: "6px" }}>
                    <input 
                        ref={inputRef}
                        type="text" 
                        placeholder={`搜索${placeholder}...`} 
                        onInput={handleInput} 
                        style={{ flex: 1, fontSize: "0.8em", padding: "4px 8px", borderRadius: "4px", border: "1px solid var(--background-modifier-border-soft)", background: "var(--background-primary)" }} 
                    />
                    <select 
                        ref={selectRef}
                        id={`select-${id}`} 
                        style={{ width: "90px", fontSize: "0.8em" }} 
                        onChange={(e) => { if(e.target.value) { onChange([...selected, e.target.value]); e.target.value = ""; } }}>
                        <option value="" disabled selected>添加</option>
                        {options.filter(opt => !selected.includes(opt)).slice(0, 15).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            </div>
        );
    };

    // 加载状态显示
    if (isLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "40px" }}>
                <div style={{ fontSize: "0.9em", color: "var(--text-muted)" }}>⏳ 加载中...</div>
            </div>
        );
    }

    // ================== 6. 渲染界面 ==================
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "10px", color: "var(--text-normal)", maxWidth: "100%", overflow: "hidden" }}>
            
            {/* ----- 6.1 标题栏 ----- */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ fontSize: "1.2em", fontWeight: "bold" }}>📊 {label}分布</div>
                <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => setShowConfig(!showConfig)} style={{ padding: "4px 12px", borderRadius: "5px", background: "transparent", color: "var(--text-muted)", border: "1px solid var(--background-modifier-border)", cursor: "pointer", fontSize: "0.8em", opacity: 0.7, transition: "opacity 0.2s ease" }}
	                    onMouseEnter={(e) => {
			                e.currentTarget.style.opacity = "1";
			                e.currentTarget.style.background = "var(--background-modifier-hover)";  // 可选：悬停时背景变化
			            }}
			            onMouseLeave={(e) => {
			                e.currentTarget.style.opacity = "0.75";
			                e.currentTarget.style.background = "var(--background-secondary)";
			            }}
				    >
                        {showConfig ? "取消配置" : "设置面板"}
                    </button>
                </div>
            </div>

            {/* ----- 6.2 设置面板（可折叠）----- */}
            {showConfig && (
                <div style={{ padding: "12px", background: "var(--background-secondary)", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "10px", border: "1px solid var(--background-modifier-border-soft)" }}>
                    {/* 基础配置行 */}
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <div style={{ flex: "1 1 120px" }}>
                            <span style={{ fontSize: "0.7em", opacity: 0.6, marginBottom: "2px", display: "block" }}>目标属性</span>
                            <select 
                                value={prop} 
                                onChange={e => {
                                    const newProp = e.target.value;
                                    setProp(newProp);
                                    setExcludedValues([]);
                                }} 
                                style={{ width: "100%", padding: "4px", borderRadius: "4px" }}
                            >
                                {allProps.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div style={{ flex: "1 1 120px" }}>
                            <span style={{ fontSize: "0.7em", opacity: 0.6, marginBottom: "2px", display: "block" }}>显示名称</span>
                            <input 
                                value={pendingLabel} 
                                onChange={e => setPendingLabel(e.target.value)} 
                                style={{ width: "100%", padding: "4px", borderRadius: "4px", border: "1px solid var(--background-modifier-border)" }} 
                                placeholder="输入显示名称..."
                            />
                        </div>
                    </div>
                    {/* 显示配置行 */}
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <div style={{ flex: "1 1 120px" }}>
                            <span style={{ fontSize: "0.7em", opacity: 0.6, marginBottom: "2px", display: "block" }}>最大显示项数</span>
                            <input 
                                type="number"
                                value={maxDisplayItems} 
                                onChange={e => {
                                    const newValue = Math.max(1, parseInt(e.target.value) || 1);
                                    setMaxDisplayItems(newValue);
                                    setCurrentPage(1);
                                }} 
                                style={{ width: "100%", padding: "4px", borderRadius: "4px", border: "1px solid var(--background-modifier-border)" }} 
                                min="1"
                            />
                        </div>
                        <div style={{ flex: "1 1 120px" }}>
                            <span style={{ fontSize: "0.7em", opacity: 0.6, marginBottom: "2px", display: "block" }}>每页显示数量</span>
                            <input 
                                type="number"
                                value={pageSize} 
                                onChange={e => {
                                    const newValue = Math.max(1, parseInt(e.target.value) || 1);
                                    setPageSize(newValue);
                                    setCurrentPage(1);
                                }} 
                                style={{ width: "100%", padding: "4px", borderRadius: "4px", border: "1px solid var(--background-modifier-border)" }} 
                                min="1"
                            />
                        </div>
                    </div>
                    {/* 排除配置 */}
                    <SearchableSelector id="folder" options={allFolders} selected={excludedFolders} onChange={setExcludedFolders} placeholder="目录" />
                    <SearchableSelector id="val" options={currentValues} selected={excludedValues} onChange={setExcludedValues} placeholder="属性值" />
                    
                    {/* 确认按钮 */}
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                        <button 
                            onClick={handleConfirmConfig}
                            style={{ padding: "6px 16px", borderRadius: "5px", background: "var(--interactive-accent)", color: "var(--text-on-accent)", border: "none", cursor: "pointer", fontSize: "0.8em" }}
                        >
                            确认配置
                        </button>
                    </div>
                    <div style={{ fontSize: "0.7em", color: "var(--text-muted)", textAlign: "center", marginTop: "4px" }}>
                        💡 提示：如需永久保存配置，请修改代码顶部的 CONFIG 对象
                    </div>
                </div>
            )}

            {/* ----- 6.3 统计卡片 ----- */}
            <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1, textAlign: "center", padding: "12px", background: "var(--background-primary-alt)", borderRadius: "8px", border: "1px solid var(--background-modifier-border-soft)" }}>
                    <div style={{ fontSize: "1.6em", fontWeight: "800", color: "var(--interactive-accent)" }}>{total}</div>
                    <div style={{ fontSize: "0.75em", opacity: 0.6 }}>已匹配文件</div>
                </div>
                <div style={{ flex: 1, textAlign: "center", padding: "12px", background: "var(--background-primary-alt)", borderRadius: "8px", border: "1px solid var(--background-modifier-border-soft)" }}>
                    <div style={{ fontSize: "1.6em", fontWeight: "800" }}>{mdFiles.length}</div>
                    <div style={{ fontSize: "0.75em", opacity: 0.6 }}>库内总文件</div>
                </div>
            </div>

            {/* ----- 6.4 饼图 + 图例（核心可视化）----- */}
            <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "clamp(10px, 5%, 50px)", 
                flexWrap: "wrap", 
                justifyContent: "center",
                width: "100%"
            }}>
                
                {/* 饼图区域 */}
                <div 
                    ref={svgContainerRef}
                    style={{ 
                        flex: "1 1 200px",  /* 最小占据200px，可自动放大 */
                        maxWidth: "350px",
                        minWidth: "180px",
                        aspectRatio: "1/1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    <svg viewBox={`0 0 ${svgSize} ${svgSize}`} style={{ width: "100%", height: "100%" }}>
                        {/* 扇形路径 */}
                        {paths.map((p, i) => (
                            <path 
                                key={i} 
                                d={p.d} 
                                fill={`hsl(${p.hue}, 60%, 50%)`}
                                style={{ 
                                    // 非悬停时半透明，悬停时全亮
                                    opacity: hoverIdx === -1 || hoverIdx === i ? 1 : 0.2, 
                                    transition: "all 0.25s ease", 
                                    cursor: "pointer",
                                    filter: hoverIdx === i ? "brightness(1.1)" : "none"
                                }}
                                onMouseEnter={() => setHoverIdx(i)}
                                onMouseLeave={() => setHoverIdx(-1)}
                            />
                        ))}
                        {/* 中心圆（环形效果） */}
                        <circle cx={svgSize/2} cy={svgSize/2} r={svgSize * 0.21} fill="var(--background-primary)" />
                        {/* 中心文字 - 标题 */}
                        <text x={svgSize/2} y={svgSize/2 - 8} textAnchor="middle" fontSize={svgSize * 0.06} fontWeight="bold" fill="var(--text-normal)" style={{ pointerEvents: "none" }}>
                            {active ? (active.name.length > 12 ? active.name.substring(0,11)+"…" : active.name) : (label.length > 10 ? label.substring(0,9)+"…" : label)}
                        </text>
                        {/* 中心文字 - 数值 */}
                        <text x={svgSize/2} y={svgSize/2 + 12} textAnchor="middle" fontSize={svgSize * 0.045} fill="var(--text-muted)" style={{ pointerEvents: "none" }}>
                            <tspan fontWeight="bold" fill="var(--interactive-accent)">{active ? active.count : total}</tspan>
                            <tspan fill="var(--text-faint)"> · </tspan>
                            <tspan>{active ? active.percent : "100%"}</tspan>
                        </text>
                    </svg>
                </div>

                {/* 图例区域 */}
                <div style={{ 
                    flex: "2 1 280px", /* 占据比饼图更多的剩余空间 */
                    maxHeight: "400px", 
                    maxWidth: "300px",
                    minWidth: "140px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    flexShrink: 1, 
                    overflow: "hidden"
                }}>
                    {/* 表头 */}
                    <div style={{ display: "flex", padding: "8px 4px", color: "var(--text-muted)", fontSize: "0.75em", borderBottom: "1px solid var(--background-modifier-border-soft)", fontWeight: "bold" }}>
                        <span style={{ flex: "1 1 60px", minWidth: "60px", flexShrink: 0, overflow: "hidden" }}>名称</span>
                        <span style={{ width: "60px", textAlign: "right", flexShrink: 3, overflow: "hidden", whiteSpace: "nowrap", marginLeft: "8px" }}>占比</span>
                        <span style={{ width: "50px", textAlign: "right", flexShrink: 5, overflow: "hidden", whiteSpace: "nowrap", marginLeft: "8px" }}>数量</span>
                    </div>
                    
                    {/* 图例列表 */}
                    <div style={{ flex: 1, overflowY: "auto", maxHeight: "280px" }}>
                        {paginatedPaths.map((p, i) => {
                            const globalIndex = (currentPage - 1) * pageSize + i;
                            return (
                                <div 
                                    key={i} 
                                    style={{ 
                                        display: "flex", 
                                        alignItems: "center",
                                        padding: "4px 4px",  /*影响列表行高*/
                                        fontSize: "0.85em", 
                                        borderRadius: "4px", 
                                        background: hoverIdx === globalIndex ? "var(--background-modifier-hover)" : "transparent", 
                                        opacity: hoverIdx === -1 || hoverIdx === globalIndex ? 1 : 0.5,
                                        transition: "all 0.2s ease",
                                        cursor: "pointer",
                                        overflow: "hidden" 
                                    }}
                                    onMouseEnter={() => setHoverIdx(globalIndex)}
                                    onMouseLeave={() => setHoverIdx(-1)}
                                >
                                    {/* 色块 + 名称 */}
                                    <span style={{ flex: "1 1 60px", minWidth: "60px", display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: `hsl(${p.hue}, 60%, 50%)`, flexShrink: 0 }} />
                                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: hoverIdx === globalIndex ? "var(--interactive-accent)" : "inherit" }}>
                                            {p.name}{p.isOther && otherCount > 0 ? ` (${otherCount}+)` : ""}
                                        </span>
                                    </span>
                                    {/* 占比 */}
                                    <span style={{ width: "60px", textAlign: "right", marginLeft: "8px", opacity: 0.7, fontSize: "0.9em", fontVariantNumeric: "tabular-nums", flexShrink: 3, overflow: "hidden", whiteSpace: "nowrap" }}>{p.percent}</span>
                                    {/* 数量 */}
                                    <span style={{ width: "50px", textAlign: "right", fontWeight: "bold", fontVariantNumeric: "tabular-nums", flexShrink: 5, overflow: "hidden", whiteSpace: "nowrap", marginLeft: "8px" }}>{p.count}</span>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* 分页控件 */}
                    {totalPages > 1 && (
                        <div style={{ 
                            display: "flex", 
                            justifyContent: "center", 
                            alignItems: "center", 
                            gap: "6px", 
                            padding: "8px 4px",
                            borderTop: "1px solid var(--background-modifier-border-soft)",
                            fontSize: "0.75em"
                        }}>
                            <button 
                                onClick={() => goToPage(1)}
                                disabled={currentPage === 1}
                                style={{ 
                                    padding: "2px 8px", 
                                    borderRadius: "4px", 
                                    background: currentPage === 1 ? "var(--background-modifier-border)" : "var(--interactive-accent)",
                                    color: currentPage === 1 ? "var(--text-muted)" : "var(--text-on-accent)",
                                    border: "none", 
                                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                                    opacity: currentPage === 1 ? 0.5 : 1
                                }}
                            >
                                «
                            </button>
                            <button 
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                style={{ 
                                    padding: "2px 8px", 
                                    borderRadius: "4px", 
                                    background: currentPage === 1 ? "var(--background-modifier-border)" : "var(--interactive-accent)",
                                    color: currentPage === 1 ? "var(--text-muted)" : "var(--text-on-accent)",
                                    border: "none", 
                                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                                    opacity: currentPage === 1 ? 0.5 : 1
                                }}
                            >
                                ‹
                            </button>
                            <span style={{ color: "var(--text-muted)" }}>
                                {currentPage} / {totalPages}
                            </span>
                            <button 
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                style={{ 
                                    padding: "2px 8px", 
                                    borderRadius: "4px", 
                                    background: currentPage === totalPages ? "var(--background-modifier-border)" : "var(--interactive-accent)",
                                    color: currentPage === totalPages ? "var(--text-muted)" : "var(--text-on-accent)",
                                    border: "none", 
                                    cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                                    opacity: currentPage === totalPages ? 0.5 : 1
                                }}
                            >
                                ›
                            </button>
                            <button 
                                onClick={() => goToPage(totalPages)}
                                disabled={currentPage === totalPages}
                                style={{ 
                                    padding: "2px 8px", 
                                    borderRadius: "4px", 
                                    background: currentPage === totalPages ? "var(--background-modifier-border)" : "var(--interactive-accent)",
                                    color: currentPage === totalPages ? "var(--text-muted)" : "var(--text-on-accent)",
                                    border: "none", 
                                    cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                                    opacity: currentPage === totalPages ? 0.5 : 1
                                }}
                            >
                                »
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {/* ----- 6.5 性能提示（仅当有"其他"分类时显示）----- */}
            {hasMore && (
                <div style={{ fontSize: "0.7em", color: "var(--text-muted)", textAlign: "center", padding: "4px" }}>
                    💡 共 {originalCount} 个分类，当前仅显示前 {maxDisplayItems} 项，其余已归入「其他」
                </div>
            )}
        </div>
    );
};

return <AdvancedStatsApp />;
```
