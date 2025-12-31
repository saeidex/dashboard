import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import tsConfigPaths from "vite-tsconfig-paths";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/apps/web",
  plugins: [
    dts({
      entryRoot: "src",
      tsconfigPath: path.join(__dirname, "tsconfig.json"),
    }),
    react(),
    tsConfigPaths(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    tailwindcss(),
  ],
  server: {
    proxy: {
      "/api": "http://localhost:9999",
    },
    warmup: {
      clientFiles: ["./src/components/**/*.{ts,tsx}"],
    },
    allowedHosts: [
      "colacobiotic-commentatorially-sharan.ngrok-free.dev",
    ],
  },
  preview: {
    allowedHosts: [
      "colacobiotic-commentatorially-sharan.ngrok-free.dev",
    ],
  },
  build: {
    // outDir: path.join(__dirname, "../api/public"),
    emptyOutDir: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
