import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

const CONFIG_PATH = path.resolve(process.cwd(), "..", "..", "config", "pipeline.yaml");

const loadPipelineConfig = async () => {
  const raw = await fs.readFile(CONFIG_PATH, "utf8");
  return YAML.parse(raw) ?? {};
};

const buildCseUrl = ({ query, apiKey, cx, start = 1, num = 10 }) => {
  const params = new URLSearchParams({
    key: apiKey,
    cx,
    q: query,
    start: String(start),
    num: String(num)
  });
  return `https://www.googleapis.com/customsearch/v1?${params.toString()}`;
};

export const executeCseQuery = async ({ query, apiKey, cx, start = 1, num = 10 }) => {
  if (!apiKey || !cx) {
    throw new Error("Missing Google CSE apiKey or cx.");
  }
  const response = await fetch(buildCseUrl({ query, apiKey, cx, start, num }));
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`CSE API ${response.status}: ${body}`);
  }
  return response.json();
};

export const runCseQueriesWithBudget = async ({ keywords, apiKey, cx }) => {
  const config = await loadPipelineConfig();
  const { keywords_per_day, pages_per_keyword, results_per_page } =
    config.search ?? {};

  const budget = {
    remaining: keywords_per_day ?? 150,
    calls: 0
  };

  const results = [];

  for (const keyword of keywords) {
    if (budget.remaining <= 0) {
      break;
    }

    for (let page = 0; page < (pages_per_keyword ?? 2); page += 1) {
      if (budget.remaining <= 0) {
        break;
      }

      const start = page * (results_per_page ?? 10) + 1;
      const data = await executeCseQuery({
        query: keyword,
        apiKey,
        cx,
        start,
        num: results_per_page ?? 10
      });
      results.push({ keyword, data });
      budget.remaining -= 1;
      budget.calls += 1;
    }
  }

  return { results, budget };
};
