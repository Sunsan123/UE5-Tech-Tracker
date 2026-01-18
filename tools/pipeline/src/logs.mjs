import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const repoRoot = path.resolve(process.cwd(), "..", "..");
const logsDir = path.join(repoRoot, "reports", "logs");
const logsFile = path.join(logsDir, "index.json");

const defaultLogs = { builds: [] };

export const loadLogs = async () => {
  try {
    const raw = await readFile(logsFile, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT") {
      return defaultLogs;
    }
    throw error;
  }
};

export const writeLogs = async (logs) => {
  await mkdir(logsDir, { recursive: true });
  await writeFile(logsFile, JSON.stringify(logs, null, 2), "utf8");
};

export const createBuildLog = ({ startedAt }) => ({
  id: startedAt,
  started_at: startedAt,
  finished_at: null,
  status: "running",
  incomplete_data: false,
  truncated: false,
  quota_exhausted: false,
  steps: [],
  error_samples: [],
});

export const finalizeBuildLog = (log) => {
  const failedSteps = log.steps.filter((step) => step.status === "failed").length;
  const partial = failedSteps > 0 && log.steps.length > failedSteps;
  if (failedSteps === 0) {
    log.status = "success";
  } else if (partial) {
    log.status = "partial";
  } else {
    log.status = "failed";
  }
  log.finished_at = new Date().toISOString();
  log.error_samples = log.steps.flatMap((step) => step.error_samples ?? []).slice(0, 20);
  log.incomplete_data = log.truncated || log.quota_exhausted;
  return log;
};

export const addStepResult = (log, step) => {
  log.steps.push(step);
  if (step.truncated) {
    log.truncated = true;
  }
  if (step.quota_exhausted) {
    log.quota_exhausted = true;
  }
  return log;
};
