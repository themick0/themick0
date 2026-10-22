import { readFile } from 'node:fs/promises';

export type CvText = { text: string; href?: string }[];

type CvBlock =
  | { kind: 'paragraph' | 'heading'; text: CvText }
  | { kind: 'list'; items: CvText[] };

interface Cv {
  name: string;
  intro: CvText[];
  sections: { title: string; blocks: CvBlock[] }[];
}

export async function readCv(): Promise<Cv> {
  return JSON.parse(await readFile('.generated/cv/content.json', 'utf8'));
}
