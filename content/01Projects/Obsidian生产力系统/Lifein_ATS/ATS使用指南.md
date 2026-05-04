---
modified date: 2026-03-12 10:38:22
---
# ATS系统使用指南 - 多项目状态追踪

## 1 核心功能说明

### 1.1 多项目状态管理

同一个人才可以在多个项目中处于不同状态，例如：
- **项目A**：面试中
- **项目B**：谈offer
- **项目C**：推荐简历

### 1.2 实现方式

#### 1.2.1 方案A：Frontmatter 数组（推荐用于简单场景）

```yaml
---
projects:
  - name: "项目A"
    status: "interview"
    stage: "技术面试-第二轮"
    last_update: "2024-01-27"
    notes: "表现优秀"

  - name: "项目B"
    status: "offer"
    stage: "薪资谈判"
    last_update: "2024-01-25"
    notes: "全部通过"

  - name: "项目C"
    status: "pipeline"
    stage: "简历初筛"
    last_update: "2024-01-26"
    notes: "推荐到车载OS项目"
---
```

#### 1.2.2 方案B：在笔记正文使用列表（灵活扩展）

```markdown
## 项目追踪

### 项目A：感知算法集成工程师
- **状态**：面试中
- **阶段**：技术面试-第二轮
- **更新时间**：2024-01-27
- **备注**：技术面试表现优秀

### 项目B：高级软件工程师-自动驾驶
- **状态**：谈offer
- **阶段**：薪资谈判
- **更新时间**：2024-01-25
- **备注**：全部通过，谈薪资中
```

---

## 2 完整工作流程

### 2.1 步骤1：创建人才笔记

使用 `Templates/Talents/ATS人才模板-多项目版.md` 模板创建新笔记。

1. 按 `Cmd/Ctrl + p` 打开命令面板
2. 输入 "Templater: Create new note from template"
3. 选择模板：`ATS人才模板-多项目版`
4. 输入人才姓名

### 2.2 步骤2：填写基础信息

模板会自动提示输入以下信息：
- 人才基础信息（姓名、性别、年龄等）
- 工作背景（公司、职位、技术栈）
- 联系方式（电话、邮箱、微信等）
- 第一个项目信息

### 2.3 步骤3：添加多个项目

在 Frontmatter 的 `projects` 字段中添加更多项目：

```yaml
projects:
  - name: "项目A"
    status: "interview"
    stage: "第一阶段"
    last_update: "2024-01-27"
    notes: ""

  - name: "项目B"
    status: "offer"
    stage: "谈判中"
    last_update: "2024-01-25"
    notes: ""

  - name: "项目C"
    status: "pipeline"
    stage: "初筛"
    last_update: "2024-01-26"
    notes: ""
```

### 2.4 步骤4：更新项目状态

当项目状态变化时：

1. **修改 Frontmatter**：更新对应项目的 `status` 字段
2. **更新 `last_update`**：记录最新更新时间
3. **添加备注**：在 `notes` 字段说明变化原因

示例：
```yaml
projects:
  - name: "感知算法集成工程师"
    status: "offer"           # 从 "interview" 改为 "offer"
    stage: "薪资谈判"         # 更新阶段
    last_update: "2024-01-28" # 更新时间
    notes: "面试全部通过"     # 修改备注
```

### 2.5 步骤5：记录项目详情

在笔记正文的 `[[2 项目追踪]]` 部分，为每个项目创建详细记录：

```markdown
### 项目名称：感知算法集成工程师
**状态**：💬 面试中
**最后更新**：2024-01-27

#### 面试记录
| 日期 | 面试轮次 | 面试官 | 结果 | 备注 |
|------|---------|--------|------|------|
| 2024-01-22 | 初筛 | @HR | 通过 | 简历优秀 |
| 2024-01-24 | 技术面试 | 李工 | 通过 | C++扎实 |
| 2024-01-26 | 技术面试 | 王工 | 通过 | Apollo经验丰富 |
```

---

## 3 项目状态说明

### 3.1 状态代码

| 代码 | 图标 | 名称 | 说明 |
|------|------|------|------|
| `pipeline` | 📄 | 简历初筛 | 新简历进入筛选阶段 |
| `interview` | 💬 | 面试中 | 正在进行面试流程 |
| `offer` | 💰 | 谈offer | 面试通过，薪资谈判中 |
| `offer_sent` | 📧 | 已发offer | 已发送正式offer |
| `offer_accepted` | ✅ | 已接offer | 候选人接受offer |
| `offer_rejected` | ❌ | 拒绝offer | 候选人拒绝offer |
| `hired` | 🎉 | 已入职 | 候选人已入职 |
| `rejected` | 🚫 | 已拒绝 | 面试未通过/公司拒绝 |
| `on_hold` | ⏸️ | 暂缓 | 暂时搁置项目 |
| `withdrawn` | 👋 | 退出 | 候选人主动退出 |

### 3.2 状态流转路径

```
📄 简历初筛 (pipeline)
    ↓
💬 面试中 (interview)
    ↓
💰 谈offer (offer)
    ↓
📧 已发offer (offer_sent)
    ↓
✅ 已接offer (offer_accepted) → 🎉 已入职 (hired)
    ↓
❌ 拒绝offer (offer_rejected)
```

或者：

```
💬 面试中 (interview)
    ↓
🚫 已拒绝 (rejected)
```

---

## 4 仪表板使用

### 4.1 查看特定状态的人才

