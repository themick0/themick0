import { readFile } from 'node:fs/promises';

type CvBlock =
  | { kind: 'paragraph' | 'heading'; text: string }
  | { kind: 'list'; items: string[] };

interface Cv {
  name: string;
  intro: string[];
  sections: { title: string; blocks: CvBlock[] }[];
}

export async function readCv(): Promise<Cv> {
  return JSON.parse(await readFile('.generated/cv/content.json', 'utf8'));
}
