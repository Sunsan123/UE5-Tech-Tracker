import { Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import ModuleSearchBar from "../components/ModuleSearchBar";
import ModuleUpdateCard from "../components/ModuleUpdateCard";
import { indexItems } from "../data/index-base";
import { createSearchIndex } from "../data/search-index";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 250);
    return () => window.clearTimeout(handle);
  }, [query]);

  const searchIndex = useMemo(() => createSearchIndex(), []);

  const results = useMemo(() => {
    if (!debouncedQuery) {
      return [];
    }
    const matches = searchIndex.search(debouncedQuery, 50) as string[];
    const items = matches
      .map((id) => indexItems.find((item) => item.id === id))
      .filter(Boolean)
      .map((item) => item!);
    return items.sort((a, b) => {
      if (a.p1_score !== b.p1_score) {
        return b.p1_score - a.p1_score;
      }
      return b.published_at.localeCompare(a.published_at);
    });
  }, [debouncedQuery, searchIndex]);

  const highlightSnippet = (text: string, keyword: string) => {
    if (!text || !keyword) return "";
    const escaped = keyword.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">全局搜索</Typography>
      <ModuleSearchBar value={query} onChange={setQuery} />
      <Stack spacing={2}>
        {debouncedQuery ? (
          results.length > 0 ? (
            results.map((result) => (
              <ModuleUpdateCard
                key={result.id}
                id={result.id}
                titleZh={result.title_zh}
                titleEn={result.title_en}
                summaryZh={result.summary_zh}
                summaryEn={result.summary_en}
                version={result.version}
                date={result.published_at}
                tags={result.tags}
                credibility={result.credibility}
                highlightSnippet={highlightSnippet(result.summary_zh, debouncedQuery)}
              />
            ))
          ) : (
            <Typography color="text.secondary">未找到匹配结果。</Typography>
          )
        ) : (
          <Typography color="text.secondary">请输入关键词进行搜索。</Typography>
        )}
      </Stack>
    </Stack>
  );
};

export default SearchPage;
