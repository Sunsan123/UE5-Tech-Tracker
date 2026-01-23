import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const filePreviewPlugin = () => ({
  name: "file-preview",
  transformIndexHtml(html: string) {
    return html
      .replace(/\s*type="module"/g, "")
      .replace(/\s*crossorigin/g, "")
      .replace(/<link rel="modulepreload"[^>]*>/g, "");
  }
});

export default defineConfig({
  base: "./",
  plugins: [react(), filePreviewPlugin()],
  build: {
    outDir: "../../site",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        format: "iife",
        inlineDynamicImports: true
      }
    }
  },
  resolve: {
    alias: {
      "@": "/src"
    }
  }
});
