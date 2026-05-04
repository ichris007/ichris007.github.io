# 个人开发者 Obsidian CRM 产品设计方案

---

## 一、产品定位

### 🎯 产品定义

```
产品名称: Obsidian Personal CRM (暂定名：LinkCRM)

核心定位:
  个人客户关系管理系统 - 用 Obsidian 管理你的人脉

目标用户:
  ✅ 自由职业者（设计师、开发者、顾问等）
  ✅ 销售人员（个人销售、代理等）
  ✅ 创业者/小微企业主
  ✅ 内容创作者
  ✅ 知识工作者

核心价值:
  1. 用 Obsidian 的双向链接管理人际关系
  2. 关系即知识，人脉即价值
  3. 轻量级，5 分钟上手
  4. 一次付费，终身使用
  5. 完全离线，数据安全
```

---

## 二、MVP 功能范围（精简版）

### 核心功能（必须有）

```yaml
1. 联系人管理
   ✅ 基本信息模板
     - 姓名
     - 电话
     - 邮箱
     - 公司/职位
     - 标签（客户/朋友/潜在客户等）
     - 重要度（高/中/低）

   ✅ 一键创建模板
     - Templater 模板
     - 快捷键触发
     - 默认值预填

2. 关系追踪
   ✅ 互动记录
     - 通话记录
     - 邮件往来
     - 见面笔记
     - 备忘事项

   ✅ 提醒设置
     - 跟进日期
     - 定期联系提醒（30天/60天/90天）
     - 生日提醒

3. 搜索和筛选
   ✅ 快速搜索
     - Dataview 查询
     - 标签筛选
     - 重要度过滤

   ✅ 仪表盘视图
     - 今天需要联系谁
     - 明天有哪些活动
     - 本周跟进计划

4. 链接关联
   ✅ 与笔记关联
     - 客户相关文档
     - 会议记录
     - 项目备忘

   ✅ 双向链接
     - 从客户档案跳到相关笔记
     - 从笔记跳回客户档案
```

### 辅助功能（锦上添花）

```yaml
5. 数据可视化
   ✅ 热力图显示活跃度
   ✅ 关系网络图（可选）

6. 导出功能
   ✅ 导出 CSV
   ✅ 导出名片格式

7. 数据导入
   ✅ 从 CSV 导入
   ✅ 从 vCard 导入
   ✅ 从 Excel 导入
```

---

## 三、技术实现方案（轻量级）

### 方案优势

```
✅ 无需编写复杂代码
✅ 充分利用 Obsidian 现有插件
✅ 配置文件替代代码
✅ 模块化，易于维护
✅ 可以快速迭代
```

### 核心技术栈

```yaml
基础工具:
  - Obsidian (核心)
  - Dataview插件 (数据查询)
  - Templater插件 (模板引擎)
  - Hotkeys插件 (快捷键)
  - Calendar插件 (日历可视化)
  - Homepage插件 (仪表盘)

配置文件:
  - .obsidian/plugins/ (插件配置)
  - Templates/ (模板文件)
  - Dataview/ (查询脚本)

可选脚本（如果需要）:
  - JavaScript (Obsidian 插件开发)
  - Python (数据导入/导出工具)
```

### 文件结构

```
📦 LinkCRM/
├── 📁 00 Inbox/                 (临时联系人)
│
├── 📁 00 Contacts/               (联系人文件夹)
│   ├── 📄 People/               (人员档案)
│   ├── 📄 Companies/            (公司档案)
│   └── 📄 Groups/               (分组/标签)
│
├── 📁 01 Interactions/           (互动记录)
│   ├── 📁 2024/
│   │   ├── 📁 01-January/
│   │   └── 📁 02-February/
│   └── 📃 Interactions Dashboard.md
│
├── 📁 02 Tasks/                 (任务相关)
│   ├── 📁 Follow-ups/           (跟进任务)
│   └── 📁 Reminders/            (提醒事项)
│
├── 📁 03 Templates/             (模板)
│   ├── 📄 Contact Template.md   (联系人模板)
│   ├── 📄 Company Template.md  (公司模板)
│   └── 📄 Interaction Template.md (互动记录模板)
│
├── 📁 04 Scripts/               (脚本)
│   ├── 📄 export-csv.js         (导出 CSV)
│   └── 📄 import-contacts.py    (导入联系人)
│
├── 📁 05 Dashboard/             (仪表盘)
│   ├── 📄 Home.md               (首页)
│   ├── 📄 Today.md              (今日任务)
│   └── 📄 Statistics.md         (统计)
│
└── 📁 06 Documentation/          (文档)
    ├── 📄 Installation.md       (安装指南)
    ├── 📄 User Guide.md        (使用指南)
    └── 📄 FAQ.md                (常见问题)
```

