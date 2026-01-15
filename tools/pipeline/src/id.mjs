import crypto from "node:crypto";

const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "ref",
  "ref_",
  "source",
  "campaign",
  "medium",
  "content",
  "fbclid",
  "gclid",
  "igshid",
  "spm",
]);

export const normalizeUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== "string") {
    return "";
  }

  try {
    const url = new URL(rawUrl);
    url.hash = "";
    url.protocol = "https:";
    url.hostname = url.hostname.toLowerCase();

    for (const key of [...url.searchParams.keys()]) {
      if (TRACKING_PARAMS.has(key) || key.startsWith("utm_")) {
        url.searchParams.delete(key);
      }
    }

    const normalizedPath = url.pathname.replace(/\/$/, "");
    url.pathname = normalizedPath || "/";

    if ((url.protocol === "https:" && url.port === "443") || (url.protocol === "http:" && url.port === "80")) {
      url.port = "";
    }

    return url.toString();
  } catch (error) {
    return rawUrl.trim();
  }
};

export const normalizeUrls = (urls) => {
  const seen = new Set();
  const normalized = [];

  for (const url of urls) {
    const cleaned = normalizeUrl(url);
    if (!cleaned || seen.has(cleaned)) {
      continue;
    }
    seen.add(cleaned);
    normalized.push(cleaned);
  }

  return normalized;
};

export const selectPrimaryUrls = (sources = []) => {
  const weighted = sources
    .filter((source) => source?.url)
    .map((source, index) => {
      const weight = source.credibility === "high" ? 2 : 1;
      return { url: source.url, weight, index };
    })
    .sort((a, b) => {
      if (a.weight !== b.weight) {
        return b.weight - a.weight;
      }
      return a.index - b.index;
    });

  return weighted.map((entry) => entry.url);
};

export const buildItemIdInput = ({ version, sources = [], github_refs = [] }) => {
  const primaryUrls = normalizeUrls(selectPrimaryUrls(sources));
  const githubKeys = github_refs
    .map((ref) => {
      if (ref?.type && ref?.id) {
        return `${ref.type}:${ref.id}`;
      }
      if (ref?.url) {
        return `url:${normalizeUrl(ref.url)}`;
      }
      return "";
    })
    .filter(Boolean)
    .sort();

  return [version ?? "", ...primaryUrls, ...githubKeys].join("|");
};

export const hashItemId = (input, length = 12) => {
  const hash = crypto.createHash("sha256").update(input).digest("hex");
  return hash.slice(0, length);
};

export const computeItemId = ({ version, sources = [], github_refs = [] }, length = 12) => {
  const input = buildItemIdInput({ version, sources, github_refs });
  return hashItemId(input, length);
};
