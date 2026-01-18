---
id: "nanite-streaming"
title: "Nanite streaming budget improvements"
version: "5.4"
published_at: "2024-04-28"
module_system:
  - "nanite"
module_code:
  - "Renderer/Nanite"
change_type: "feature"
tags:
  - "Nanite"
  - "LOD"
sources:
  - title: "Unreal Engine 5.4 Release Notes - Nanite"
    url: "https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-5-4-release-notes"
    credibility: "high"
    excerpt_en: "Added streaming budget diagnostics for Nanite to help balance memory residency."
    excerpt_zh: "【AI 翻译】为 Nanite 添加了流式预算诊断，帮助平衡内存驻留。"
    translation_note: "AI 翻译"
  - title: "Nanite Streaming Tips"
    url: "https://example.com/nanite-streaming"
    credibility: "low"
    excerpt_en: "New tooling makes it easier to identify over-budget clusters in large scenes."
    excerpt_zh: "【AI 翻译】新工具更容易定位大型场景中的超预算集群。"
    translation_note: "AI 翻译"
github_refs:
  - type: "commit"
    id: "fed456cba"
    url: "https://github.com/EpicGames/UnrealEngine/commit/fed456cba"
  - type: "issue"
    id: "9876"
    url: "https://github.com/EpicGames/UnrealEngine/issues/9876"
    title: "Expose Nanite streaming budget metrics"
ai:
  generated_fields:
    - "benefits"
    - "risks"
    - "sources.excerpt_zh"
  model: "gpt-4.1"
  generated_at: "2024-05-01T10:00:00Z"
benefits:
  summary: "【AI 生成】提供 Nanite 预算诊断以提升资源调优效率。"
  performance: "【AI 生成】帮助减少 Nanite 过度驻留。"
  quality: "【AI 生成】更稳定的几何流式管理。"
  workflow: "【AI 生成】更快定位流式瓶颈。"
risks:
  - "【AI 推断】需要更新内部性能监控流程。"
---

## Evidence

### Sources

- 【AI 翻译】为 Nanite 添加了流式预算诊断，帮助平衡内存驻留。
  - Added streaming budget diagnostics for Nanite to help balance memory residency.

## GitHub References

- Commit: https://github.com/EpicGames/UnrealEngine/commit/fed456cba
- Files:
  - Engine/Source/Runtime/Renderer/Private/Nanite/NaniteStreamingManager.cpp
  - Engine/Source/Runtime/Renderer/Private/Nanite/NaniteBudget.cpp

## AI Insights

### Benefits

- 性能：减少 Nanite 过度驻留。
- 质量：更稳定的几何流式管理。
- 工作流：更快定位流式瓶颈。

### Risks

- 需要更新内部性能监控流程。