---

## 四、核心组件设计

### 4.1 联系人模板

```markdown
---
type: contact
created: <% tp.date.now("YYYY-MM-DD") %>
name:
company:
position:
phone:
email:
website:
address:

# 标签
tags:
-

# 重要度 (1=低, 3=高)
priority:

# 备注
notes:

## 快速链接
- [[相关公司]]
- [[相关联系人]]

## 互动记录
```dataview
TABLE rows.file.link as "互动记录"
FROM "01 Interactions"
WHERE contains(this.file.name, this.name)
SORT date DESC
```

## 待跟进
```dataview
TASK
FROM "02 Tasks/Follow-ups"
WHERE contains(this.file.name, this.name)
SORT due ASC
```

## 元数据
最后联系: <% tp.file.last_modified_date("YYYY-MM-DD") %>
跟进周期: 30 天
下次联系: <% tp.date.now("YYYY-MM-DD").add(30, "days") %>
```

---

### 4.2 互动记录模板

```markdown
---
type: interaction
created: <% tp.date.now("YYYY-MM-DD HH:mm") %>
contact:
interaction_type:
  - 通话
  - 邮件
  - 见面
  - 消息

# 互动详情
## 主要内容

## 关键信息

## 下一步
- [ ]

## 关联联系人
-

## 关联项目
-

## 情绪/氛围

## 元数据
后续跟进: "2024-01-15"
需要跟进: true
```

---

### 4.3 仪表盘

```markdown
---
type: dashboard
---

# LinkCRM - 你的关系网络管理

## 今日概览

### 📞 今天需要联系的人
```dataview
TABLE name, priority, contact
FROM "00 Contacts/People"
WHERE contains(contact.next_follow_up, this.date)
SORT priority DESC
```

### 📆 本周会议
```dataview
TABLE rows.file.link as "会议", date
FROM "01 Interactions"
WHERE date >= date(today) AND date <= date(today) + dur(7 days)
SORT date ASC
```

### ⏰ 需要跟进的任务
```dataview
TASK
FROM "02 Tasks/Follow-ups"
WHERE due <= date(today) + dur(7 days)
SORT due ASC
```

### 📊 统计数据
- 联系人总数: <% dv.pages('"type: contact"').length %>
- 本月新增: <% dv.pages('"type: contact"').where(p => p.created >= date(dv.today()) - dur(30 days)).length %>
- 待跟进: <% dv.pages('"nextfollowup:: true"').length %>

## 快速操作
- [[新建联系人]]
- [[查看今日会议]]
- [[添加互动记录]]
- [[浏览联系人列表]]
```

---

### 4.4 Dataview 查询脚本

```markdown
---
type: dataview
---

## 联系人列表

### 按公司汇总
```dataview
TABLE rows.file.link, position, priority
FROM "00 Contacts/People"
WHERE company
GROUP BY company
SORT company ASC
```

### 重要联系人（高优先级）
```dataview
TABLE name, company, phone, email
FROM "00 Contacts/People"
WHERE priority = 3
SORT name ASC
```

### 今天生日的人
```dataview
TABLE name, company, phone
FROM "00 Contacts/People"
WHERE dateformat(birthday, "MM-dd") = dateformat(date(today), "MM-dd")
```

### 最近联系
```dataview
TABLE contact, interaction_type, date
FROM "01 Interactions"
SORT date DESC
LIMIT 5
```

### 超过 90 天未联系的人
```dataview
TABLE name, company, phone, last_contacted
FROM "00 Contacts/People"
WHERE (date(today) - last_contacted) > dur(90 days)
SORT last_contacted ASC
```
```

---

## 五、具体开发步骤

### 阶段 1：基础搭建（1-2 天）

