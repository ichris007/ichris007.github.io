# 感知算法集成工程师 - GitHub人才搜索方案

## 1 职位基本信息

| 项目 | 内容 |
|------|------|
| 岗位名称 | 感知算法集成工程师 |
| 岗位等级 | H5–H6（资深工程师） |
| 工作地点 | 上海 |
| 岗位性质 | 算法工程 / 系统集成 |

---

## 2 核心技术要求

### 2.1 编程语言
- **Python** + **C/C++**

### 2.2 技术领域
- 智能驾驶感知算法
- 视觉算法
- 多传感器融合
- 感知链路
- 算法工程化与部署

### 2.3 平台经验
- 车载系统集成
- 芯片适配
- 嵌入式平台
- Android/Linux/RTOS

---

## 3 GitHub搜索策略

### 3.1 一、技术栈关键词搜索

#### 3.1.1 核心技术组合

**搜索关键词组合：**
```
"perception" "autonomous driving" C++
"sensor fusion" automotive C++
"computer vision" automotive deployment
"perception pipeline" C++ deployment
"object detection" automotive inference
```

#### 3.1.2 框架与库相关
```
"ROS" "autonomous driving" perception
"Autoware" perception
"Apollo" perception
"TensorRT" automotive inference
"ONNX" automotive deployment
"OpenCV" automotive
"Paddle" automotive inference
"PyTorch" C++ inference
```

#### 3.1.3 芯片与平台相关
```
"Snapdragon" automotive
"NXP" automotive perception
"Qualcomm" automotive
"Renesas" automotive
"TI" automotive perception
"Jetson" autonomous driving
"Orin" perception
"Xavier" autonomous
"Mobileye" tools
```

---

### 3.2 二、目标公司相关人员搜索

#### 3.2.1 芯片公司
**公司列表：**
- 高通 Qualcomm
- 英伟达 NVIDIA
- 恩智浦 NXP
- 瑞萨 Renesas
- 德州仪器 TI
- 联发科 MediaTek
- 地平线 Horizon Robotics（中国）
- 黑芝麻 Black Sesame（中国）
- 芯擎科技 SiEngine（中国）
- 摩尔线程 Moore Threads（中国）

**搜索语法：**
```
org:Qualcomm  perception automotive
org:Qualcomm  C++ autonomous
org:NVIDIA-Corporation  automotive perception
org:NXPSemiconductors  automotive
org:renesas-rcar  perception
org:ti-embedded  automotive
org:horizonai  perception
org:BlackSesame-Tech  autonomous
```

#### 3.2.2 汽车 Tier1 / 主机厂
**公司列表：**
- 德州大陆 Continental
- 博世 Bosch
- 电装 Denso
- 采埃孚 ZF
- 麦格纳 Magna
- 比亚迪 BYD
- 长城汽车 Great Wall
- 小鹏 XPeng
- 理想 Li Auto
- 蔚来 NIO
- 问界 AITO
- 集度 Jidu
- 智己 IM

**搜索语法：**
```
org:ContinentalAG  perception
org:BoschGlobal  autonomous driving
org:denso  automotive perception
org:ZFgroup  autonomous
org:wpengine  automotive（示例需调整）
org:ByteDance  autonomous（理想/蔚来等可能有公司账号）
```

#### 3.2.3 手机终端厂商
**公司列表：**
- 小米 Xiaomi
- 华为 Huawei
- OPPO
- vivo
- 荣耀 Honor
- 三星 Samsung

**搜索语法：**
```
org:Xiaomi  automotive
org:MaaX-0-IoT  automotive（小米IoT）
org:Huawei  autonomous driving
org:OPPO  camera vision
org:vivo  computer vision
```

---

### 3.3 三、开源项目定向搜索

#### 3.3.1 智能驾驶相关开源项目

| 项目 | 搜索关键词 |
|------|-----------|
| Autoware | `org:autowarefoundation` |
| Apollo | `org:ApolloAuto` |
| Baidu Apollo | `org:Baidu-Apollo` |
| ApolloAuto | `org:ApolloAuto` |
| Carla Simulator | `org:carla-simulator` |
| OpenPilot | `org:commaai` |
| Panda | `org:commaai` |
| DeepScale | `org:openpilot` |

**项目贡献者搜索：**
1. 访问项目页面 → Contributors
2. 筛选近期活跃贡献者
3. 查看贡献代码：关注 C++、ROS、感知相关

#### 3.3.2 感知算法相关项目

