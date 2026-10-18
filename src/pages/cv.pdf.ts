import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';

export const GET: APIRoute = async () =>
  new Response(new Uint8Array(await readFile('.generated/cv/cv.pdf')), {
    headers: { 'Content-Type': 'application/pdf' },
  });
