# UE5 Tech Tracker

UE5 Tech Tracker 是一个离线可打开的静态站点，用于按模块浏览 UE5 版本更新、证据链与代码定位信息。

## 目录结构

- `apps/web/`：前端 SPA（React + Vite + MUI + Zustand）
- `tools/pipeline/`：抓取与构建脚本（Node/Python）
- `data/items/`：更新项 Markdown 源数据
- `data/meta/`：版本元数据
- `config/`：模块映射、标签同义词、抓取策略配置
- `assets/thumbs/`：缩略图缓存
- `reports/daily/`：每日更新报告
- `reports/logs/`：构建日志
- `state/`：增量游标与运行状态

## 本地开发

```bash
cd apps/web
npm install
npm run dev
```

浏览器打开 `http://localhost:4173/#/` 预览模块目录页面。

## 构建与数据生成

前端离线数据依赖于 `data/` 与 `reports/` 目录，建议先运行 pipeline 生成日报与日志，再构建站点：

```bash
cd tools/pipeline
npm install
npm run run
```

随后生成前端可导入数据与构建产物：

```bash
cd apps/web
npm install
npm run build
```

### 常用脚本

- `tools/pipeline/src/run.mjs`：流水线主入口（不会因单步失败而中断）。
- `tools/pipeline/src/daily-report.mjs`：生成日报（输出到 `reports/daily/`）。
- `apps/web/scripts/generate-data.mjs`：生成前端离线数据模块（`apps/web/src/data`）。

## 配置说明

- `config/module_mapping.yaml`：`module_code → module_system` 映射规则（最长匹配）。
- `config/tag_synonyms.yaml`：标签归一化表。
- `config/scoring.yaml`：P1 重要性打分规则（影响列表排序与日报 Top10）。

## GitHub Actions（自动化）

仓库内置 `Pipeline` workflow，每日 UTC 0:00 执行一次，并支持手动触发。Secrets 需配置：

- `UE_GITHUB_PAT`：仅用于读取 UnrealEngine 私有仓库（只读权限）。
- `OPENAI_API_KEY` / `DEEPSEEK_API_KEY`：AI 生成与翻译。
- `GOOGLE_CSE_KEY` / `GOOGLE_CSE_CX`：Google CSE 检索配额。

构建完成后会自动提交更新内容（使用 `GITHUB_TOKEN` 写入）。

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
