---
date: <%tp.date.now("YYYY-MM-DD")%>
week: <% moment(tp.file.title, "WW_YYYYMMDD").format("GGGG[W]WW") %>
tags:
  - DailyNotes
cssclasses:
  - daily
  - callouts-outlined
  - bannerimg
  - <%*  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];  tR += days[new Date(tp.date.now("YYYY-MM-DD")).getDay()];%>
number headings: off
读书:
写作:
健身:
早起:
社媒分享:
听播客:
睡眠时长:
体重:
---
![[Banner06.jpg##bannerimg]]
|<< [[<% tp.date.now("WW_YYYYMMDD", -1) %>|前一天]] | <% tp.date.now("YYYY年M月D日, dddd")%>, [[<% moment(tp.file.title, "WW_YYYYMMDD").format("GGGG[W]WW") %>|周回顾]]  | [[<% tp.date.now("WW_YYYYMMDD", +1) %>|后一天]] >>| 

![[金句名言]]


### 任务清单

```meta-bind-embed
[[添加任务按钮]]
```

#### 日常和工作任务
![[task_board#日常任务]]

#### 项目任务
![[task_board#项目任务]]

### 日记

#### TIME




### 今日总结/感悟

#### 今日总结


#### 今日感悟



### 今日文件状态
![[最近编辑.base#今日创建]]
