import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography
} from "@mui/material";
import { useParams } from "react-router-dom";
import BilingualBlock from "../components/BilingualBlock";

const ItemDetailPage = () => {
  const { itemId = "item" } = useParams();

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" gutterBottom>
          更新详情 · {itemId}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip label="版本 5.4" size="small" />
          <Chip label="模块：Lumen" size="small" />
          <Chip label="改动类型：性能" size="small" />
        </Stack>
      </Box>

      <Stack spacing={2}>
        <Typography variant="h5">证据来源</Typography>
        <Grid container spacing={2}>
          {[1, 2].map((index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardContent>
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle1">来源 {index}</Typography>
                    <BilingualBlock
                      zh="【AI 翻译】此处展示 300 词以内的中文证据摘录。"
                      en="This section shows the original English excerpt (up to 300 words)."
                    />
                    <Chip label="高可信" size="small" color="success" />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>

      <Stack spacing={2}>
        <Typography variant="h5">GitHub 引用</Typography>
        <Card>
          <CardContent>
            <Stack spacing={1.5}>
              <Typography variant="body1">PR #12345 · Commit abcdef</Typography>
              <Divider />
              <Typography variant="body2" color="text.secondary">
                变更文件路径（前 30 条）：
              </Typography>
              <Stack spacing={0.5}>
                {[
                  "Engine/Source/Runtime/Renderer/Private/Lumen/LumenScene.cpp",
                  "Engine/Source/Runtime/Renderer/Private/Lumen/LumenRadianceCache.cpp",
                  "Engine/Shaders/Private/Lumen/LumenScene.usf"
                ].map((path) => (
                  <Typography key={path} variant="body2">
                    {path}
                  </Typography>
                ))}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Stack spacing={2}>
        <Typography variant="h5">AI 解读</Typography>
        <Card>
          <CardContent>
            <Stack spacing={1}>
              <BilingualBlock
                zh="【AI 生成】性能收益：提升 Lumen 光照更新速度。"
                en="[AI Generated] Performance: improves Lumen update speed."
              />
              <Divider />
              <Typography variant="body2" color="text.secondary">
                注意事项：
              </Typography>
              <Stack spacing={0.5}>
                <Typography variant="body2">- 【AI 推断】大场景可能增加显存占用。</Typography>
                <Typography variant="body2">- 【AI 推断】需关注 RHI 兼容性。</Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Stack>
  );
};

export default ItemDetailPage;