在 `ATS追踪仪表板.md` 中：

1. 找到对应的状态部分，例如 "💬 面试中"
2. 查看表格，了解当前所有面试中的人才
3. 点击姓名链接跳转到详细笔记

### 4.2 筛选特定项目

使用 Dataview 过滤器：

```dataview
TABLE file.link as "姓名",
       (array(projects)[0].name) as "项目",
       (array(projects)[0].status) as "状态"
FROM "09Talents"
WHERE contains(category, "talent")
  AND (array(projects)[0].name).includes("感知算法")  
limit 10
```

### 4.3 按城市筛选

```dataview
TABLE file.link as "姓名",
       (array(projects)[0].name) as "项目",
       city as "城市",
       (array(projects)[0].status) as "状态"
FROM "09Talents"
WHERE contains(category, "talent")
  AND city = "上海"
limit 10
```

---

## 5 高级用法

### 5.1 使用 DataviewJS 处理多项目

```dataviewjs
// 显示所有人才的跨项目状态
dv.table(["人才", "项目", "状态", "更新时间"], dv.pages('"09Talents"')
    .where(p => p.category && p.category.includes("talent"))
    .flatMap(p => {
        if (p.projects && Array.isArray(p.projects)) {
            return p.projects.map(proj => [p.file.link, proj.name, proj.status, proj.last_update])
        } else {
            return [[p.file.link, "-", "-", "-"]]
        }
    })
)
```

### 5.2 使用嵌套查询

查看某个人才的所有项目状态：

```dataviewjs
const targetName = "张三"  // 查找人才姓名

const person = dv.pages('"09Talents"')
    .where(p => p.name && p.name.includes(targetName))[0]

if (person && person.projects) {
    dv.header(3, `${person.name} 的所有项目`)
    dv.table(["项目", "状态", "阶段", "更新时间", "备注"],
        person.projects.map(p => [p.name, p.status, p.stage, p.last_update, p.notes])
    )
}
```

---

## 6 最佳实践

### 6.1 命名规范
- **人才姓名**：使用真实姓名，如"张三"、"李四"
- **项目名称**：包含岗位名称和部门，如"感知算法集成工程师-研发部"
- **状态更新**：每次状态变化都更新 `last_update`字段

### 6.2 维护建议
- **每日检查**：查看仪表板，跟进待办事项
- **每周汇总**：导出周报，统计各阶段人才数量
- **每月归档**：归档已关闭/已入职的人才

### 6.3 协作建议
- **备注清晰**：在 `notes` 字段记录关键决策点
- **及时更新**：状态变化后立即更新
- **数据一致**：Frontmatter 与正文保持一致

---

## 7 常见问题

### 7.1 Q: Dataview 无法读取 Frontmatter 中的数组怎么办？

A: Dataview 对复杂对象支持有限，解决方案：
1. 使用 `array(projects)[0]` 访问数组第一个元素
2. 使用 DataviewJS 进行更复杂的查询
3. 将重要信息复制到 Frontmatter 顶层字段

### 7.2 Q: 如何批量更新项目状态？

A: 使用 Templater 或 MetaEdit 插件的批量编辑功能：
```javascript
// MetaEdit 批量更新示例
// 在仪表板中批量更新多个人才的状态
```

### 7.3 Q: 如何导出报告？

A: 使用 Dataview 导出为 CSV 或直接截图：
```dataview
TABLE file.link as "姓名",
       (array(projects)[0].name) as "项目",
       (array(projects)[0].status) as "状态"
FROM "09Talents"
WHERE contains(category, "talent")
```
点击表格的"..."菜单，选择"Export CSV"

---

## 8 扩展建议

### 8.1 集成其他插件

1. **Tasks Plugin**：管理面试待办事项
   ```dataview
   TASK
   FROM "09Talents"
   WHERE contains(text, "面试")
   ```

2. **Calendar Plugin**：在日历中查看面试安排

3. **Heatmap Calendar**：可视化面试频率

4. **Review Plugin**：定期回顾人才状态

### 8.2 数据可视化

使用 Charts 插件创建可视化图表：

```dataview
TABLE rows.name.length as "数量"
FROM "09Talents"
WHERE contains(category, "talent")
GROUP BY array(projects)[0].status
```

---

## 9 示例场景

### 9.1 场景1：一个面试者在三个项目中

**人才**：张三（5星级）
- **项目A**：感知算法集成工程师 → 💬 面试中
- **项目B**：高级软件工程师 → 💰 谈offer
- **项目C**：算法专家 → 📄 简历初筛

**仪表板显示**：
- 在"面试中"部分显示张三-项目A
- 在"谈offer"部分显示张三-项目B
- 在"简历初筛"部分显示张三-项目C

### 9.2 场景2：跟踪项目进度

**时间线**：
1. 1月20日：张三的项目A初筛 → 📄 简历初筛
2. 1月22日：项目A通过初筛 → 💬 面试中
3. 1月24日：项目A第一轮面试通过
4. 1月26日：项目A第二轮面试通过
5. 1月28日：项目B面试全部通过 → 💰 谈offer
6. 1月30日：项目C推荐到项目 → 📄 简历初筛

每次状态变化都更新 `last_update` 字段和备注。

---

## 10 相关文件

- `Templates/Talents/ATS人才模板-多项目版.md` - 人才模板
- `09Talents/示例-张三.md` - 示例笔记
- `09Talents/ATS追踪仪表板.md` - 仪表板

---

*最后更新：2024-01-27*