import { Stack, Typography } from "@mui/material";
import ModuleSearchBar from "../components/ModuleSearchBar";
import ModuleUpdateCard from "../components/ModuleUpdateCard";

const SearchPage = () => {
  return (
    <Stack spacing={3}>
      <Typography variant="h4">全局搜索</Typography>
      <ModuleSearchBar value="" onChange={() => undefined} />
      <Stack spacing={2}>
        <ModuleUpdateCard
          titleZh="全局搜索结果示例"
          titleEn="Sample search result"
          summaryZh="这里显示命中摘要与高亮片段。"
          summaryEn="Highlights and summary snippets appear here."
          version="5.3"
          date="2024-03-12"
          tags={["Lumen", "P1"]}
          credibility="high"
        />
      </Stack>
    </Stack>
  );
};

export default SearchPage;
