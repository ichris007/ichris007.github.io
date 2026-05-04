<%*
if (tp.file.title === "Untitled" || tp.file.title === "") {
    const newName = await tp.system.prompt("请输入人物名称");
    if (newName) {
        tp.file.rename(newName);
    }
}
 tR += "---"
 %>
area: 关系
category:
 - <% tp.system.suggester(["I.Client", "C.Client"],["I.Client", "C.Client"],false, "选择人物客户分类") %>
tags:
  - people
aliases: 
status:
  - <% tp.system.suggester(["未开始","进行中","已停止","已完成","已存档"],["未开始","进行中","已停止","已完成","已存档"],false, "选择人物当前状态") %>
projects: 
  - 
company: 
title: 
country: 
city: 
date of birth: 
gender: <% tp.system.suggester(["男","女"],["男","女"],false, "选择人物性别") %>
school: 
education: 
domain: 
  - 
expertise:
  - 
from: 
phone no.: 
email: 
wechat no.: 
homepage: 
  - 
stars: <% tp.system.suggester(["3星级","4星级","5星级"],["3星级","4星级","5星级"],false, "选择人物重要程度") %>
start_date: 
fee: 
payment status: 
payment date: 
created date: <% tp.file.creation_date() %>
modified date: <% tp.file.last_modified_date() %>
number headings: auto, first-level 2, max 6, contents ^toc, skip ^skipped, start-at 1, _.1.1
---

## 1 个人简介


## 2 相关项目
```dataview
table without id
	file.link as 项目,
	client as 客户,
	category as 类型,
	status as 状态
from ""
where icontains(tags, "Project") AND icontains(file.outlinks, [[<% tp.file.title %>]])
sort file.cday desc
```

## 3 相关会议
```dataview
table without id
	client as 客户,
	project as 项目,
	location as 会议地点,
	start_time as 会议时间
from ""
where icontains(tags, "meeting") AND icontains(file.outlinks, [[<% tp.file.title %>]])
sort file.cday desc
limit 10
```
## 4 相关日记

```dataview
table without id
  file.link as 日期,
  regexreplace(L.text, "#\S+", "") as 内容
from "00Journal/01DailyNotes"
flatten reverse(file.lists) AS L
where contains(L.text, "[[" + this.file.name + "|") 
	OR contains(L.text, "[[" + this.file.name + "]]")
sort
  date desc,
  L.line desc
```

## 5 任务清单
### 5.1 未完成
```tasks
not done
description includes <% tp.file.title %>
short mode
sort by due desc
```

### 5.2 已完成
```tasks
done
description includes <% tp.file.title %>
short mode
sort by due desc
```

## 6 延伸阅读



