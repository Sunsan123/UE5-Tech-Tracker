import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { executeCseQuery } from "./cse-client.mjs";
import { mergeNearDuplicates, buildExcerptFromHtml } from "./dedupe-sources.mjs";
import { loadEnv } from "./env.mjs";
import { fetchHtml } from "./excerpt.mjs";
import { loadPipelineConfig, resolvePipelineConfigPath } from "./github-commits.mjs";
import { parseFrontMatter, renderItemMarkdown } from "./markdown.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..", "..");
const itemsDir = path.join(repoRoot, "data", "items");

const resolveCseEnv = () => ({
  apiKey: process.env.GOOGLE_CSE_API_KEY ?? process.env.CSE_API_KEY ?? "",
  cx: process.env.GOOGLE_CSE_CX ?? process.env.CSE_CX ?? "",
});

const buildSource = ({ title, url, excerptEn }) => ({
  title: title || "Untitled",
  url,
  credibility: "low",
  excerpt_en: excerptEn,
  excerpt_zh: "待翻译",
  translation_note: "auto:pending",
});

const loadItems = async () => {
  const entries = await readdir(itemsDir, { withFileTypes: true });
  const items = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) {
      continue;
    }
    const filePath = path.join(itemsDir, entry.name);
    const raw = await readFile(filePath, "utf8");
    const { frontMatter, body } = parseFrontMatter(raw);
    if (!frontMatter?.title) {
      continue;
    }
    items.push({
      filePath,
      frontMatter,
      body,
    });
  }
  return items;
};

const updateItemSources = async ({
  item,
  pipelineConfig,
  apiKey,
  cx,
  budget,
}) => {
  const searchConfig = pipelineConfig?.search ?? {};
  const limits = pipelineConfig?.limits ?? {};
  const dedupe = pipelineConfig?.dedupe ?? {};
  const maxSources = limits.max_sources ?? 3;
  const maxWords = limits.max_excerpt_words ?? 300;
  const maxParagraphs = dedupe.max_paragraphs ?? 3;
  const threshold = dedupe.tfidf_similarity ?? 0.92;
  const resultsPerPage = searchConfig.results_per_page ?? 10;
  const pagesPerKeyword = searchConfig.pages_per_keyword ?? 2;

  const existingSources = Array.isArray(item.frontMatter.sources)
    ? item.frontMatter.sources
    : [];
  if (existingSources.length >= maxSources) {
    return false;
  }

  const keyword = item.frontMatter.title;
  const newSources = [];

  for (let page = 0; page < pagesPerKeyword; page += 1) {
    if (budget.remaining <= 0 || existingSources.length + newSources.length >= maxSources) {
      break;
    }
    const start = page * resultsPerPage + 1;
    let data;
    try {
      data = await executeCseQuery({ query: keyword, apiKey, cx, start, num: resultsPerPage });
      budget.remaining -= 1;
      budget.calls += 1;
    } catch (error) {
      console.warn(`CSE query failed for "${keyword}":`, error);
      continue;
    }

    const results = Array.isArray(data?.items) ? data.items : [];
    for (const result of results) {
      if (existingSources.length + newSources.length >= maxSources) {
        break;
      }
      const link = result?.link;
      if (!link) {
        continue;
      }
      try {
        const html = await fetchHtml(link);
        const excerptEn = buildExcerptFromHtml({
          html,
          query: keyword,
          maxParagraphs,
          maxWords,
        });
        if (!excerptEn) {
          continue;
        }
        newSources.push(buildSource({ title: result?.title, url: link, excerptEn }));
      } catch (error) {
        console.warn(`Failed to build excerpt for ${link}:`, error);
      }
    }
  }

  if (newSources.length === 0) {
    return false;
  }

  const merged = mergeNearDuplicates({
    sources: [...existingSources, ...newSources],
    threshold,
  }).slice(0, maxSources);

  item.frontMatter.sources = merged;
  const markdown = renderItemMarkdown(item.frontMatter, item.body);
  await writeFile(item.filePath, markdown, "utf8");
  return true;
};

const main = async () => {
  await loadEnv();
  const { apiKey, cx } = resolveCseEnv();
  if (!apiKey || !cx) {
    console.warn("Missing GOOGLE_CSE_API_KEY / GOOGLE_CSE_CX, skipping web search.");
    return;
  }

  const pipelineConfig = await loadPipelineConfig(resolvePipelineConfigPath());
  const searchConfig = pipelineConfig?.search ?? {};
  const budget = {
    remaining: searchConfig.keywords_per_day ?? 150,
    calls: 0,
  };

  const items = await loadItems();
  let updated = 0;

  for (const item of items) {
    if (budget.remaining <= 0) {
      break;
    }
    const didUpdate = await updateItemSources({
      item,
      pipelineConfig,
      apiKey,
      cx,
      budget,
    });
    if (didUpdate) {
      updated += 1;
    }
  }

  console.log(`Web search complete. updated_items=${updated} calls=${budget.calls}`);
};

await main();
