# UE5 Tech Tracker

## 简介

UE5 Tech Tracker 是一个离线可打开的静态站点，面向技术美术与渲染工程师，提供从 UE5.0 起至最新版本的更新追踪。项目以“模块浏览”为核心路径，聚合来自 Epic 官方 Release Notes、GitHub（UnrealEngine 私有仓库）及社区资料的证据链，并提供源码文件路径、PR/Issue 引用与 AI 生成的摘要/风险提示，帮助快速理解变化与影响范围。

## 使用教程

### 0. 先准备好基础环境（新手必看）

> 下面步骤面向“程序小白”，按顺序做即可。

**需要的软件：**

1. **Git**：用于拉取代码。  
2. **Node.js 18+**（自带 npm）：用于运行前端与 pipeline。  

**如何检查是否安装成功：**

```bash
git --version
node -v
npm -v
```

如果能看到版本号，说明安装成功。  

---

### 1. 克隆项目并进入目录

```bash
git clone <你的仓库地址>
cd UE5-Tech-Tracker
```

---

### 2. 配置环境变量（非常重要）

项目需要一些密钥用于访问 UnrealEngine 私有仓库、AI 摘要和 Google CSE 搜索。**建议用 `.env` 文件管理**（新手最方便）。

在项目根目录创建 `.env` 文件：

```bash
touch .env
```

打开 `.env`，按下面格式填写（没有的可以先留空，但对应功能会不可用）：

```bash
UE_GITHUB_PAT=你的GitHubToken
GITHUB_TOKEN=可选的GitHubToken
OPENAI_API_KEY=你的OpenAIKey
DEEPSEEK_API_KEY=你的DeepSeekKey
GOOGLE_CSE_KEY=你的GoogleCSEKey
GOOGLE_CSE_CX=你的GoogleCSECX
```

**变量说明（逐条解释）：**

- `UE_GITHUB_PAT`  
  用途：读取 UnrealEngine 私有仓库（必须有权限才能访问）。  
  获取方式：  
  1) 登录 GitHub → Settings → Developer settings → Personal access tokens  
  2) 创建 **Fine-grained token** 或 **Classic token**  
  3) 确保有读取 `EpicGames/UnrealEngine` 私有仓库的权限（只读即可）  
  4) 把 token 填到 `.env`  

- `GITHUB_TOKEN`（可选）  
  用途：pipeline 读取 GitHub 私有仓库（如 `EpicGames/UnrealEngine`）的备用变量。  
  说明：若未设置 `GITHUB_TOKEN`，pipeline 会回退使用 `UE_GITHUB_PAT`。如缺少权限会触发 GitHub API 404。  

- `OPENAI_API_KEY` / `DEEPSEEK_API_KEY`  
  用途：AI 生成摘要、翻译等。如果你只用其中一家，可以只配一个。  
  获取方式：去 OpenAI / DeepSeek 官方控制台生成 API Key。  

- `GOOGLE_CSE_KEY` / `GOOGLE_CSE_CX`  
  用途：调用 Google CSE（自定义搜索引擎）获取社区资料。  
  获取方式：  
  1) Google Cloud 控制台创建项目并启用 **Custom Search API**  
  2) 获取 API Key → 填 `GOOGLE_CSE_KEY`  
  3) 在 Google CSE 创建一个搜索引擎 → 拿到 CX → 填 `GOOGLE_CSE_CX`

**提示：**

- `.env` 文件不要提交到仓库（建议加入 `.gitignore`）。  
- 不配 AI / Google 也可以跑通前端，但生成数据时会缺少对应能力。  

---

### 3. 本地开发预览（前端）

```bash
cd apps/web
npm install
npm run dev
```

浏览器打开 `http://localhost:4173/#/` 预览模块目录页面。

### 4. 生成数据与构建离线站点

前端离线数据依赖于 `data/` 与 `reports/` 目录，建议先运行 pipeline 生成日报与日志，再构建站点：

```bash
cd tools/pipeline
npm install
npm run run
```

> **注意：** `npm run run` 会读取 GitHub 私有仓库分支信息与文件树。如果遇到 `GitHub API 404`，通常是因为 `GITHUB_TOKEN`/`UE_GITHUB_PAT` 未配置或没有 `EpicGames/UnrealEngine` 的访问权限。  

随后生成前端可导入数据与构建产物：

```bash
cd apps/web
npm install
npm run build
```

构建完成后打开 `site/index.html` 即可在 `file://` 环境离线访问。  
> **说明：** 本项目的构建输出目录是根目录下的 `site/`（由 `apps/web/vite.config.ts` 的 `outDir` 配置决定），所以不会生成 `apps/web/dist/index.html`。

#### 4.1 生成数据与离线站点后如何使用（详细）

1. **生成数据（必须先做）**  
   `tools/pipeline` 会产出 `data/` 与 `reports/`，为前端提供可离线索引与日志：
   ```bash
   cd tools/pipeline
   npm install
   npm run run
   ```
2. **构建离线站点（把数据打包进前端）**  
   ```bash
   cd apps/web
   npm install
   npm run build
   ```
3. **离线打开**  
   直接用浏览器打开 `site/index.html` 即可离线访问，URL 类似：
   ```
   file:///你的路径/UE5-Tech-Tracker/site/index.html
   ```
4. **本地快速预览（非离线）**  
   如果只是临时查看结果，可用开发服务器：
   ```bash
   cd apps/web
   npm run dev
   ```
   浏览器访问 `http://localhost:4173/#/`。

#### 4.2 第一次构建后，以后每次还需要构建吗？

