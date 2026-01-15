# UE5 Tech Tracker（V1）实施计划与依赖关系（基于 PRD）

> 说明：这是一个无孤立任务的 WBS（Work Breakdown Structure），从“能离线打开的前端骨架”开始，逐步引入数据模型、抓取、索引、AI、站点生成、Actions 自动化与验收。  
> 任务编号：`M1` 为里程碑级任务，子任务：`M1.1`、`M1.1.1`。  
> 每个任务都包含 Deps（依赖的任务编号），且整个任务图是连通的。

---

## M1 仓库与工程基础（可运行的最小骨架）
**Deps:** 无

- [x] **M1.1 建立仓库与目录结构**  
  **Deps:** 无  
  背景：为前端、抓取管线、数据与产物提供稳定路径约定，减少后期迁移成本。  
  - [x] **M1.1.1 创建私有仓库与默认分支**（`main`）  
    **Deps:** 无  
  - [x] **M1.1.2 初始化目录骨架**  
    **Deps:** M1.1.1  
    建议结构：  
    - `apps/web/` 前端 SPA  
    - `tools/pipeline/` 抓取/构建脚本（Node/Python）  
    - `data/items/` Markdown 源数据（每条更新项一个文件）  
    - `data/meta/` 版本元数据等  
    - `config/` 配置（module/tag/策略）  
    - `assets/thumbs/` 缩略图  
    - `reports/daily/` 日报  
    - `reports/logs/` 构建日志  
    - `state/` 增量游标与运行状态（仅仓库可见）  
  - [x] **M1.1.3 添加基础文档与运行说明**（README + 架构草图）  
    **Deps:** M1.1.2  

- [x] **M1.2 工具链与规范**  
  **Deps:** M1.1  
  背景：统一格式化/校验，保证多人协作与 Actions 自动化稳定。  
  - [x] **M1.2.1 前端 lint/format**（ESLint + Prettier + EditorConfig）  
    **Deps:** M1.1.2  
  - [x] **M1.2.2 Node/Python 代码质量工具**（可选：eslint/ruff）  
    **Deps:** M1.1.2  
  - [x] **M1.2.3 提交规范**（可选：commitlint）与 CI 基础检查  
    **Deps:** M1.2.1  

---

## M2 前端离线骨架（file:// 可打开 + 页面框架）
**Deps:** M1

- [x] **M2.1 初始化前端工程（React + Vite + TS）**  
  **Deps:** M1.1.2  
  背景：PRD 要求离线双击打开，需 SPA + hash 路由。  
  - [x] **M2.1.1 创建 Vite React TS 项目**（`apps/web`）  
    **Deps:** M1.1.2  
  - [x] **M2.1.2 安装依赖**：MUI、Zustand、FlexSearch、路由（HashRouter）  
    **Deps:** M2.1.1  
  - [x] **M2.1.3 配置基础构建输出目录**（如 `site/` 或 `dist/`）  
    **Deps:** M2.1.1  

- [x] **M2.2 路由与页面骨架（无数据也能跑通）**  
  **Deps:** M2.1  
  背景：先把信息架构落地为可访问页面，后续逐步替换为真实数据。  
  - [x] **M2.2.1 定义 hash 路由**：`#/`、`#/module/:ms`、`#/item/:id`、`#/search`、`#/favorites`、`#/daily`、`#/logs`  
    **Deps:** M2.1.2  
  - [x] **M2.2.2 布局组件**：顶栏导航 + 内容区（响应式）  
    **Deps:** M2.2.1  
  - [x] **M2.2.3 页面占位 UI**（模块目录/模块页/详情/搜索/收藏/日报/日志）  
    **Deps:** M2.2.2  

- [x] **M2.3 语言显示开关（全站记忆）**  
  **Deps:** M2.2  
  背景：PRD 规定中英同屏（上中下英）且可切换，需全站状态持久化。  
  - [x] **M2.3.1 Zustand store：languageMode（zh/en/both）**  
    **Deps:** M2.2.2  
  - [x] **M2.3.2 localStorage 持久化与默认值（both）**  
    **Deps:** M2.3.1  
  - [x] **M2.3.3 UI 控件：顶栏语言切换**（影响所有页面文本渲染）  
    **Deps:** M2.3.2  

- [x] **M2.4 关键交互骨架（模块页）**  
  **Deps:** M2.2  
  背景：黄金路径是模块浏览，先把交互容器搭好（20 条 + 无限滚动 + 模块内搜索）。  
  - [x] **M2.4.1 模块页：模块内搜索框组件**（仅作用于模块页）  
    **Deps:** M2.2.3  
  - [x] **M2.4.2 模块页：列表卡片组件（移动端适配）**  
    **Deps:** M2.4.1  
  - [x] **M2.4.3 无限滚动容器**（IntersectionObserver + “加载中”占位）  
    **Deps:** M2.4.2  

