import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..", "..");
const defaultEnvPath = path.join(repoRoot, ".env");

let hasLoaded = false;

const parseEnvValue = (rawValue) => {
  if (rawValue === "") {
    return "";
  }

  const quote = rawValue[0];
  if ((quote === '"' || quote === "'") && rawValue.endsWith(quote)) {
    const inner = rawValue.slice(1, -1);
    if (quote === '"') {
      return inner
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\"/g, "\"");
    }
    return inner.replace(/\\'/g, "'");
  }

  const commentIndex = rawValue.indexOf(" #");
  if (commentIndex !== -1) {
    return rawValue.slice(0, commentIndex).trim();
  }

  return rawValue;
};

const parseEnv = (content) => {
  for (const rawLine of content.split(/\r?\n/)) {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const line = trimmed.startsWith("export ")
      ? trimmed.slice("export ".length).trim()
      : trimmed;
    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    if (!key) {
      continue;
    }

    const rawValue = line.slice(separatorIndex + 1).trim();
    const value = parseEnvValue(rawValue);

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
};

export const loadEnv = async ({ envPath = defaultEnvPath } = {}) => {
  if (hasLoaded) {
    return;
  }

  try {
    const content = await fs.readFile(envPath, "utf8");
    parseEnv(content);
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  } finally {
    hasLoaded = true;
  }
};
