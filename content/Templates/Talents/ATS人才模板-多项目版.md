<%*
// 自动命名
if (tp.file.title === "Untitled" || tp.file.title === "") {
    const newName = await tp.system.prompt("请输入人才姓名");
    if (newName) {
        await tp.file.rename(newName);
    }
}
tR += "---"
%>
area: 关系
category:
  - talent
tags:
  - people
  - talent
aliases: []

# ============================================
# 人才基础信息
# ============================================
name: <% tp.file.title %>
status: <% tp.system.suggester(["活跃","闲置","已入职","已关闭"],["活跃","闲置","已入职","已关闭"],false, "选择人才整体状态") %>
stars: <% tp.system.suggester(["3星级","4星级","5星级"],["3星级","4星级","5星级"],false, "选择人才重要程度") %>

# ============================================
# 个人资料
# ============================================
gender: <% tp.system.suggester(["男","女","未知"],["男","女","未知"],false, "选择性别") %>
date of birth:
age:
country: <% tp.system.suggester(["中国","美国","英国","新加坡","德国","日本","其他"],["中国","美国","英国","新加坡","德国","日本","其他"],false, "选择国家") %>
city:

# ============================================
# 工作背景
# ============================================
current company:
current title:
domain:
  - <% tp.system.prompt("请输入主要领域（如：自动驾驶、AI、嵌入式系统）") %>
expertise:
  - <% tp.system.prompt("请输入专业方向（如：感知算法、C++开发、系统集成）") %>
education: <% tp.system.suggester(["专科","本科","硕士","博士","博士后","其他"],["专科","本科","硕士","博士","博士后","其他"],false, "选择学历") %>
school:
total years:

# ============================================
# 联系方式
# ============================================
phone: <% tp.system.prompt("请输入手机号码（可选）") %>
email: <% tp.system.prompt("请输入邮箱（可选）") %>
wechat: <% tp.system.prompt("请输入微信号（可选）") %>
homepage:
linkedin:
github:
other_contact:

# ============================================
# 来源信息
# ============================================
source: <% tp.system.suggester(["GitHub","LinkedIn","X.com","内推推荐","猎头推荐","主动投递","meetup","其他"],["GitHub","LinkedIn","X.com","内推推荐","猎头推荐","主动投递","meetup","其他"],false, "选择人才来源") %>
source_detail:
resume: <% tp.system.suggester(["有","无"],["有","无"],false, "是否有简历") %>
resume_file:

# ============================================
# 多项目追踪 ⭐ 关键字段
# ============================================
# 项目状态说明：
# - pipeline: 简历初筛
# - interview: 面试中
# - offer: 谈offer
# - offer_sent: 已发offer
# - offer_accepted: 已接offer
# - offer_rejected: 拒绝offer
# - hired: 已入职
# - rejected: 已拒绝
# - on_hold: 暂缓
# - withdrawn: 退出

# 添加新项目格式：
# projects:
#   - name: "项目A名称"
#     status: "当前状态"
#     stage: "具体阶段"
#     last_update: "2024-01-27"
#     notes: "备注信息"

projects:
  - name: "<% tp.system.prompt("请输入项目名称（如：感知算法集成工程师）") %>"
    status: <% tp.system.suggester(["pipeline","interview","offer","offer_sent","offer_accepted","offer_rejected","hired","rejected","on_hold","withdrawn"],["pipeline","interview","offer","offer_sent","offer_accepted","offer_rejected","hired","rejected","on_hold","withdrawn"],false, "选择项目状态") %>
    stage: "初筛"
    last_update: <% tp.date.now("YYYY-MM-DD") %>
    notes: ""

# ============================================
# 时间记录
# ============================================
created date: <% tp.file.creation_date("YYYY-MM-DD") %>
modified date: <% tp.file.last_modified_date("YYYY-MM-DD") %>
last_contact:

# ============================================
# 附件
# ============================================
attachments:
  - name: "简历"
    file: ""
    type: "pdf"
  - name: "作品集"
    file: ""
    type: "link"

# ============================================
# 备注
# ============================================
notes:

---

# [[1 个人信息]]
## 个人简介

## 工作经历
| 时间 | 公司 | 职位 |
|------|------|------|
|      |      |      |

## 技能清单
- **编程语言**：
- **技术栈**：
- **项目经验**：

