import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

// The same settings are read by Astro and the post-build validator.
// Environment variables supplied by CI take precedence over the local .env.
if (existsSync('.env')) loadEnvFile('.env');

const url = process.env.SITE_URL?.trim();
const indexing = process.env.SITE_INDEXABLE ?? 'false';
if (!['true', 'false'].includes(indexing)) {
  throw new Error('SITE_INDEXABLE must be true or false.');
}
export const indexable = indexing === 'true';
export const siteUrl = url ? new URL(url) : undefined;

if (
  siteUrl &&
  (siteUrl.protocol !== 'https:' ||
    siteUrl.search ||
    siteUrl.hash ||
    siteUrl.username ||
    siteUrl.password)
) {
  throw new Error(
    'SITE_URL must be an HTTPS URL without credentials, query, or hash.',
  );
}
if (
  indexable &&
  (!siteUrl ||
    /(^|\.)(localhost|example\.(com|org|net)|invalid|test)$/.test(
      siteUrl.hostname,
    ) ||
    !siteUrl.hostname.includes('.') ||
    /^\d+\.\d+\.\d+\.\d+$/.test(siteUrl.hostname))
) {
  throw new Error('An indexable build needs a real public SITE_URL.');
}
if (siteUrl && !siteUrl.pathname.endsWith('/')) siteUrl.pathname += '/';
export const base = siteUrl?.pathname ?? '/';
