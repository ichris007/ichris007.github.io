/* =============================================================================
 * AI 发展史图谱 —— 交互可视化 (D3.js v7)
 * 支持两套数据集切换：核心版 134 (window.AI_DATA) / 完整版 323 (window.AI_DATA_300)
 * 功能：年份力导向布局 / 点击高亮邻居 / 悬停 Tooltip / 底部时间轴联动 /
 *       搜索定位 / 图例 / 脉络线开关(学术·技术·商业·重大事件) / 历史回放 /
 *       范式时代背景带 / 缩放隐藏标签(密集版) / 版本切换
 * ===========================================================================*/
(function () {
  "use strict";

  /* ----------------------------- 常量与配置 ----------------------------- */
  const LAYOUT_MIN = 1900;            // 早于该年的节点统一压缩到左侧
  const AXIS_MAX = 2026;              // 时间轴右端（当前年份），滑块/轴域均可拖到 2026
  const TYPE_COLOR = {
    Person: "#ef4444", Organization: "#22c55e", Concept: "#a855f7", Field: "#64748b",
    Algorithm: "#06b6d4", Architecture: "#3b82f6", Hardware: "#f97316", Paper: "#84cc16", Event: "#ea580c"
  };
  /* ------------------------- 主题色板（浅色 / 深色） ------------------------- */
  const THEME_TOKENS = {
    light: {
      grid: "#e2e8f0",
      edge: "#94a3b8",
      nodeStroke: "#ffffff",
      eventStroke: "#7c2d12",
      ringDefault: "#ffffff",
      ringSelected: "#0f172a",
      ringNeighbor: "#f59e0b"
    },
    dark: {
      grid: "#1f2937",
      edge: "#94a3b8",
      nodeStroke: "#0b1220",
      eventStroke: "#fed7aa",
      ringDefault: "#0b1220",
      ringSelected: "#f8fafc",
      ringNeighbor: "#fbbf24"
    }
  };
  // 初始主题取自 <html data-theme>（由 index.html 前置脚本写入，避免首屏闪白）
  let themeKey = (document.documentElement.getAttribute("data-theme") === "dark") ? "dark" : "light";
  function T() { return THEME_TOKENS[themeKey]; }

  /* ------------------------- 主题切换 ------------------------- */
  function applyThemeUI() {
    const btn = document.getElementById("themeBtn");
    if (btn) {
      const dark = themeKey === "dark";
      btn.textContent = dark ? "☀️ 浅色" : "🌙 深色";
      btn.title = dark ? "当前：深色模式，点击切回浅色" : "当前：浅色模式，点击切到深色";
    }
  }
  function setTheme(key) {
    themeKey = (key === "dark") ? "dark" : "light";
    try { localStorage.setItem("ai_graph_theme", themeKey); } catch (e) {}
    document.documentElement.setAttribute("data-theme", themeKey);
    applyThemeUI();
    // 重绘背景时代带 + 重跑渲染（含节点描边/环色）；不重建节点，保留布局与图片
    drawBands();
    render();
  }
  const themeBtnEl = document.getElementById("themeBtn");
  if (themeBtnEl) {
    themeBtnEl.addEventListener("click", () => setTheme(themeKey === "dark" ? "light" : "dark"));
  }
  applyThemeUI();

  const TYPE_LABEL = {
    Person: "人物", Organization: "组织", Concept: "概念", Field: "领域",
    Algorithm: "算法", Architecture: "架构", Hardware: "硬件", Paper: "论文", Event: "事件"
  };
  const TYPE_EMOJI = {
    Person: "👤", Organization: "🏢", Concept: "💡", Field: "🎯",
    Algorithm: "⚙️", Architecture: "🏗️", Hardware: "🔧", Paper: "📄", Event: "⭐"
  };
  const REL_AXIS = {
    ADVISOR: "academic", AUTHOR: "academic", PROPOSED: "academic",
    INFLUENCED: "academic", CITE: "academic",
    BUILT_UPON: "tech", SUBCLASS_OF: "tech",
    AFFILIATED_WITH: "business", RELEASED: "business",
    ACQUIRED: "business", PARTNERED_WITH: "business", FUNDED: "business"
  };
  const AXIS_COLOR = {
    academic: "#a855f7", tech: "#3b82f6", business: "#22c55e", event: "#ea580c"
  };

  /* ----------------------------- 可切换的数据状态 ----------------------------- */
  let DATA = window.AI_DATA;          // 当前数据集
  let currentKey = "core";            // 'core' | 'full'
  let R = 17;                         // 节点半径基准（密集版更小）
  let nodes, links, nodeById, minYear, maxYear;
  const displayYear = d => Math.max(LAYOUT_MIN, d.year);
  let edgeAxis, adj;
  let linkSel, nodeSel;
  let sim = null;
  let lastVisible = new Set();
  let currentTransform = d3.zoomIdentity;
  const LABEL_HIDE_K = 0.9;           // 缩放系数低于此值时，密集版隐藏文字标签

  /* ----------------------------- id / 端点辅助 ----------------------------- */
  const idOf = (e, key) => {
    const v = e[key];
    return typeof v === "object" && v !== null ? v.id : v;
  };
  const idObj = (e, key) => {
    const v = e[key];
    return typeof v === "object" && v !== null ? v : nodeById.get(v);
  };

  /* ----------------------------- 状态 ----------------------------- */
  const state = {
    threshold: 2026, soloAxis: null, selected: null, search: "", playing: false, alignYear: false
  };

  /* ----------------------------- 尺寸 / 比例尺 ----------------------------- */
  const container = document.getElementById("graph");
  let width = container.clientWidth;
  let height = container.clientHeight;
  const margin = { top: 64, right: 60, bottom: 84, left: 60 };
  const xScale = d3.scaleLinear().domain([LAYOUT_MIN, AXIS_MAX]).range([margin.left, width - margin.right]);
  const yMid = () => (margin.top + height - margin.bottom) / 2;

  /* ----------------------------- SVG 骨架 ----------------------------- */
  const svg = d3.select("#graph").append("svg").attr("width", width).attr("height", height).attr("class", "graph-svg");
  const defs = svg.append("defs");
  const gRoot = svg.append("g").attr("class", "root");
  const gBands = gRoot.append("g").attr("class", "bands");
  const gGrid = gRoot.append("g").attr("class", "grid");
  const gLinks = gRoot.append("g").attr("class", "links");
  const gNodes = gRoot.append("g").attr("class", "nodes");
  const gPlayhead = gRoot.append("g").attr("class", "playhead-g");
  const playheadLine = gPlayhead.append("line").attr("class", "playhead");
  const gEra = gRoot.append("g").attr("class", "era-labels"); // 时代标签置顶，避免被节点遮挡

  /* ----------------------------- 背景：范式时代带 + 年份网格 ----------------------------- */
  function drawBands() {
    gBands.selectAll("*").remove();
    // 五时代（重叠共存）：半透明叠色表现"并存 / 交替主导"
    const eras = [
      { from: 1956, to: 1985, name: "符号主义", fill: "rgba(245,158,11,0.12)", fillD: "rgba(245,158,11,0.20)", label: "#92400e", labelD: "#fbbf24", labelDy: 14 },
      { from: 1980, to: 2010, name: "联结主义复兴 · 统计机器学习", fill: "rgba(13,148,136,0.12)", fillD: "rgba(13,148,136,0.22)", label: "#115e59", labelD: "#5eead4", labelDy: 28 },
      { from: 2006, to: 2017, name: "深度学习", fill: "rgba(59,130,246,0.12)", fillD: "rgba(59,130,246,0.20)", label: "#1d4ed8", labelD: "#93c5fd", labelDy: 14 },
      { from: 2017, to: 2023, name: "大模型 · 生成式 AI", fill: "rgba(139,92,246,0.12)", fillD: "rgba(139,92,246,0.22)", label: "#5b21b6", labelD: "#c4b5fd", labelDy: 42 },
      { from: 2023, to: AXIS_MAX, name: "具身智能 · AI Agent", fill: "rgba(244,63,94,0.12)", fillD: "rgba(244,63,94,0.20)", label: "#9f1239", labelD: "#fda4af", labelDy: 56 }
    ];
    const top = margin.top, bot = height - margin.bottom;
    // 半透明矩形：重叠区域颜色自然混合，直观表现"并存"
    gBands.selectAll("rect").data(eras).join("rect")
      .attr("x", d => xScale(d.from)).attr("y", top)
      .attr("width", d => Math.max(0, xScale(d.to) - xScale(d.from))).attr("height", bot - top)
      .attr("fill", d => themeKey === "dark" ? d.fillD : d.fill);
    // 时代标签：置于顶部空白条（节点区之上），垂直错开避免重叠；画在置顶图层 gEra，确保不被节点遮挡
    gEra.selectAll("text.era-label").data(eras).join("text")
      .attr("class", "era-label").attr("x", d => (xScale(d.from) + xScale(d.to)) / 2)
      .attr("y", d => d.labelDy).attr("text-anchor", "middle")
      .style("fill", d => themeKey === "dark" ? d.labelD : d.label).text(d => d.name);
    // 年份刻度网格（保留）
    gGrid.selectAll("*").remove();
    const ticks = d3.range(LAYOUT_MIN, AXIS_MAX + 1, 10).concat(AXIS_MAX);
    gGrid.selectAll("line.tick").data(ticks).join("line")
      .attr("class", "tick").attr("x1", d => xScale(d)).attr("x2", d => xScale(d))
      .attr("y1", top).attr("y2", bot).attr("stroke", T().grid).attr("stroke-width", 1);
    gGrid.selectAll("text.year-tick").data(ticks).join("text")
      .attr("class", "year-tick").attr("x", d => xScale(d)).attr("y", bot + 16)
      .attr("text-anchor", "middle").text(d => d);
    // 注意：五时代"重叠共存"是常态，不再画"一刀切"的硬边界分隔线
    // 播放头竖线：随底部时间轴移动，标出当前阈值年份在图谱中的精确位置
    playheadLine.attr("y1", top).attr("y2", bot);
  }

  /* ----------------------------- 形状生成 ----------------------------- */
  function starPoints(r) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 === 0 ? r : r * 0.45;
      const a = Math.PI / 5 * i - Math.PI / 2;
      pts.push((Math.cos(a) * rad).toFixed(1) + "," + (Math.sin(a) * rad).toFixed(1));
    }
    return pts.join(" ");
  }
  function hexPoints(r) {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 3 * i - Math.PI / 6;
      pts.push((Math.cos(a) * r).toFixed(1) + "," + (Math.sin(a) * r).toFixed(1));
    }
    return pts.join(" ");
  }
  function shapePath(type, r) {
    switch (type) {
      case "Person": return `M0,${-r}a${r},${r} 0 1,0 0,${2 * r}a${r},${r} 0 1,0 0,${-2 * r}Z`;
      case "Organization": return roundedRect(r + 2, r - 1, 5);
      case "Concept": return diamond(r);
      case "Field": return `M${-(r + 4)},0a${r + 4},${r - 2} 0 1,0 ${2 * (r + 4)},0a${r + 4},${r - 2} 0 1,0 ${-2 * (r + 4)},0Z`;
      case "Algorithm": return roundedRect(r + 1, r - 2, 2);
      case "Architecture": return `M${hexPoints(r + 2)}`;
      case "Hardware": return diamond(r);
      case "Paper": return roundedRect(r, r - 3, 2);
      case "Event": return `M${starPoints(r + 1)}`;
      default: return `M0,${-r}a${r},${r} 0 1,0 0,${2 * r}a${r},${r} 0 1,0 0,${-2 * r}Z`;
    }
  }
  function roundedRect(w, h, r) {
    return `M${-w + r},${-h}` +
      `h${2 * w - 2 * r}` + `a${r},${r} 0 0,1 ${r},${r}` +
      `v${2 * h - 2 * r}` + `a${r},${r} 0 0,1 ${-r},${r}` +
      `h${-2 * w + 2 * r}` + `a${r},${r} 0 0,1 ${-r},${-r}` +
      `v${-2 * h + 2 * r}` + `a${r},${r} 0 0,1 ${r},${-r}Z`;
  }
  function diamond(r) { return `M0,${-r}L${r * 0.78},0L0,${r}L${-r * 0.78},0Z`; }

  /* ----------------------------- 力导向布局 ----------------------------- */
  function ticked() {
    const top = margin.top, bot = height - margin.bottom;
    nodes.forEach(d => {
      const tx = xScale(displayYear(d));
      if (state.alignYear && !d.fx) d.x = tx;                       // 对齐年份：硬吸附（精确对齐，密集年竖直堆叠属正常）
      else if (!d.fx) d.x += (tx - d.x) * 0.06;                     // 默认：轻软吸附，压低漂移、保留有机散布（堆叠由 forceX 决定，与此无关）
      d.y = Math.max(top, Math.min(bot, d.y));
    });
    gLinks.selectAll("line")
      .attr("x1", d => idObj(d, "source").x).attr("y1", d => idObj(d, "source").y)
      .attr("x2", d => idObj(d, "target").x).attr("y2", d => idObj(d, "target").y);
    gNodes.selectAll("g.node").attr("transform", d => `translate(${d.x},${d.y})`);
  }

  function dragStart(ev, d) { if (!ev.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; }
  function dragged(ev, d) { d.fx = ev.x; d.fy = ev.y; }
  function dragEnd(ev, d) { if (!ev.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }

  /* ----------------------------- 数据集构建 ----------------------------- */
  function buildData() {
    nodes = DATA.nodes.map(d => Object.assign({}, d));
    links = DATA.edges.map((d, i) => Object.assign({ __i: i }, d));
    nodeById = new Map(nodes.map(d => [d.id, d]));
    minYear = d3.min(nodes, d => d.year);
    maxYear = d3.max(nodes, d => d.year);
    nodes.forEach(d => {
      d.x = xScale(displayYear(d));
      d.y = yMid() + (Math.random() - 0.5) * (height - margin.top - margin.bottom) * 0.8;
    });
    edgeAxis = links.map(l => {
      const s = nodeById.get(idOf(l, "source"));
      const t = nodeById.get(idOf(l, "target"));
      if ((s && s.type === "Event") || (t && t.type === "Event")) return "event";
      return REL_AXIS[l.relation] || "tech";
    });
    adj = new Map(nodes.map(n => [n.id, new Set()]));
    links.forEach(l => {
      const s = idOf(l, "source"), t = idOf(l, "target");
      if (adj.has(s)) adj.get(s).add(t);
      if (adj.has(t)) adj.get(t).add(s);
    });
  }

  function buildSim() {
    if (sim) sim.stop();
    const dense = currentKey === "full";
    sim = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(dense ? 36 : 42).strength(0.08))
      .force("x", d3.forceX(d => xScale(displayYear(d))).strength(0.85))
      .force("y", d3.forceY(yMid()).strength(0.03))
      .force("charge", d3.forceManyBody().strength(dense ? -100 : -120))
      .force("collide", d3.forceCollide(dense ? 15 : 22))
      .on("tick", ticked);
  }

  function buildGraph() {
    gLinks.selectAll("*").remove();
    gNodes.selectAll("*").remove();
    defs.selectAll("clipPath").remove();
    linkSel = gLinks.selectAll("line").data(links).join("line")
      .attr("class", "edge").attr("stroke", T().edge).attr("stroke-width", 1.2).attr("stroke-opacity", 0.5);
    nodeSel = gNodes.selectAll("g.node").data(nodes).join("g")
      .attr("class", "node").style("cursor", "pointer")
      .call(d3.drag().on("start", dragStart).on("drag", dragged).on("end", dragEnd))
      .on("click", (ev, d) => { ev.stopPropagation(); selectNode(d); })
      .on("mouseover", (ev, d) => showTooltip(ev, d))
      .on("mousemove", moveTooltip)
      .on("mouseout", hideTooltip);
    nodeSel.each(function (d) {
      const g = d3.select(this);
      const color = TYPE_COLOR[d.type] || "#64748b";
      const shape = g.append("path").attr("class", "shape").attr("fill", color)
        .attr("stroke", T().nodeStroke).attr("stroke-width", 2).attr("d", shapePath(d.type, R));
      if (d.type === "Event") shape.attr("stroke", T().eventStroke).attr("stroke-width", 1.5);

      // 人物 / 组织节点：优先显示权威头像 / logo（本地 images/ 路径），缺图则回退 emoji
      const isImg = (d.type === "Person" || d.type === "Organization") &&
                    typeof d.image === "string" && d.image.indexOf("images/") === 0;
      if (isImg) {
        const clipId = "clip-" + d.id;
        const dPath = shapePath(d.type, R);
        defs.append("clipPath").attr("id", clipId).attr("clipPathUnits", "userSpaceOnUse")
          .append("path").attr("d", dPath);
        const imgW = d.type === "Person" ? 2 * R : 2 * (R + 2);
        const imgH = d.type === "Person" ? 2 * R : 2 * (R - 1);
        const img = g.append("image")
          .attr("class", "node-img")
          .attr("href", d.image).attr("xlink:href", d.image)
          .attr("x", -imgW / 2).attr("y", -imgH / 2).attr("width", imgW).attr("height", imgH)
          .attr("clip-path", "url(#" + clipId + ")")
          .attr("preserveAspectRatio", d.type === "Person" ? "xMidYMid slice" : "xMidYMid meet");
        img.on("error", function () {
          d3.select(this).remove();
          g.append("text").attr("class", "node-emoji").attr("text-anchor", "middle")
            .attr("dy", "0.35em").attr("font-size", 14).text(TYPE_EMOJI[d.type] || "•");
        });
      } else {
        g.append("text").attr("class", "node-emoji").attr("text-anchor", "middle")
          .attr("dy", "0.35em").attr("font-size", 14).text(TYPE_EMOJI[d.type] || "•");
      }

      g.append("text").attr("class", "node-label").attr("text-anchor", "middle")
        .attr("y", R + 13).attr("font-size", 11).text(d.label);
    });
  }

  /* ----------------------------- 缩放 / 拖拽 ----------------------------- */
  const zoom = d3.zoom().scaleExtent([0.3, 3]).on("zoom", (ev) => {
    gRoot.attr("transform", ev.transform);
    currentTransform = ev.transform;
    applyLabelVisibility();
  });
  svg.call(zoom).on("dblclick.zoom", null);
  svg.on("click", () => { state.selected = null; render(); });

  /* ----------------------------- 渲染 (可见性 + 高亮) ----------------------------- */
  function isNodeVisible(d) { return d.year <= state.threshold || d.year < LAYOUT_MIN; }

  function render() {
    const soloAxis = state.soloAxis;
    const newVisible = new Set();
    nodeSel.style("display", d => {
      const vis = isNodeVisible(d);
      if (vis) newVisible.add(d.id);
      return vis ? null : "none";
    });
    linkSel.style("display", d => {
      const s = nodeById.get(idOf(d, "source"));
      const t = nodeById.get(idOf(d, "target"));
      const timeVis = s && t && isNodeVisible(s) && isNodeVisible(t);
      return timeVis ? null : "none";
    });

    let focusSet = null, focusLinks = null;
    if (soloAxis) {
      focusLinks = new Set();
      links.forEach(l => { if (edgeAxis[l.__i] === soloAxis) focusLinks.add(l.__i); });
      focusSet = new Set();
      links.forEach(l => {
        if (edgeAxis[l.__i] === soloAxis) { focusSet.add(idOf(l, "source")); focusSet.add(idOf(l, "target")); }
      });
    } else if (state.selected) {
      focusSet = new Set(adj.get(state.selected));
      focusSet.add(state.selected);
      focusLinks = new Set();
      links.forEach(l => {
        if (idOf(l, "source") === state.selected || idOf(l, "target") === state.selected) focusLinks.add(l.__i);
      });
    } else if (state.search) {
      const q = state.search.toLowerCase();
      focusSet = new Set(nodes.filter(n => n.label.toLowerCase().includes(q)).map(n => n.id));
    }

        // 节点高亮邻居集合（可在选中脉络线类别的同时叠加显示）
    let neighborSet = null, neighborLinks = null;
    if (state.selected) {
      neighborSet = new Set(adj.get(state.selected));
      neighborSet.add(state.selected);
      neighborLinks = new Set();
      links.forEach(l => {
        if (idOf(l, "source") === state.selected || idOf(l, "target") === state.selected) neighborLinks.add(l.__i);
      });
    }

    // 计算单个节点目标透明度（脉络线类别 + 点节点邻居 可叠加）
    const nodeTargetOpacity = (id) => {
      if (soloAxis && state.selected) {
        if (neighborSet.has(id)) return 1;
        if (focusSet.has(id)) return 0.4;
        return 0.06;
      }
      if (soloAxis) return focusSet.has(id) ? 1 : 0.08;
      if (state.selected) return neighborSet.has(id) ? 1 : 0.12;
      if (!focusSet) return 1;
      return focusSet.has(id) ? 1 : 0.12;
    };

    nodeSel.style("opacity", d => nodeTargetOpacity(d.id)).select(".shape")
      .attr("stroke", d => {
        if (state.selected && neighborSet && neighborSet.has(d.id)) {
          return (d.id === state.selected) ? T().ringSelected : T().ringNeighbor;
        }
        return T().ringDefault;
      })
      .attr("stroke-width", d => {
        if (state.selected && neighborSet && neighborSet.has(d.id)) {
          return (d.id === state.selected) ? 4 : 3;
        }
        return 2;
      });

    linkSel.style("opacity", d => {
      if (soloAxis && state.selected) {
        if (neighborLinks.has(d.__i)) return 0.95;
        if (edgeAxis[d.__i] === soloAxis) return 0.25;
        return 0.04;
      }
      if (soloAxis) return edgeAxis[d.__i] === soloAxis ? 0.95 : 0.04;
      if (state.selected) return focusLinks.has(d.__i) ? 0.95 : 0.04;
      if (focusSet) return 0.15;
      return 0.5;
    }).attr("stroke", d => {
      if (soloAxis && edgeAxis[d.__i] === soloAxis) return AXIS_COLOR[soloAxis];
      if (state.selected && focusLinks && focusLinks.has(d.__i)) {
        const s = nodeById.get(idOf(d, "source"));
        return TYPE_COLOR[s ? s.type : "Field"] || T().edge;
      }
      return T().edge;
    }).attr("stroke-width", d => {
      if (neighborLinks && neighborLinks.has(d.__i)) return 2.6;
      if ((soloAxis && edgeAxis[d.__i] === soloAxis) || (state.selected && focusLinks && focusLinks.has(d.__i))) return 2;
      return 1.2;
    });

    newVisible.forEach(id => {
      if (!lastVisible.has(id)) {
        const sel = nodeSel.filter(d => d.id === id);
        sel.style("opacity", 0);
        const target = nodeTargetOpacity(id);
        sel.transition().duration(450).style("opacity", target);
      }
    });
    lastVisible = newVisible;

    applyLabelVisibility();
  }

  /* 缩放隐藏标签：密集版在缩小时隐藏文字（事件节点常显），核心版始终显示 */
  function applyLabelVisibility() {
    if (!nodeSel) return;
    if (currentKey !== "full") { nodeSel.select(".node-label").style("opacity", 1); return; }
    const k = currentTransform.k;
    const hide = k < LABEL_HIDE_K;
    nodeSel.each(function (d) {
      const g = d3.select(this);
      const groupOpacity = parseFloat(g.style("opacity") || "1");
      const isEvent = d.type === "Event";
      const show = isEvent || (!hide && groupOpacity >= 0.5);
      g.select(".node-label").style("opacity", show ? 1 : 0);
    });
  }

  function selectNode(d) {
    state.selected = (state.selected === d.id) ? null : d.id;
    render();
  }

  /* ----------------------------- Tooltip ----------------------------- */
  const tooltip = d3.select("#tooltip");
  let hideTimer = null;
  function cancelHide() { if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; } }
  function showTooltip(ev, d) {
    cancelHide();
    const color = TYPE_COLOR[d.type] || "#64748b";
    const isImg = (d.type === "Person" || d.type === "Organization") &&
                  typeof d.image === "string" && d.image.indexOf("images/") === 0;
    const headIcon = isImg
      ? `<img class="${d.type === "Organization" ? "tt-logo tt-logo-org" : "tt-logo"}" src="${d.image}" alt="">`
      : `<span class="tt-emoji">${TYPE_EMOJI[d.type] || "•"}</span>`;
    let html = `<div class="tt-head" style="border-color:${color}">
        ${headIcon}
        <span class="tt-title">${d.label}</span>
        <span class="tt-type" style="background:${color}">${TYPE_LABEL[d.type]}</span>
      </div>`;
    html += `<div class="tt-meta">📅 ${d.year} 年${d.era ? " · " + d.era : ""}${d.paradigm ? " · " + d.paradigm : ""}</div>`;
    if (d.description) html += `<div class="tt-desc">${d.description}</div>`;
    if (d.url) html += `<div class="tt-link"><a href="${d.url}" target="_blank" rel="noopener">查看来源 ↗</a></div>`;
    tooltip.html(html).style("display", "block");
    const link = tooltip.select(".tt-link a").node();
    if (link) link.addEventListener("click", ev2 => ev2.stopPropagation());
    moveTooltip(ev);
  }
  function moveTooltip(ev) {
    const pad = 16;
    let x = ev.clientX + pad, y = ev.clientY + pad;
    const tw = tooltip.node().offsetWidth, th = tooltip.node().offsetHeight;
    if (x + tw > window.innerWidth) x = ev.clientX - tw - pad;
    if (y + th > window.innerHeight) y = ev.clientY - th - pad;
    tooltip.style("left", x + "px").style("top", y + "px");
  }
  function hideTooltip() {
    cancelHide();
    hideTimer = setTimeout(() => { tooltip.style("display", "none"); hideTimer = null; }, 350);
  }
  tooltip.on("mouseenter", cancelHide).on("mouseleave", hideTooltip);

  /* ----------------------------- 时间轴滑块 ----------------------------- */
  const slider = document.getElementById("yearSlider");
  const yearLabel = document.getElementById("yearLabel");
  const thumbYear = document.getElementById("thumbYear");
  slider.min = LAYOUT_MIN; slider.max = AXIS_MAX; slider.value = AXIS_MAX; slider.step = 1;
  // 统一刷新：阈值 + 左侧年份 + 图谱播放头竖线 + 圆点年份气泡
  function updateTimeControl() {
    const y = +slider.value;
    state.threshold = y;
    yearLabel.textContent = y + " 年";
    const px = xScale(y);                 // 与图谱共用比例尺，保证视觉对齐
    playheadLine.attr("x1", px).attr("x2", px);
    thumbYear.textContent = y;
    thumbYear.style.left = (px - margin.left) + "px"; // #timeline 左缘 = margin.left
    render();
  }
  slider.addEventListener("input", updateTimeControl);

  /* ----------------------------- 分层开关（纯单选 solo） ----------------------------- */
  const layerBtns = [...document.querySelectorAll(".layer-btn")];
  const layerAllBtn = document.getElementById("layerAllBtn");
  function updateLayerButtons() {
    layerBtns.forEach(b => b.classList.toggle("active", b.dataset.axis === state.soloAxis));
    if (layerAllBtn) layerAllBtn.classList.toggle("active", state.soloAxis === null);
  }
  layerBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const axis = btn.dataset.axis;
      state.soloAxis = (state.soloAxis === axis) ? null : axis;
      state.selected = null;
      updateLayerButtons();
      render();
    });
  });
  if (layerAllBtn) layerAllBtn.addEventListener("click", () => {
    state.soloAxis = null; state.selected = null;
    updateLayerButtons();
    render();
  });

  /* ----------------------------- 对齐年份 开关 ----------------------------- */
  const alignBtn = document.getElementById("alignBtn");
  alignBtn.addEventListener("click", () => {
    state.alignYear = !state.alignYear;
    alignBtn.classList.toggle("active", state.alignYear);
    alignBtn.textContent = state.alignYear ? "🔒 已对齐年份" : "📅 对齐年份";
    if (state.alignYear) nodes.forEach(d => { d.x = xScale(displayYear(d)); });
    if (sim) sim.alpha(0.6).restart();
  });

  /* ----------------------------- 搜索 ----------------------------- */
  const searchInput = document.getElementById("search");
  searchInput.addEventListener("input", () => {
    state.search = searchInput.value.trim();
    if (state.search) {
      state.selected = null;
      state.soloAxis = null; updateLayerButtons();
      const m = nodes.find(n => n.label.toLowerCase().includes(state.search.toLowerCase()));
      if (m && isNodeVisible(m)) focusOn(m);
    }
    render();
  });
  const clearSearchBtn = document.getElementById("clearSearch");
  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    state.search = "";
    render();
  });
  function focusOn(d) {
    const t = d3.zoomTransform(svg.node());
    const scale = Math.max(t.k, 1.2);
    svg.transition().duration(600).call(
      zoom.transform,
      d3.zoomIdentity.translate(width / 2, height / 2).scale(scale).translate(-d.x, -d.y)
    );
  }

  /* ----------------------------- 历史回放 (Play) ----------------------------- */
  let playTimer = null;
  const playBtn = document.getElementById("playBtn");
  function togglePlay() {
    if (state.playing) { stopPlay(); return; }
    state.playing = true;
    playBtn.textContent = "⏸ 暂停";
    state.selected = null; state.search = ""; searchInput.value = "";
    state.soloAxis = null; updateLayerButtons();
    state.threshold = LAYOUT_MIN;
    slider.value = LAYOUT_MIN; updateTimeControl();
    lastVisible = new Set();
    playTimer = setInterval(() => {
      slider.value = state.threshold + 1;
      updateTimeControl();
      if (state.threshold >= AXIS_MAX) stopPlay();
    }, 110);
  }
  function stopPlay() {
    state.playing = false;
    playBtn.textContent = "▶ 历史回放";
    if (playTimer) clearInterval(playTimer);
    playTimer = null;
  }
  playBtn.addEventListener("click", togglePlay);

  /* ----------------------------- 视图复位 ----------------------------- */
  document.getElementById("resetBtn").addEventListener("click", () => {
    svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
    render();
  });
  /* ----------------------------- 图例 ----------------------------- */
  const legend = d3.select("#legend");
  Object.keys(TYPE_COLOR).forEach(type => {
    const row = legend.append("div").attr("class", "legend-row");
    row.append("span").attr("class", "legend-dot").style("background", TYPE_COLOR[type]).text(TYPE_EMOJI[type] || "");
    row.append("span").attr("class", "legend-text").text(TYPE_LABEL[type]);
  });

  /* ----------------------------- 版本切换 ----------------------------- */
  const verBtns = [...document.querySelectorAll(".ver-btn")];
  function setActiveVerBtn(key) {
    verBtns.forEach(b => b.classList.toggle("active", b.dataset.version === key));
  }
  verBtns.forEach(b => {
    b.addEventListener("click", () => {
      const key = b.dataset.version;
      if (key === currentKey) return;
      setActiveVerBtn(key);
      try { localStorage.setItem("ai_graph_version", key); } catch (e) {}
      loadDataset(key);
    });
  });

  /* ----------------------------- 加载数据集 ----------------------------- */
  function loadDataset(key) {
    currentKey = key;
    DATA = key === "full" ? window.AI_DATA_300 : window.AI_DATA;
    R = key === "full" ? 14 : 17;
    buildData();
    xScale.domain([LAYOUT_MIN, AXIS_MAX]);
    buildSim();
    buildGraph();
    drawBands();

    // 重置状态与控件
    state.threshold = AXIS_MAX;
    state.soloAxis = null;
    state.selected = null;
    state.search = "";
    searchInput.value = "";
    slider.min = LAYOUT_MIN; slider.max = AXIS_MAX; slider.value = AXIS_MAX;
    yearLabel.textContent = AXIS_MAX + " 年";
    updateLayerButtons();
    lastVisible = new Set();

    // 重置视图并居中
    currentTransform = d3.zoomIdentity;
    svg.call(zoom.transform, d3.zoomIdentity);

    render();
    sim.alpha(1).restart();
    applyLabelVisibility();
    updateTimeControl();
  }

  /* ----------------------------- 初始化 ----------------------------- */
  let defaultKey = "core";
  setActiveVerBtn(defaultKey);
  loadDataset(defaultKey);

  /* ----------------------------- 自适应窗口 ----------------------------- */
  window.addEventListener("resize", () => {
    width = container.clientWidth;
    height = container.clientHeight;
    svg.attr("width", width).attr("height", height);
    xScale.range([margin.left, width - margin.right]);
    if (sim) {
      sim.force("x", d3.forceX(d => xScale(displayYear(d))).strength(0.85));
      sim.force("y", d3.forceY(yMid()).strength(0.03));
      sim.alpha(0.3).restart();
    }
    drawBands();
    applyLabelVisibility();
    updateTimeControl();
  });
})();
