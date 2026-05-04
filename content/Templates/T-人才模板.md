<%*
if (tp.file.title === "Untitled" || tp.file.title === "") {
    const newName = await tp.system.prompt("请输入人才姓名");
    if (newName) {
        tp.file.rename(newName);
    }
}
 tR += "---"
 %>
area: 关系
category:
  - talent
tags:
  - people
aliases: 
status:
  - <% tp.system.suggester(["未开始","进行中","已停止","已完成","已存档"],["未开始","进行中","已停止","已完成","已存档"],false, "选择人才当前状态") %>
projects: 
 - 
company: 
title: 
country: 
city: 
date of birth: 
gender: <% tp.system.suggester(["男","女"],["男","女"],false, "选择人才性别") %>
school: 
education: <% tp.system.suggester(["专科","本科","硕士","博士","博士后"],["专科","本科","硕士","博士","博士后"],false, "选择人才学历") %>
domain: 
 - <% tp.system.prompt("请输入专业/賽道:") %>
expertise:
  - <% tp.system.prompt("请输入专业/擅长方向:") %>
from: 
date of comm: 
last_contact: 
way of comm: <% tp.system.prompt("请输入沟通方式：微信、手机、email、腾讯会议、飞书、Zoom") %>
phone no.: 
email: 
wechat no.: 
homepage: 
resume: <% tp.system.suggester(["有", "无"],["有", "无"],false, "是否有简历") %>
stars: <% tp.system.suggester(["3星级","4星级","5星级"],["3星级","4星级","5星级"],false, "选择人才重要程度") %>
created date: <% tp.file.creation_date() %>
modified date: <% tp.file.last_modified_date() %>
number headings: auto, first-level 2, max 6, contents ^toc, skip ^skipped, start-at 1, _.1.1
---

## 1 个人信息


## 2 推荐记录

```dataview
table without id 
	client as 企业,
	project as 职位, 
	link(file.path, "详情") as 申请记录,
	status as 进度, 
	offer_status as offer状态, 
	summary as 备注,
	last_contact as 最近联系
from "07People/Applications"
where talent = this.file.link OR icontains(talent, this.file.link)
sort modified desc
```

## 3 任务清单
### 3.1 未完成
```tasks
not done
description includes <% tp.file.title %>
short mode
sort by due desc
```


### 3.2 已完成
```tasks
done
description includes <% tp.file.title %>
short mode
sort by due desc
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
sort file.name desc
```


## 5 延伸阅读



