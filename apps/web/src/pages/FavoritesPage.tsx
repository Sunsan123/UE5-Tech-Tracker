import { Stack, Typography } from "@mui/material";
import BilingualBlock from "../components/BilingualBlock";
import ModuleUpdateCard from "../components/ModuleUpdateCard";
import { indexItems } from "../data/index-base";

const FavoritesPage = () => {
  const favorite = indexItems[0];
  return (
    <Stack spacing={3}>
      <Typography variant="h4">收藏</Typography>
      <BilingualBlock
        zh="收藏内容将按时间倒序展示。"
        en="Favorites will appear in reverse chronological order."
      />
      {favorite ? (
        <ModuleUpdateCard
          id={favorite.id}
          titleZh={favorite.title_zh}
          titleEn={favorite.title_en}
          summaryZh={favorite.summary_zh}
          summaryEn={favorite.summary_en}
          version={favorite.version}
          date={favorite.published_at}
          tags={favorite.tags}
          credibility={favorite.credibility}
        />
      ) : null}
    </Stack>
  );
};

export default FavoritesPage;
