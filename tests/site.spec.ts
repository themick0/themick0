import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['./', 'projects/forge/', '404.html'];

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
    for (const expanded of route === './' ? [false, true] : [false]) {
      if (expanded)
        await page.getByRole('button', { name: 'More projects' }).click();
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
  await expect(page.locator('.project-list > li:visible')).toHaveCount(9);
  await expect(page.getByRole('button', { name: 'More projects' })).toHaveCount(
    0,
  );
  await page.getByRole('link', { name: /^Ankr Forge/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Ankr Forge.',
  );
  await expect(page.getByRole('link', { name: /^Neuraverse/ })).toHaveAttribute(
    'target',
    '_blank',
  );
  await page.getByRole('link', { name: 'Back to projects' }).first().click();
  await expect(page).toHaveURL(/#project-forge$/);
  await expect(page.locator('#project-davos a')).toHaveCount(0);
  await expect(page.locator('a[href^="mailto:"]')).toBeVisible();
  await context.close();
});

test('pages pass automated accessibility checks', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of routes) {
    await page.goto(route);
    for (const expanded of route === './' ? [false, true] : [false]) {
      if (expanded)
        await page.getByRole('button', { name: 'More projects' }).click();
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        results.violations,
        `${route}: ${JSON.stringify(results.violations)}`,
      ).toEqual([]);
    }
  }
});

test('More reveals the remaining projects without moving the page or losing keyboard focus', async ({
  page,
  isMobile,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  const rows = page.locator('.project-list > li:visible');
  const more = page.getByRole('button', { name: 'More projects' });
  await expect(rows).toHaveCount(3);
  await expect(more).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#project-swirl')).toBeHidden();

  if (!isMobile) {
    await page.locator('#project-mat-stake a').focus();
    await page.keyboard.press('Tab');
    await expect(more).toBeFocused();
  }
  await more.scrollIntoViewIfNeeded();
  const scrollBefore = await page.evaluate(() => scrollY);
  if (isMobile) await more.tap();
  else await page.keyboard.press('Enter');

  await expect(rows).toHaveCount(9);
  await expect(more).toBeHidden();
  await expect(page.locator('#project-swirl a')).toBeFocused();
  expect(
    Math.abs((await page.evaluate(() => scrollY)) - scrollBefore),
  ).toBeLessThan(5);
});

test('project anchors reveal hidden entries on arrival and hash changes', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./#project-inception-lrt');
  await expect(page.locator('#project-inception-lrt')).toBeInViewport();
  await expect(page.locator('.project-list > li:visible')).toHaveCount(9);

  await page.goto('./');
  await page.reload();
  await expect(page.locator('.project-list > li:visible')).toHaveCount(3);
  await page.evaluate(() => {
    location.hash = 'project-ankr-automate';
  });
  await expect(page.locator('#project-ankr-automate')).toBeInViewport();
  await expect(page.locator('.project-list > li:visible')).toHaveCount(9);
});

test('projects with websites open in a new tab and Forge keeps its case page', async ({
  page,
  context,
}) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'More projects' }).click();
  const forge = page.locator('#project-forge a');
  await expect(forge).toHaveAttribute('href', /\/projects\/forge\/$/);
  await expect(forge).not.toHaveAttribute('target', '_blank');

  const destinations = [
    ['neuraverse', 'https://neuraverse.neuraprotocol.io/'],
    ['mat-stake', 'https://matstake.io/'],
    ['swirl', 'https://swirlstake.com/'],
    ['staking-circle', 'https://www.stakingcircle.com/'],
    ['inception-lrt', 'https://www.inceptionlrt.com/'],
    ['ankr-staking', 'https://www.ankr.com/staking/'],
    ['ankr-automate', 'https://www.ankr.com/automate'],
  ];
  for (const [slug, url] of destinations) {
    const link = page.locator(`#project-${slug} a`);
    await expect(link).toHaveAttribute('href', url);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(link).toHaveAttribute('rel', /noreferrer/);
    await expect(link).toHaveAccessibleDescription('Opens in a new tab.');
  }

  await context.route('https://matstake.io/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<title>Project website</title>',
    }),
  );
  const originalUrl = page.url();
  const popupPromise = page.waitForEvent('popup');
  await page.locator('#project-mat-stake a').click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL('https://matstake.io/');
  await expect(page).toHaveURL(originalUrl);
  await popup.close();
  await forge.click();
  await expect(page).toHaveURL(/\/projects\/forge\/$/);
  expect(context.pages()).toHaveLength(1);
});

test('projects without websites have no navigation or interactive treatment', async ({
  page,
  context,
  isMobile,
}) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'More projects' }).click();
  const project = page.locator('#project-davos');
  await expect(project.getByRole('heading')).toHaveText('Davos Protocol');
  await expect(
    project.locator('a, button, [tabindex], .project-arrow, .project-link'),
  ).toHaveCount(0);
  await expect(project.locator('.project-row')).toHaveCSS('cursor', 'auto');
  const originalUrl = page.url();
  await project.click();
  await expect(page).toHaveURL(originalUrl);
  expect(context.pages()).toHaveLength(1);

  if (!isMobile) {
    await page.locator('#project-swirl a').focus();
    await page.keyboard.press('Tab');
    await expect(page.locator('#project-staking-circle a')).toBeFocused();
  }
});

