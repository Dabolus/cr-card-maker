import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import { analyzer } from 'vite-bundle-analyzer';
import preload from 'vite-plugin-preload';
import { createHtmlPlugin } from 'vite-plugin-html';
import { VitePWA } from 'vite-plugin-pwa';
import { sitemap } from './vite-plugins/sitemap';
import packageJson from './package.json' with { type: 'json' };

process.env.VITE_APP_VERSION = packageJson.version;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    mkcert(),
    preload(),
    createHtmlPlugin({ minify: true }),
    sitemap(),
    VitePWA({
      // Don't inject register, as we will do it ourselves
      injectRegister: false,
      // We will update the service worker after prompting the user, not automatically
      registerType: 'prompt',
      // We will have a custom service worker, where we will inject the installation manifest
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      // We will create our own site.webmanifest
      manifest: false,
      injectManifest: {
        rollupFormat: 'es',
        sourcemap: true,
        globPatterns: [
          '**/*.{webmanifest,js,html,json,wasm,woff2,css,txt,xml,svg,png,jpg,jpeg,gif,ico,webp,jxl,mp4,webm,ogg,mp3,opus}',
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
    analyzer(),
  ],
  esbuild: {
    legalComments: 'none',
  },
});
