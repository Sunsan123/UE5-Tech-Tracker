import fs from "node:fs/promises";
import path from "node:path";

const RELEASE_NOTES_URLS = [
  "https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-release-notes",
  "https://dev.epicgames.com/documentation/en-us/unreal-engine/release-notes-for-unreal-engine",
];

const fetchHtml = async (url) => {
  const response = await fetch(url, {
    headers: { "User-Agent": "ue5-tech-tracker" },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch release notes index: ${response.status}`);
  }
  return response.text();
};

const parseVersions = (html) => {
  const linkRegex = /href="([^"]*unreal-engine-5-[^"]*release-notes[^"]*)"[^>]*>([^<]*)<\/a>/gi;
  const versions = new Map();
  let match;

  while ((match = linkRegex.exec(html))) {
    const url = match[1];
    const versionMatch = url.match(/5\.(\d+)/);
    if (!versionMatch) {
      continue;
    }
    const version = `5.${versionMatch[1]}`;
    if (versions.has(version)) {
      continue;
    }

    const surrounding = html.slice(
      Math.max(0, match.index - 200),
      Math.min(html.length, match.index + 200),
    );
    const dateMatch = surrounding.match(/datetime="([0-9-]+)"/i);
    const published_at = dateMatch ? dateMatch[1] : "";

    versions.set(version, {
      version,
      published_at,
      release_notes_url: url.startsWith("http")
        ? url
        : `https://dev.epicgames.com${url}`,
    });
  }

  return Array.from(versions.values());
};

const computeLatestMajor = (versions) => {
  const sorted = [...versions].sort((a, b) =>
    (b.published_at || "").localeCompare(a.published_at || ""),
  );
  return sorted[0]?.version ?? null;
};

const writeVersions = async (versions) => {
  const repoRoot = path.resolve(process.cwd(), "..", "..");
  const metaDir = path.join(repoRoot, "data", "meta");
  await fs.mkdir(metaDir, { recursive: true });
  const payload = {
    versions,
    latest_major: computeLatestMajor(versions),
  };
  await fs.writeFile(
    path.join(metaDir, "versions.json"),
    JSON.stringify(payload, null, 2),
    "utf8",
  );
};

const main = async () => {
  let html = null;
  let lastError = null;

  for (const url of RELEASE_NOTES_URLS) {
    try {
      html = await fetchHtml(url);
      break;
    } catch (error) {
      lastError = error;
    }
  }

  if (!html) {
    throw lastError;
  }

  const versions = parseVersions(html);
  if (versions.length === 0) {
    throw new Error("No release note versions parsed from index.");
  }

  await writeVersions(versions);
  console.log(`Release notes parsed: ${versions.length} versions.`);
};

await main();