```
步骤 1: 安装必需插件
  1. Obsidian Community Plugins
     - Dataview ✅ (必需)
     - Templater ✅ (必需)
     - Hotkeys for Specific Files ✅
     - Calendar ✅
     - Homepage ✅
     - Advanced Tables ✅

步骤 2: 创建文件夹结构
  1. 按上述文件结构创建文件夹
  2. 设置图标（可选）

步骤 3: 配置插件
  Dataview 配置:
    - 启用 Inline Dataview
    - 启用 JavaScript Queries

  Templater 配置:
    - 设置模板文件夹: 03 Templates
    - 启用触发器
    - 设置快捷键: Ctrl+N (新建联系人)

步骤 4: 创建基础模板
  1. Copy 上述模板代码
  2. 保存到 03 Templates 文件夹
  3. 测试模板是否正常工作
```

---

### 阶段 2：核心功能实现（3-5 天）

```
步骤 1: 联系人管理
  ✅ 创建联系人模板
  ✅ 配置 Templater 触发器
  ✅ 测试新建联系人流程
  ✅ 验证 Dataview 查询

步骤 2: 互动记录
  ✅ 创建互动记录模板
  ✅ 设置快捷键
  ✅ 测试添加互动

步骤 3: 提醒系统
  ✅ 在联系人中添加"下次联系"字段
  ✅ 创建"待跟进"查询
  ✅ 添加到仪表盘

步骤 4: 仪表盘
  ✅ 创建主页 Dashboard
  ✅ 配置 Dataview 查询
  ✅ 设置为 Homepage
```

---

### 阶段 3：辅助功能（2-3 天）

```
步骤 1: 数据导入
  ✅ 创建 Python 导入脚本
  ✅ 支持 CSV 导入
  ✅ 支持 Excel 导入

步骤 2: 数据导出
  ✅ 使用 Dataview 导出功能
  ✅ 创建 CSV 导出查询

步骤 3: 快捷键设置
  ✅ 新建联系人: Ctrl+N
  ✅ 新建互动: Ctrl+I
  ✅ 打开仪表盘: Ctrl+H
  ✅ 快速搜索: Ctrl+F
```

---

### 阶段 4：文档和测试（2-3 天）

```
步骤 1: 用户文档
  ✅ 安装指南
    - 如何安装 Obsidian
    - 如何安装插件
    - 如何设置 LinkCRM

  ✅ 使用指南
    - 新建联系人
    - 添加互动记录
    - 查看仪表盘
    - 导入/导出数据

  ✅ 视频教程
    - 5 分钟快速上手
    - 核心功能演示

步骤 2: 测试
  ✅ 功能测试
  ✅ 兼容性测试
  ✅ 性能测试
  ✅ Bug 修复

步骤 3: 打包
  ✅ 压缩成 ZIP 文件
  ✅ 包含所有模板和配置
  ✅ 包含文档
  ✅ 准备发布
```

---

## 六、定价策略

### 6.1 产品版本

```yaml
版本 1: 基础版 (主要销售)
  价格: ¥49 (一次性)

  包含:
    ✅ 完整模板包
    ✅ Dataview 查询脚本
    ✅ 插件配置文件
    ✅ 安装指南（图文）
    ✅ 使用说明（PDF）
    ✅ 3 个视频教程（共 15 分钟）
    ✅ 3 个月更新支持

  定价理由:
    - 价格亲民，容易决策
    - 对比 SaaS CRM (300-1000元/年)
    - 一次性付费，终身使用
    - 降低试用门槛

---

版本 2: 专业版 (高级用户)
  价格: ¥129 (一次性) + ¥29/年 (可选更新)

  包含:
    ✅ 基础版所有功能
    ✅ 自定义主题
    ✅ 高级 Dataview 查询
    ✅ CSV/Excel 导入脚本
    ✅ 数据分析报表
    ✅ 10 个视频教程
    ✅ 1 对 1 咨询（30 分钟）
    ✅ 终身更新支持

  定价理由:
    - 面对重度用户
    - 增值服务值得付费
    - 年度订阅带来持续收入

---

版本 3: 团队版（未来扩展）
  价格: ¥299 /年

  包含:
    ✅ 专业版所有功能
    ✅ 团队使用授权
    ✅ 协作模板
    ✅ 团队管理功能
    ✅ 优先支持
    ✅ 定制服务

  定价理由:
    - 小团队市场
    - 比企业 CRM 便宜很多
    - 简化功能团队能用
```

