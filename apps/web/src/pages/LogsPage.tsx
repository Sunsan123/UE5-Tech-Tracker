import { Card, CardContent, Stack, Typography } from "@mui/material";
import BilingualBlock from "../components/BilingualBlock";

const LogsPage = () => {
  return (
    <Stack spacing={3}>
      <Typography variant="h4">构建日志</Typography>
      <BilingualBlock
        zh="展示最近一次构建状态与失败样例。"
        en="Show the latest build status and recent failure samples."
      />
      <Card>
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="body1">最近一次构建：成功</Typography>
            <Typography variant="body2" color="text.secondary">
              失败步骤：无
            </Typography>
            <Typography variant="body2">错误样例（前 20 条）：暂无</Typography>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default LogsPage;
