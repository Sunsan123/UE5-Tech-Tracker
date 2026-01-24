import { loadEnv } from "./env.mjs";
import {
  applyDailyCommitLimit,
  fetchCommitsWithBacktrack,
  filterMergeCommits,
  loadPipelineConfig,
  resolvePipelineConfigPath,
} from "./github-commits.mjs";
import {
  generateItemFromCommit,
  runValidateItems,
} from "./github-items.mjs";
import {
  filterCommitsByItemId,
  loadExistingItemIds,
} from "./github-dedupe.mjs";
import {
  advanceLastSeenSha,
  loadGithubState,
  resolveGithubStatePath,
  updateGithubStats,
  writeGithubState,
} from "./github-state.mjs";

const DEFAULT_OWNER = "EpicGames";
const DEFAULT_REPO = "UnrealEngine";
const DEFAULT_BRANCH = "ue5-main";

const resolveGithubEnv = () => ({
  owner: process.env.GITHUB_OWNER ?? DEFAULT_OWNER,
  repo: process.env.GITHUB_REPO ?? DEFAULT_REPO,
  branch: process.env.GITHUB_BRANCH ?? DEFAULT_BRANCH,
  token: process.env.GITHUB_TOKEN ?? process.env.GITHUB_PAT ?? "",
});

const main = async () => {
  await loadEnv();
  const configPath = resolvePipelineConfigPath();
  const pipelineConfig = await loadPipelineConfig(configPath);
  const limits = pipelineConfig?.limits ?? {};
  const statePath = resolveGithubStatePath();
  const state = await loadGithubState(statePath);
  const { owner, repo, branch, token } = resolveGithubEnv();

  const { commits, foundLastSeen } = await fetchCommitsWithBacktrack({
    owner,
    repo,
    branch,
    token,
    lastSeenSha: state.last_seen_sha,
    backtrack: limits.backtrack_commits ?? 50,
  });

  const filtered = filterMergeCommits(commits);
  const { commits: limited, truncated } = applyDailyCommitLimit(
    filtered,
    limits.daily_commits ?? 200,
  );

  const existingIds = await loadExistingItemIds();
  const freshCommits = filterCommitsByItemId(limited, existingIds);

  let processed = 0;
  let failures = 0;
  const errors = [];

  for (const commit of freshCommits) {
    try {
      await generateItemFromCommit({
        owner,
        repo,
        token,
        commit,
        maxFiles: limits.max_files_listed ?? 30,
      });
      processed += 1;
    } catch (error) {
      failures += 1;
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  const skipped = limited.length - freshCommits.length;
  let nextState = advanceLastSeenSha(state, commits);
  nextState = updateGithubStats(nextState, {
    processed,
    skipped,
    failures,
    truncated,
  });
  nextState.errors = [
    ...(nextState.errors ?? []),
    ...errors,
    ...(foundLastSeen ? [] : ["last_seen_sha 未出现在回溯窗口内。"]),
  ].slice(-20);
  await writeGithubState(statePath, nextState);

  if (processed > 0) {
    await runValidateItems();
  }

  console.log(
    `GitHub sync complete. processed=${processed} skipped=${skipped} failures=${failures}`,
  );
};

await main();