**搜索命令：**
```bash
# 图像处理与计算机视觉
topic:"computer-vision" language:C++ stars:>100
topic:"object-detection" language:C++ stars:>100
topic:"semantic-segmentation" stars:>100

# 传感器融合
topic:"sensor-fusion" language:C++
topic:"lidar" perception autonomous
topic:"radar" perception automotive

# 推理加速
topic:"tensorrt" stars:>50
topic:"onnx" C++ deployment
topic:"model-optimization" automotive
```

---

### 3.4 四、简历与经验特征搜索

#### 3.4.1 README与Bio关键词

在用户主页README或Bio中搜索：
```
"autonomous driving" "C++"
"perception engineer"
"automotive" "computer vision"
"ADAS" "C++"
"embedded systems" perception
"RTOS" automotive
"Qt" automotive
"Android" automotive
```

#### 3.4.2 项目经验关键词

**项目描述中搜索：**
```
"感知系统开发"
"传感器融合"
"车载部署"
"芯片移植"
"算法工程化"
"性能优化" inference
"ONNX" "TensorRT"
"ROS" "autonomous"
```

---

### 3.5 五、技能组合矩阵搜索

| Python | C/C++ | 搜索示例 |
|--------|-------|----------|
| ✓ | ✓ | `topic:autonomous-driving language:python` + 查看repo中C++ |
| ✓ | ✓ | `topic:computer-vision language:C++` |
| ✓ | ✓ | `topic:deep-learning language:C++` |

**实用搜索脚本：**
```bash
# 组合搜索
gh search repos "autonomous driving perception" --language python --language cpp --limit 50
gh search repos "sensor fusion automotive C++" --limit 50
gh search repos "computer vision deployment" --language cpp --limit 50
```

---

## 4 六、高级筛选技巧

### 4.1 按活跃度筛选
```
# 查看活跃项目
gh search repos "perception automotive" --sort updated-desc --limit 50

# 查看用户近期活动
gh api users/{username}/events/public
```

### 4.2 按地区筛选
- 查看 Bio 中的 location 信息
- 优先关注：Shanghai, Beijing, Shenzhen, Suzhou, Hangzhou
- 海外：Singapore, Silicon Valley, Munich

### 4.3 按语言筛选
- 优先中文用户（便于沟通）
- Bio/README 包含中文
- 提交信息中含中文

---

## 5 七、人才评估维度

### 5.1 代码质量评估

**查看指标：**
1. 代码结构：是否规范、模块化
2. 文档完整性：README、注释、文档
3. 测试覆盖：是否有单元测试、集成测试
4. 性能优化：是否有优化相关的提交

### 5.2 项目相关性

**评估要点：**
- 是否有感知算法相关项目
- 是否有系统集成经验
- 是否有车载/芯片平台经验
- 是否有工程化部署经验

### 5.3 技术深度

**考察内容：**
- 对底层系统理解（OS、驱动、中间件）
- 性能调优经验
- 跨平台适配经验
- 工程化思维

---

## 6 八、联系与沟通话术

### 6.1 初步沟通模板

```
Hi [姓名],

我注意到你在GitHub上关于 [项目名称] 的工作，特别是在 [具体技术领域，如感知算法/系统集成] 方面。

我们在上海正在招聘一位资深感知算法集成工程师（H5-H6），主要负责智能驾驶感知算法的系统集成。我看你的技术背景非常契合，包括Python/C++开发、感知算法部署和工程化经验。

如果感兴趣的话，我们可以进一步交流。期待你的回复！
```

### 6.2 深度技术交流问题

1. 您在感知算法集成方面的主要技术栈是什么？
2. 有过车载或芯片平台的部署经验吗？
3. 如何处理算法从原型到生产的工程化问题？
4. 在性能优化方面有什么心得？
5. 对多传感器融合有什么理解？

---

## 7 九、搜索记录追踪表

| 搜索日期 | 搜索关键词 | 结果数量 | 候选人数 | 备注 |
|----------|-----------|---------|---------|------|
| | | | | |
| | | | | |
| | | | | |

---

## 8 十、下一步行动计划

- [ ] 执行基础技术栈搜索
- [ ] 筛选目标公司贡献者
- [ ] 分析热门感知相关项目
- [ ] 建立候选人数据库
- [ ] 发送初步联系信息

---

## 9 附录：常用GitHub CLI命令

```bash
# 搜索仓库
gh search repos "keyword" --language python --limit 100

# 搜索用户
gh search users "autonomous driving" --location Shanghai --limit 50

# 查看用户信息
gh api users/{username}

# 查看用户仓库
gh repo list {username} --limit 50

# 导出搜索结果
gh search repos "perception automotive C++" --json name,owner,stars,url > results.json
```

---

*创建日期：2026-01-27*
*最后更新：2026-01-27*
