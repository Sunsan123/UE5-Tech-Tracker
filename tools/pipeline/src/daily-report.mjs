import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import { parseFrontMatter } from "./markdown.mjs";

const repoRoot = path.resolve(process.cwd(), "..", "..");
const itemsDir = path.join(repoRoot, "data", "items");
const configDir = path.join(repoRoot, "config");
const reportsDir = path.join(repoRoot, "reports", "daily");

const readYaml = async (fileName) => {
  const content = await readFile(path.join(configDir, fileName), "utf8");
  return YAML.parse(content);
};

const buildScore = (item, scoringConfig) => {
  const reasons = [];
  let score = 0;

  const changeWeight = scoringConfig?.change_type?.[item.change_type] ?? 1;
  score += changeWeight;
  reasons.push(`change_type:${item.change_type}+${changeWeight}`);

  const highSources = (item.sources ?? []).filter(
    (source) => source.credibility === "high",
  ).length;
  if (highSources > 0) {
    const highWeight = (scoringConfig?.high_source ?? 0) * highSources;
    score += highWeight;
    reasons.push(`high_sources:${highSources}+${highWeight}`);
  }

  const sourceWeight = (scoringConfig?.source_count ?? 0) * (item.sources ?? []).length;
  if (sourceWeight) {
    score += sourceWeight;
    reasons.push(`sources:${item.sources?.length ?? 0}+${sourceWeight}`);
  }

  if (item.has_conflict) {
    score += scoringConfig?.conflict ?? 0;
    reasons.push(`conflict+${scoringConfig?.conflict ?? 0}`);
  }

  return { score, reasons };
};

const loadItems = async () => {
  const entries = await readdir(itemsDir, { withFileTypes: true });
  const items = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) {
      continue;
    }
    const raw = await readFile(path.join(itemsDir, entry.name), "utf8");
    const { frontMatter } = parseFrontMatter(raw);
    if (!frontMatter) {
      continue;
    }
    items.push(frontMatter);
  }

  return items;
};

const resolveReportDate = (argDate) => {
  if (argDate) {
    return argDate;
  }
  return new Date().toISOString().slice(0, 10);
};

const pickItemDate = (item) => item.published_at ?? item.ai?.generated_at?.slice(0, 10);

const groupByModule = (items) => {
  const grouped = new Map();
  for (const item of items) {
    const modules = Array.isArray(item.module_system)
      ? item.module_system
      : [item.module_system ?? "unknown"];
    for (const moduleId of modules) {
      if (!grouped.has(moduleId)) {
        grouped.set(moduleId, []);
      }
      grouped.get(moduleId).push(item);
    }
  }
  return grouped;
};

const renderMarkdown = (date, groups) => {
  const lines = [`# 日报 ${date}`, "", "按模块分组（每模块最多 10 条）：", ""];

  for (const [moduleId, items] of groups) {
    lines.push(`## ${moduleId}`);
    for (const item of items) {
      lines.push(`- ${item.title} (${item.version})`);
    }
    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
};

const writeReport = async (date, groups, itemsForJson) => {
  await mkdir(reportsDir, { recursive: true });

  const markdown = renderMarkdown(date, groups);
  await writeFile(path.join(reportsDir, `${date}.md`), markdown, "utf8");

  const payload = {
    date,
    modules: itemsForJson,
  };
  await writeFile(
    path.join(reportsDir, "index.json"),
    JSON.stringify(payload, null, 2),
    "utf8",
  );
};

const main = async () => {
  const date = resolveReportDate(process.argv[2]);
  const scoringConfig = await readYaml("scoring.yaml");
  const items = await loadItems();
  const todaysItems = items.filter((item) => pickItemDate(item) === date);

  const scored = todaysItems.map((item) => {
    const { score } = buildScore(item, scoringConfig?.scoring ?? {});
    return { ...item, p1_score: score };
  });

  const grouped = groupByModule(scored);
  const modules = [];

  const sortedGroups = [...grouped.entries()].map(([moduleId, moduleItems]) => {
    const sorted = [...moduleItems].sort((a, b) => b.p1_score - a.p1_score).slice(0, 10);
    modules.push({
      id: moduleId,
      items: sorted.map((item) => ({
        id: item.id,
        title: item.title,
        version: item.version,
        published_at: item.published_at,
        p1_score: item.p1_score,
      })),
    });
    return [moduleId, sorted];
  });

  await writeReport(date, sortedGroups, modules);
  console.log(`Daily report generated for ${date}.`);
};

await main();
