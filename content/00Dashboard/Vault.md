---
modified date: 2026-01-15 09:13:26
---


```datacorejsx 
/* ==================================================================
    ACTIVITIES (React + Datacore)
    - Author: @furbas16e8 (https://github.com/furbas16e8) 
    - Heatmaps of notes by category (Personal, Studies, Career).
    - Trend Chart (TrendChart).
    - Ref.: activities.css
 ================================================================== */

return function View() {
    // --- CONFIGURATION ---
    const CONFIG = {
        TITLE: "活动看板",
        MONTHS_BACK: 12,
        WEEK_START_MONDAY: true,
        CHART_HEIGHT: 30, // px
        DATE_FIELDS: ["date", "Data", "Início", "Date", "created date", "created_date"], // Keep original keys for compatibility
        LEVEL_THRESHOLDS: [0, 1, 2, 3, 4, 5],
        CATEGORIES: [
            { title: "商业", folder: "02Business" },
            { title: "生活", folder: "03Life" },
            { title: "成长", folder: "04Growth" },
            { title: "书籍", folder: "05Books" },
            { title: "影视", folder: "06Movies" },
            { title: "日记", folder: "00Journal" }
        ],
        CSS_VARS: {
            prefix: "--ativ-",
            keys: ["cell-size", "cell-gap", "radius", "padding-container"],
            defaults: { "cell-size": 14, "cell-gap": 3, "radius": 2 }
        },
        DEBOUNCE_MS: 500,
        GRADIENT: { bottom: "0%", top: "100%", opacityBottom: 0.8, opacityTop: 0.9 }
    };

    // --- HOOKS ---
    function useStyleConfig() {
        const [styles, setStyles] = dc.useState({ cell: 14, gap: 3, rad: 2 });
        
        dc.useEffect(() => {
            const getNum = (prop, fallback) => {
                const val = getComputedStyle(document.body).getPropertyValue(CONFIG.CSS_VARS.prefix + prop);
                const parsed = parseFloat(val);
                return Number.isFinite(parsed) ? parsed : fallback;
            };
            const update = () => {
                setStyles({
                    cell: getNum("cell-size", CONFIG.CSS_VARS.defaults["cell-size"]),
                    gap: getNum("cell-gap", CONFIG.CSS_VARS.defaults["cell-gap"]),
                    rad: getNum("radius", CONFIG.CSS_VARS.defaults["radius"])
                });
            };
            update();
            const id = setInterval(update, 2000); 
            return () => clearInterval(id);
        }, []);
        return styles;
    }

    function useHeatmapData(folder) {
        const pages = dc.useQuery(`@page and path("${folder}")`, { debounce: CONFIG.DEBOUNCE_MS });
        const today = dc.useMemo(() => dc.coerce.date(new Date().toISOString()).startOf("day"), []);
        const startDate = dc.useMemo(() => today.minus({ months: CONFIG.MONTHS_BACK }).startOf("day"), [today]);

        const { dailyMap, dailyList } = dc.useMemo(() => {
            const map = new Map();
            for (const page of pages) {
                let date = null;
                for (const field of CONFIG.DATE_FIELDS) {
                    const val = page.value(field);
                    if (val != null) {
                        // 将内容转为字符串并去掉多余空格
                        let dateStr = String(val).trim();
                        
                        // 如果长度超过10位（比如包含了 19:09:39），就只取前10位（2026-01-14）
                        if (dateStr.length > 10) {
                            dateStr = dateStr.substring(0, 10);
                        }
                        
                        // 让系统尝试解析这个日期
                        date = dc.coerce.date(dateStr);

                        // 检查解析是否成功
                        if (date && date.isValid) { 
                            date = date.startOf("day"); 
                            break; 
                        }
                    }
                }
                if (!date || !date.isValid || date < startDate || date > today) continue;

                const iso = date.toISODate();
                if (!map.has(iso)) map.set(iso, { count: 0, files: [] });
                const entry = map.get(iso);
                entry.count++;
                entry.files.push({ name: page.$name, path: page.$path });
            }
            const list = [];
            let cursor = startDate;
            while(cursor <= today) { list.push(cursor); cursor = cursor.plus({ days: 1 }); }
            return { dailyMap: map, dailyList: list };
        }, [pages, startDate, today]);

        return { dailyMap, dailyList, startDate, today };
    }

    // --- SERVICE ---
    const StatsService = {
        calculate(dailyMap, dailyList) {
            const values = [];
            const dayFreq = [0, 0, 0, 0, 0, 0, 0, 0];
            let totalNotes = 0;
            for (const day of dailyList) {
                const count = dailyMap.get(day.toISODate())?.count ?? 0;
                values.push(count);
                if (count > 0) {
                    totalNotes += count;
                    if (day.weekday >= 1 && day.weekday <= 7) dayFreq[day.weekday] += count;
                }
            }
            const N = values.length;
            if (N === 0) return { mean: "0", sigma: "0", mode: "—", kurt: "0", gap: "0" };

            const mean = totalNotes / N;
            let sumSq = 0; let sum4th = 0;
            for (const v of values) { const diff = v - mean; sumSq += Math.pow(diff, 2); sum4th += Math.pow(diff, 4); }
            const variance = sumSq / N;
            const sigma = Math.sqrt(variance);
            const kurtosis = variance > 0 ? (sum4th / N) / Math.pow(variance, 2) : 0;

            let maxFreq = 0; let maxDayIdx = 1;
            for (let i = 1; i <= 7; i++) { if (dayFreq[i] > maxFreq) { maxFreq = dayFreq[i]; maxDayIdx = i; } }
            const weekDays = ["", "周一", "周二", "周三", "周四", "周五", "周六", "周日"];
            const mode = maxFreq > 0 ? weekDays[maxDayIdx] : "—";

            let gapSum = 0; let gapEvents = 0; let currentGap = 0; let hasStarted = false;
            for (const v of values) {
                if (v > 0) { if (hasStarted && currentGap > 0) { gapSum += currentGap; gapEvents++; } hasStarted = true; currentGap = 0; }
                else if (hasStarted) { currentGap++; }
            }
            const avgGap = gapEvents > 0 ? (gapSum / gapEvents) : 0;
            return { mean: mean.toFixed(2), sigma: sigma.toFixed(2), mode, kurt: kurtosis.toFixed(1), gap: avgGap.toFixed(1) };
        },
        getLevel(count) {
            for (let i = CONFIG.LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
                if (count >= CONFIG.LEVEL_THRESHOLDS[i]) return i;
            }
            return 0;
        }
    };

    // --- COMPONENTS ---

    function TrendChart({ dailyMap, startDate, today, onPointClick }) {
        const [viewMode, setViewMode] = dc.useState("week");
        const [chartType, setChartType] = dc.useState("area");
        const gradId = dc.useMemo(() => "grad-" + Math.random().toString(36).substr(2, 9), []);
        const gradHoverId = gradId + "-hover";

        const buckets = dc.useMemo(() => {
            const result = [];
            let cursor = startDate;
            while (cursor <= today) {
                const isWeek = viewMode === "week";
                const startOfPeriod = isWeek ? cursor.startOf("week") : cursor.startOf("month");
                const endOfPeriod = isWeek ? cursor.endOf("week") : cursor.endOf("month");
                const key = isWeek ? startOfPeriod.toISODate() : startOfPeriod.toFormat("yyyy-MM");
                let label = "";
                if (isWeek) label = `第 ${cursor.weekNumber} 周`;
                else { 
                    // 获取月份数字（1-12）并加上“月”字
                    label = cursor.toFormat("M") + "月"; 
                }
                // else { const m = cursor.setLocale("zh-CN").toFormat("MMMM"); label = m.charAt(0).toUpperCase() + m.slice(1); }

                let sum = 0; let batchFiles = [];
                let internalCursor = cursor;
                while (internalCursor <= endOfPeriod && internalCursor <= today) {
                    const entry = dailyMap.get(internalCursor.toISODate());
                    if (entry) { sum += entry.count; batchFiles.push(...entry.files); }
                    internalCursor = internalCursor.plus({ days: 1 });
                }
                result.push({ key, value: sum, label, files: batchFiles });
                cursor = internalCursor;
            }
            return result;
        }, [viewMode, dailyMap, startDate, today]);

        const HEIGHT = CONFIG.CHART_HEIGHT;
        const WIDTH = 1000;
        const maxValue = Math.max(...buckets.map(b => b.value), 1);
        const stepX = WIDTH / (buckets.length - 1 || 1);

        const generateSmoothPath = (points) => {
            if (points.length === 0) return "";
            if (points.length === 1) return `M ${points[0][0]},${points[0][1]} L ${points[0][0]},${points[0][1]}`;
            const op = (p, n) => { const lx = n[0] - p[0]; const ly = n[1] - p[1]; return { len: Math.sqrt(lx*lx + ly*ly), ang: Math.atan2(ly, lx) }; };
            const cp = (curr, prev, next, rev) => {
                const p = prev || curr; const n = next || curr; const o = op(p, n);
                const ang = o.ang + (rev ? Math.PI : 0); const len = o.len * 0.2;
                return [curr[0] + Math.cos(ang) * len, curr[1] + Math.sin(ang) * len];
            };
            let d = `M ${points[0][0].toFixed(1)},${points[0][1].toFixed(1)} `;
            for (let i = 1; i < points.length; i++) {
                const startCp = cp(points[i-1], points[i-2], points[i], false);
                const endCp = cp(points[i], points[i-1], points[i+1], true);
                d += `C ${startCp[0].toFixed(1)},${startCp[1].toFixed(1)} ${endCp[0].toFixed(1)},${endCp[1].toFixed(1)} ${points[i][0].toFixed(1)},${points[i][1].toFixed(1)} `;
            }
            return d;
        };

        const renderArea = () => {
            const points = buckets.map((b, i) => [i * stepX, HEIGHT - ((b.value / maxValue) * HEIGHT)]);
            const pathLine = generateSmoothPath(points);
            const pathFill = `${pathLine} L ${WIDTH},${HEIGHT} L 0,${HEIGHT} Z`;
            return (
                <g className="ativ-trend-group-area">
                    <path d={pathFill} className="ativ-trend-area-fill" style={{ fill: `url(#${gradId})` }} />
                    <path d={pathLine} className="ativ-trend-area-line" />
                    {buckets.map((b, i) => (
                        <rect key={`trig-${b.key}`} x={(i * stepX) - (stepX / 2)} y={0} width={stepX} height={HEIGHT} fill="transparent" className="ativ-trend-trigger" style={{ cursor: b.value > 0 ? "pointer" : "default" }} onClick={(e) => onPointClick(e, b)}>
                             <title>{`${b.label} (${b.value})`}</title>
                        </rect>
                    ))}
                </g>
            );
        };

        const renderBars = () => (
             <g className="ativ-trend-group-bars">
                {buckets.map((b, i) => {
                    const barW = Math.max(1, (WIDTH - (buckets.length * 2)) / buckets.length);
                    const barH = (b.value / maxValue) * HEIGHT;
                    return (
                        <rect key={b.key} x={i * (barW + 2)} y={HEIGHT - barH} width={barW} height={barH} className="ativ-trend-element-bar"
                            style={{ "--fill-normal": `url(#${gradId})`, "--fill-hover": `url(#${gradHoverId})`, cursor: b.value > 0 ? "pointer" : "default" }}
                            onClick={(e) => onPointClick(e, b)}>
                            <title>{`${b.label} (${b.value})`}</title>
                        </rect>
                    );
                })}
            </g>
        );

        return (
            <div className="ativ-trend-container">
                <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="ativ-trend-svg">
                    <defs>
                        <linearGradient id={gradId} x1="0" y1="1" x2="0" y2="0">
                            <stop offset={CONFIG.GRADIENT.bottom} stopColor="var(--grad-bottom)" stopOpacity={CONFIG.GRADIENT.opacityBottom} />
                            <stop offset={CONFIG.GRADIENT.top} stopColor="var(--grad-top)" stopOpacity={CONFIG.GRADIENT.opacityTop} />
                        </linearGradient>
                        <linearGradient id={gradHoverId} x1="0" y1="1" x2="0" y2="0">
                            <stop offset={CONFIG.GRADIENT.bottom} stopColor="var(--grad-bottom)" stopOpacity={CONFIG.GRADIENT.opacityBottom} />
                            <stop offset={CONFIG.GRADIENT.top} stopColor="var(--grad-top-hover)" stopOpacity="1" />
                        </linearGradient>
                    </defs>
                    {chartType === "bar" ? renderBars() : renderArea()}
                </svg>
                <div className="ativ-trend-controls">
                    <div className="ativ-trend-toggle">
                        <span className={viewMode === "week" ? "is-active" : ""} onClick={() => setViewMode("week")}>周</span><span className="ativ-sep">/</span>
                        <span className={viewMode === "month" ? "is-active" : ""} onClick={() => setViewMode("month")}>月</span>
                    </div>
                    <span className="ativ-trend-sep-group">|</span>
                    <div className="ativ-trend-toggle">
                        <span className={chartType === "bar" ? "is-active" : ""} onClick={() => setChartType("bar")}>柱状图</span><span className="ativ-sep">/</span>
                        <span className={chartType === "area" ? "is-active" : ""} onClick={() => setChartType("area")}>面积图</span>
                    </div>
                </div>
            </div>
        );
    }

    function HeatmapBlock({ title, folder, styles }) {
        const { dailyMap, dailyList, startDate, today } = useHeatmapData(folder);
        const stats = dc.useMemo(() => StatsService.calculate(dailyMap, dailyList), [dailyMap, dailyList]);
        const [tooltip, setTooltip] = dc.useState({ visible: false, x: 0, y: 0, text: "" });
        const [menu, setMenu] = dc.useState(null);

        const handleInteraction = {
            cellEnter: (dateIso, count) => (e) => setTooltip({ visible: true, x: e.nativeEvent.offsetX + 12, y: e.nativeEvent.offsetY + 12, text: `${dc.coerce.date(dateIso).toFormat("dd/MM/yyyy")} — ${count} 篇笔记` }),
            cellMove: (e) => { if (tooltip.visible) setTooltip(t => ({ ...t, x: e.nativeEvent.offsetX + 12, y: e.nativeEvent.offsetY + 12 })); },
            cellLeave: () => setTooltip(t => ({ ...t, visible: false })),
            showMenu: (e, label, files) => {
                if (!files || files.length === 0) return;
                e.preventDefault(); e.stopPropagation();
                const root = e.target.closest(".ativ-heatmap-root");
                let align = "right"; let x = 0; let y = 0;
                if (root) {
                    const rect = root.getBoundingClientRect();
                    const clientX = e.clientX || e.nativeEvent.clientX; 
                    const clientY = e.clientY || e.nativeEvent.clientY;
                    x = clientX - rect.left; y = clientY - rect.top;
                    align = clientX > (window.innerWidth / 2) ? "left" : "right";
                }
                setMenu({ x, y, align, label, files });
            },
            clickCell: (dateIso) => (e) => {
                const entry = dailyMap.get(dateIso);
                if (entry) handleInteraction.showMenu(e, dc.coerce.date(dateIso).toFormat("dd/MM/yyyy"), entry.files);
            }
        };

        dc.useEffect(() => {
            const closer = (e) => { if (menu && !e.target.closest(".ativ-heatmap-menu")) setMenu(null); };
            if (menu) document.addEventListener("click", closer, true);
            return () => document.removeEventListener("click", closer, true);
        }, [menu]);

        const startOfWeek = startDate.startOf("week");
        const weeksCount = Math.ceil(dailyList.length / 7) + 1;
        const width = weeksCount * (styles.cell + styles.gap) + 10;
        const height = (7 * (styles.cell + styles.gap)) + 30;
        let lastMonthRendered = -1;

        return (
            <div className="ativ-heatmap-root" data-id={title}>
                <div className="ativ-heatmap-title">{title}</div>
                <svg className="ativ-heatmap-svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`} onMouseMove={handleInteraction.cellMove}>
                    {dailyList.map(date => {
                        const iso = date.toISODate();
                        const diffDays = Math.floor(date.diff(startOfWeek, "days").days);
                        const col = Math.floor(diffDays / 7);
                        const row = CONFIG.WEEK_START_MONDAY ? ((date.weekday + 6) % 7) : (date.weekday % 7);
                        const x = Math.round(col * (styles.cell + styles.gap));
                        const y = Math.round(20 + row * (styles.cell + styles.gap));
                        const entry = dailyMap.get(iso);
                        const count = entry?.count ?? 0;
                        const rectNode = <rect key={`r-${iso}`} className="ativ-heatmap-cell" x={x} y={y} width={styles.cell} height={styles.cell} rx={styles.rad} ry={styles.rad}
                                data-level={StatsService.getLevel(count)} onMouseEnter={handleInteraction.cellEnter(iso, count)} onMouseLeave={handleInteraction.cellLeave}
                                onClick={handleInteraction.clickCell(iso)} />;
                        let labelNode = null;
                        if (date.month !== lastMonthRendered && date.day <= 7) { lastMonthRendered = date.month; labelNode = <text key={`m-${iso}`} className="ativ-heatmap-month-label" x={x} y={y - 5}>{date.setLocale("zh-CN").toFormat("LLL")}</text>; }
                        return <g key={`g-${iso}`}>{rectNode}{labelNode}</g>;
                    })}
                </svg>
                <div className="ativ-stats-grid">
                    <div className="ativ-stat-col"><span className="ativ-stat-header">平均值</span><span className="ativ-stat-val">{stats.mean}</span></div>
                    <div className="ativ-stat-col"><span className="ativ-stat-header">标准差</span><span className="ativ-stat-val">{stats.sigma}</span></div>
                    <div className="ativ-stat-col"><span className="ativ-stat-header">高产日</span><span className="ativ-stat-val">{stats.mode}</span></div>
                    <div className="ativ-stat-col"><span className="ativ-stat-header">峰度</span><span className="ativ-stat-val">{stats.kurt}</span></div>
                    <div className="ativ-stat-col"><span className="ativ-stat-header">平均间隔</span><span className="ativ-stat-val">{stats.gap}</span></div>
                </div>
                <TrendChart dailyMap={dailyMap} startDate={startDate} today={today} onPointClick={(e, data) => handleInteraction.showMenu(e, data.label, data.files)} />
                <div className="ativ-heatmap-tooltip" style={{ opacity: tooltip.visible ? 1 : 0, left: tooltip.x, top: tooltip.y }}>{tooltip.text}</div>
                {menu && (
                    <div className={`ativ-heatmap-menu align-${menu.align}`} style={{ left: menu.x, top: menu.y }}>
                        <div className="ativ-heatmap-menu-title">{menu.label} — {menu.files.length} 篇笔记</div>
                        <div>{menu.files.map(f => (<div className="ativ-heatmap-menu-item" key={f.path}><a href={f.path} onClick={(e) => { e.preventDefault(); app.workspace.openLinkText(f.path, "", true); setMenu(null); }}>{f.name}</a></div>))}</div>
                    </div>
                )}
            </div>
        );
    }

    // --- MAIN COMPONENT (WITH TITLE AND DIVIDER) ---
    function AtividadesBoard() {
        const styles = useStyleConfig();
        return (
            /* Main Div */
            <div className="ativ-heatmaps-container">
                 {/* Title Structure + Divider (identical to Dashboard) */}
                <div className="title-tabs">
                    <span className="title-tab is-active">{CONFIG.TITLE}</span>
                </div>
                
                <div className="ativ-heatmaps-shell">
                    {CONFIG.CATEGORIES.map(cat => <HeatmapBlock key={cat.folder} title={cat.title} folder={cat.folder} styles={styles} />)}
                </div>
            </div>
        );
    }

    return <AtividadesBoard />;
};

