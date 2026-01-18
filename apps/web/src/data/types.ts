export interface SourceRef {
  title: string;
  url: string;
  credibility: "high" | "low";
  excerpt_en: string;
  excerpt_zh: string;
  translation_note: string;
}

export interface GitHubRef {
  type: "commit" | "pr" | "issue" | "tag" | "release" | "discussion";
  id: string;
  url: string;
  repo?: string;
  title?: string;
}

export interface AIInfo {
  generated_fields: string[];
  model: string;
  generated_at: string;
  notes?: string;
}

export interface Benefits {
  summary: string;
  performance: string;
  quality: string;
  workflow: string;
}

export interface ModuleItem {
  id: string;
  title: string;
  title_zh?: string;
  title_en?: string;
  version: string;
  published_at: string;
  module_system: string[];
  module_code: string[];
  change_type: string;
  tags: string[];
  sources: SourceRef[];
  github_refs: GitHubRef[];
  thumbs: string[];
  ai: AIInfo;
  benefits: Benefits;
  risks: string[];
  file_paths: string[];
  credibility: "high" | "low";
}
