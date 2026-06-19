import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// `VITE_BASE` is provided by the GitHub Actions deploy workflow so the bundle
// can be hosted under `https://pierre-claisse.github.io/tuan-yuting/`.
// Locally it defaults to "/" so `npm run dev` works as expected.
const base = process.env.VITE_BASE ?? "/";

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  clearScreen: false,
  server: {
    strictPort: false,
  },
  envPrefix: ["VITE_"],
  build: {
    target: "chrome105",
  },
});
