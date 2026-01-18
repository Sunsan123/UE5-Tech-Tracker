import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import {
  findModuleCodesForPaths,
  loadModuleMappingConfig,
  mapModuleCodesToSystems,
} from "./module-map.mjs";
import { computeItemId } from "./id.mjs";
import { buildDefaultBody, renderItemMarkdown } from "./markdown.mjs";

const DEFAULT_OWNER = "EpicGames";
const DEFAULT_REPO = "UnrealEngine";
const DEFAULT_BRANCH = "ue5-main";
const DEFAULT_VERSION = "unknown";
const DEFAULT_AI_MODEL = "tbd";
const DEFAULT_NOTE = "待补充";

const normalizePath = (value) => path.posix.normalize(value).replace(/\\/g, "/");

const fetchJson = async (url, token) => {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API ${response.status}: ${body}`);
  }

  return response.json();
};

export const resolveModuleMapPath = (baseDir = process.cwd()) =>
  path.resolve(baseDir, "..", "..", "data", "meta", "module_map.json");

export const resolveModuleMappingPath = (baseDir = process.cwd()) =>
  path.resolve(baseDir, "..", "..", "config", "module_mapping.yaml");

export const resolveItemsDir = (baseDir = process.cwd()) =>
  path.resolve(baseDir, "..", "..", "data", "items");

export const resolveValidateItemsPath = (baseDir = process.cwd()) =>
  path.resolve(baseDir, "src", "validate-items.mjs");

export const loadModuleMap = async (filePath) => {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT") {
      return { modules: [] };
    }
    throw error;
  }
};

export const fetchCommitDetails = async ({
  owner = DEFAULT_OWNER,
  repo = DEFAULT_REPO,
  token,
  sha,
} = {}) => {
  if (!sha) {
    throw new Error("Commit SHA is required.");
  }
  return fetchJson(`https://api.github.com/repos/${owner}/${repo}/commits/${sha}`, token);
};

export const extractCommitMetadata = (commit) => {
  const message = commit?.commit?.message ?? "";
  const [titleLine] = message.split("\n");
  return {
    sha: commit?.sha ?? "",
    title: titleLine || "Untitled commit",
    message,
    date: commit?.commit?.author?.date ?? null,
    author: commit?.commit?.author?.name ?? null,
  };
};

export const extractFilePaths = (commit, maxFiles = 30) => {
  const files = Array.isArray(commit?.files) ? commit.files : [];
  const normalized = files
    .map((file) => normalizePath(file?.filename ?? ""))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
  const limited = normalized.slice(0, maxFiles);
  return {
    files: limited,
    total: normalized.length,
    truncated: normalized.length > maxFiles,
  };
};

export const deriveChangeType = (message) => {
  const lower = message.toLowerCase();
  if (lower.startsWith("fix") || lower.includes("bug")) {
    return "fix";
  }
  if (lower.startsWith("perf") || lower.includes("optimiz")) {
    return "perf";
  }
  if (lower.startsWith("refactor")) {
    return "refactor";
  }
  if (lower.startsWith("docs") || lower.includes("documentation")) {
    return "docs";
  }
  if (lower.startsWith("deprecate")) {
    return "deprecation";
  }
  if (lower.startsWith("break") || lower.includes("breaking")) {
    return "breaking";
  }
  return "feature";
};

export const buildGithubRefs = ({ owner, repo, sha }) => [
  {
    type: "commit",
    id: sha,
    url: `https://github.com/${owner}/${repo}/commit/${sha}`,
    repo: `${owner}/${repo}`,
  },
];

const buildPlaceholders = () => ({
  ai: {
    generated_fields: [],
    model: DEFAULT_AI_MODEL,
    generated_at: new Date().toISOString(),
    notes: DEFAULT_NOTE,
  },
  benefits: {
    summary: DEFAULT_NOTE,
    performance: DEFAULT_NOTE,
    quality: DEFAULT_NOTE,
    workflow: DEFAULT_NOTE,
  },
  risks: [],
});

export const buildItemFrontMatter = ({
  metadata,
  moduleCodes,
  moduleSystems,
  changeType,
  githubRefs,
  version = DEFAULT_VERSION,
}) => {
  const placeholders = buildPlaceholders();
  const frontMatter = {
    id: "",
    title: metadata.title,
    version,
    module_system: moduleSystems.length > 0 ? moduleSystems : ["unknown"],
    module_code: moduleCodes.length > 0 ? moduleCodes : ["Unknown"],
    change_type: changeType,
    tags: [],
    sources: [],
    github_refs: githubRefs,
    ai: placeholders.ai,
    benefits: placeholders.benefits,
    risks: placeholders.risks,
  };
  frontMatter.id = computeItemId(frontMatter);
  return frontMatter;
};

export const buildItemBody = ({
  githubRefs,
  filesInfo,
  metadata,
} = {}) => {
  const lines = [];
  lines.push("## Evidence", "", "### Sources", "", "- （上中文下英文）", "");
  lines.push("## GitHub References", "");
  for (const ref of githubRefs ?? []) {
    lines.push(`- ${ref.type.toUpperCase()}: ${ref.url}`);
  }
  if (metadata?.author || metadata?.date) {
    lines.push(
      `- Author: ${metadata?.author ?? "unknown"} | Date: ${metadata?.date ?? "unknown"}`,
    );
  }
  lines.push("", "### Files");
  for (const filePath of filesInfo?.files ?? []) {
    lines.push(`- ${filePath}`);
  }
  if (filesInfo?.truncated) {
    const remaining = (filesInfo?.total ?? 0) - (filesInfo?.files?.length ?? 0);
    lines.push(`- 还有 ${remaining} 个文件`);
  }
  lines.push("", "## AI Insights", "", "### Benefits", "", "- 性能：", "- 质量：", "- 工作流：", "");
  lines.push("### Risks", "", "- 待补充");
  return `${lines.join("\n")}\n`;
};

export const generateItemFromCommit = async ({
  owner = DEFAULT_OWNER,
  repo = DEFAULT_REPO,
  token,
  commit,
  moduleMapPath = resolveModuleMapPath(),
  moduleMappingPath = resolveModuleMappingPath(),
  maxFiles = 30,
  itemsDir = resolveItemsDir(),
}) => {
  const detailed = commit?.files
    ? commit
    : await fetchCommitDetails({ owner, repo, token, sha: commit.sha });
  const metadata = extractCommitMetadata(detailed);
  const filesInfo = extractFilePaths(detailed, maxFiles);
  const moduleMap = await loadModuleMap(moduleMapPath);
  const moduleCodes = findModuleCodesForPaths(filesInfo.files, moduleMap);
  const mappings = await loadModuleMappingConfig(moduleMappingPath);
  const moduleSystems = mapModuleCodesToSystems(moduleCodes, mappings);
  const changeType = deriveChangeType(metadata.message);
  const githubRefs = buildGithubRefs({ owner, repo, sha: metadata.sha });
  const frontMatter = buildItemFrontMatter({
    metadata,
    moduleCodes,
    moduleSystems,
    changeType,
    githubRefs,
  });
  const body = buildItemBody({ githubRefs, filesInfo, metadata });
  const markdown = renderItemMarkdown(frontMatter, body || buildDefaultBody());

  await fs.mkdir(itemsDir, { recursive: true });
  const filePath = path.join(itemsDir, `${frontMatter.id}.md`);
  await fs.writeFile(filePath, markdown, "utf8");

  return { id: frontMatter.id, filePath, frontMatter };
};

export const runValidateItems = async (scriptPath = resolveValidateItemsPath()) =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath], {
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error(`validate-items exited with code ${code}`));
      }
    });
  });
