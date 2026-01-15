import {
  AppBar,
  Box,
  Button,
  Container,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import useLanguageStore, { LanguageMode } from "../store/languageStore";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { label: "模块目录", path: "/" },
  { label: "全局搜索", path: "/search" },
  { label: "收藏", path: "/favorites" },
  { label: "日报", path: "/daily" },
  { label: "日志", path: "/logs" }
];

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const mode = useLanguageStore((state) => state.mode);
  const setMode = useLanguageStore((state) => state.setMode);

  const handleModeChange = (_: React.MouseEvent<HTMLElement>, value: LanguageMode | null) => {
    if (value) {
      setMode(value);
    }
  };

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar sx={{ gap: 2, flexWrap: "wrap" }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            UE5 Tech Tracker
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                color={location.pathname === item.path ? "primary" : "inherit"}
              >
                {item.label}
              </Button>
            ))}
          </Box>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={mode}
            onChange={handleModeChange}
            aria-label="language toggle"
          >
            <ToggleButton value="zh" aria-label="中文">
              中
            </ToggleButton>
            <ToggleButton value="en" aria-label="English">
              EN
            </ToggleButton>
            <ToggleButton value="both" aria-label="中文/英文">
              中/EN
            </ToggleButton>
          </ToggleButtonGroup>
        </Toolbar>
      </AppBar>
      <Container sx={{ flex: 1, py: 4 }}>{children}</Container>
    </Box>
  );
};

export default Layout;
