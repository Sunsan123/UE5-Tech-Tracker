import YAML from "yaml";

const FRONT_MATTER_ORDER = [
  "id",
  "title",
  "version",
  "published_at",
  "module_system",
  "module_code",
  "change_type",
  "tags",
  "sources",
  "github_refs",
  "thumbs",
  "ai",
  "benefits",
  "risks",
];

const DEFAULT_BODY = `## Evidence\n\n### Sources\n\n- （上中文下英文）\n\n## GitHub References\n\n- Commit/PR/Issue links\n\n## AI Insights\n\n### Benefits\n\n- 性能：\n- 质量：\n- 工作流：\n\n### Risks\n\n- 待补充\n`;

export const parseFrontMatter = (markdown) => {
  if (!markdown.startsWith("---")) {
    return { frontMatter: null, body: markdown };
  }

  const parts = markdown.split("---");
  if (parts.length < 3) {
    return { frontMatter: null, body: markdown };
  }

  const frontMatterRaw = parts[1];
  const body = parts.slice(2).join("---").replace(/^\n/, "");
  const frontMatter = YAML.parse(frontMatterRaw) ?? {};
  return { frontMatter, body };
};

export const orderFrontMatter = (frontMatter) => {
  const ordered = {};
  for (const key of FRONT_MATTER_ORDER) {
    if (Object.prototype.hasOwnProperty.call(frontMatter, key)) {
      ordered[key] = frontMatter[key];
    }
  }
  for (const [key, value] of Object.entries(frontMatter)) {
    if (!Object.prototype.hasOwnProperty.call(ordered, key)) {
      ordered[key] = value;
    }
  }
  return ordered;
};

export const stringifyFrontMatter = (frontMatter) => {
  const ordered = orderFrontMatter(frontMatter);
  return YAML.stringify(ordered, {
    indent: 2,
    lineWidth: 0,
  }).trimEnd();
};

export const buildDefaultBody = () => DEFAULT_BODY;

export const renderItemMarkdown = (frontMatter, body = DEFAULT_BODY) => {
  const serialized = stringifyFrontMatter(frontMatter);
  return `---\n${serialized}\n---\n\n${body.trim()}\n`;
};
