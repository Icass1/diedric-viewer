import { defineConfig } from "vite";
import tailwindcss from "tailwindcss";
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [viteSingleFile()],
  server: {
    host: "",
    port: 3000,
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  build: {
    cssCodeSplit: false,  // Merge CSS into a single file
    assetsInlineLimit: 100000000,  // Increase the limit to inline all assets
  }
});