import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_STATE = {
  last_seen_sha: null,
  last_run_at: null,
  stats: {
    processed: 0,
    skipped: 0,
    failures: 0,
    truncated: false,
  },
  errors: [],
};

export const resolveGithubStatePath = (baseDir = process.cwd()) =>
  path.resolve(baseDir, "..", "..", "state", "github.json");

export const loadGithubState = async (filePath) => {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATE,
      ...parsed,
      stats: {
        ...DEFAULT_STATE.stats,
        ...(parsed?.stats ?? {}),
      },
      errors: Array.isArray(parsed?.errors) ? parsed.errors : [],
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return { ...DEFAULT_STATE };
    }
    throw error;
  }
};

export const writeGithubState = async (filePath, state) => {
  const payload = {
    ...DEFAULT_STATE,
    ...state,
    stats: {
      ...DEFAULT_STATE.stats,
      ...(state?.stats ?? {}),
    },
    errors: Array.isArray(state?.errors) ? state.errors : [],
  };

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return payload;
};

export const advanceLastSeenSha = (state, commits) => {
  const nextSha = commits?.[0]?.sha ?? null;
  return {
    ...state,
    last_seen_sha: nextSha ?? state?.last_seen_sha ?? null,
    last_run_at: new Date().toISOString(),
  };
};

export const updateGithubStats = (state, { processed, skipped, failures, truncated } = {}) => ({
  ...state,
  stats: {
    processed: processed ?? state?.stats?.processed ?? 0,
    skipped: skipped ?? state?.stats?.skipped ?? 0,
    failures: failures ?? state?.stats?.failures ?? 0,
    truncated: truncated ?? state?.stats?.truncated ?? false,
  },
});
