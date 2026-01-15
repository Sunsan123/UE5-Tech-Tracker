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
import { moduleSystems } from "../data/config";

const ModuleDirectoryPage = () => {
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
      </Box>
      <Grid container spacing={2}>
        {moduleSystems.map((module) => {
          const countLabel =
            typeof module.item_count === "number"
              ? `${module.item_count} 条更新`
              : "更新数量待同步";
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
