import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  adapter: netlify(),
  trailingSlash: 'never',
  vite: {
    plugins: [tailwindcss()],
  },
  site: 'https://cs2-market.netlify.app',
});
