import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import { parseFrontMatter } from "./markdown.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..", "..");
const itemsDir = path.join(repoRoot, "data", "items");
const schemaPath = path.join(__dirname, "schema", "item.schema.json");

const loadSchema = async () => {
  const content = await readFile(schemaPath, "utf8");
  return JSON.parse(content);
};

const formatErrors = (errors = []) =>
  errors
    .map((error) => {
      const pointer = error.instancePath || "/";
      const message = error.message ?? "invalid";
      return `  - ${pointer}: ${message}`;
    })
    .join("\n");

const validateSourcesLimit = (frontMatter) => {
  const sources = frontMatter?.sources ?? [];
  if (!Array.isArray(sources)) {
    return "sources 必须是数组。";
  }
  if (sources.length > 3) {
    return `sources 数量超出上限（${sources.length}/3）。`;
  }
  return null;
};

const validateItems = async () => {
  const schema = await loadSchema();
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);

  let entries = [];
  try {
    entries = await readdir(itemsDir, { withFileTypes: true });
  } catch (error) {
    console.log("data/items 目录不存在，跳过校验。");
    return { ok: true, count: 0 };
  }

  const markdownFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(itemsDir, entry.name));

  if (markdownFiles.length === 0) {
    console.log("未发现 Markdown 更新项，跳过校验。");
    return { ok: true, count: 0 };
  }

  const failures = [];

  for (const filePath of markdownFiles) {
    const content = await readFile(filePath, "utf8");
    const { frontMatter } = parseFrontMatter(content);

    if (!frontMatter) {
      failures.push({
        filePath,
        message: "缺少 Front Matter。",
      });
      continue;
    }

    const valid = validate(frontMatter);
    if (!valid) {
      failures.push({
        filePath,
        message: "Schema 校验失败：\n" + formatErrors(validate.errors),
      });
      continue;
    }

    const sourcesError = validateSourcesLimit(frontMatter);
    if (sourcesError) {
      failures.push({
        filePath,
        message: sourcesError,
      });
    }
  }

  if (failures.length > 0) {
    console.error("发现校验错误：");
    for (const failure of failures) {
      console.error(`\n${path.relative(repoRoot, failure.filePath)}\n${failure.message}`);
    }
    return { ok: false, count: failures.length };
  }

  console.log(`校验通过：${markdownFiles.length} 条更新项。`);
  return { ok: true, count: markdownFiles.length };
};

const result = await validateItems();
if (!result.ok) {
  process.exit(1);
}
