import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// @ts-ignore - no type declarations available for this plugin
import { miaodaDevPlugin } from "miaoda-sc-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), miaodaDevPlugin() as any],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 3000,
    headers: {
      "Cross-Origin-Embedder-Policy": "unsafe-none",
      "Cross-Origin-Opener-Policy": "unsafe-none",
    },
    proxy: {
      '/api': {
        target: 'http://localhost/hexacore',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost/hexacore',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/uploads/, ''),
      }
    }
  },
});