```



```datacorejsx
/* ==================================================================
    MEMORIES (React + Datacore)
    - Author: @furbas16e8 (https://github.com/furbas16e8) 
    - "Memories" list (past notes)
    - Ref.: memories.css
 ================================================================== */

return function View() {
    const CONFIG = {
        TITLE: "回忆",
        SOURCE_FOLDERS: [
		    "00Journal/01DailyNotes",
		    "02Business",
		    "03Life",
		    "04Growth"
		],
        FIELDS: {
            DATE: ["date", "Date", "created", "created_at", "created_date", "created date"],
            TIME: ["hour", "Hour", "time", "timestamp"]
        },
        LABELS: {
            MONTHS: [, "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
            DAYS: [, "周一", "周二", "周三", "周四", "周五", "周六", "周日"],
            PERIODS: ["凌晨", "上午", "下午", "晚上"]
        }
    };

    // --- SERVICE ---
    const TimeParserService = {
        clampTime({ h = 0, m = 0 } = {}) { return { h: Math.max(0, Math.min(23, h | 0)), m: Math.max(0, Math.min(59, m | 0)) }; },
        toISO({ y, m, d }) { return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`; },
        toJSDate({ y, m, d }) { return new Date(y, m - 1, d); },
        extractDate(raw) {
            if (!raw) return null;
            if (raw.year != null && raw.month != null && raw.day != null) return { y: raw.year | 0, m: raw.month | 0, d: raw.day | 0 };
            if (raw instanceof Date && !isNaN(raw)) return { y: raw.getFullYear(), m: raw.getMonth() + 1, d: raw.getDate() };
            if (typeof raw === "string") {
                let match = raw.match(/(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/);
                if (match) return { y: +match[1], m: +match[2], d: +match[3] };
                match = raw.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
                if (match) return { y: +match[3] < 100 ? 2000 + +match[3] : +match[3], m: +match[2], d: +match[1] };
                const digits = raw.replace(/\D/g, "");
                if (digits.length >= 8) return { y: +digits.slice(0, 4), m: +digits.slice(4, 6), d: +digits.slice(6, 8) };
            }
            return null;
        },
        extractTime(raw) {
            if (!raw) return null;
            if (raw.hour != null && raw.minute != null) return this.clampTime({ h: raw.hour, m: raw.minute });
            if (raw instanceof Date && !isNaN(raw)) return this.clampTime({ h: raw.getHours(), m: raw.getMinutes() });
            if (typeof raw === "number") {
                const s = String(raw);
                if (s.length <= 2) return this.clampTime({ h: +s, m: 0 });
                if (s.length === 3) return this.clampTime({ h: +s[0], m: +s.slice(1) });
                return this.clampTime({ h: +s.slice(0, 2), m: +s.slice(2, 4) });
            }
            if (typeof raw === "string") {
                const s = raw.trim();
                const match = s.match(/(\d{1,2})\s*[:hH\.]\s*(\d{2})/);
                if (match) return this.clampTime({ h: +match[1], m: +match[2] });
                const digits = s.replace(/\D/g, ""); 
                if (!digits) return null;
                if (digits.length <= 2) return this.clampTime({ h: +digits, m: 0 });
                if (digits.length === 3) return this.clampTime({ h: +digits[0], m: +digits.slice(1) });
                return this.clampTime({ h: +digits.slice(0, 2), m: +digits.slice(2, 4) });
            }
            return null;
        },
        getPeriodAlias(dateObj, hour) {
            const jsDate = this.toJSDate(dateObj);
            const dayIdx = jsDate.getDay() === 0 ? 7 : jsDate.getDay();
            const weekDay = CONFIG.LABELS.DAYS[dayIdx];
            let period = CONFIG.LABELS.PERIODS[3]; // 默认“晚上”
            if (hour <= 4) period = CONFIG.LABELS.PERIODS[0];
            else if (hour <= 11) period = CONFIG.LABELS.PERIODS[1];
            else if (hour <= 17) period = CONFIG.LABELS.PERIODS[2];
            
            // 返回格式：周一 · 上午
            return `${weekDay} · ${period}`; 
        },
        formatDateFull({ y, m, d }) { 
            return `${y}年${m}月${d}日`; 
        }
    };

    const MarkdownService = {
        clean(md) { return md.replace(/^---[\s\S]*?---\s*/m, "").replace(/```[\s\S]*?```/g, " ").replace(/\r/g, "\n"); },
        mdToHtml(text) {
            let s = text.replace(/`([^`]+)`/g, "<code>$1</code>");
            s = s.replace(/(\*\*|__)(.+?)\1/g, "<strong>$2</strong>");
            s = s.replace(/(\*|_)([^*_][\s\S]*?)\1/g, "<em>$2</em>");
            s = s.replace(/~~(.+?)~~/g, "<del>$1</del>");
            s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, t, u) => `<a href="${u.replace(/"/g, "&quot;")}" target="_blank">${t}</a>`);
            s = s.replace(/\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g, (m, target, anchor, alias) => `<a class="internal-link" href="${anchor ? target + '#' + anchor : target}">${alias || target}</a>`);
            return s;
        },
        getFirstParagraph(md) {
            const paragraphs = this.clean(md).split(/\n\s*\n+/).map(x => x.trim()).filter(Boolean);
            if (!paragraphs.length) return "";
            let p = paragraphs[0].replace(/^#{1,6}\s+/gm, "").replace(/^\s{0,3}>\s?/gm, "").replace(/!\[[^\]]*\]\([^)]*\)/g, "");
            return this.mdToHtml(p).replace(/\s+/g, " ").trim();
        }
    };

    // --- HOOKS ---
    function useMemoryPreview(path) {
        const [preview, setPreview] = dc.useState("...");
        const revision = dc.useIndexUpdates({ debounce: 3000 });
        dc.useEffect(() => {
            let active = true;
            (async () => {
                try {
                    const af = app.vault.getAbstractFileByPath(path);
                    if (!af) { if (active) setPreview("N/A"); return; }
                    const content = await app.vault.read(af);
                    if (active) setPreview(MarkdownService.getFirstParagraph(content) || "...");
                } catch { if (active) setPreview("Error"); }
            })();
            return () => { active = false; };
        }, [path, revision]);
        return preview;
    }

    function useMemoryData() {
        //const pages = dc.useQuery(`@page and path("${CONFIG.SOURCE_FOLDER}")`);
        // 将数组转换为 path("A") or path("B") or path("C") 的格式
	    const pathConditions = CONFIG.SOURCE_FOLDERS
	        .map(folder => `path("${folder}")`)
	        .join(" or ");
    
    // 使用拼接好的路径条件进行查询
	    const pages = dc.useQuery(`@page and (${pathConditions})`);
        const currentFile = dc.useCurrentFile();
        const anchorDate = dc.useMemo(() => {
            const m = (currentFile?.$name || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
            const now = new Date();
            if (m) return { y: +m[1], m: +m[2], d: +m[3] };
            return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
        }, [currentFile]);

        const memoryItems = dc.useMemo(() => {
            return pages.map(page => {
                let rawDate = null;
                for (const f of CONFIG.FIELDS.DATE) { const v = page.value(f); if (v != null) { rawDate = v; break; } }
                const dateObj = TimeParserService.extractDate(rawDate);
                let timeObj = null;
                for (const f of CONFIG.FIELDS.TIME) { const v = page.value(f); if (v != null) { const p = TimeParserService.extractTime(v); if (p) { timeObj = p; break; } } }
                if (!timeObj && rawDate) timeObj = TimeParserService.extractTime(rawDate);
                if (!timeObj) {
                    const t = TimeParserService.extractTime(page.$name);
                    if (t) timeObj = t;
                    else { const tm = (page.$name || "").replace(/\D/g, "").slice(-4); if (/^\d{4}$/.test(tm)) timeObj = { h: +tm.slice(0, 2), m: +tm.slice(2, 4) }; }
                }
                if (!timeObj) timeObj = TimeParserService.extractTime(page.$ctime);
                return { page, date: dateObj, time: timeObj || { h: 12, m: 0 } };
            }).filter(i => i.date != null);
        }, [pages]);
        return { memoryItems, anchorDate };
    }

    function useMemoryTabs(memoryItems, anchorDate) {
        const [activeTab, setActiveTab] = dc.useState(null);
        const tabs = dc.useMemo(() => {
            const sub = (d, t, a) => {
                const js = TimeParserService.toJSDate(d);
                if (t === "days") js.setDate(js.getDate() - a);
                if (t === "months") js.setMonth(js.getMonth() - a);
                if (t === "years") js.setFullYear(js.getFullYear() - a);
                return { y: js.getFullYear(), m: js.getMonth() + 1, d: js.getDate() };
            };
            const existing = new Set(memoryItems.map(i => TimeParserService.toISO(i.date)));
            const fixed = [
                { label: "1周前", date: sub(anchorDate, "days", 7) },
                { label: "1个月前", date: sub(anchorDate, "months", 1) },
                { label: "3个月前", date: sub(anchorDate, "months", 3) },
                { label: "6个月前", date: sub(anchorDate, "months", 6) }
            ].filter(c => existing.has(TimeParserService.toISO(c.date)));
            const years = new Set(memoryItems.filter(i => i.date.m === anchorDate.m && i.date.d === anchorDate.d && i.date.y < anchorDate.y).map(i => anchorDate.y - i.date.y));
            const yCandidates = Array.from(years).sort((a, b) => a - b).map(d => ({ label: d === 1 ? "1年前" : `${d}年前`, date: sub(anchorDate, "years", d) }));
            return [...fixed, ...yCandidates];
        }, [memoryItems, anchorDate]);
        dc.useEffect(() => { if (!activeTab && tabs.length > 0) setActiveTab(tabs[0]); }, [tabs]);
        return { tabs, activeTab, setActiveTab };
    }

    // --- COMPONENTS ---
    function MemoryCard({ item }) {
        // 1. 重新启用内容预览逻辑（获取文件第一行）
        const preview = useMemoryPreview(item.page.$path);
        
        // 跳转逻辑
        const open = () => app.workspace.openLinkText(item.page.$path, "/", true);
        
        // 时间和别名
        const alias = TimeParserService.getPeriodAlias(item.date, item.time.h);
        const time = `${String(item.time.h).padStart(2, '0')}:${String(item.time.m).padStart(2, '0')}`;
        
        return (
            <div 
                className="mem-card" 
                role="button" 
                tabIndex={0} 
                /* onClick={open} */ // 如果你想恢复全卡片点击，去掉前后的注释符号
            >
                <div className="mem-head">
                    <span className="mem-title-link">{alias}</span>
                    <span className="mem-time">({time})</span>
                </div>
                
                {/* 2. 第一行：显示文件名（带预览功能） */}
                <div style={{ marginBottom: "4px" }}>
                    <a 
                        className="mem-body internal-link" 
                        href={item.page.$path}
                        onClick={(e) => {
                            e.stopPropagation(); 
                            e.preventDefault(); 
                            open();
                        }}
                        style={{ 
                            fontWeight: "bold", 
                            color: "var(--text-accent)",
                            textDecoration: "none",
                            fontSize: "1em" // 让文件名稍微大一点
                        }}
                    >
                        {item.page.$name}
                    </a>
                </div>

                {/* 3. 第二行：显示文件第一行内容 */}
                <div 
                    className="mem-body markdown-rendered" 
                    style={{ 
                        fontSize: "0.9em", 
                        opacity: 0.8,
                        lineHeight: "1.4",
                        color: "var(--text-normal)"
                    }}
                    dangerouslySetInnerHTML={{ __html: preview }} 
                />
            </div>
        );
    }

    function MemoryGrid({ activeTab, memoryItems }) {
        if (!activeTab) return null;
        const target = TimeParserService.toISO(activeTab.date);
        const items = memoryItems.filter(i => TimeParserService.toISO(i.date) === target).sort((a, b) => (a.time.h * 60 + a.time.m) - (b.time.h * 60 + b.time.m) || a.page.$name.localeCompare(b.page.$name));
        return (
            <>
                <h3 className="mem-subtitle">{TimeParserService.formatDateFull(activeTab.date)}</h3>
                {items.length === 0 ? <p className="mem-empty">暂无日记</p> : <div className="mem-grid">{items.map((it, i) => <MemoryCard key={it.page.$path + i} item={it} />)}</div>}
            </>
        );
    }

    function MemoriasBoard() {
        const [isOpen, setIsOpen] = dc.useState(false);
        const { memoryItems, anchorDate } = useMemoryData();
        const { tabs, activeTab, setActiveTab } = useMemoryTabs(memoryItems, anchorDate);
        const toggle = () => setIsOpen(p => !p);

        return (
             /* Root Container with Highlight Line Structure */
            <div className="memorias-root">
                <div className="title-tabs">
                    <span className={`title-tab ${isOpen ? "is-active" : ""}`} onClick={toggle} style={{cursor:"pointer"}}>{CONFIG.TITLE}</span>
                </div>

                {isOpen && (
                    <div className="mem-text">
                        <nav className="mem-tabs">
                            {tabs.map(tab => (
                                <button key={tab.label} className={`mem-tab ${activeTab && TimeParserService.toISO(activeTab.date) === TimeParserService.toISO(tab.date) ? "mem-tab--active" : ""}`} onClick={() => setActiveTab(tab)}>{tab.label}</button>
                            ))}
                        </nav>
                        <MemoryGrid activeTab={activeTab} memoryItems={memoryItems} />
                    </div>
                )}
            </div>
        );
    }

    return <MemoriasBoard />;
};

```

