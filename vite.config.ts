import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import { analyzer } from 'vite-bundle-analyzer';
import preload from 'vite-plugin-preload';
import { createHtmlPlugin } from 'vite-plugin-html';
import { VitePWA } from 'vite-plugin-pwa';
import { sitemap } from './vite-plugins/sitemap';
import packageJson from './package.json' with { type: 'json' };
import type { WebSite } from 'schema-dts';

process.env.VITE_APP_VERSION = packageJson.version;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    mkcert(),
    preload(),
    createHtmlPlugin({
      inject: {
        data: {
          linkedData: JSON.stringify({
            '@context': 'http://schema.org/',
            '@type': 'WebSite',
            url: 'https://clashroyalecardmaker.com',
            image: 'https://clashroyalecardmaker.com/icons/any-512x512.png',
            name: 'Clash Royale Card Maker',
            description:
              'Welcome to Clash Royale Card Maker! With this simple tool you can create your own custom Clash Royale cards!',
            author: [
              {
                '@type': 'Person',
                url: 'https://giorgio.garasto.me',
                image: 'https://giorgio.garasto.me/images/propic-20220630.jpg',
                name: 'Dabolus',
                givenName: 'Giorgio',
                familyName: 'Garasto',
                gender: { '@type': 'GenderType', name: 'Male' },
                email: 'giorgio@garasto.me',
                nationality: { '@type': 'Country', name: 'IT' },
                description:
                  'Giorgio Garasto—also known as Dabolus—is an italian Software Engineer and Graphic Designer specialized in web development. He is mainly known for his very first published project, the Clash Royale Card Maker.',
                jobTitle: 'Software Engineer',
                worksFor: {
                  '@type': 'Organization',
                  name: 'Empatica',
                  address: 'Via Stendhal, 36, 20144 Milano MI, Italy',
                },
                sameAs: [
                  'https://www.linkedin.com/in/giorgiogarasto',
                  'https://github.com/Dabolus',
                  'https://x.com/Dabolus',
                  'https://fb.me/giorgio.garasto',
                  'https://t.me/Dabolus',
                ],
              },
            ],
          } satisfies WebSite & { '@context': string }),
        },
      },
      minify: {
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        collapseInlineTagWhitespace: true,
        keepClosingSlash: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        minifyCSS: true,
        minifyJS: true,
        processScripts: ['application/ld+json'],
      },
    }),
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
