import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { HashRouter } from "react-router-dom";
import App from "./App";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1e3a8a"
    },
    background: {
      default: "#f5f7fb"
    }
  },
  typography: {
    fontFamily: "\"Inter\", \"Noto Sans SC\", system-ui, sans-serif"
  }
});

const mountApp = () => {
  let rootElement = document.getElementById("root");

  if (!rootElement) {
    const fallbackRoot = document.createElement("div");
    fallbackRoot.id = "root";
    const mountPoint = document.body ?? document.documentElement;
    mountPoint.appendChild(fallbackRoot);
    rootElement = fallbackRoot;
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <HashRouter>
          <App />
        </HashRouter>
      </ThemeProvider>
    </React.StrictMode>
  );
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountApp, { once: true });
} else {
  mountApp();
}
