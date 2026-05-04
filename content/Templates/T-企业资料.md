<%*
if (tp.file.title === "Untitled" || tp.file.title === "") {
    const newName = await tp.system.prompt("请输入企业名称");
    if (newName) {
        tp.file.rename(newName);
    }
}
 tR += "---"
 %>
area: 商业
category:
  - 猎头客户
domain: 
 - <% tp.system.prompt("请输入企业所属赛道或主营产品") %>
status:
  - <% tp.system.suggester(["未开始","进行中","已停止","已完成","已存档"],["未开始","进行中","已停止","已完成","已存档"] ,false, "选择企业合作状态") %>
tags:
  - 企业/猎头
aliases: 
contacts: 
stars: <% tp.system.suggester(["3星级","4星级","5星级"],["3星级","4星级","5星级"],false, "选择企业重要等级") %>
created date: <% tp.file.creation_date() %>
modified date: <% tp.file.last_modified_date() %>
start_date: 
stop_date: 
number headings: auto, first-level 2, max 6, contents ^toc, skip ^skipped, start-at 1, _.1.1
summary: 
---


## 任务清单^skipped

```tasks
path includes <% tp.file.folder(false) %>
path does not include <% tp.file.folder(false) %>.md
short mode
sort by status
sort by due desc
```
## 1 职位及进展
```dataview
table without id 
  file.link as 职位名称,
  status as 状态,
  招聘人数,
  工作地点,
  stars as 紧急程度,
  file.ctime AS 启动时间,
  round(max((date(today) - date(start_date)).days, 0)) + "天" AS 已启动
from ""
where contains(client, link(this.file.name)) AND icontains(tags, "project")
sort stars desc, file.ctime desc
```
### 1.1 会议
```dataview
table without id 
  file.link as 会议名称,
  client as 客户,
  project as 项目,
  status as 状态,
  start_time as 开会时间
from ""
where icontains(client, link(this.file.name)) AND icontains(tags, "meeting")
sort file.ctime desc
```
### 1.2 日记
```dataview
table without id
  file.link as 日期,
  regexreplace(L.text, "#\S+", "") as 内容
from "00Journal/01DailyNotes"
flatten file.lists as L
where contains(L.text, "[[" + this.file.name + "]]") OR contains(L.text, "#" + this.file.name)
sort
  date desc,
  L.line desc
```

## 2 公司信息

### 2.1 基本信息
- 企业全称：
- 成立时间：
- 公司官网：
- 办公地址：
### 2.2 公司简介

### 2.3 发展历程
按照时间倒序

## 3 主营业务和产品
### 3.1 主营业务

### 3.2 市值或估值

### 3.3 年营收总额

### 3.4 产品类型

## 4 团队介绍
### 4.1 人员规模
### 4.2 组织架构
### 4.3 高管背景

## 5 融资历程

## 6 新闻报道
最近3年主流媒体的新闻报道，并列出参考网址

## 7 竞对公司

## 8 内部/小道消息

## 9 相关条目
```dataview
list
from ""
where icontains(tags, "note") AND (icontains(tags, this.file.name) OR icontains(client, link(this.file.name)))
sort file.ctime desc
limit 10
```
