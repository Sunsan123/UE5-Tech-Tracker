import { Box, Stack, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import BilingualBlock from "../components/BilingualBlock";
import InfiniteScrollList from "../components/InfiniteScrollList";
import ModuleSearchBar from "../components/ModuleSearchBar";
import ModuleUpdateCard from "../components/ModuleUpdateCard";

const TOTAL_ITEMS = 60;

const buildMockItems = (moduleSystem: string) =>
  Array.from({ length: TOTAL_ITEMS }, (_, index) => {
    const itemNumber = index + 1;
    return {
      id: `${moduleSystem}-${itemNumber}`,
      titleZh: `${moduleSystem.toUpperCase()} 更新要点 ${itemNumber}`,
      titleEn: `${moduleSystem.toUpperCase()} update highlight ${itemNumber}`,
      summaryZh: "这里将呈现更新摘要与证据摘录的占位内容。",
      summaryEn: "Placeholder summary for evidence-first update content.",
      version: "5.4",
      date: "2024-05-01",
      tags: ["RHI", "性能", "P1"],
      credibility: index % 2 === 0 ? ("high" as const) : ("low" as const)
    };
  });

const ModulePage = () => {
  const { moduleSystem = "module" } = useParams();
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);

  const items = useMemo(() => buildMockItems(moduleSystem), [moduleSystem]);
  const filtered = useMemo(() => {
    if (!query.trim()) {
      return items;
    }
    return items.filter((item) =>
      [item.titleZh, item.titleEn, item.summaryZh, item.summaryEn, item.tags.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [items, query]);

  const visibleItems = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 20, filtered.length));
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" gutterBottom>
          {moduleSystem.toUpperCase()} 模块
        </Typography>
        <BilingualBlock
          zh="默认展示最新大版本的前 20 条更新，可通过搜索与滚动加载更多。"
          en="Showing the latest major version with infinite scroll and module-only search."
        />
      </Box>
      <ModuleSearchBar value={query} onChange={setQuery} />
      <InfiniteScrollList isLoading={false} hasMore={hasMore} onLoadMore={handleLoadMore}>
        {visibleItems.map((item) => (
          <ModuleUpdateCard key={item.id} {...item} />
        ))}
      </InfiniteScrollList>
    </Stack>
  );
};

export default ModulePage;