### 6.2 销售渠道

```yaml
渠道 1: Obsidian Plugin市场 (如果开发插件)
  - 免费版引流
  - 付费版升级

渠道 2: Gumroad
  - 托管数字产品
  - 自动交付
  - 收款简单

渠道 3: 知识付费平台
  - 小鹅通
  - 得到
  - 知识星球

渠道 4: 微信公众号 (最推荐)
  - 自有渠道
  - 无平台抽成
  - 粉丝经济
```

---

## 七、营销推广策略

### 7.1 内容营销

```yaml
B站/YouTube 视频内容:
  "Obsidian 管理500+客户，我开发的模板"
  "5分钟用 Obsidian 建立 CRM 系统"
  "我用 Obsidian 替代了 SFDC"
  "免费替代 CRM，我用 Obsidian"
  "Obsidian 做 CRM 的6个技巧"

小红书/抖音短内容:
  "程序员的一天：用 Obsidian 管理人脉"
  "销售高手都在用的秘密武器"
  "Obsidian+CRM，意想不到的搭配"
  "免费替代付费 CRM"

微信公众号文章:
  "为什么我用 Obsidian 管理 1000+ 客户"
  "Obsidian: 不仅仅是笔记工具"
  "销售人员必备：个人 CRM 系统"
  "从 0 到 1，用 Obsidian 构建 CRM"
```

### 7.2 社区运营

```yaml
Obsidian 论坛:
  - 发布 Free Plugin
  - 分享使用经验
  - 回答相关问题
  - 建立 Expert 形象

Reddit r/ObsidianMD:
  - 分享模板
  - 讨论使用经验
  - 收集反馈

微信社群:
  - 建立 LinkCRM 用户群
  - 分享技巧和更新
  - 口碑传播

Discord:
  - 建立社区
  - 实时支持
  - 用户反馈
```

---

## 八、时间规划

### 开发时间表（单人开发）

```
第1周: 需求确认和设计
  Day 1-2: 详细需求文档
  Day 3-4: 产品设计
  Day 5: 技术方案确认
  Day 6-7: 准备开发环境

第2-3周: MVP开发
  Week 2:
    Day 1-2: 基础搭建
    Day 3-5: 核心功能
    Day 6: 休息

  Week 3:
    Day 1-2: 辅助功能
    Day 3-4: 测试和修复
    Day 5: 文档编写

第4周: 发布准备
  Day 1: 视频录制
  Day 2: 营销素材准备
  Day 3: 产品打包
  Day 4: Bug 修复
  Day 5: 发布

第5-6周: 市场测试
  Week 5:
    Day 1-2: 发布到社区
    Day 3-4: 收集反馈
    Day 5: 分析反馈

  Week 6:
    Day 1-3: 快速迭代
    Day 4-5: 更新发布

第7-8周: 正式销售
  Week 7:
    - 完善产品
    - 准备营销内容
    - 建立社群

  Week 8:
    - 正式上线销售
    - 持续运营
```

---

## 九、关键技术点

### 9.1 Dataview 查询（核心）

```markdown
## 查询示例 1: 所有联系人
```dataview
TABLE WITHOUT ID
  name as "姓名",
  company as "公司",
  position as "职位",
  phone as "电话",
  email as "邮箱"
FROM "00 Contacts/People"
WHERE name
SORT name ASC
```

## 查询示例 2: 高优先级联系人
```dataview
TABLE name, company, phone, email, next_follow_up
FROM "00 Contacts/People"
WHERE priority = 3 AND next_follow_up <= date(today) + dur(30 days)
SORT next_follow_up ASC
```

## 查询示例 3: 最近互动记录
```dataview
TABLE contact, interaction_type, date
FROM "01 Interactions"
WHERE date >= date(today) - dur(7 days)
SORT date DESC
```
```

### 9.2 Templater 模板变量

```javascript
// Templater 用户脚本示例
<%*
// 当前日期
const now = tp.date.now("YYYY-MM-DD");

// 获取联系人名称
const contactName = await tp.system.prompt("联系人姓名");

// 生成文件名
const fileName = `00 Contacts/People/${contactName}.md`;

// 等等...
*%>
---
type: contact
name: <%= contactName %>
company: <%= await tp.system.prompt("公司") %>
position: <%= await tp.system.prompt("职位") %>
phone: <%= await tp.system.prompt("电话") %>
email: <%= await tp.system.prompt("邮箱") %>
created: <%= now %>

# <%= contactName %>
```

