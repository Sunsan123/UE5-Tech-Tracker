import { Stack, Typography } from "@mui/material";
import BilingualBlock from "../components/BilingualBlock";
import ModuleUpdateCard from "../components/ModuleUpdateCard";

const FavoritesPage = () => {
  return (
    <Stack spacing={3}>
      <Typography variant="h4">收藏</Typography>
      <BilingualBlock
        zh="收藏内容将按时间倒序展示。"
        en="Favorites will appear in reverse chronological order."
      />
      <ModuleUpdateCard
        titleZh="示例收藏更新"
        titleEn="Sample saved update"
        summaryZh="保存的更新项将显示在这里。"
        summaryEn="Saved updates appear here."
        version="5.2"
        date="2024-01-20"
        tags={["Nanite", "工作流"]}
        credibility="high"
      />
    </Stack>
  );
};

export default FavoritesPage;