---

## M3 配置体系（module/tag/抓取策略）与可扩展点
**Deps:** M1, M2

- [ ] **M3.1 配置文件结构定义**  
  **Deps:** M1.1.2  
  背景：PRD 要求你可扩展模块目录与同义词表，且 pipeline 规则可调整。  
  - [ ] **M3.1.1 定义 `config/module_mapping.yaml`**（最长匹配优先规则）  
    **Deps:** M1.1.2  
  - [ ] **M3.1.2 定义 `config/tag_synonyms.yaml`**（归一化到缩写）  
    **Deps:** M1.1.2  
  - [ ] **M3.1.3 定义 `config/pipeline.yaml`**（上限/阈值/配额/关键词权重模块列表）  
    **Deps:** M1.1.2  

- [ ] **M3.2 前端读取配置（用于 UI 展示与枚举）**  
  **Deps:** M3.1, M2.2  
  背景：模块目录页需要模块清单；前端应能显示 module_system 目录（可由 config 驱动）。  
  - [ ] **M3.2.1 构建期将 YAML 转成可 import 的 TS/JS 模块**（避免 file:// fetch）  
    **Deps:** M3.1.1  
  - [ ] **M3.2.2 模块目录页用配置渲染模块列表**（支持后续新增）  
    **Deps:** M3.2.1, M2.2.3  

---

## M4 数据模型（Markdown per item）+ 校验 + 稳定 ID
**Deps:** M1, M3

- [ ] **M4.1 定义 Front Matter Schema（必填字段 + 类型）**  
  **Deps:** M3.1  
  背景：源数据是 Markdown，每条更新项必须可校验、可追溯、可重建。  
  - [ ] **M4.1.1 列出字段与枚举**（change_type、可信度 high/low、ai 标注结构等）  
    **Deps:** M3.1.3  
  - [ ] **M4.1.2 编写 schema（JSON Schema 或自定义校验逻辑）**  
    **Deps:** M4.1.1  

- [ ] **M4.2 Markdown 读写库与模板**  
  **Deps:** M4.1  
  背景：要稳定写回（利于 git diff），并固定正文结构（Evidence first）。  
  - [ ] **M4.2.1 选型并封装 front-matter 解析与序列化**  
    **Deps:** M4.1.2  
  - [ ] **M4.2.2 定义正文模板**：Evidence（中英）→ GitHub → AI  
    **Deps:** M4.2.1  
  - [ ] **M4.2.3 写入格式稳定性**（字段排序、缩进、换行风格）  
    **Deps:** M4.2.2  

- [ ] **M4.3 稳定 ID 生成器（内容哈希，不含 title）**  
  **Deps:** M4.1  
  背景：ID 用于去重/关联缩略图/索引 key；输入为 version + 主URL列表 + github_refs。  
  - [ ] **M4.3.1 定义 URL 规范化规则**（去 fragment、统一 scheme、去追踪参数等）  
    **Deps:** M4.1.2  
  - [ ] **M4.3.2 实现 hash 计算**（sha256，取前 N 位）  
    **Deps:** M4.3.1  
  - [ ] **M4.3.3 实现“主 URL 选择”接口**（按可信度权重最高）  
    **Deps:** M4.3.1  

- [ ] **M4.4 数据校验 CLI**  
  **Deps:** M4.2, M4.3  
  背景：Actions 构建前后都要能验证 `data/items` 的一致性。  
  - [ ] **M4.4.1 `validate-items`：遍历并校验 schema**  
    **Deps:** M4.1.2  
  - [ ] **M4.4.2 校验 sources 上限（<=3）与 github_refs 不计入 sources**  
    **Deps:** M4.4.1  
  - [ ] **M4.4.3 校验缺失字段的错误输出（可读日志）**  
    **Deps:** M4.4.2  

---

## 依赖关系摘要（无孤立任务）
- 基础：M1 → M2/M3/M4  
- 数据能力主干：M3+M4 → M5 → M6 → M7  
- 版本元数据：M3+M4 → M8 → M14  
- 社区补充：M3+M4 → M9 → M10  
- AI：M4+M6+M9 → M11  
- 打分与索引：M6/M7/M8 + M11 → M12 → M13  
- 前端闭环：M2 + M13 + M8 + M12 → M14 → M15/M16  
- 日报与日志：M12+M14 → M17；各 pipeline → M18  
- 自动化：M6..M18 + M14..M16 → M19 → M20 → M21
