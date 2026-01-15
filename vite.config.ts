import fs from 'node:fs';
import { resolve } from 'node:path';
import { URL, fileURLToPath } from 'node:url';
import process from 'node:process';
import VueI18n from '@intlify/unplugin-vue-i18n/vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import fg from 'fast-glob';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import Sitemap from 'vite-plugin-sitemap';
import Markdown from 'unplugin-vue-markdown/vite';
import { configDefaults } from 'vitest/config';

const baseUrl = process.env.BASE_URL ?? '/';
const hostname = process.env.HOSTNAME ?? 'https://next-tools.dev';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VueI18n({
      runtimeOnly: true,
      compositionOnly: true,
      fullInstall: true,
      strictMessage: false,
      include: [
        resolve(__dirname, 'locales/**')
      ]
    }),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        '@vueuse/core',
        'vue-i18n',
      ],
      vueTemplate: true,
      eslintrc: {
        enabled: true,
      },
    }),
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    vueJsx(),
    Markdown({ markdownItOptions: { html: true } }),
    VitePWA({
      registerType: 'prompt',
      strategies: 'generateSW',
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB
      },
      manifest: {
        name: 'Next-Tools',
        description: 'Next-Tools is a collection of useful tools for developers.',
        display: 'standalone',
        lang: 'zh-CN',
        start_url: `${baseUrl}?utm_source=pwa&utm_medium=pwa`,
        orientation: 'any',
        theme_color: '#F0F3F0',
        background_color: '#ffffff',
        icons: [
          {
            src: '/favicon-16x16.png',
            type: 'image/png',
            sizes: '16x16',
          },
          {
            src: '/favicon-32x32.png',
            type: 'image/png',
            sizes: '32x32',
          },
          {
            src: '/android-chrome-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/android-chrome-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
          // Non-maskable rounded icons provided for desktop "Add to desktop" (white rounded)
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
    Components({
      dirs: ['src/'],
      extensions: ['vue', 'md'],
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
    }),
    Sitemap({
      hostname,
      generateRobotsTxt: true,
      robots: [{ userAgent: '*', allow: '/' }],
      dynamicRoutes: (() => {
        const paths = ['/', '/about'];
        fg.sync('src/tools/*/index.ts').forEach((file) => {
          const content = fs.readFileSync(file, 'utf-8');
          const pathMatch = content.match(/path:\s*['"`]([^'"`]+)['"`]/);
          if (pathMatch?.[1])
            paths.push(pathMatch[1]);
        });
        return paths;
      })(),
    }),
  ],
  base: baseUrl,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(process.env.npm_package_version),
  },
  test: {
    exclude: [...configDefaults.exclude, '**/*.e2e.spec.ts'],
    passWithNoTests: true,
  },
  build: {
    target: 'esnext',
  },
  server: {
    host: '0.0.0.0',
  },
});
