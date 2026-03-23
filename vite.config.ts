import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const appRoot = path.resolve(import.meta.dirname, "artifacts/bgis-tracker");

export default defineConfig({
  root: appRoot,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(appRoot, "src"),
      "@workspace/api-client-react": path.resolve(
        import.meta.dirname,
        "src/api-client.ts"
      ),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
