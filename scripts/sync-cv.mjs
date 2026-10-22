import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { load } from 'cheerio';
import { cvDocumentId } from '../cv.config.mjs';

const sectionHeading =
  /^(Summary|Profile|Technical Skills|Skills|Experience|Professional Experience|Work Experience|Education|Languages|Certifications|Projects)$/i;
const experienceHeading =
  /^(Experience|Professional Experience|Work Experience)$/i;

function linkDestination(value, unwrap = true) {
  if (!value || /[\u0000-\u001f\u007f]/.test(value)) return;
  try {
    const url = new URL(value.trim());
    if (
      ['https:', 'http:'].includes(url.protocol) &&
      ['www.google.com', 'google.com'].includes(url.hostname) &&
      url.pathname === '/url'
    ) {
      if (!unwrap) return;
      return linkDestination(
        url.searchParams.get('q') || url.searchParams.get('url'),
        false,
      );
    }
    if (
      !['https:', 'http:', 'mailto:', 'tel:'].includes(url.protocol) ||
      !url.pathname ||
      url.username ||
      url.password
    )
      return;
    return url.href;
  } catch {
    return;
  }
}

function plainText(runs) {
  return runs.map(({ text }) => text).join('');
}

function trimRuns(runs) {
  while (runs.length) {
    runs[0].text = runs[0].text.trimStart();
    if (runs[0].text) break;
    runs.shift();
  }
  while (runs.length) {
    runs.at(-1).text = runs.at(-1).text.trimEnd();
    if (runs.at(-1).text) break;
    runs.pop();
  }
  return runs;
}

// Retain text and safe links, without importing Google's markup or styles.
export function parseCvHtml(html) {
  const $ = load(html);
  $('script, style, template, noscript').remove();
  const lines = [];
  let runs = [];
  let listItem;
  let nextListItem = 0;
  const blockTags = new Set([
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'div',
    'section',
    'article',
    'header',
    'footer',
    'blockquote',
    'li',
    'ul',
    'ol',
    'table',
    'tr',
    'td',
    'th',
    'hr',
  ]);
  const flush = () => {
    trimRuns(runs);
    const text = plainText(runs);
    if (text && !/^[_─━-]{3,}$/.test(text)) {
      const previous = lines.at(-1);
      if (listItem !== undefined && previous?.listItem === listItem)
        previous.runs.push({ text: ' ' }, ...runs);
      else lines.push({ runs, bullet: listItem !== undefined, listItem });
    }
    runs = [];
  };
  const visit = (node, href) => {
    if (node.type === 'text') {
      let text = node.data.replace(/\s+/gu, ' ');
      const previous = runs.at(-1);
      if (previous?.text.endsWith(' ') && text.startsWith(' '))
        text = text.slice(1);
      if (!text) return;
      if (previous && previous.href === href) previous.text += text;
      else runs.push(href ? { text, href } : { text });
      return;
    }
    if (node.type !== 'tag') return;
    if (node.name === 'br') {
      flush();
      return;
    }
    const block = blockTags.has(node.name);
    if (block) flush();
    const parentListItem = listItem;
    if (node.name === 'li') listItem = nextListItem++;
    const destination =
      node.name === 'a' ? linkDestination(node.attribs.href) : href;
    for (const child of node.children) visit(child, destination);
    if (block) flush();
    listItem = parentListItem;
  };
  for (const child of $('body').contents().toArray()) visit(child);
  flush();

  const name = plainText(lines.shift()?.runs ?? []);
  const intro = [];
  const sections = [];
  let section;

  for (const line of lines) {
    const text = plainText(line.runs);
    if (sectionHeading.test(text) && !line.bullet) {
      section = { title: text, blocks: [] };
      sections.push(section);
    } else if (!section) {
      intro.push(line.runs);
    } else {
      const marker = text.match(/^[*•-]\s+/);
      if (marker) {
        let remaining = marker[0].length;
        for (const run of line.runs) {
          const length = Math.min(remaining, run.text.length);
          run.text = run.text.slice(length);
          remaining -= length;
          if (!remaining) break;
        }
        trimRuns(line.runs);
      }
      if (line.bullet || marker) {
        const previous = section.blocks.at(-1);
        if (previous?.kind === 'list') previous.items.push(line.runs);
        else section.blocks.push({ kind: 'list', items: [line.runs] });
      } else {
        section.blocks.push({
          kind:
            experienceHeading.test(section.title) && text.includes(' | ')
              ? 'heading'
              : 'paragraph',
          text: line.runs,
        });
      }
    }
  }

  if (
    !name ||
    name.length > 100 ||
    !intro.length ||
    !sections.some(
      ({ title, blocks }) => experienceHeading.test(title) && blocks.length,
    ) ||
    sections.some(({ blocks }) => !blocks.length)
  ) {
    throw new Error(
      'CV export is incomplete or its section headings are not recognized.',
    );
  }
  return { name, intro, sections };
}

async function fetchExport(format, fetchImpl) {
  const url = `https://docs.google.com/document/d/${cvDocumentId}/export?format=${format}`;
  let failure;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetchImpl(url, {
        signal: AbortSignal.timeout(20_000),
      });
      if (!response.ok)
        throw new Error(
          `CV ${format} export returned HTTP ${response.status}.`,
        );
      const mime = format === 'pdf' ? 'application/pdf' : 'text/html';
      if (
        !response.headers.get('content-type')?.toLowerCase().startsWith(mime)
      ) {
        throw new Error(`CV ${format} export did not return ${mime}.`);
      }
      const bytes = Buffer.from(await response.arrayBuffer());
      if (!bytes.length || bytes.length > 10 * 1024 * 1024) {
        throw new Error(`CV ${format} export has an unexpected size.`);
      }
      return bytes;
    } catch (error) {
      failure = error;
      if (attempt < 2) await delay(500 * (attempt + 1));
    }
  }
  throw failure;
}

export async function syncCv({
  outputDirectory = '.generated/cv',
  fetchImpl = fetch,
} = {}) {
  const [html, pdf] = await Promise.all([
    fetchExport('html', fetchImpl),
    fetchExport('pdf', fetchImpl),
  ]);
  const content = parseCvHtml(html.toString('utf8'));
  if (
    pdf.subarray(0, 5).toString() !== '%PDF-' ||
    !pdf.includes(Buffer.from('%%EOF'))
  ) {
    throw new Error('CV PDF export is not a complete PDF file.');
  }
  // Validate both exports before replacing the local snapshot. A failed sync
  // stops the build, so incomplete or stale exports cannot be published.
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(
    path.join(outputDirectory, 'content.json'),
    JSON.stringify(content, null, 2) + '\n',
  );
  await writeFile(path.join(outputDirectory, 'cv.pdf'), pdf);
  console.log(
    `Synced CV: ${content.sections.length} sections and ${pdf.length} PDF bytes.`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  await syncCv();
}
