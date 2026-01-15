import fs from "node:fs/promises";
import path from "node:path";
import { computeItemId } from "./id.mjs";
import { parseFrontMatter } from "./markdown.mjs";

const DEFAULT_VERSION = "unknown";

export const resolveItemsDir = (baseDir = process.cwd()) =>
  path.resolve(baseDir, "..", "..", "data", "items");

export const loadExistingItemIds = async (itemsDir = resolveItemsDir()) => {
  let entries = [];
  try {
    entries = await fs.readdir(itemsDir, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") {
      return new Set();
    }
    throw error;
  }

  const ids = new Set();
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) {
      continue;
    }
    const content = await fs.readFile(path.join(itemsDir, entry.name), "utf8");
    const { frontMatter } = parseFrontMatter(content);
    if (frontMatter?.id) {
      ids.add(frontMatter.id);
    }
  }
  return ids;
};

export const buildCommitItemId = ({ sha, url, version = DEFAULT_VERSION } = {}) => {
  if (!sha) {
    return "";
  }
  const commitUrl = url || `https://github.com/unknown/unknown/commit/${sha}`;
  return computeItemId({
    version,
    sources: [],
    github_refs: [
      {
        type: "commit",
        id: sha,
        url: commitUrl,
      },
    ],
  });
};

export const filterCommitsByItemId = (commits, existingIds, version = DEFAULT_VERSION) =>
  commits.filter((commit) => {
    const itemId = buildCommitItemId({
      sha: commit?.sha,
      url: commit?.html_url,
      version,
    });
    return itemId && !existingIds.has(itemId);
  });
