<%*
if (tp.file.title === "Untitled" || tp.file.title === "") {
    const newName = await tp.system.prompt("请输入项目名称");
    if (newName) {
        tp.file.rename(newName);
    }
}
 tR += "---"
 %>
area: 商业
category:
  - 猎头
client: "[[<% tp.system.prompt('请输入客户名称:') %>]]"
status:
  - <% tp.system.suggester(["未开始","进行中","已停止","已完成","已存档"],["未开始","进行中","已停止","已完成","已存档"],false, "选择项目状态") %>
tags:
  - project
aliases: 
stars: <% tp.system.suggester(["3星级","4星级","5星级"],["3星级","4星级","5星级"],false, "选择项目重要程度") %>
招聘人数: 
工作地点: 
contacts: 
  - 
owner: 
  - 
member: 
  - 
start_date: 
stop_date: 
Deadline:
completedDate:
tasks: 
tasks_todo: 
tasks_completed: 
created date: <% tp.file.creation_date() %>
modified date: <% tp.file.last_modified_date() %>
number headings: auto, first-level 2, max 6, contents ^toc, skip ^skipped, start-at 1, _.1.1
Summary:
---

## 1 候选人名单

```dataview
table without id
	link(file.link, "详情") as 申请职位,
	status as 进展,
	talent as 姓名,
	match as 匹配度,
	willingness as 意愿度,
	summary as 备注,
	last_contact as 最近联系
from "07People/Applications"
where icontains(project, this.file.link)
sort file.cday desc
```


## 任务清单^skipped


## 2 话术

## 3 职位资料与进展

### 3.1 会议
```dataview
table without id 
  file.link as 会议名称,
  status as 状态,
  start_time as 开会时间,
  location as 地点,
  summary as 概述
from ""
where icontains(project, link(this.file.name)) AND icontains(tags, "meeting")
sort file.ctime desc
```
### 3.2 日记
```dataview
table without id
  file.link as 日期,
  L.text as 内容
from "00Journal/01DailyNotes"
flatten reverse(file.lists) AS L
where contains(L.text, "[[" + this.file.name + "]]") 
	OR contains(L.text, "[[" + this.file.name + "|") 
	OR contains(L.text, "#" + this.file.name)
sort
  date desc,
  L.line desc
```

### 3.3 职位描述（JD）

- 招聘职位
- 薪资预算
- 工作地点
- 需求原因
- 汇报关系
- 下属人数
- 招聘要求
- 面试流程
- 找了多久
- 目标公司

## 4 资源
