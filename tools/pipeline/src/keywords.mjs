export const extractKeywords = ({ commits = [], releases = [], tags = [] } = {}) => {
  const keywords = new Set();

  const addTokens = (text) => {
    if (!text) return;
    text
      .split(/[^\w\-\.]+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 2)
      .forEach((token) => keywords.add(token));
  };

  commits.forEach((commit) => {
    addTokens(commit.title);
    (commit.tags ?? []).forEach((tag) => keywords.add(tag));
    (commit.module_system ?? []).forEach((module) => keywords.add(module));
    if (commit.version) keywords.add(`UE ${commit.version}`);
  });

  releases.forEach((release) => {
    if (release.version) keywords.add(`UE ${release.version}`);
    addTokens(release.title);
  });

  tags.forEach((tag) => keywords.add(tag));

  return Array.from(keywords);
};

export const prioritizeKeywords = ({ keywords, max = 150, moduleWeights = {} }) => {
  if (keywords.length <= max) {
    return keywords;
  }

  return keywords
    .map((keyword) => ({
      keyword,
      weight: moduleWeights[keyword] ?? 0
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, max)
    .map((entry) => entry.keyword);
};
