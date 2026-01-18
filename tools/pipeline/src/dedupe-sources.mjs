import { buildExcerpt, extractParagraphs, selectTopParagraphs } from "./excerpt.mjs";

const tokenize = (text) =>
  text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length > 2);

const buildVector = (tokens) => {
  const counts = new Map();
  tokens.forEach((token) => {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  });
  return counts;
};

const cosineSimilarity = (vecA, vecB) => {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  vecA.forEach((value, token) => {
    normA += value * value;
    dot += value * (vecB.get(token) ?? 0);
  });
  vecB.forEach((value) => {
    normB += value * value;
  });

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const mergeNearDuplicates = ({ sources, threshold = 0.92 }) => {
  const merged = [];

  for (const source of sources) {
    const sourceVector = buildVector(tokenize(source.excerpt_en ?? ""));
    const existing = merged.find((entry) =>
      cosineSimilarity(buildVector(tokenize(entry.excerpt_en ?? "")), sourceVector) >
      threshold
    );

    if (existing) {
      existing.duplicates = existing.duplicates ?? [];
      existing.duplicates.push({ url: source.url, title: source.title });
    } else {
      merged.push({ ...source });
    }
  }

  return merged;
};

export const buildExcerptFromHtml = ({ html, query, maxParagraphs, maxWords }) => {
  const paragraphs = extractParagraphs(html);
  const topParagraphs = selectTopParagraphs({
    paragraphs,
    query,
    maxParagraphs
  });
  return buildExcerpt({ paragraphs: topParagraphs, maxWords });
};
