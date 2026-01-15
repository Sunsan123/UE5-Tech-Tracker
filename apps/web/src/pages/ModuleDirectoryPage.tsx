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

const modules = [
  {
    key: "lumen",
    nameZh: "Lumen 全局光照",
    nameEn: "Lumen Global Illumination",
    count: 128
  },
  {
    key: "nanite",
    nameZh: "Nanite 虚拟几何",
    nameEn: "Nanite Virtualized Geometry",
    count: 92
  },
  {
    key: "rendering",
    nameZh: "渲染总览",
    nameEn: "Rendering Overview",
    count: 210
  }
];

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
        {modules.map((module) => (
          <Grid item xs={12} md={4} key={module.key}>
            <Card>
              <CardActionArea component={Link} to={`/module/${module.key}`}>
                <CardContent>
                  <Stack spacing={1}>
                    <BilingualBlock zh={module.nameZh} en={module.nameEn} />
                    <Chip label={`${module.count} 条更新`} size="small" />
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

export default ModuleDirectoryPage;
