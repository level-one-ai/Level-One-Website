import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the built site works whether it's served from a domain
  // root (custom domain / user page) or a subpath (GitHub Pages project page,
  // e.g. https://<user>.github.io/<repo>/).
  base: "./",
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  build: {
    outDir: "dist",
  },
});
