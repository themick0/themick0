import type { APIRoute } from 'astro';
import { indexable, siteUrl } from '../../site.config.mjs';

export const GET: APIRoute = () => {
  const content =
    indexable && import.meta.env.PROD && siteUrl
      ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', siteUrl).href}\n`
      : 'User-agent: *\nAllow: /\n';
  // Preview pages remain crawlable so crawlers can read their noindex directives.
  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
