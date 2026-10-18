import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';
import { HtmlValidate } from 'html-validate';
import { base, indexable, siteUrl } from '../site.config.mjs';

const output = path.resolve('dist');
const validator = new HtmlValidate({
  extends: ['html-validate:recommended'],
  rules: {
    'void-style': 'off', // Astro serializes HTML void elements without XHTML slashes.
    'no-trailing-whitespace': 'off',
    'no-redundant-role': 'off', // role=list preserves Safari semantics after list-style:none.
  },
});

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(
    entries.map((entry) => {
      const file = path.join(directory, entry.name);
      return entry.isDirectory() ? filesIn(file) : [file];
    }),
  );
  return groups.flat();
}

const files = await filesIn(output);
const pages = new Map();
const titles = new Set();
const descriptions = new Set();
const expectedCanonicals = new Set();

for (const file of files.filter((file) => file.endsWith('.html'))) {
  const html = await readFile(file, 'utf8');
  const relative = path.relative(output, file).replaceAll(path.sep, '/');
  const report = await validator.validateString(html, relative);
  assert(
    report.valid,
    `${relative}: invalid HTML\n${JSON.stringify(
      report.results.flatMap((r) => r.messages),
      null,
      2,
    )}`,
  );
  const $ = load(html);
  const route = base + relative.replace(/index\.html$/, '');
  const is404 = relative === '404.html';
  const meta = (name) =>
    $(`meta[name="${name}"], meta[property="${name}"]`).attr('content');
  pages.set(route, $);

  assert.equal($('html').attr('lang'), 'en', `${route}: language`);
  assert.equal($('h1').length, 1, `${route}: exactly one h1`);
  assert.equal($('main').length, 1, `${route}: exactly one main`);
  assert.equal(
    $('meta[name="description"]').length,
    1,
    `${route}: one description`,
  );
  assert.equal($('title').length, 1, `${route}: one title`);
  assert(
    meta('viewport')?.includes('width=device-width'),
    `${route}: responsive viewport`,
  );
  const title = $('title').text().trim();
  const description = meta('description');
  assert(title.length >= 10 && title.length <= 70, `${route}: title length`);
  assert(
    description?.length >= 70 && description.length <= 180,
    `${route}: description length`,
  );
  assert(!titles.has(title), `${route}: duplicate title`);
  assert(!descriptions.has(description), `${route}: duplicate description`);
  titles.add(title);
  descriptions.add(description);
  assert.equal(meta('og:title'), title, `${route}: OG title`);
  assert.equal(meta('og:description'), description, `${route}: OG description`);
  assert.equal(
    meta('twitter:card'),
    'summary_large_image',
    `${route}: social card`,
  );
  assert.equal(
    meta('robots'),
    indexable && !is404
      ? 'index, follow, max-image-preview:large'
      : 'noindex, nofollow',
    `${route}: indexing policy`,
  );

  const ids = $('[id]')
    .toArray()
    .map((element) => $(element).attr('id'));
  assert.equal(new Set(ids).size, ids.length, `${route}: duplicate IDs`);
  let previousHeading = 0;
  $('h1,h2,h3,h4,h5,h6').each((_, element) => {
    const level = Number(element.tagName.slice(1));
    assert(level <= previousHeading + 1, `${route}: skipped heading level`);
    previousHeading = level;
  });
  $('[aria-labelledby], [aria-describedby]').each((_, element) => {
    for (const attribute of ['aria-labelledby', 'aria-describedby']) {
      for (const id of ($(element).attr(attribute) ?? '')
        .split(/\s+/)
        .filter(Boolean)) {
        assert(
          ids.includes(id),
          `${route}: missing accessible reference ${id}`,
        );
      }
    }
  });
  $('img').each((_, element) => {
    assert($(element).attr('alt') !== undefined, `${route}: image alt`);
    assert(
      $(element).attr('width') && $(element).attr('height'),
      `${route}: image dimensions`,
    );
  });
  if (siteUrl && !is404) {
    const canonical = new URL(route, siteUrl.origin).href;
    assert.equal(
      $('link[rel="canonical"]').length,
      1,
      `${route}: one canonical`,
    );
    assert.equal(
      $('link[rel="canonical"]').attr('href'),
      canonical,
      `${route}: canonical URL`,
    );
    assert.equal(meta('og:url'), canonical, `${route}: OG URL`);
    assert.equal(
      meta('og:image'),
      new URL('social-preview.png', siteUrl).href,
      `${route}: absolute social image`,
    );
    const data = JSON.parse($('script[type="application/ld+json"]').text());
    assert.equal(data['@context'], 'https://schema.org');
    for (const type of ['Person', 'WebSite', 'WebPage']) {
      assert(
        data['@graph'].some((node) => node['@type'] === type),
        `${route}: missing ${type}`,
      );
    }
    assert.equal(
      data['@graph'].find((node) => node['@type'] === 'WebPage').url,
      canonical,
    );
    if (route.includes('/projects/')) {
      const breadcrumb = data['@graph'].find(
        (node) => node['@type'] === 'BreadcrumbList',
      );
      assert.equal(
        breadcrumb?.itemListElement.at(-1).item,
        canonical,
        `${route}: breadcrumb URL`,
      );
    }
    if (indexable) expectedCanonicals.add(canonical);
  } else {
    assert.equal(
      $('link[rel="canonical"]').length,
      0,
      `${route}: no invented canonical`,
    );
  }
  assert(
    !/\b(?:lorem ipsum|TODO|example\.com)\b/i.test($('body').text()),
    `${route}: placeholder content`,
  );
}

