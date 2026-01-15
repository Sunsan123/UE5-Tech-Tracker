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
