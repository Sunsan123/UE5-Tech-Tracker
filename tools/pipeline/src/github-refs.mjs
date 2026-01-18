const DEFAULT_OWNER = "EpicGames";
const DEFAULT_REPO = "UnrealEngine";

const fetchJson = async (url, token) => {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API ${response.status}: ${body}`);
  }

  return response.json();
};

const buildRepo = ({ owner, repo }) => `${owner}/${repo}`;

export const fetchCommitPullRequests = async ({
  owner = DEFAULT_OWNER,
  repo = DEFAULT_REPO,
  token,
  sha,
} = {}) => {
  if (!sha) {
    throw new Error("Commit SHA is required.");
  }
  return fetchJson(
    `https://api.github.com/repos/${owner}/${repo}/commits/${sha}/pulls`,
    token,
  );
};

export const fetchPullRequest = async ({
  owner = DEFAULT_OWNER,
  repo = DEFAULT_REPO,
  token,
  number,
} = {}) => {
  if (!number) {
    throw new Error("PR number is required.");
  }
  return fetchJson(`https://api.github.com/repos/${owner}/${repo}/pulls/${number}`, token);
};

export const fetchIssue = async ({
  owner = DEFAULT_OWNER,
  repo = DEFAULT_REPO,
  token,
  number,
} = {}) => {
  if (!number) {
    throw new Error("Issue number is required.");
  }
  return fetchJson(`https://api.github.com/repos/${owner}/${repo}/issues/${number}`, token);
};

export const fetchIssueComments = async ({
  owner = DEFAULT_OWNER,
  repo = DEFAULT_REPO,
  token,
  number,
} = {}) => {
  if (!number) {
    throw new Error("Issue number is required.");
  }
  return fetchJson(`https://api.github.com/repos/${owner}/${repo}/issues/${number}/comments`, token);
};

export const extractIssueNumbers = (text = "") => {
  const matches = text.match(/#(\\d+)/g) ?? [];
  return [...new Set(matches.map((match) => Number(match.slice(1))).filter(Boolean))];
};

export const buildPrRef = ({ owner, repo, pr }) => ({
  type: "pr",
  id: String(pr.number),
  url: pr.html_url,
  repo: buildRepo({ owner, repo }),
  title: pr.title,
});

export const buildIssueRef = ({ owner, repo, issue }) => ({
  type: "issue",
  id: String(issue.number),
  url: issue.html_url,
  repo: buildRepo({ owner, repo }),
  title: issue.title,
});

export const buildCommentRefs = ({ owner, repo, comments = [] }) =>
  comments.map((comment) => ({
    type: "discussion",
    id: String(comment.id),
    url: comment.html_url,
    repo: buildRepo({ owner, repo }),
    title: comment.user?.login ? `Comment by ${comment.user.login}` : "Comment",
  }));

export const isLowInfoComment = (comment) => {
  const body = comment?.body ?? "";
  if (!body || body.trim().length < 30) {
    const hasLink = /https?:\\/\\//.test(body);
    const hasQuote = />\\s/.test(body);
    const hasCode = /`{1,3}/.test(body);
    return !(hasLink || hasQuote || hasCode);
  }
  return false;
};

export const pickEarliestComments = (comments, limit = 3) =>
  comments
    .filter((comment) => !isLowInfoComment(comment))
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .slice(0, limit);

export const buildPullRequestSummary = (pr) => ({
  title: pr.title,
  body: pr.body ?? "",
});

export const buildIssueSummary = (issue) => ({
  title: issue.title,
  body: issue.body ?? "",
});
