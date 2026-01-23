import { Stack, Typography } from "@mui/material";
import { useMemo } from "react";
import BilingualBlock from "../components/BilingualBlock";
import ModuleUpdateCard from "../components/ModuleUpdateCard";
import { indexItems, type IndexItem } from "../data/index-base";
import { useFavoritesStore } from "../store/favoritesStore";

const FavoritesPage = () => {
  const favorites = useFavoritesStore((state) => state.items);
  const items = useMemo(() => {
    const map = new Map<string, IndexItem>(indexItems.map((item) => [item.id, item]));
    return [...favorites]
      .sort((a, b) => b.ts - a.ts)
      .map((entry) => ({
        entry,
        item: map.get(entry.id),
      }))
      .filter((entry) => Boolean(entry.item));
  }, [favorites]);

  return (
    <Stack spacing={3}>
      <Typography variant="h4">收藏</Typography>
      <BilingualBlock
        zh="收藏内容将按时间倒序展示。"
        en="Favorites will appear in reverse chronological order."
      />
      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          暂无收藏条目。
        </Typography>
      ) : null}
      {items.map(({ entry, item }) =>
        item ? (
          <ModuleUpdateCard
            key={entry.id}
            id={item.id}
            titleZh={item.title_zh}
            titleEn={item.title_en}
            summaryZh={item.summary_zh}
            summaryEn={item.summary_en}
            version={item.version}
            date={item.published_at}
            tags={item.tags}
            credibility={item.credibility}
          />
        ) : null
      )}
    </Stack>
  );
};

export default FavoritesPage;