// Resolve local links, fragments, styles and scripts against the emitted files.
for (const [route, $] of pages) {
  for (const element of $(
    'a[href], link[href], script[src], img[src], video[src], source[src]',
  ).toArray()) {
    const href = $(element).attr('href') ?? $(element).attr('src');
    assert(href && href !== '#', `${route}: empty link`);
    const url = new URL(href, `https://local.invalid${route}`);
    if (url.origin !== 'https://local.invalid') continue;
    assert(
      url.pathname.startsWith(base),
      `${route}: link escapes deployment base: ${href}`,
    );
    const relative = decodeURIComponent(url.pathname.slice(base.length));
    const file = path.resolve(
      output,
      relative,
      url.pathname.endsWith('/') ? 'index.html' : '',
    );
    assert(file.startsWith(output + path.sep), `${route}: invalid local path`);
    assert(
      (await stat(file).catch(() => null))?.isFile(),
      `${route}: missing target ${href}`,
    );
    if (url.hash) {
      const target = pages.get(url.pathname);
      assert(
        target &&
          target('[id]')
            .toArray()
            .some(
              (node) =>
                target(node).attr('id') ===
                decodeURIComponent(url.hash.slice(1)),
            ),
        `${route}: broken fragment ${href}`,
      );
    }
  }
  for (const video of $('video[poster]').toArray()) {
    const poster = new URL(
      $(video).attr('poster'),
      `https://local.invalid${route}`,
    );
    if (poster.origin !== 'https://local.invalid') continue;
    assert(
      poster.pathname.startsWith(base),
      `${route}: poster escapes deployment base`,
    );
    const file = path.resolve(
      output,
      decodeURIComponent(poster.pathname.slice(base.length)),
    );
    assert(file.startsWith(output + path.sep), `${route}: invalid poster path`);
    assert(
      (await stat(file).catch(() => null))?.isFile(),
      `${route}: missing video poster`,
    );
  }
}

const robots = await readFile(path.join(output, 'robots.txt'), 'utf8');
assert(
  robots.includes('User-agent: *\nAllow: /'),
  'Crawlers must be able to read page-level indexing directives.',
);
const sitemapFiles = files.filter((file) => /sitemap.*\.xml$/.test(file));
if (indexable) {
  assert(
    robots.includes(`Sitemap: ${new URL('sitemap-index.xml', siteUrl).href}`),
    'robots sitemap URL',
  );
  const locations = new Set();
  for (const file of sitemapFiles) {
    const $ = load(await readFile(file, 'utf8'), { xml: true });
    $('url > loc').each((_, element) => locations.add($(element).text()));
  }
  assert.deepEqual(
    locations,
    expectedCanonicals,
    'Sitemap must match all indexable pages and exclude 404.',
  );
} else {
  assert.equal(sitemapFiles.length, 0, 'Preview must not emit a sitemap.');
  assert(!robots.includes('Sitemap:'), 'Preview must not advertise a sitemap.');
}
const image = await readFile(path.join(output, 'social-preview.png'));
assert.equal(image.readUInt32BE(16), 1200, 'Social image width');
assert.equal(image.readUInt32BE(20), 630, 'Social image height');
assert(
  !files.some((file) =>
    /\/(concepts|versions|materials|roles|artifacts)\//.test(
      file.slice(output.length),
    ),
  ),
  'Draft sources leaked into the build.',
);
console.log(
  `Validated ${pages.size} pages: HTML, links, headings, metadata, JSON-LD, assets and ${indexable ? 'production sitemap' : 'preview noindex'}.`,
);
