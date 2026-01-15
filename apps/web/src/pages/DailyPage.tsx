import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import BilingualBlock from "../components/BilingualBlock";

const DailyPage = () => {
  return (
    <Stack spacing={3}>
      <Typography variant="h4">日报</Typography>
      <BilingualBlock
        zh="每日更新将按模块分组展示。"
        en="Daily updates will be grouped by module."
      />
      <Box>
        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="h6">Lumen</Typography>
              <Typography variant="body2">- 关键更新条目 1</Typography>
              <Typography variant="body2">- 关键更新条目 2</Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
};

export default DailyPage;