---

## 十、风险评估和应对

### 10.1 主要风险

```yaml
风险 1: 用户不会用 Obsidian
  影响: 50%
  应对:
    - 提供详细的视频教程
    - 提供图文指南
    - 提供安装服务（额外收费）
    - 简化安装包

风险 2: 免费替代品多
  影响: 40%
  应对:
    - 强调差异化（关系即知识）
    - 强调灵活性（完全可定制）
    - 强调成本优势（一次付费）
    - 强调数据安全（本地化）

风险 3: 技术问题
  影响: 30%
  应对:
    - 充分测试
    - 提供快速支持
    - 稳定的插件依赖
    - 文档覆盖常见问题

风险 4: 市场冷启动
  影响: 50%
  应对:
    - 免费 Lite 版
    - 社区推广
    - KOL 合作
    - 优惠券活动
```

### 10.2 成功的关键

```yaml
成功要素 1: 开箱即用
  ✅ 5 分钟完成安装
  ✅ 10 分钟上手
  ✅ 30 分钟产生价值

成功要素 2: 用户支持
  ✅ 快速response
  ✅ 详细FAQ
  ✅ 视频教程
  ✅ 社区答疑

成功要素 3: 持续改进
  ✅ 根据反馈迭代
  ✅ 定期更新
  ✅ 添加新功能
  ✅ 保持新鲜感

成功要素 4: 建立信任
  ✅ 免费Lite版
  ✅ 透明定价
  ✅ 明确价值
  ✅ 真实案例

成功要素 5: 口碑传播
  ✅ 用户案例
  ✅ 社区活跃
  ✅ 分享激励
  ✅ 用户共创
```

---

## 十一、收入预期

### 第一年预测（保守估计）

```yaml
基础版 (¥49):
  - 定价: ¥49
  - 预计销量: 500 份
  - 收入: ¥24,500

专业版 (¥129 + ¥29/年更新):
  - 定价: ¥129
  - 预计销量: 100 份
  - 收入: ¥12,900

首年总收入: ¥37,400

附加服务:
  - 安装服务: ¥99 × 10 = ¥990
  - 定制服务: ¥500 × 5 = ¥2,500
  - 培训服务: ¥299 × 3 = ¥897

首年总服务收入: ¥4,387
```

---

## 十二、快速启动检查清单

### 开发前准备

- [ ] 确认产品定位和目标用户
- [ ] 准备开发环境（安装 Obsidian）
- [ ] 熟悉 Dataview 和 Templater 插件
- [ ] 准备营销素材
- [ ] 建立社交媒体账号
- [ ] 准备收款方式（Stripe/微信/支付宝）

### 发布前检查

- [ ] 核心功能测试通过
- [ ] 所有查询正确
- [ ] 模板正常工作
- [ ] 文档完整
- [ ] 视频录制完成
- [ ] 销售页面搭建
- [ ] 定价策略确认
- [ ] 客服渠道建立

---

## 十三、最后的建议

### 💡 核心建议

```yaml
1. 从小规模开始
   - 先做 50 人内测
   - 收集反馈快速迭代
   - 确认市场价值

2. 重视用户教育
   - Obsidian 有学习成本
   - 必须有详细的视频教程
   - 图文并茂是标配

3. 建立社区
   - 微信群/ Discord
   - 快速响应用户问题
   - 用户共创内容

4. 持续改进
   - 根据反馈更新
   - 定期发布新功能
   - 保持产品新鲜感

5. 多渠道推广
   - 不要依赖单一渠道
   - B站/小红书/公众号
   - 社区口碑很重要
```

### 🎯 你能做到的

```
✅ 会用 Obsidian（你已经在用）
✅ 能编写 Dataview 查询（我给你现成的）
✅ 能创建模板（我给你代码）
✅ 能录制视频（手机即可）
✅ 能写文档（Markdown 即可）

❌ 不需要精通编程（用插件代替）
❌ 不需要开发独立应用（基于 Obsidian）
❌ 不需要复杂架构（MVP 就够）
❌ 不需要大团队（单人即可）
```

---

*本方案专为个人开发者设计，以最小的技术门槛实现最大的市场价值。*
