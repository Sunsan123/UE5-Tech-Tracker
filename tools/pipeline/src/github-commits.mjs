import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

const DEFAULT_OWNER = "EpicGames";
const DEFAULT_REPO = "UnrealEngine";
const DEFAULT_BRANCH = "ue5-main";
const PER_PAGE = 100;

export const resolvePipelineConfigPath = (baseDir = process.cwd()) =>
  path.resolve(baseDir, "..", "..", "config", "pipeline.yaml");

export const loadPipelineConfig = async (configPath) => {
  const raw = await fs.readFile(configPath, "utf8");
  return YAML.parse(raw) ?? {};
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
    throw new Error(`GitHub API ${response.status}: ${body}`);
  }

  return response.json();
};

const buildCommitsUrl = ({ owner, repo, branch, page }) =>
  `https://api.github.com/repos/${owner}/${repo}/commits?sha=${encodeURIComponent(
    branch,
  )}&per_page=${PER_PAGE}&page=${page}`;

export const fetchCommitsWithBacktrack = async ({
  owner = DEFAULT_OWNER,
  repo = DEFAULT_REPO,
  branch = DEFAULT_BRANCH,
  token,
  lastSeenSha,
  backtrack = 50,
} = {}) => {
  const commits = [];
  let page = 1;
  let remainingBacktrack = lastSeenSha ? null : 0;
  let foundLastSeen = false;

  while (true) {
    const batch = await fetchJson(
      buildCommitsUrl({ owner, repo, branch, page }),
      token,
    );
    if (!Array.isArray(batch) || batch.length === 0) {
      break;
    }

    for (const entry of batch) {
      commits.push(entry);
      if (lastSeenSha && entry?.sha === lastSeenSha) {
        foundLastSeen = true;
        remainingBacktrack = backtrack;
        continue;
      }

      if (remainingBacktrack !== null) {
        remainingBacktrack -= 1;
        if (remainingBacktrack === 0) {
          break;
        }
      }
    }

    if (remainingBacktrack !== null && remainingBacktrack === 0) {
      break;
    }

    page += 1;
  }

  return { commits, foundLastSeen };
};

export const filterMergeCommits = (commits) =>
  commits.filter((commit) => {
    const message = commit?.commit?.message ?? "";
    return !message.startsWith("Merge");
  });

export const applyDailyCommitLimit = (commits, dailyLimit) => {
  if (!dailyLimit || commits.length <= dailyLimit) {
    return { commits, truncated: false };
  }

  return { commits: commits.slice(0, dailyLimit), truncated: true };
};
