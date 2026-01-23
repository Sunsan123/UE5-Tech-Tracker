import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

const DEFAULT_OWNER = "EpicGames";
const DEFAULT_REPO = "UnrealEngine";
const DEFAULT_BRANCH = "ue5-main";
const BUILD_CS_SUFFIX = ".Build.cs";
const ENGINE_ROOTS = ["Engine/Source/", "Engine/Plugins/"];

const normalizePosixPath = (value) => path.posix.normalize(value).replace(/\\/g, "/");

const ensureTrailingSlash = (value) => (value.endsWith("/") ? value : `${value}/`);

export const loadModuleMappingConfig = async (configPath) => {
  const raw = await fs.readFile(configPath, "utf8");
  const parsed = YAML.parse(raw) ?? {};
  const mappings = Array.isArray(parsed.mappings) ? parsed.mappings : [];
  return mappings
    .filter((entry) => entry?.module_code && entry?.module_system)
    .map((entry) => ({
      module_code: String(entry.module_code),
      module_system: String(entry.module_system),
    }))
    .sort((a, b) => b.module_code.length - a.module_code.length);
};

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
    const hint =
      response.status === 404 && !token
        ? " (missing GITHUB_TOKEN/UE_GITHUB_PAT or lacking access to the target repo/branch)"
        : "";
    throw new Error(`GitHub API ${response.status}: ${body}${hint}`);
  }

  return response.json();
};

const fetchBranchHeadSha = async ({ owner, repo, branch, token }) => {
  const data = await fetchJson(
    `https://api.github.com/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}`,
    token,
  );
  return data?.commit?.sha;
};

const fetchTree = async ({ owner, repo, sha, token }) =>
  fetchJson(`https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`, token);

const isBuildCsPath = (filePath) =>
  filePath.endsWith(BUILD_CS_SUFFIX) && ENGINE_ROOTS.some((root) => filePath.startsWith(root));

export const extractModuleEntries = (treeItems) =>
  treeItems
    .filter((item) => item.type === "blob")
    .map((item) => normalizePosixPath(item.path))
    .filter((filePath) => isBuildCsPath(filePath))
    .map((filePath) => {
      const normalized = normalizePosixPath(filePath);
      const moduleDir = normalizePosixPath(path.posix.dirname(normalized));
      const moduleName = path.posix.basename(normalized, BUILD_CS_SUFFIX);
      return {
        module_code: moduleName,
        module_dir: moduleDir,
        build_file: normalized,
      };
    })
    .sort((a, b) => a.module_code.localeCompare(b.module_code));

export const generateModuleMap = async ({
  owner = DEFAULT_OWNER,
  repo = DEFAULT_REPO,
  branch = DEFAULT_BRANCH,
  token,
} = {}) => {
  const sha = await fetchBranchHeadSha({ owner, repo, branch, token });
  if (!sha) {
    throw new Error(`Unable to resolve branch ${branch} for ${owner}/${repo}.`);
  }

  const tree = await fetchTree({ owner, repo, sha, token });
  const entries = extractModuleEntries(tree?.tree ?? []);

  return {
    generated_at: new Date().toISOString(),
    owner,
    repo,
    branch,
    sha,
    total: entries.length,
    modules: entries,
  };
};

export const writeModuleMap = async (outputPath, moduleMap) => {
  const serialized = JSON.stringify(moduleMap, null, 2);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${serialized}\n`, "utf8");
};

export const findModuleCodesForPaths = (filePaths, moduleMap) => {
  const modules = Array.isArray(moduleMap?.modules) ? moduleMap.modules : [];
  const directories = modules
    .filter((entry) => entry?.module_dir && entry?.module_code)
    .map((entry) => ({
      module_code: entry.module_code,
      module_dir: ensureTrailingSlash(normalizePosixPath(entry.module_dir)),
    }))
    .sort((a, b) => b.module_dir.length - a.module_dir.length);

  const results = new Set();
  for (const filePath of filePaths) {
    const normalized = ensureTrailingSlash(normalizePosixPath(filePath));
    const match = directories.find((entry) => normalized.startsWith(entry.module_dir));
    if (match) {
      results.add(match.module_code);
    } else {
      results.add("Unknown");
    }
  }

  return [...results];
};

export const mapModuleCodesToSystems = (moduleCodes, mappings) => {
  const systems = new Set();

  for (const code of moduleCodes) {
    const match = mappings.find((entry) => code.startsWith(entry.module_code));
    if (match) {
      systems.add(match.module_system);
    } else {
      systems.add("unknown");
    }
  }

  return [...systems];
};
