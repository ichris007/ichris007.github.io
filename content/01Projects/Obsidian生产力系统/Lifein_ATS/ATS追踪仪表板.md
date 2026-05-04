# ATS人才追踪仪表板

## 1 全局统计

```dataview
TABLE length(rows) as "人才总数"
FROM "09Talents"
WHERE contains(category, "talent")
GROUP BY true
```

### 1.1 按状态统计
```dataview
TABLE status as "状态", count(*) as "人数"
FROM "09Talents"
WHERE contains(category, "talent")
GROUP BY status
```

### 1.2 按星级统计
```dataview
TABLE stars as "星级", count(*) as "人数"
FROM "09Talents"
WHERE contains(category, "talent")
GROUP BY stars
ORDER BY stars DESC
```

---

## 2 项目状态总览（跨所有人才）

> 💡 **说明**：由于Dataview对Frontmatter中复杂对象的支持有限，以下为手动维护的关键项目列表。
>
> **自动化方案**：
> 1. 使用Templater插件自动化项目状态更新
> 2. 使用DataviewJS处理复杂对象
> 3. 使用Properties（Meta）插件管理复杂数据

### 2.1 🔍 快速筛选
- [当前面试中人才](#面试中)
- [谈offer中人才](#谈offer)
- [已发offer人才](#已发offer）
- [已入职人才](#已入职)
- [重点关注人才](#重点关注-5星级)

---

## 3 💬 面试中

```dataview
TABLE file.link as "姓名",
       (array(projects)[0].name) as "项目",
       (array(projects)[0].status) as "状态",
       (array(projects)[0].stage) as "阶段",
       (array(projects)[0].last_update) as "更新时间"
FROM "09Talents"
WHERE contains(category, "talent")
  AND array(projects)[0].status = "interview"
SORT array(projects)[0].last_update DESC
```

## 4 📄 简历初筛

```dataview
TABLE file.link as "姓名",
       (array(projects)[0].name) as "项目",
       (array(projects)[0].status) as "状态",
       (array(projects)[0].last_update) as "更新时间"
FROM "09Talents"
WHERE contains(category, "talent")
  AND array(projects)[0].status = "pipeline"
SORT array(projects)[0].last_update DESC
```

## 5 💰 谈offer

```dataview
TABLE file.link as "姓名",
       (array(projects)[0].name) as "项目",
       (array(projects)[0].status) as "状态",
       (array(projects)[0].stage) as "阶段",
       (array(projects)[0].last_update) as "更新时间"
FROM "09Talents"
WHERE contains(category, "talent")
  AND array(projects)[0].status = "offer"
SORT array(projects)[0].last_update DESC
```

## 6 📧 已发offer

```dataview
TABLE file.link as "姓名",
       (array(projects)[0].name) as "项目",
       (array(projects)[0].status) as "状态",
       (array(projects)[0].last_update) as "更新时间"
FROM "09Talents"
WHERE contains(category, "talent")
  AND array(projects)[0].status = "offer_sent"
SORT array(projects)[0].last_update DESC
```

## 7 ✅ 已接offer

```dataview
TABLE file.link as "姓名",
       (array(projects)[0].name) as "项目",
       (array(projects)[0].status) as "状态",
       (array(projects)[0].last_update) as "更新时间"
FROM "09Talents"
WHERE contains(category, "talent")
  AND array(projects)[0].status = "offer_accepted"
SORT array(projects)[0].last_update DESC
```

## 8 ❌ 拒绝offer

```dataview
TABLE file.link as "姓名",
       (array(projects)[0].name) as "项目",
       (array(projects)[0].status) as "状态",
       (array(projects)[0].last_update) as "更新时间"
FROM "09Talents"
WHERE contains(category, "talent")
  AND array(projects)[0].status = "offer_rejected"
SORT array(projects)[0].last_update DESC
```

## 9 🎉 已入职

```dataview
TABLE file.link as "姓名",
       (array(projects)[0].name) as "项目",
       (array(projects)[0].status) as "状态",
       (array(projects)[0].last_update) as "更新时间"
FROM "09Talents"
WHERE contains(category, "talent")
  AND array(projects)[0].status = "hired"
SORT array(projects)[0].last_update DESC
```

## 10 🚫 已拒绝

```dataview
TABLE file.link as "姓名",
       project as "项目",
       created date as "创建时间"
FROM "09Talents"
WHERE contains(category, "talent")
  AND status = "已关闭"
SORT created date DESC
```

---

## 11 ⭐ 重点关注（5星级）

```dataview
TABLE file.link as "姓名",
       current company as "当前公司",
       current title as "职位",
       (array(projects)[0].name) as "当前项目",
       (array(projects)[0].status) as "状态",
       stars as "星级"
FROM "09Talents"
WHERE contains(category, "talent")
  AND stars = "5星级"
SORT stars DESC, (array(projects)[0].last_update DESC
```

---

## 12 📊 按领域分布

```dataview
TABLE domain[0] as "领域", count(*) as "人数"
FROM "09Talents"
WHERE contains(category, "talent")
GROUP BY domain[0]
ORDER BY count(*) DESC
```

---

## 13 🌍 按城市分布

```dataview
TABLE city as "城市", count(*) as "人数"
FROM "09Talents"
WHERE contains(category, "talent")
  AND city
GROUP BY city
ORDER BY count(*) DESC
```

---

## 14 📅 最近更新（7天内）

```dataview
TABLE file.link as "姓名",
       (array(projects)[0].name) as "项目",
       (array(projects)[0].status) as "状态",
       (array(projects)[0].last_update) as "更新时间"
FROM "09Talents"
WHERE contains(category, "talent")
  AND date(array(projects)[0].last_update) >= date(today) - dur(7 days)
SORT (array(projects)[0].last_update) DESC
```

---

## 15 🔧 DataviewJS高级查询（需要Dataview插件）

```dataviewjs
// 统计跨项目的所有状态
for (let page of dv.pages('"09Talents"')
    .where(p => p.category && p.category.includes("talent"))) {

    // 处理多项目状态
    if (page.projects && Array.isArray(page.projects)) {
        for (let project of page.projects) {
            dv.paragraph(`**${page.file.link}** - ${project.name}: ${project.status} (${project.last_update})`)
        }
    }
}
```

---

## 16 📝 使用说明

### 16.1 添加新人才
1. 使用模板 `Templates/Talents/ATS人才模板-多项目版.md`
2. 填写基础信息
3. 添加项目信息到 Frontmatter 的 `projects` 字段

### 16.2 更新项目状态
1. 打开对应人才笔记
2. 修改 Frontmatter 中 `projects` 数组内的状态
3. 更新 `last_update` 字段
4. 在"项目详情"部分添加新的记录

### 16.3 项目状态代码
| 代码 | 含义 | 使用场景 |
|------|------|---------|
| `pipeline` | 简历初筛 | 新简历进入流程 |
| `interview` | 面试中 | 正在进行面试 |
| `offer` | 谈offer | 面试通过，薪资谈判 |
| `offer_sent` | 已发offer | 已发正式offer |
| `offer_accepted` | 已接offer | 候选人接受offer |
| `offer_rejected` | 拒绝offer | 候选人拒绝 |
| `hired` | 已入职 | 已入职 |
| `rejected` | 已拒绝 | 面试未通过 |
| `on_hold` | 暂缓 | 暂时搁置 |
| `withdrawn` | 退出 | 候选人主动退出 |

### 16.4 多项目管理示例
```yaml
projects:
  - name: "感知算法集成工程师"
    status: "interview"
    stage: "技术面试-第二轮"
    last_update: "2024-01-27"
    notes: "技术面试表现优秀"

  - name: "高级软件工程师-自动驾驶"
    status: "offer"
    stage: "薪资谈判"
    last_update: "2024-01-25"
    notes: "全部通过，谈薪资中"

  - name: "算法专家-车载OS"
    status: "pipeline"
    stage: "简历初筛"
    last_update: "2024-01-26"
    notes: "等待HR初步沟通"
```

---

## 17 🎯 快速操作

- [ ] 创建新人才笔记
- [ ] 批量更新项目状态
- [ ] 导出周报
- [ ] 归档已关闭候选人

---

> 💡 **提示**：
> 1. Dataview 对 Frontmatter 复杂对象（如数组中的对象）支持有限
> 2. 建议使用 `Properties` 插件或 `MetaEdit` 插件管理复杂数据
> 3. 可以结合 Tasks 插件管理待办事项
> 4. 使用 Templater 插件自动化 repetitive 任务