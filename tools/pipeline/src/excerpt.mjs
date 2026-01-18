const stripHtml = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (text) =>
  text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length > 2);

const buildTf = (tokens) => {
  const counts = new Map();
  tokens.forEach((token) => {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  });
  return counts;
};

const buildIdf = (docs) => {
  const docCount = docs.length;
  const df = new Map();
  docs.forEach((doc) => {
    const seen = new Set(doc);
    seen.forEach((token) => {
      df.set(token, (df.get(token) ?? 0) + 1);
    });
  });
  const idf = new Map();
  df.forEach((count, token) => {
    idf.set(token, Math.log((docCount + 1) / (count + 1)) + 1);
  });
  return idf;
};

const buildVector = (tf, idf) => {
  const vector = new Map();
  tf.forEach((count, token) => {
    vector.set(token, count * (idf.get(token) ?? 0));
  });
  return vector;
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

export const fetchHtml = async (url, timeoutMs = 10000) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    return response.text();
  } finally {
    clearTimeout(timeout);
  }
};

export const extractParagraphs = (html) => {
  const text = stripHtml(html);
  return text
    .split(/\n{2,}|\.\s+/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 40);
};

export const selectTopParagraphs = ({ paragraphs, query, maxParagraphs = 3 }) => {
  const docs = paragraphs.map((paragraph) => tokenize(paragraph));
  const idf = buildIdf(docs);
  const queryTokens = tokenize(query);
  const queryTf = buildTf(queryTokens);
  const queryVector = buildVector(queryTf, idf);

  const scored = paragraphs.map((paragraph, index) => {
    const tf = buildTf(docs[index]);
    const vector = buildVector(tf, idf);
    return {
      paragraph,
      score: cosineSimilarity(vector, queryVector)
    };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxParagraphs)
    .map((entry) => entry.paragraph);
};

export const buildExcerpt = ({ paragraphs, maxWords = 300 }) => {
  const joined = paragraphs.join(" ");
  const words = joined.split(/\s+/).slice(0, maxWords);
  return words.join(" ");
};
