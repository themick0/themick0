import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { parseCvHtml, syncCv } from './sync-cv.mjs';

const source = `<!doctype html><html><body>
  <p>Example Engineer</p>
  <p>Software Engineer</p>
  <p>Remote | UTC+7</p>
  <p>Summary</p>
  <p>Builds APIs &amp; interfaces.</p>
  <p>Experience</p>
  <p>Example Co | Engineer</p>
  <p>2023 – Present</p>
  <p>* Shipped a product.</p>
  <p>* Improved its performance.</p>
  <p>________________</p>
  <p>Education</p>
  <p>Example University</p>
  <p>Languages</p>
  <p>English</p>
</body></html>`;
const pdf = Buffer.from('%PDF-1.7\nExample export\n%%EOF\n');

function exportResponse(format, html = source, document = pdf) {
  return new Response(format === 'html' ? html : document, {
    headers: {
      'content-type':
        format === 'html' ? 'text/html; charset=utf-8' : 'application/pdf',
    },
  });
}

const textOf = (runs) => runs.map((run) => run.text).join('');
const linksOf = (runs) => runs.filter((run) => run.href);

test('HTML export retains content and produces semantic sections and lists', () => {
  const cv = parseCvHtml(source);
  assert.equal(cv.name, 'Example Engineer');
  assert.deepEqual(cv.intro.map(textOf), [
    'Software Engineer',
    'Remote | UTC+7',
  ]);
  assert.deepEqual(cv.sections[1], {
    title: 'Experience',
    blocks: [
      { kind: 'heading', text: [{ text: 'Example Co | Engineer' }] },
      { kind: 'paragraph', text: [{ text: '2023 – Present' }] },
      {
        kind: 'list',
        items: [
          [{ text: 'Shipped a product.' }],
          [{ text: 'Improved its performance.' }],
        ],
      },
    ],
  });
  assert.equal(textOf(cv.sections.at(-1).blocks[0].text), 'English');
  assert.equal(
    textOf(cv.sections[0].blocks[0].text),
    'Builds APIs & interfaces.',
  );
});

test('inline links retain labels, surrounding whitespace and distinct destinations', () => {
  const cv = parseCvHtml(
    source
      .replace(
        '<p>Remote | UTC+7</p>',
        `<p>
          <a href="mailto:engineer@example.com"><span>Email &amp; contact</span></a>
          | <a href="https://first.example/"><span>Profile</span></a>
          | <a href="https://second.example/">Profile</a><br>
          <a href="tel:+123456789">Call</a>
        </p>`,
      )
      .replace(
        '<p>Builds APIs &amp; interfaces.</p>',
        '<p>Builds <span> APIs </span><span> &amp; interfaces</span>.</p>',
      ),
  );
  assert.deepEqual(cv.intro.map(textOf), [
    'Software Engineer',
    'Email & contact | Profile | Profile',
    'Call',
  ]);
  assert.deepEqual(linksOf(cv.intro[1]), [
    { text: 'Email & contact', href: 'mailto:engineer@example.com' },
    { text: 'Profile', href: 'https://first.example/' },
    { text: 'Profile', href: 'https://second.example/' },
  ]);
  assert.deepEqual(linksOf(cv.intro[2]), [
    { text: 'Call', href: 'tel:+123456789' },
  ]);
  assert.equal(
    textOf(cv.sections[0].blocks[0].text),
    'Builds APIs & interfaces.',
  );
});

test('experience headings and native or manual bullets preserve inline links', () => {
  const cv = parseCvHtml(
    source
      .replace(
        '<p>Example Co | Engineer</p>',
        '<p><a href="https://company.example/"><span>Example Co</span></a> | Engineer</p>',
      )
      .replace(
        '<p>* Shipped a product.</p>\n  <p>* Improved its performance.</p>',
        `<ul>
          <li><p>Shipped a <a href="https://product.example/">product</a><br>with a dashboard.</p><p>Added tests.</p></li>
          <li><span>Improved its performance.</span></li>
        </ul>
        <p>• Added documentation.</p>
        <p>- Fixed bugs.</p>
        <p>* Reviewed changes.</p>`,
      ),
  );
  const [heading, date, bullets] = cv.sections[1].blocks;
  assert.equal(heading.kind, 'heading');
  assert.equal(textOf(heading.text), 'Example Co | Engineer');
  assert.deepEqual(linksOf(heading.text), [
    { text: 'Example Co', href: 'https://company.example/' },
  ]);
  assert.equal(textOf(date.text), '2023 – Present');
  assert.equal(bullets.kind, 'list');
  assert.deepEqual(bullets.items.map(textOf), [
    'Shipped a product with a dashboard. Added tests.',
    'Improved its performance.',
    'Added documentation.',
    'Fixed bugs.',
    'Reviewed changes.',
  ]);
  assert.deepEqual(linksOf(bullets.items[0]), [
    { text: 'product', href: 'https://product.example/' },
  ]);
  assert.equal(cv.sections[1].blocks.length, 3);
});

