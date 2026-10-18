import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { parseCvText, syncCv } from './sync-cv.mjs';

const source =
  '\uFEFFExample Engineer\r\nSoftware Engineer\r\nRemote | UTC+7\r\nSummary\r\nBuilds APIs & interfaces.\r\nExperience\r\nExample Co | Engineer\r\n2023 – Present\r\n* Shipped a product.\r\n* Improved its performance.\r\n________________\r\nEducation\r\nExample University\r\nLanguages\r\nEnglish';
const pdf = Buffer.from('%PDF-1.7\nExample export\n%%EOF\n');

function exportResponse(format, text = source, document = pdf) {
  return new Response(format === 'txt' ? text : document, {
    headers: {
      'content-type':
        format === 'txt' ? 'text/plain; charset=utf-8' : 'application/pdf',
    },
  });
}

test('text export retains content and produces semantic sections and lists', () => {
  const cv = parseCvText(source);
  assert.equal(cv.name, 'Example Engineer');
  assert.deepEqual(cv.intro, ['Software Engineer', 'Remote | UTC+7']);
  assert.deepEqual(cv.sections[1], {
    title: 'Experience',
    blocks: [
      { kind: 'heading', text: 'Example Co | Engineer' },
      { kind: 'paragraph', text: '2023 – Present' },
      {
        kind: 'list',
        items: ['Shipped a product.', 'Improved its performance.'],
      },
    ],
  });
  assert.equal(cv.sections.at(-1).blocks[0].text, 'English');
  assert.equal(cv.sections[0].blocks[0].text, 'Builds APIs & interfaces.');
});

test('empty or unrecognized exports cannot become a published CV', () => {
  for (const invalid of [
    '',
    '<html>Please sign in</html>',
    source.replace('Experience', 'Unrecognized heading'),
  ]) {
    assert.throws(() => parseCvText(invalid), /incomplete/);
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
    new Set(['txt', 'pdf']),
  );
  assert.deepEqual(
    JSON.parse(
      await readFile(path.join(outputDirectory, 'content.json'), 'utf8'),
    ),
    parseCvText(source),
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
    'incomplete-text',
    'wrong-mime',
    'http-error',
  ]) {
    await assert.rejects(
      syncCv({
        outputDirectory,
        fetchImpl: async (url) => {
          const format = new URL(url).searchParams.get('format');
          if (invalid === 'http-error')
            return new Response('Unavailable', { status: 503 });
          if (invalid === 'wrong-mime')
            return new Response('<html>Sign in</html>', {
              headers: { 'content-type': 'text/html' },
            });
          return exportResponse(
            format,
            invalid === 'incomplete-text' ? '' : source,
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
