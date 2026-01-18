import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography
} from "@mui/material";
import { Link } from "react-router-dom";
import BilingualBlock from "../components/BilingualBlock";
import { buildLogs, type BuildLog } from "../data/build-logs";
import { moduleSystems } from "../data/config";
import { indexItems } from "../data/index-base";

const ModuleDirectoryPage = () => {
  const latestBuild = buildLogs[0];
  const statusLabel = (status: BuildLog["status"]) => {
    switch (status) {
      case "success":
        return "成功";
      case "partial":
        return "部分失败";
      case "failed":
        return "失败";
      default:
        return "未知";
    }
  };
  const moduleStats = indexItems.reduce<Record<string, { count: number; latest?: string }>>(
    (acc, item) => {
      const modules = Array.isArray(item.module_system)
        ? item.module_system
        : [item.module_system];
      modules.forEach((moduleId) => {
        if (!acc[moduleId]) {
          acc[moduleId] = { count: 0, latest: undefined };
        }
        acc[moduleId].count += 1;
        if (!acc[moduleId].latest || item.published_at > acc[moduleId].latest) {
          acc[moduleId].latest = item.published_at;
        }
      });
      return acc;
    },
    {}
  );

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" gutterBottom>
          模块目录
        </Typography>
        <BilingualBlock
          zh="按模块浏览 UE5 版本更新，默认显示最新大版本条目。"
          en="Browse UE5 updates by module, showing the latest major version by default."
        />
        {latestBuild ? (
          <Card sx={{ marginTop: 2 }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="body1">
                  最近一次构建状态：{statusLabel(latestBuild.status)}
                </Typography>
                {latestBuild.incomplete_data ? (
                  <Typography variant="body2" color="warning.main">
                    数据可能不完整（截断/配额耗尽）。
                  </Typography>
                ) : null}
                <Typography variant="body2" color="text.secondary">
                  时间：{latestBuild.finished_at ?? latestBuild.started_at}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ) : null}
      </Box>
      <Grid container spacing={2}>
        {moduleSystems.map((module) => {
          const stats = moduleStats[module.id];
          const countLabel = stats ? `${stats.count} 条更新` : "更新数量待同步";
          const latestLabel = stats?.latest ? `最近更新 ${stats.latest}` : null;
          return (
            <Grid item xs={12} md={4} key={module.id}>
              <Card>
                <CardActionArea component={Link} to={`/module/${module.id}`}>
                  <CardContent>
                    <Stack spacing={1}>
                      <BilingualBlock zh={module.name_zh} en={module.name_en} />
                      <BilingualBlock
                        zh={module.description_zh}
                        en={module.description_en}
                        variant="body2"
                      />
                      <Chip label={countLabel} size="small" />
                      {latestLabel ? (
                        <Chip label={latestLabel} size="small" variant="outlined" />
                      ) : null}
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  );
};

export default ModuleDirectoryPage;
