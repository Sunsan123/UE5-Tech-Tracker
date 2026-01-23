import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { useMemo } from "react";
import BilingualBlock from "../components/BilingualBlock";
import { moduleSystems, type ModuleSystem } from "../data/config";
import { dailyReport } from "../data/daily-reports";
import { indexItems, type IndexItem } from "../data/index-base";

const DailyPage = () => {
  const itemMap = useMemo(
    () => new Map<string, IndexItem>(indexItems.map((item) => [item.id, item])),
    []
  );
  const moduleMap = useMemo(
    () =>
      new Map<string, ModuleSystem>(moduleSystems.map((module) => [module.id, module])),
    []
  );

  return (
    <Stack spacing={3}>
      <Typography variant="h4">日报</Typography>
      <BilingualBlock
        zh="每日更新将按模块分组展示。"
        en="Daily updates will be grouped by module."
      />
      {!dailyReport.date ? (
        <Typography variant="body2" color="text.secondary">
          暂无可用日报，请先运行构建流水线生成数据。
        </Typography>
      ) : (
        <Typography variant="body2" color="text.secondary">
          最新日报日期：{dailyReport.date}
        </Typography>
      )}
      {dailyReport.modules.map((module) => {
        const moduleInfo = moduleMap.get(module.id);
        return (
          <Box key={module.id}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="h6">
                    {moduleInfo?.name_zh ?? module.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {moduleInfo?.name_en ?? module.id}
                  </Typography>
                  {module.items.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      当日无更新。
                    </Typography>
                  ) : null}
                  {module.items.map((item) => {
                    const indexItem = itemMap.get(item.id);
                    return (
                      <Typography key={item.id} variant="body2">
                        - {indexItem?.title_zh ?? item.title} · {item.version}
                      </Typography>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          </Box>
        );
      })}
    </Stack>
  );
};

export default DailyPage;
