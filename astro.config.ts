import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { base, indexable, siteUrl } from './site.config.mjs';

export default defineConfig({
  output: 'static',
  site: siteUrl?.origin,
  base,
  trailingSlash: 'always',
  integrations: indexable
    ? [sitemap({ filter: (page) => !page.endsWith('/404/') })]
    : [],
  devToolbar: { enabled: false },
});
