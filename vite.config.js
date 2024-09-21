import { defineConfig } from "vite";
import tailwindcss from "tailwindcss";
export default defineConfig({
  plugins: [],
  server: {
    host: "",
    port: 3000,
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
});