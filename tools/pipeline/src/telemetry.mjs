import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..", "..");
const logsDir = path.join(repoRoot, "reports", "logs", "telemetry");
const logIdEnv = "PIPELINE_LOG_ID";

const createDefaultStats = () => ({
  success: 0,
  failed: 0,
  errors: [],
});

const createDefaultTelemetry = () => ({
  ai: createDefaultStats(),
  search: createDefaultStats(),
});

const resolveTelemetryPath = (logId) => path.join(logsDir, `${logId}.json`);

export const readTelemetry = async (logId) => {
  if (!logId) {
    return createDefaultTelemetry();
  }
  try {
    const raw = await readFile(resolveTelemetryPath(logId), "utf8");
    const parsed = JSON.parse(raw);
    return {
      ai: {
        ...createDefaultStats(),
        ...(parsed?.ai ?? {}),
      },
      search: {
        ...createDefaultStats(),
        ...(parsed?.search ?? {}),
      },
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return createDefaultTelemetry();
    }
    throw error;
  }
};

const writeTelemetry = async (logId, telemetry) => {
  await mkdir(logsDir, { recursive: true });
  await writeFile(resolveTelemetryPath(logId), JSON.stringify(telemetry, null, 2), "utf8");
};

const formatError = (error) => {
  if (!error) {
    return "Unknown error";
  }
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

export const recordTelemetry = async ({ category, status, error }) => {
  const logId = process.env[logIdEnv];
  if (!logId) {
    return;
  }
  try {
    const telemetry = await readTelemetry(logId);
    const bucket = telemetry?.[category];
    if (!bucket) {
      return;
    }
    if (status === "success") {
      bucket.success += 1;
    } else {
      bucket.failed += 1;
      const message = formatError(error);
      bucket.errors = [...(bucket.errors ?? []), message].slice(-20);
    }
    await writeTelemetry(logId, telemetry);
  } catch (telemetryError) {
    console.warn("Failed to record telemetry.", telemetryError);
  }
};