---

# [[2 项目追踪]]

<%*
const projects = [
  { status: "pipeline", name: "简历初筛", emoji: "📄" },
  { status: "interview", name: "面试中", emoji: "💬" },
  { status: "offer", name: "谈offer", emoji: "💰" },
  { status: "offer_sent", name: "已发offer", emoji: "📧" },
  { status: "offer_accepted", name: "已接offer", emoji: "✅" },
  { status: "offer_rejected", name: "拒绝offer", emoji: "❌" },
  { status: "hired", name: "已入职", emoji: "🎉" },
  { status: "rejected", name: "已拒绝", emoji: "🚫" },
  { status: "on_hold", name: "暂缓", emoji: "⏸️" },
  { status: "withdrawn", name: "退出", emoji: "👋" }
];

let projectTable = "## 项目状态总览\n\n| 项目名称 | 状态 | 阶段 | 最后更新 | 备注 |\n|---------|------|------|----------|------|\n";

// 从frontmatter获取项目信息
// 注意：这里需要手动维护，因为tp不能直接读取frontmatter的复杂结构
// 实际使用时，需要根据实际情况更新下方的表格

projectTable += `| <% tp.system.prompt("更新项目名称") %>| 更新状态 | 更新阶段 | ${tp.date.now("YYYY-MM-DD")} | 更新备注 |\n`;

tR += projectTable;
%>

<%*
tR += "\n## 项目状态图例\n\n";
projects.forEach(p => {
  tR += `- **${p.emoji} ${p.status}**: ${p.name}\n`;
});
%>

## 项目详情

### 项目名称：[项目A]
**状态**：📄 简历初筛
**阶段**：初筛
**最后更新**：2024-01-27

#### 面试记录
| 日期 | 面试轮次 | 面试官 | 结果 | 备注 |
|------|---------|--------|------|------|
|      |         |        |      |      |

#### Offer信息
| 项目 | 内容 | 数值 |
|------|------|------|
| Base salary |      |      |
| Bonus |      |      |
| Equity |      |      |
| Start date |      |      |

---

### 项目名称：[项目B]
**状态**：💰 谈offer
**阶段**：薪资谈判
**最后更新**：2024-01-27

#### 面试记录
| 日期 | 面试轮次 | 面试官 | 结果 | 备注 |
|------|---------|--------|------|------|
|      |         |        |      |      |

#### Offer信息
| 项目 | 内容 | 数值 |
|------|------|------|
| Base salary |      |      |
| Bonus |      |      |
| Equity |      |      |
| Start date |      |      |

**备注**：

---

# [[3 联系记录]]

## 联系历史
| 日期 | 沟通方式 | 沟通类型 | 内容摘要 | 负责人 |
|------|---------|---------|---------|--------|
| <% tp.date.now("YYYY-MM-DD") %> | 线上会议 | 初次沟通 | <% tp.system.prompt("记录沟通内容") %> |      |

## 待办事项
- [ ] 后续跟进
- [ ] 准备面试材料
- [ ] 收集更多信息

---

# [[4 面试反馈]]

## 面试评价
| 维度 | 评分 | 详情 |
|------|------|------|
| 技术能力 | ⭐⭐⭐⭐⭐ |      |
| 沟通能力 | ⭐⭐⭐⭐⭐ |      |
| 项目经验 | ⭐⭐⭐⭐⭐ |      |
| 文化匹配 | ⭐⭐⭐⭐⭐ |      |

## 优势与劣势
### 优势（Strengths）
-
-
-

### 劣势（Weaknesses）
-
-
-

## 综合评价

---

# [[5 附件和资源]]

## 简历
- [ ] 原版简历
- [ ] 中文简历
- [ ] 英文简历

## 作品集/项目展示
-
-

## 其他资料
-

---

# [[6 备注]]

<%*
tR += "\n\n---\n\n";
tR += "> 📌 **提示**：\n";
tR += "> - 添加新项目：在frontmatter的`projects`字段中添加新的项目项\n";
tR += "> - 更新项目状态：修改frontmatter中对应项目的`status`字段\n";
tR += "> - 项目时间线：在\"项目详情\"部分记录完整的时间线\n";
tR += "> - 使用Dataview插件可以自动统计多项目状态\n";
%>
