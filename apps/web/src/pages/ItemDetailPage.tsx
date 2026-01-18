import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Link,
  Stack,
  Typography
} from "@mui/material";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import BilingualBlock from "../components/BilingualBlock";
import { loadModuleChunk } from "../data/chunk-loaders";
import { indexItems } from "../data/index-base";
import type { ModuleItem } from "../data/types";
import { useFavoritesStore } from "../store/favoritesStore";

const ItemDetailPage = () => {
  const { itemId = "item" } = useParams();
  const [item, setItem] = useState<ModuleItem | null>(null);
  const favorites = useFavoritesStore((state) => state.items);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const indexItem = useMemo(
    () => indexItems.find((entry) => entry.id === itemId),
    [itemId]
  );

  useEffect(() => {
    let mounted = true;
    const moduleId = indexItem?.module_system?.[0];
    if (!moduleId) {
      setItem(null);
      return () => undefined;
    }
    loadModuleChunk<ModuleItem[]>(moduleId).then((data) => {
      if (!mounted) {
        return;
      }
      const found = data?.find((entry) => entry.id === itemId) ?? null;
      setItem(found);
    });
    return () => {
      mounted = false;
    };
  }, [itemId, indexItem?.module_system]);

  if (!item) {
    return (
      <Stack spacing={3}>
        <Typography variant="h5">未找到对应更新项。</Typography>
      </Stack>
    );
  }

  const filePaths = item.file_paths ?? [];
  const visibleFiles = filePaths.slice(0, 30);
  const remainingFiles = filePaths.length - visibleFiles.length;
  const isFavorite = favorites.some((entry) => entry.id === itemId);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" gutterBottom>
          更新详情 · {itemId}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
          <Chip label={`版本 ${item.version}`} size="small" />
          <Chip label={`模块：${item.module_system.join(", ")}`} size="small" />
          <Chip label={`改动类型：${item.change_type}`} size="small" />
          <Button
            size="small"
            variant={isFavorite ? "contained" : "outlined"}
            color={isFavorite ? "secondary" : "primary"}
            startIcon={isFavorite ? <Favorite /> : <FavoriteBorder />}
            onClick={() => toggleFavorite(itemId)}
          >
            {isFavorite ? "已收藏" : "收藏"}
          </Button>
        </Stack>
        {item.thumbs.length > 0 ? (
          <Stack direction="row" spacing={2} marginTop={2} flexWrap="wrap">
            {item.thumbs.slice(0, 3).map((thumb) => (
              <Box
                component="img"
                key={thumb}
                src={thumb}
                alt={item.title}
                sx={{ width: 200, borderRadius: 1, border: "1px solid #e0e0e0" }}
              />
            ))}
          </Stack>
        ) : null}
      </Box>

      <Stack spacing={2}>
        <Typography variant="h5">证据来源</Typography>
        <Grid container spacing={2}>
          {item.sources.map((source) => (
            <Grid item xs={12} md={6} key={source.url}>
              <Card>
                <CardContent>
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle1">{source.title}</Typography>
                    <BilingualBlock
                      zh={`${source.excerpt_zh}（${source.translation_note}）`}
                      en={source.excerpt_en}
                    />
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        label={source.credibility === "high" ? "高可信" : "低可信"}
                        size="small"
                        color={source.credibility === "high" ? "success" : "warning"}
                      />
                      <Link href={source.url} target="_blank" rel="noreferrer">
                        <Chip label="来源链接" size="small" variant="outlined" />
                      </Link>
                    </Stack>
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
              <Stack spacing={0.5}>
                {item.github_refs.map((ref) => (
                  <Typography key={`${ref.type}-${ref.id}`} variant="body2">
                    {ref.type.toUpperCase()} {ref.id} · {ref.title ?? ""}{" "}
                    <Link href={ref.url} target="_blank" rel="noreferrer">
                      查看
                    </Link>
                  </Typography>
                ))}
              </Stack>
              <Divider />
              <Typography variant="body2" color="text.secondary">
                变更文件路径（前 30 条）：
              </Typography>
              <Stack spacing={0.5}>
                {visibleFiles.map((path) => (
                  <Typography key={path} variant="body2">
                    {path}
                  </Typography>
                ))}
                {remainingFiles > 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    还有 {remainingFiles} 个文件未展示
                  </Typography>
                ) : null}
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
                zh={item.benefits.summary}
                en={item.benefits.summary}
              />
              <Divider />
              <Typography variant="body2" color="text.secondary">
                注意事项：
              </Typography>
              <Stack spacing={0.5}>
                {item.risks.map((risk) => (
                  <Typography key={risk} variant="body2">
                    - {risk}
                  </Typography>
                ))}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Stack>
  );
};

export default ItemDetailPage;
