import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { cvDocumentId } from '../cv.config.mjs';

const sectionHeading =
  /^(Summary|Profile|Technical Skills|Skills|Experience|Professional Experience|Work Experience|Education|Languages|Certifications|Projects)$/i;
const experienceHeading =
  /^(Experience|Professional Experience|Work Experience)$/i;

// Plain-text export preserves paragraphs and bullets without importing Google CSS.
export function parseCvText(text) {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !/^[_─━-]{3,}$/.test(line));
  const name = lines.shift();
  const intro = [];
  const sections = [];
  let section;

  for (const line of lines) {
    if (sectionHeading.test(line)) {
      section = { title: line, blocks: [] };
      sections.push(section);
    } else if (!section) {
      intro.push(line);
    } else {
      const bullet = line.match(/^[*•-]\s+(.+)$/);
      if (bullet) {
        const previous = section.blocks.at(-1);
        if (previous?.kind === 'list') previous.items.push(bullet[1]);
        else section.blocks.push({ kind: 'list', items: [bullet[1]] });
      } else {
        section.blocks.push({
          kind:
            experienceHeading.test(section.title) && line.includes(' | ')
              ? 'heading'
              : 'paragraph',
          text: line,
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
      const mime = format === 'pdf' ? 'application/pdf' : 'text/plain';
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
  const [text, pdf] = await Promise.all([
    fetchExport('txt', fetchImpl),
    fetchExport('pdf', fetchImpl),
  ]);
  const content = parseCvText(text.toString('utf8'));
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
