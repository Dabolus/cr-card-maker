import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import { analyzer } from 'vite-bundle-analyzer';
import preload from 'vite-plugin-preload';
import { createHtmlPlugin } from 'vite-plugin-html';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    mkcert(),
    analyzer(),
    preload(),
    createHtmlPlugin({ minify: true }),
  ],
  esbuild: {
    legalComments: 'none',
  },
});