test('projects without case studies do not generate detail pages', async ({
  page,
}) => {
  const response = await page.goto('projects/davos/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Lost in space.',
  );
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

test('star clusters react to scroll, animate only while visible and respect reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('./');
  await page.getByRole('button', { name: 'More projects' }).click();
  await page.locator('#project-davos').scrollIntoViewIfNeeded();
  const cluster = page.locator('.star-cluster-left');
  const sample = () =>
    cluster.evaluate((element) => ({
      position: getComputedStyle(element.querySelector('.star-layer')!)
        .transform,
      light: getComputedStyle(element.querySelector('.star-twinkle')!).opacity,
    }));
  const states = () =>
    cluster.evaluate((element) =>
      element
        .getAnimations({ subtree: true })
        .map((animation) => animation.playState),
    );
  const before = await sample();
  await expect
    .poll(async () => (await sample()).position)
    .not.toBe(before.position);
  await expect.poll(async () => (await sample()).light).not.toBe(before.light);

  const parallax = () =>
    cluster.evaluate((element) =>
      Array.from(
        element.querySelectorAll('.star-parallax'),
        (layer) => new DOMMatrix(getComputedStyle(layer).transform).m42,
      ),
    );
  await cluster.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    scrollTo({
      top: scrollY + bounds.top + bounds.height / 2 - innerHeight / 2,
      behavior: 'instant',
    });
  });
  await expect.poll(async () => (await parallax())[1]).toBeCloseTo(0, 1);
  await page.evaluate(() => scrollBy({ top: 200, behavior: 'instant' }));
  await expect.poll(async () => (await parallax())[1]).toBeGreaterThan(2);
  const [far, near] = await parallax();
  expect(far).toBeGreaterThan(0);
  expect(far).toBeLessThan(near);
  expect(near).toBeLessThanOrEqual(24);
  await page.evaluate(() => scrollBy({ top: -200, behavior: 'instant' }));
  await expect.poll(async () => (await parallax())[1]).toBeCloseTo(0, 1);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(states).toEqual([]);
  expect((await sample()).position).toBe('none');
  await page.evaluate(() => scrollBy({ top: 200, behavior: 'instant' }));
  expect(await parallax()).toEqual([0, 0]);

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect
    .poll(async () => (await states()).includes('running'))
    .toBe(true);
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await expect(cluster).not.toBeInViewport();
  await expect
    .poll(async () => {
      const animations = await states();
      return (
        animations.length > 0 && animations.every((state) => state === 'paused')
      );
    })
    .toBe(true);
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

test('opening comet tails follow their on-screen flight direction', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const frames: { x: number; y: number; angle: number }[][] = [];
    Object.assign(window, { cometFrames: frames });
    const clear = CanvasRenderingContext2D.prototype.clearRect;
    const gradient = CanvasRenderingContext2D.prototype.createLinearGradient;
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      if (this.canvas.classList.contains('meteorfield')) {
        frames.push([]);
        if (frames.length > 120) frames.shift();
      }
      return clear.apply(this, args);
    };
    CanvasRenderingContext2D.prototype.createLinearGradient = function (
      ...args
    ) {
      if (this.canvas.classList.contains('meteorfield')) {
        const transform = this.getTransform();
        frames.at(-1)?.push({
          x: transform.e,
          y: transform.f,
          angle: Math.atan2(transform.b, transform.a),
        });
      }
      return gradient.apply(this, args);
    };
  });
  await page.goto('./');
  const frames = () =>
    page.evaluate(() =>
      (
        (
          window as Window & {
            cometFrames?: { x: number; y: number; angle: number }[][];
          }
        ).cometFrames ?? []
      )
        .filter((frame) => frame.length === 3)
        .slice(0, 2),
    );
  await expect
    .poll(async () => (await frames()).length, { timeout: 10_000 })
    .toBe(2);
  const [before, after] = await frames();
  // The first two comets cross the screen; the third is the distant backdrop.
  for (let index = 0; index < 2; index++) {
    const dx = after[index].x - before[index].x;
    const dy = after[index].y - before[index].y;
    const distance = Math.hypot(dx, dy);
    expect(distance).toBeGreaterThan(0);
    const alignment =
      (dx * Math.cos(after[index].angle) + dy * Math.sin(after[index].angle)) /
      distance;
    expect(alignment).toBeLessThan(-0.999);
  }
});

test('mobile intro stays stable on height-only resize and adapts to rotation', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Mobile browser toolbar scenario');
  await page.goto('./');
  const intro = page.locator('.intro');
  const viewport = page.viewportSize()!;
  const height = await intro.evaluate((element) => element.clientHeight);
  const canvasHeight = await page
    .locator('.meteorfield')
    .getAttribute('height');

  // A height-only resize models browser chrome expanding or collapsing.
  await page.setViewportSize({ ...viewport, height: viewport.height + 100 });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  expect(await intro.evaluate((element) => element.clientHeight)).toBe(height);
  await expect(page.locator('.meteorfield')).toHaveAttribute(
    'height',
    canvasHeight!,
  );

  await page.setViewportSize({
    width: viewport.height,
    height: viewport.width,
  });
  await expect
    .poll(() =>
      page
        .locator('.home')
        .evaluate((element) =>
          parseFloat(
            (element as HTMLElement).style.getPropertyValue('--intro-height'),
          ),
        ),
    )
    .toBe(viewport.width - (viewport.height < 768 ? 96 : 112));
  await expectNoOverflow(page);

  // Crossing the compact desktop height threshold must not reflow a touch layout.
  const landscapeWidth = Math.max(viewport.height + 100, 844);
  await page.setViewportSize({ width: landscapeWidth, height: 640 });
  await expect
    .poll(() =>
      page
        .locator('.home')
        .evaluate((element) =>
          parseFloat(
            (element as HTMLElement).style.getPropertyValue('--intro-height'),
          ),
        ),
    )
    .toBe(640 - 112);
  const landscapeHeight = await intro.evaluate(
    (element) => element.clientHeight,
  );
  await page.setViewportSize({ width: landscapeWidth, height: 740 });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  expect(await intro.evaluate((element) => element.clientHeight)).toBe(
    landscapeHeight,
  );
});
