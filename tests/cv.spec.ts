import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { readCv } from '../src/data/cv';

test.use({ javaScriptEnabled: false });

test('CV is discoverable, readable and downloadable without JavaScript', async ({
  page,
  context,
  request,
}) => {
  const cv = await readCv();
  await page.goto('./');
  const link = page.getByRole('link', { name: 'View CV', exact: true });
  await expect(link).toHaveAttribute('href', /\/cv\/$/);
  await expect(link).not.toHaveAttribute('target', '_blank');
  await link.click();
  await expect(page).toHaveURL(/\/cv\/$/);
  expect(context.pages()).toHaveLength(1);
  await expect(page.locator('h1')).toContainText(cv.name);
  for (const section of cv.sections) {
    await expect(
      page.getByRole('heading', { name: section.title, exact: true }),
    ).toBeVisible();
    for (const block of section.blocks) {
      for (const text of block.kind === 'list' ? block.items : [block.text]) {
        await expect(page.locator('main')).toContainText(
          text.map((run) => run.text).join(''),
        );
      }
    }
  }
  const pdfLink = page.getByRole('link', { name: 'Download PDF' });
  const response = await request.get((await pdfLink.getAttribute('href'))!);
  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type']).toContain('application/pdf');
  const expectedPdf = await readFile('.generated/cv/cv.pdf');
  expect(await response.body()).toEqual(expectedPdf);
  const downloadPromise = page.waitForEvent('download');
  await pdfLink.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('Peter-Mikheev-CV.pdf');
  expect(await readFile((await download.path())!)).toEqual(expectedPdf);
  await page.getByRole('link', { name: 'Contact', exact: true }).click();
  await expect(page).toHaveURL(/\/#contact$/);
  await expect(page.locator('#contact')).toBeInViewport();
});

test('CV source links work without JavaScript and preserve their labels', async ({
  page,
  context,
}) => {
  const cv = await readCv();
  const sourceLinks = [
    ...cv.intro.flat(),
    ...cv.sections.flatMap(({ blocks }) =>
      blocks.flatMap((block) =>
        block.kind === 'list' ? block.items.flat() : block.text,
      ),
    ),
  ].filter((run) => run.href);
  await page.goto('cv/');
  const links = page.locator('.cv-intro a, .cv-section a');
  await expect(links).toHaveCount(sourceLinks.length);
  for (const [index, { text, href }] of sourceLinks.entries()) {
    await expect(links.nth(index)).toHaveText(text);
    await expect(links.nth(index)).toHaveAttribute('href', href!);
  }
  for (const link of await page
    .locator('.cv-intro a[target="_blank"], .cv-section a[target="_blank"]')
    .all()) {
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(link).toHaveAttribute('rel', /noreferrer/);
  }
  const external = page
    .locator('.cv-intro a[target="_blank"], .cv-section a[target="_blank"]')
    .first();
  if (await external.count()) {
    const href = (await external.getAttribute('href'))!;
    await context.route(href, (route) =>
      route.fulfill({
        contentType: 'text/html',
        body: '<title>CV link destination</title>',
      }),
    );
    const popupPromise = page.waitForEvent('popup');
    await external.click();
    const popup = await popupPromise;
    await expect(popup).toHaveURL(href);
    await expect(page).toHaveURL(/\/cv\/$/);
    await popup.close();
  }
  await expect(
    page.locator('.cv-intro a[href^="mailto:"]'),
  ).not.toHaveAttribute('target', '_blank');
  await expect(
    page.locator('.cv-intro a[href="https://themick0.com/"]'),
  ).not.toHaveAttribute('target', '_blank');
});
