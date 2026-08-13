// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';

import vercel from '@astrojs/vercel';

// [https://astro.build/config](https://astro.build/config)
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },

  output: 'server',
  adapter: vercel(),
  // Urutan penting: react() harus terdaftar sebelum keystatic()
  integrations: [react(), markdoc(), keystatic()],
});
