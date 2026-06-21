import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// The site is served at the root of the custom domain `https://duan.life`, so
// the base is "/". `VITE_BASE` remains an override hook in case hosting ever
// moves back to a subpath (e.g. a project page); locally it defaults to "/".
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