test('Google redirect links unwrap once without corrupting encoded query values', () => {
  const target = 'https://example.com/search?q=a%2Bb&ref=x%26y#result';
  const cv = parseCvHtml(
    source.replace(
      '<p>Remote | UTC+7</p>',
      `<p><a href="https://www.google.com/url?q=${encodeURIComponent(target)}&amp;sa=D">Search</a>
      | <a href="https://www.google.com/url?url=${encodeURIComponent('mailto:engineer@example.com')}">Email</a>
      | <a href="http://example.com/">HTTP</a></p>`,
    ),
  );
  assert.deepEqual(linksOf(cv.intro[1]), [
    { text: 'Search', href: target },
    { text: 'Email', href: 'mailto:engineer@example.com' },
    { text: 'HTTP', href: 'http://example.com/' },
  ]);
});

test('unsafe and unsupported links remain readable without importing executable content', () => {
  const unsafe = [
    'javascript:alert(1)',
    'data:text/html,unexpected',
    'file:///tmp/private.txt',
    '#bookmark',
    '/relative-path',
    '//example.com/',
    'https://www.google.com/url?q=javascript%3Aalert(1)',
  ];
  const cv = parseCvHtml(
    source.replace(
      '<p>Builds APIs &amp; interfaces.</p>',
      `<style>.hidden { color: red; }</style><script>unexpected()</script>
      <p>${unsafe.map((href, index) => `<a href="${href}" onclick="unexpected()">Label ${index}</a>`).join(' | ')} &lt;em&gt;literal&lt;/em&gt;</p>`,
    ),
  );
  const runs = cv.sections[0].blocks[0].text;
  assert.equal(
    textOf(runs),
    unsafe.map((_, index) => `Label ${index}`).join(' | ') +
      ' <em>literal</em>',
  );
  assert.deepEqual(linksOf(runs), []);
  assert.equal(JSON.stringify(cv).includes('unexpected'), false);
  assert.equal(cv.sections[0].blocks.length, 1);
});

test('empty or unrecognized exports cannot become a published CV', () => {
  for (const invalid of [
    '',
    '<html>Please sign in</html>',
    source.replace('Experience', 'Unrecognized heading'),
    source.replace('<p>English</p>', ''),
  ]) {
    assert.throws(() => parseCvHtml(invalid), /incomplete/);
  }
});

test('sync refreshes both files from the same configured document', async (t) => {
  const outputDirectory = await mkdtemp(path.join(os.tmpdir(), 'cv-sync-'));
  t.after(() => rm(outputDirectory, { recursive: true, force: true }));
  const requested = [];
  await syncCv({
    outputDirectory,
    fetchImpl: async (url) => {
      requested.push(new URL(url));
      return exportResponse(new URL(url).searchParams.get('format'));
    },
  });
  assert.equal(requested[0].pathname, requested[1].pathname);
  assert.deepEqual(
    new Set(requested.map((url) => url.searchParams.get('format'))),
    new Set(['html', 'pdf']),
  );
  assert.deepEqual(
    JSON.parse(
      await readFile(path.join(outputDirectory, 'content.json'), 'utf8'),
    ),
    parseCvHtml(source),
  );
  assert.deepEqual(await readFile(path.join(outputDirectory, 'cv.pdf')), pdf);
});

test('failed exports reject the build and preserve the previous snapshot', async (t) => {
  const outputDirectory = await mkdtemp(path.join(os.tmpdir(), 'cv-failure-'));
  t.after(() => rm(outputDirectory, { recursive: true, force: true }));
  await writeFile(
    path.join(outputDirectory, 'content.json'),
    'previous content',
  );
  await writeFile(path.join(outputDirectory, 'cv.pdf'), pdf);
  for (const invalid of [
    'invalid-pdf',
    'incomplete-html',
    'html-wrong-mime',
    'pdf-wrong-mime',
    'http-error',
  ]) {
    await assert.rejects(
      syncCv({
        outputDirectory,
        fetchImpl: async (url) => {
          const format = new URL(url).searchParams.get('format');
          if (invalid === 'http-error')
            return new Response('Unavailable', { status: 503 });
          if (
            (invalid === 'html-wrong-mime' && format === 'html') ||
            (invalid === 'pdf-wrong-mime' && format === 'pdf')
          )
            return new Response('<html>Sign in</html>', {
              headers: { 'content-type': 'text/plain' },
            });
          return exportResponse(
            format,
            invalid === 'incomplete-html' ? '' : source,
            invalid === 'invalid-pdf' ? Buffer.from('not a PDF') : pdf,
          );
        },
      }),
    );
    assert.equal(
      await readFile(path.join(outputDirectory, 'content.json'), 'utf8'),
      'previous content',
    );
    assert.deepEqual(await readFile(path.join(outputDirectory, 'cv.pdf')), pdf);
  }
});
