import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import BilingualBlock from "../components/BilingualBlock";
import InfiniteScrollList from "../components/InfiniteScrollList";
import ModuleSearchBar from "../components/ModuleSearchBar";
import ModuleUpdateCard from "../components/ModuleUpdateCard";
import { loadModuleChunk } from "../data/chunk-loaders";
import { indexItems } from "../data/index-base";
import type { ModuleItem } from "../data/types";
import { latestMajor, versions } from "../data/versions";

const ModulePage = () => {
  const { moduleSystem = "module" } = useParams();
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);
  const [moduleItems, setModuleItems] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    loadModuleChunk<ModuleItem[]>(moduleSystem).then((data) => {
      if (!mounted) {
        return;
      }
      setModuleItems(data ?? []);
      setLoading(false);
      setVisibleCount(20);
    });
    return () => {
      mounted = false;
    };
  }, [moduleSystem]);

  const indexMap = useMemo(
    () => new Map(indexItems.map((item) => [item.id, item])),
    []
  );

  const latestMajorVersion =
    latestMajor ??
    [...versions].sort((a, b) => b.published_at.localeCompare(a.published_at))[0]?.version;

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const byVersion = moduleItems.filter((item) =>
      latestMajorVersion ? item.version.startsWith(latestMajorVersion) : true
    );

    const byQuery = normalizedQuery
      ? byVersion.filter((item) => {
          const indexItem = indexMap.get(item.id);
          return [
            item.title_zh ?? item.title,
            item.title_en ?? item.title,
            indexItem?.summary_zh ?? "",
            indexItem?.summary_en ?? "",
            item.tags?.join(" ") ?? ""
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);
        })
      : byVersion;

    return byQuery
      .map((item) => ({ item, index: indexMap.get(item.id) }))
      .sort((a, b) => {
        const scoreA = a.index?.p1_score ?? 0;
        const scoreB = b.index?.p1_score ?? 0;
        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
        return (b.item.published_at ?? "").localeCompare(a.item.published_at ?? "");
      });
  }, [moduleItems, query, indexMap, latestMajorVersion]);

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
      <InfiniteScrollList isLoading={loading} hasMore={hasMore} onLoadMore={handleLoadMore}>
        {loading ? (
          <Stack alignItems="center" padding={4}>
            <CircularProgress />
          </Stack>
        ) : (
          visibleItems.map(({ item, index }) => (
            <ModuleUpdateCard
              key={item.id}
              id={item.id}
              titleZh={item.title_zh ?? item.title}
              titleEn={item.title_en ?? item.title}
              summaryZh={index?.summary_zh ?? ""}
              summaryEn={index?.summary_en ?? ""}
              version={item.version}
              date={item.published_at ?? ""}
              tags={item.tags ?? []}
              credibility={index?.credibility ?? "low"}
              thumbnailUrl={item.thumbs?.[0] ?? null}
            />
          ))
        )}
      </InfiniteScrollList>
    </Stack>
  );
};

export default ModulePage;
