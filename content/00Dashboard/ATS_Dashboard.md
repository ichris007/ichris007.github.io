---
modified date: 2026-01-30 11:13:58
number headings: auto, off
cssclasses:
  - callouts-outlined
  - hide-properties
  - bannerimg
---
![[Banner06.jpg##bannerimg]]
# Todo

> [!tip]+ Todo Lists
> ```tasks
> (not done) 
> (path includes 01Projects/猎头) OR (path includes 07People/Application)
> sort by priority
> sort by due
> sort by created
> short mode
> show tree
> hide created date
> hide start date
> group by filename
> ```


# Job orders
![[ATS.base#Projects_Ongoing]]

# Clients
![[ATS.base#Clients_ongong]]

# Pipeline

#### 推荐前

> [!tabbed-underline]
>
> <label>潜在人选<input type="radio"  name="test"/></label>
>
> > ```dataview
>>TABLE without id
>>	talent AS 姓名,
>>	client AS 客户,
>>	project AS 职位,
>>	summary AS 备注,
>>	link(file.link, "详情") AS 应聘记录,
>>	last_contact AS 最近联系
>>FROM  "07People/Applications"
>>WHERE icontains(status, "潜在人选")
>>	AND icontains(pipeline, "招聘中")
>>```
>
> <label>初步沟通<input type="radio"  name="test"/></label>
>
> > ```dataview
>>TABLE without id
>>	talent AS 姓名,
>>	client AS 客户,
>>	project AS 职位,
>>	summary AS 备注,
>>	link(file.link, "详情") AS 应聘,
>>	last_contact AS 最近联系
>>FROM  "07People/Applications"
>>WHERE icontains(status, "初步沟通")
>>	AND icontains(pipeline, "招聘中")
>>```
>
> <label>顾问评估<input type="radio" name="test" /></label>
>
> > ```dataview
>>TABLE without id
>>	talent AS 姓名,
>>	client AS 客户,
>>	project AS 职位,
>>	summary AS 备注,
>>	link(file.link, "详情") AS 应聘,
>>	last_contact AS 最近联系
>>FROM  "07People/Applications"
>>WHERE icontains(status, "顾问评估")
>>	AND icontains(pipeline, "招聘中")
>>```
>
>



#### 推荐后

> [!tabbed-underline]
>
> <label>推荐简历<input type="radio"  name="test"/></label>
>
> > ```dataview
>>TABLE without id
>>	talent AS 姓名,
>>	client AS 客户,
>>	project AS 职位,
>>	summary AS 备注,
>>	link(file.link, "详情") AS 应聘记录,
>>	last_contact AS 最近联系
>>FROM  "07People/Applications"
>>WHERE icontains(status, "推荐")
>>	AND icontains(pipeline, "招聘中")
>>```
>
> <label>简历初筛<input type="radio"  name="test"/></label>
>
> > ```dataview
>>TABLE without id
>>	talent AS 姓名,
>>	client AS 客户,
>>	project AS 职位,
>>	summary AS 备注,
>>	link(file.link, "详情") AS 应聘,
>>	last_contact AS 最近联系
>>FROM  "07People/Applications"
>>WHERE icontains(status, "初筛")
>>	AND icontains(pipeline, "招聘中")
>>```
>
> <label>一面<input type="radio" name="test" /></label>
>
> > ```dataview
>>TABLE without id
>>	talent AS 姓名,
>>	client AS 客户,
>>	project AS 职位,
>>	summary AS 备注,
>>	link(file.link, "详情") AS 应聘,
>>	last_contact AS 最近联系
>>FROM  "07People/Applications"
>>WHERE icontains(status, "一面")
>>	AND icontains(pipeline, "招聘中")
>>```
>
> <label>二面<input type="radio" name="test" /></label>
>
> > ```dataview
>>TABLE without id
>>	talent AS 姓名,
>>	client AS 客户,
>>	project AS 职位,
>>	summary AS 备注,
>>	link(file.link, "详情") AS 应聘,
>>	last_contact AS 最近联系
>>FROM  "07People/Applications"
>>WHERE icontains(status, "二面")
>>	AND icontains(pipeline, "招聘中")
>>```
>
> <label>三面<input type="radio" name="test" /></label>
>
> > ```dataview
>>TABLE without id
>>	talent AS 姓名,
>>	client AS 客户,
>>	project AS 职位,
>>	summary AS 备注,
>>	link(file.link, "详情") AS 应聘,
>>	last_contact AS 最近联系
>>FROM  "07People/Applications"
>>WHERE icontains(status, "三面")
>>	AND icontains(pipeline, "招聘中")
>>```
>
> <label>HR面<input type="radio" name="test" /></label>
>
> > ```dataview
>>TABLE without id
>>	talent AS 姓名,
>>	client AS 客户,
>>	project AS 职位,
>>	summary AS 备注,
>>	link(file.link, "详情") AS 应聘,
>>	last_contact AS 最近联系
>>FROM  "07People/Applications"
>>WHERE icontains(status, "HR面")
>>	AND icontains(pipeline, "招聘中")
>>```
>
> <label>谈offer<input type="radio" name="test" /></label>
>
> > ```dataview
>>TABLE without id
>>	offer_status AS offer状态,
>>	talent AS 姓名,
>>	client AS 客户,
>>	project AS 职位,
>>	summary AS 备注,
>>	link(file.link, "详情") AS 应聘,
>>	last_contact AS 最近联系
>>FROM  "07People/Applications"
>>WHERE icontains(status, "谈offer")
>>	AND icontains(pipeline, "招聘中")
>>```
>
> <label>待入职<input type="radio" name="test" /></label>
>
> > ```dataview
>>TABLE without id
>>	entry_date AS 入职日期,
>>	talent AS 姓名,
>>	client AS 客户,
>>	project AS 职位,
>>	summary AS 备注,
>>	link(file.link, "详情") AS 应聘,
>>	last_contact AS 最近联系
>>FROM  "07People/Applications"
>>WHERE icontains(status, "待入职")
>>	AND icontains(pipeline, "招聘中")
>>```
>
> <label>已入职<input type="radio" name="test" /></label>
>
> > ```dataview
>>TABLE without id
>>	entry_date AS 入职日期,
>>	talent AS 姓名,
>>	client AS 客户,
>>	project AS 职位,
>>	summary AS 备注,
>>	link(file.link, "详情") AS 应聘,
>>	last_contact AS 最近联系
>>FROM  "07People/Applications"
>>WHERE icontains(status, "已入职")
>>	AND icontains(pipeline, "招聘中")
>>```
>

#### 负反馈

> [!tabbed-underline]
>
> <label>简历淘汰<input type="radio"  name="test"/></label>
>
> > ```dataview
>>TABLE without id
>>	talent AS 姓名,
>>	client AS 客户,
>>	project AS 职位,
>>	summary AS 备注,
>>	link(file.link, "详情") AS 应聘记录,
>>	last_contact AS 最近联系
>>FROM  "07People/Applications"
>>WHERE icontains(status, "简历淘汰")
>>	AND icontains(pipeline, "招聘中")
>>```
>
> <label>面试淘汰<input type="radio"  name="test"/></label>
>
> > ```dataview
>>TABLE without id
>>	talent AS 姓名,
>>	client AS 客户,
>>	project AS 职位,
>>	summary AS 备注,
>>	link(file.link, "详情") AS 应聘,
>>	last_contact AS 最近联系
>>FROM  "07People/Applications"
>>WHERE icontains(status, "面试淘汰")
>>	AND icontains(pipeline, "招聘中")
>>```
>
> <label>人选放弃<input type="radio" name="test" /></label>
>
> > ```dataview
>>TABLE without id
>>	talent AS 姓名,
>>	client AS 客户,
>>	project AS 职位,
>>	summary AS 备注,
>>	link(file.link, "详情") AS 应聘,
>>	last_contact AS 最近联系
>>FROM  "07People/Applications"
>>WHERE icontains(status, "人选放弃")
>>	AND icontains(pipeline, "招聘中")
>>```
>
> <label>客户放弃<input type="radio" name="test" /></label>
>
> > ```dataview
>>TABLE without id
>>	talent AS 姓名,
>>	client AS 客户,
>>	project AS 职位,
>>	summary AS 备注,
>>	link(file.link, "详情") AS 应聘,
>>	last_contact AS 最近联系
>>FROM  "07People/Applications"
>>WHERE icontains(status, "客户放弃")
>>	AND icontains(pipeline, "招聘中")
>>```
>
> <label>项目暂停<input type="radio" name="test" /></label>
>
> > ```dataview
>>TABLE without id
>>	talent AS 姓名,
>>	client AS 客户,
>>	project AS 职位,
>>	summary AS 备注,
>>	link(file.link, "详情") AS 应聘,
>>	last_contact AS 最近联系
>>FROM  "07People/Applications"
>>WHERE icontains(status, "项目暂停")
>>	AND icontains(pipeline, "招聘中")
>>```
>


