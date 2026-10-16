import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['./', 'projects/forge/', 'projects/davos/', '404.html'];

test('unknown URLs return an actual 404 with noindex', async ({ page }) => {
  const response = await page.goto('this-page-does-not-exist/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Lost in space.',
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, nofollow',
  );
});

async function expectNoOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
}

test('pages fit small phones, tablets, desktop and enlarged text', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator('h1')).toBeVisible();
    for (const width of [320, 390, 540, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await expectNoOverflow(page);
      await page.evaluate(
        () => (document.documentElement.style.fontSize = '200%'),
      );
      await expectNoOverflow(page);
      await page.evaluate(() =>
        document.documentElement.style.removeProperty('font-size'),
      );
    }
  }
  expect(errors).toEqual([]);
});

test('content and case navigation work without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Senior Software',
  );
  await page.getByRole('link', { name: /^Ankr Forge/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Ankr Forge.',
  );
  await page.getByRole('link', { name: 'Davos Protocol' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Davos Protocol.',
  );
  await page.getByRole('link', { name: 'Back to projects' }).first().click();
  await expect(page).toHaveURL(/#project-davos$/);
  await expect(page.locator('a[href^="mailto:"]')).toBeVisible();
  await context.close();
});

test('pages pass automated accessibility checks', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of routes) {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      results.violations,
      `${route}: ${JSON.stringify(results.violations)}`,
    ).toEqual([]);
  }
});

test('skip link and primary navigation work with the keyboard', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'Desktop keyboard scenario');
  await page.goto('./');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#hero')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'View projects' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#work$/);
  await page.getByRole('link', { name: /^Ankr Forge/ }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Ankr Forge.',
  );
});

test('motion respects live reduced-motion changes and stops offscreen', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const state = window as Window & { canvasDraws?: number };
    state.canvasDraws = 0;
    const clear = CanvasRenderingContext2D.prototype.clearRect;
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      state.canvasDraws = (state.canvasDraws ?? 0) + 1;
      return clear.apply(this, args);
    };
  });
  const draws = () =>
    page.evaluate(
      () => (window as Window & { canvasDraws?: number }).canvasDraws ?? 0,
    );
  const expectStill = () =>
    expect
      .poll(async () => {
        const count = await draws();
        await page.waitForTimeout(300);
        return (await draws()) - count;
      })
      .toBe(0);
  await page.goto('./');
  let before = await draws();
  await expect.poll(draws).toBeGreaterThan(before);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  // Media changes may trigger a final still redraw through ResizeObserver.
  await expectStill();
  before = await draws();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect.poll(draws).toBeGreaterThan(before);
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await expect(page.locator('.intro')).not.toBeInViewport();
  // IntersectionObserver delivery is asynchronous, particularly in WebKit.
  await expectStill();
});

test('CSS scene and content survive unavailable Canvas', async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await page.goto('./');
  await expect(page.locator('.cosmos-scene')).not.toHaveClass(/scene-ready/);
  await expect(page.locator('.static-stars')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('link', { name: 'View projects' }).click();
  await expect(page).toHaveURL(/#work$/);
});