- **本地开发预览（`npm run dev`）**：  
  仅当你改了 `apps/web` 的源码或配置才需要重启；数据更新后会自动从本地 `apps/web/src/data` 读取，无需重新安装依赖。  
- **离线站点（`npm run build`）**：  
  只有在**数据或前端代码发生变化**时才需要重新构建。  
  - **数据变化**（例如 `tools/pipeline` 生成了新的 `data/` / `reports/`）→ 需要重新执行 `npm run build`，否则离线站点不会包含新数据。  
  - **前端代码变化**（UI/逻辑修改）→ 需要重新构建。  
  - **没有变化** → 不需要反复构建。

#### 4.3 自动化需要什么条件？

要让 GitHub Actions 定时/手动自动化工作流正常运行，需要满足以下条件：

1. **仓库权限与 Secrets 配置**  
   - `UE_GITHUB_PAT`：必须能读取 `EpicGames/UnrealEngine` 私有仓库（只读即可）。  
   - `OPENAI_API_KEY` / `DEEPSEEK_API_KEY`：用于 AI 摘要/翻译。  
   - `GOOGLE_CSE_KEY` / `GOOGLE_CSE_CX`：用于 Google CSE 搜索社区资料。  
2. **Actions 权限**  
   - Workflow 需要能写回仓库（依赖 `GITHUB_TOKEN` 权限）。  
3. **依赖环境**  
   - GitHub Actions Runner 需能安装 Node.js 18+ 依赖并访问外网 API。  
4. **触发方式**  
   - 定时触发（默认 UTC 0:00）或手动触发均可。  

### 5. GitHub Actions 自动化

仓库内置 `Pipeline` workflow，每日 UTC 0:00 执行一次，并支持手动触发。Secrets 需配置：

- `UE_GITHUB_PAT`：仅用于读取 UnrealEngine 私有仓库（只读权限）。
- `OPENAI_API_KEY` / `DEEPSEEK_API_KEY`：AI 生成与翻译。
- `GOOGLE_CSE_KEY` / `GOOGLE_CSE_CX`：Google CSE 检索配额。

构建完成后会自动提交更新内容（使用 `GITHUB_TOKEN` 写入）。

## 项目架构

### 目录结构

- `apps/web/`：前端 SPA（React + Vite + MUI + Zustand）
- `tools/pipeline/`：抓取与构建脚本（Node/Python）
- `data/items/`：更新项 Markdown 源数据
- `data/meta/`：版本元数据
- `config/`：模块映射、标签同义词、抓取策略配置
- `assets/thumbs/`：缩略图缓存
- `reports/daily/`：每日更新报告
- `reports/logs/`：构建日志
- `state/`：增量游标与运行状态

### 数据与流水线

- **数据源**：Release Notes/What’s New、UnrealEngine GitHub（commit/PR/Issue）、社区与第三方资料（Google CSE）。  
- **构建期处理**：增量抓取、证据抽取（≤300 词）、近重复合并、模块映射、P1 重要性打分、缩略图缓存。  
- **落盘格式**：`data/items/<item_id>.md`（Front Matter + Evidence/GitHub/AI 正文），同时生成索引与模块分块。  
- **前端交付**：构建期将数据打包为可 import 的 JS 模块，确保 `file://` 离线可用。  

### 常用脚本

- `tools/pipeline/src/run.mjs`：流水线主入口（不会因单步失败而中断）。
- `tools/pipeline/src/daily-report.mjs`：生成日报（输出到 `reports/daily/`）。
- `apps/web/scripts/generate-data.mjs`：生成前端离线数据模块（`apps/web/src/data`）。

### 配置说明

- `config/module_mapping.yaml`：`module_code → module_system` 映射规则（最长匹配）。
- `config/tag_synonyms.yaml`：标签归一化表。
- `config/scoring.yaml`：P1 重要性打分规则（影响列表排序与日报 Top10）。

## 详细功能

### 1. 模块浏览（黄金路径）

- 模块目录 → 模块页 → 详情页的完整路径。  
- 模块页默认展示最新大版本 `x.y` 的前 20 条更新项，并支持无限滚动与模块内搜索（标题/摘要/标签）。  
- 排序默认按版本倒序，同版本内按 P1 重要性排序。  

### 2. 更新项详情（Evidence First）

- 详情页以证据为先：来源卡片（中英对照）、GitHub 引用、AI 解读区。  
- 来源卡片展示 ≤300 词摘录，包含中文翻译并标注 AI 翻译。  
- GitHub 引用支持 commit/PR/Issue，并展示文件路径列表（默认 30 条，超出提示）。  

### 3. 全局搜索

- FlexSearch 离线索引，支持标题/摘要/标签/模块/版本等字段检索。  
- 搜索结果卡片提供命中高亮片段，并以 P1 重要性为主排序。  

### 4. 收藏

- 使用 `localStorage` 存储收藏，详情页可收藏/取消收藏。  
- 收藏页按收藏时间倒序展示。  

### 5. 日报与日志

- 每日生成日报（按模块分组、每模块最多 10 条）。  
- 构建日志页记录每次构建摘要与错误样例，首页显示最近一次构建状态与“数据可能不完整”提示。  

### 6. 自动化与可追溯

- GitHub Actions 定时抓取与构建，允许部分失败也发布。  
- 支持增量抓取（回溯窗口 + 上限），并记录缺失/截断状态。  

## 架构草图（V1）

```
数据源（Release Notes / GitHub / Web 搜索）
          ↓
   数据处理与清洗（pipeline）
          ↓
Markdown 源数据（data/items）
          ↓
 构建索引与静态站点（apps/web）
          ↓
    离线浏览（file://）
```
