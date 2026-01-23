import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  addStepResult,
  createBuildLog,
  finalizeBuildLog,
  loadLogs,
  writeLogs,
} from "./logs.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..", "..");

const runCommand = async ({
  name,
  command,
  args,
  cwd,
}) =>
  new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stderr = "";
    child.stdout.on("data", (chunk) => {
      process.stdout.write(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
      process.stderr.write(chunk);
    });

    child.on("close", (code) => {
      const errorSamples = stderr
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(-20);
      resolve({
        name,
        status: code === 0 ? "success" : "failed",
        error_samples: errorSamples,
      });
    });
  });

const main = async () => {
  const startedAt = new Date().toISOString();
  const buildLog = createBuildLog({ startedAt });

  const steps = [
    {
      name: "Generate module map",
      command: process.execPath,
      args: ["tools/pipeline/src/generate-module-map.mjs"],
      cwd: repoRoot,
    },
    {
      name: "Fetch release notes",
      command: process.execPath,
      args: ["tools/pipeline/src/release-notes.mjs"],
      cwd: repoRoot,
    },
    {
      name: "Validate items",
      command: process.execPath,
      args: ["tools/pipeline/src/validate-items.mjs"],
      cwd: repoRoot,
    },
    {
      name: "Generate daily report",
      command: process.execPath,
      args: ["tools/pipeline/src/daily-report.mjs"],
      cwd: repoRoot,
    },
    {
      name: "Generate frontend data",
      command: process.execPath,
      args: ["apps/web/scripts/generate-data.mjs"],
      cwd: repoRoot,
    },
  ];

  for (const step of steps) {
    const result = await runCommand(step);
    addStepResult(buildLog, result);
  }

  finalizeBuildLog(buildLog);
  const logs = await loadLogs();
  logs.builds = [buildLog, ...(logs.builds ?? [])].slice(0, 30);
  await writeLogs(logs);
};

await main();
