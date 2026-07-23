---
title: 基于LLM Wiki的Obsidian LLM LifeinOS
aliases:
description: 基于 Andrej Karpathy 的 LLM Wiki 模式构建的个人知识维基系统
draft:
publish: "true"
enableToc: "true"
tags:
  - Obsidian
  - LLMWiki
  - LLM
  - LifeinOS
cssclasses:
created: 2026-07-23 18:10
modified: 2026-07-23 18:10
socialImage:
socialDescription:
comments: "true"
permalink:
lang:
---
## 0.1 引言

经过不断地调整和打磨，终于把LLM和我的LifeinOS系统整合好了。

目前基本的架构、工作流、交互等已经跑通了。直接在Lifein OS里用Claudian插件调用大模型，根据LLM Lifein系统规则，自动完成内容提取、创建页面、关联笔记、更新索引，并做健康检查。

我设计这个LLM模块的好处是：**不用对现在有的Vault做任何更改，直接导入LLM模块，就能完美运行**。

目前，这个系统还是早期版本，后面会随着使用不断优化、迭代。

![[LLM Lifein-poster-light.jpg]]
（用AI生成了一份海报 -> [在线预览](../assets/llmlifeinposter.html)）
## 0.2 系统定位

基于 **Andrej Karpathy 的 LLM Wiki 模式**构建的个人知识维基系统，由 LLM 担任"维护者"角色——**知识编译一次并持续更新，而非每次查询重新推导**。

## 0.3 三层架构

|层级|目录|说明|
|---|---|---|
|**Raw Sources**|`LLMWiki/sources/`|原始资源（只读）|
|**The Wiki**|`LLMWiki/wiki/`|LLM 生成的维基页面|
|**The Schema**|`LLMWiki/CLAUDE.md`|定义工作流和页面规范|

## 0.4 领域体系

- **商业 (business)** — 企业资料、AI行业、项目、人才等
- **成长 (growth)** — 知识管理、Obsidian、自我提升等
- **生活 (life)** — 个人生活
- **关系 (relations)** — 人物、候选人、联系人等

领域映射规则在 `LLMWiki/schema/domains.yaml` 中配置。


## 0.5 页面类型（4 类）

|类型|命名规则|示例|
|---|---|---|
|**Entity**|`姓名.md` / `公司名.md`|`OpenAI.md`, `林星宇.md`|
|**Concept**|`概念名.md`|`具身智能.md`, `AI Infra.md`|
|**Topic**|`描述性短语.md`|`OpenAI机器人业务.md`|
|**Source**|`YYYY-来源标题.md`|`2026-OpenAI重返机器人赛道.md`|


## 0.6 三大工作流

|工作流|触发词|核心动作|
|---|---|---|
|**Ingest**|"ingest / 导入"|读取来源 → 提取实体/概念 → 创建/更新页面 → 更新索引|
|**Query**|直接提问|搜索索引 → 读取相关页面 → 综合答案|
|**Lint**|"lint / 健康检查"|检测孤立页面、矛盾、过期内容、数据空白|

## 0.7 与 Vault 的整合

通过 `related_paths` 字段双向链接到现有 vault 内容，比如：

- 项目 → `01Projects/`
- 人物 → `07Relations/Talents/`
- 书籍 → `05Books/`
- 个人笔记 → `Longform/`, `0Inbox/`

## 0.8 总结

这是一个**让 LLM 帮你自动整理和索引知识**的系统。你丢入来源（文章、对话、URL），LLM 自动提取实体、概念、主题，生成相互链接的维基页面，并与你现有的 Obsidian Lifein 打通。

