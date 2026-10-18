import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const activeSlide = (gallery: Locator) =>
  gallery.locator('[data-gallery-slide][aria-hidden="false"]');

async function installSlideshowClock(page: Page) {
  await page.clock.install();
  // Compositor scrolling uses real time; keep it separate from timer assertions.
  await page.addInitScript(() => {
    const scrollTo = Element.prototype.scrollTo;
    Element.prototype.scrollTo = function (
      x?: ScrollToOptions | number,
      y?: number,
    ) {
      const options = typeof x === 'number' ? { left: x, top: y } : x;
      Reflect.apply(scrollTo, this, [{ ...options, behavior: 'instant' }]);
    };
  });
}

test('gallery uses matching image dimensions and stable frames when browsing', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('projects/forge/');
  const gallery = page.getByRole('region', { name: 'Ankr Forge screenshots' });
  await expect(gallery).toHaveAttribute('data-ready', '');
  const viewport = gallery.locator('[data-gallery-viewport]');
  const initialFrame = await viewport.boundingBox();

  for (const [index, direction] of [
    [1, 'Next'],
    [2, 'Next'],
    [3, 'Next'],
    [4, 'Next'],
    [0, 'Next'],
    [4, 'Previous'],
    [3, 'Previous'],
    [2, 'Previous'],
    [1, 'Previous'],
    [0, 'Previous'],
  ] as const) {
    await gallery
      .getByRole('button', {
        name: `${direction} screenshot`,
      })
      .click();
    const slide = gallery.locator('[data-gallery-slide]').nth(index);
    await expect(slide).toHaveAttribute('aria-hidden', 'false');
    await expect
      .poll(() =>
        viewport.evaluate((el) => Math.round(el.scrollLeft / el.clientWidth)),
      )
      .toBe(index);
    await slide
      .locator('[data-gallery-image]')
      .evaluate((image: HTMLImageElement) => image.decode());
    const dimensions = await slide
      .locator('[data-gallery-image]')
      .evaluate((image: HTMLImageElement) => {
        const bounds = image.getBoundingClientRect();
        const frame = image.parentElement!.getBoundingClientRect();
        return {
          ratio: bounds.width / bounds.height,
          originalRatio: image.naturalWidth / image.naturalHeight,
          width: image.naturalWidth,
          height: image.naturalHeight,
          contained:
            bounds.left >= frame.left &&
            bounds.right <= frame.right &&
            bounds.top >= frame.top &&
            bounds.bottom <= frame.bottom,
        };
      });
    expect(dimensions.ratio).toBeCloseTo(dimensions.originalRatio, 2);
    expect(dimensions.width).toBe(1600);
    expect(dimensions.height).toBe(900);
    expect(dimensions.contained).toBe(true);
    expect((await viewport.boundingBox())!.height).toBeCloseTo(
      initialFrame!.height,
      0,
    );
  }
});

test('enlargement has no toolbar and a second click returns to the gallery', async ({
  page,
  context,
  isMobile,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('projects/forge/');
  const gallery = page.getByRole('region', { name: 'Ankr Forge screenshots' });
  await gallery.getByRole('button', { name: 'Next screenshot' }).click();
  await gallery
    .getByRole('button', { name: 'Enlarge screenshot: Partner campaign' })
    .click();
  const dialog = page.getByRole('dialog', { name: 'Ankr Forge screenshots' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  await expect(dialog.getByRole('button')).toHaveCount(0);
  await expect(page).toHaveURL(/\/projects\/forge\/$/);
  expect(context.pages()).toHaveLength(1);
  expect(
    await page.locator('main').evaluate((el) => Boolean(el.closest('[inert]'))),
  ).toBe(true);

  const image = dialog.locator(
    '.pswp__item[aria-hidden="false"] img.pswp__img:not(.pswp__img--placeholder)',
  );
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute('alt', /Ankr partner campaign/);

  const accessibility = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(accessibility.violations).toEqual([]);
  if (isMobile) await image.tap();
  else await image.click();
  await expect(dialog).toHaveCount(0);
  await expect(activeSlide(gallery)).toHaveAttribute('aria-label', /^2 of 5:/);
  await expect(
    gallery.getByRole('button', {
      name: 'Enlarge screenshot: Partner campaign',
    }),
  ).toBeFocused();
  expect(
    await page.locator('main').evaluate((el) => Boolean(el.closest('[inert]'))),
  ).toBe(false);
  expect(
    await page.locator('html').evaluate((el) => el.style.overflow),
  ).not.toBe('hidden');
});

test('gallery keyboard controls keep focus inside the viewer and Escape returns it', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'Desktop keyboard scenario');
  await page.goto('projects/forge/');
  const gallery = page.getByRole('region', { name: 'Ankr Forge screenshots' });
  const viewport = gallery.locator('[data-gallery-viewport]');
  await viewport.focus();
  await page.keyboard.press('End');
  await expect(activeSlide(gallery)).toHaveAttribute('aria-label', /^5 of 5:/);
  const enlarge = gallery.getByRole('button', {
    name: 'Enlarge screenshot: Linked social accounts',
  });
  await enlarge.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Ankr Forge screenshots' });
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab');
    expect(
      await dialog.evaluate((el) => el.contains(document.activeElement)),
    ).toBe(true);
  }
  // Exercise the arrow keys once the opening transition has completed.
  await page.waitForTimeout(350);
  const image = dialog
    .locator('.pswp__item[aria-hidden="false"] img.pswp__img')
    .last();
  await page.keyboard.press('ArrowRight');
  await expect(image).toHaveAttribute('alt', /Ankr Forge interface/);
  await page.keyboard.press('ArrowLeft');
  await expect(image).toHaveAttribute('alt', /Linked social accounts panel/);
  await page.keyboard.press('ArrowLeft');
  await expect(image).toHaveAttribute('alt', /Ankr account panel/);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(
    gallery.getByRole('button', {
      name: 'Enlarge screenshot: Ankr account',
    }),
  ).toBeFocused();
});

test('slideshow advances every five seconds, loops and stops after manual interaction', async ({
  page,
}) => {
  await installSlideshowClock(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('projects/forge/');
  const gallery = page.locator('[data-project-gallery]');
  const viewport = gallery.locator('[data-gallery-viewport]');
  await expect(gallery).toHaveAttribute('data-ready', '');
  await viewport.scrollIntoViewIfNeeded();
  await expect(viewport).toBeInViewport({ ratio: 0.9 });
  await page.clock.runFor(200);
  for (const expected of [2, 3, 4, 5, 1]) {
    await page.clock.runFor(5200);
    await expect(activeSlide(gallery)).toHaveAttribute(
      'aria-label',
      new RegExp(`^${expected} of 5:`),
    );
  }
  await gallery.getByRole('button', { name: 'Next screenshot' }).click();
  await expect(activeSlide(gallery)).toHaveAttribute('aria-label', /^2 of 5:/);
  await page.mouse.move(0, 0);
  await page.clock.runFor(6000);
  await expect(activeSlide(gallery)).toHaveAttribute('aria-label', /^2 of 5:/);
});

test('slideshow pauses on hover and stays still with reduced motion', async ({
  page,
  isMobile,
}) => {
  await installSlideshowClock(page);
  await page.goto('projects/forge/');
  const gallery = page.locator('[data-project-gallery]');
  const viewport = gallery.locator('[data-gallery-viewport]');
  await expect(gallery).toHaveAttribute('data-ready', '');
  await viewport.scrollIntoViewIfNeeded();
  if (!isMobile) {
    await viewport.hover();
    await page.clock.runFor(6000);
    await expect(activeSlide(gallery)).toHaveAttribute(
      'aria-label',
      /^1 of 5:/,
    );
    await page.mouse.move(0, 0);
    await page.clock.runFor(5200);
    await expect(activeSlide(gallery)).toHaveAttribute(
      'aria-label',
      /^2 of 5:/,
    );
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const current = await activeSlide(gallery).getAttribute('aria-label');
  await page.clock.runFor(6000);
  await expect(activeSlide(gallery)).toHaveAttribute('aria-label', current!);
});

test('all screenshots remain browsable without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  for (const [route, count] of [
    ['projects/forge/', 5],
    ['projects/neuraverse/', 8],
  ] as const) {
    await page.goto(route);
    const viewport = page.locator('[data-gallery-viewport]');
    const images = page.locator('[data-gallery-image]');
    await expect(images).toHaveCount(count);
    if (route.includes('neuraverse')) {
      await expect(page.locator('video')).toHaveAttribute('controls', '');
      await expect(page.locator('video')).toHaveAttribute('preload', 'none');
    }
    await viewport.evaluate((el) => {
      el.scrollLeft = el.scrollWidth;
    });
    await expect(images.last()).toBeInViewport();
    await expect(page.locator('[data-gallery-controls]').first()).toBeHidden();
  }
  await context.close();
});

test('reduced motion keeps video playback manual and pauses on navigation', async ({
  page,
  isMobile,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const mediaResponses: string[] = [];
  page.on('response', (response) => {
    // WebKit reports a synthetic status-0 response before any bytes are fetched.
    if (
      response.url().endsWith('neuraverse-gameplay.mp4') &&
      response.status() > 0
    )
      mediaResponses.push(response.url());
  });
  await page.goto('projects/neuraverse/', { waitUntil: 'networkidle' });
  const gallery = page.getByRole('region', { name: 'Neuraverse media' });
  const video = gallery.locator('video');
  await expect(gallery.locator('[data-gallery-slide]')).toHaveCount(9);
  await expect(gallery.locator('[data-gallery-image]')).toHaveCount(8);
  await expect(activeSlide(gallery)).toHaveAttribute(
    'aria-label',
    /^1 of 9: Gameplay video/,
  );
  expect(mediaResponses).toEqual([]);
  expect(await video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);
  expect(
    await video.evaluate((el: HTMLVideoElement) => el.buffered.length),
  ).toBe(0);
  await video.scrollIntoViewIfNeeded();
  await video.evaluate((el: HTMLVideoElement) => el.play());
  await expect
    .poll(() => video.evaluate((el: HTMLVideoElement) => el.currentTime))
    .toBeGreaterThan(0);
  expect(await video.evaluate((el: HTMLVideoElement) => el.videoWidth)).toBe(
    1920,
  );
  if (!isMobile) {
    await video.evaluate((el: HTMLVideoElement) => el.pause());
    const position = await video.evaluate(
      (el: HTMLVideoElement) => el.currentTime,
    );
    await video.focus();
    await page.keyboard.press('ArrowRight');
    await expect(activeSlide(gallery)).toHaveAttribute(
      'aria-label',
      /^2 of 9:/,
    );
    expect(
      await video.evaluate((el: HTMLVideoElement) => el.currentTime),
    ).toBeCloseTo(position, 1);
    await page.keyboard.press('ArrowLeft');
    await expect(activeSlide(gallery)).toHaveAttribute(
      'aria-label',
      /^1 of 9:/,
    );
  }
  await gallery.getByRole('button', { name: 'Next slide' }).click();
  await expect(activeSlide(gallery)).toHaveAttribute(
    'aria-label',
    /^2 of 9: World map/,
  );
  await expect
    .poll(() => video.evaluate((el: HTMLVideoElement) => el.paused))
    .toBe(true);
  await gallery.getByRole('button', { name: 'Previous slide' }).click();
  await expect(activeSlide(gallery)).toHaveAttribute('aria-label', /^1 of 9:/);
  expect(await video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);
});

test('video autoplays on page load without scrolling and respects slide navigation and manual pause', async ({
  page,
  browserName,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 390, height: 400 });
  const errors: string[] = [];
  const mediaResponses: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (
      response.url().endsWith('neuraverse-gameplay.mp4') &&
      response.status() > 0
    )
      mediaResponses.push(response.url());
  });
  await page.goto('projects/neuraverse/', { waitUntil: 'domcontentloaded' });
  const gallery = page.getByRole('region', { name: 'Neuraverse media' });
  const video = gallery.locator('video');
  const paused = () => video.evaluate((el: HTMLVideoElement) => el.paused);
  const scrollAway = () =>
    page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(video).toHaveAttribute('muted', '');
  await expect(video).toHaveAttribute('autoplay', '');
  await expect(video).not.toBeInViewport();
  await expect.poll(paused).toBe(false);
  // WebKit may defer native autoplay frames while the video is offscreen.
  if (browserName === 'webkit') await video.scrollIntoViewIfNeeded();
  await expect
    .poll(() => video.evaluate((el: HTMLVideoElement) => el.currentTime))
    .toBeGreaterThan(0.5);
  expect(mediaResponses.length).toBeGreaterThan(0);
  const position = await video.evaluate(
    (el: HTMLVideoElement) => el.currentTime,
  );
  await video.scrollIntoViewIfNeeded();
  await scrollAway();
  await expect(video).not.toBeInViewport();
  await expect.poll(paused).toBe(false);
  if (browserName === 'webkit') await video.scrollIntoViewIfNeeded();
  await expect
    .poll(() => video.evaluate((el: HTMLVideoElement) => el.currentTime))
    .toBeGreaterThan(position);

  await video.scrollIntoViewIfNeeded();
  await gallery.getByRole('button', { name: 'Next slide' }).click();
  await expect.poll(paused).toBe(true);
  await gallery.getByRole('button', { name: 'Previous slide' }).click();
  await video.scrollIntoViewIfNeeded();
  await expect.poll(paused).toBe(false);

  await video.evaluate((el: HTMLVideoElement) => el.pause());
  await expect.poll(paused).toBe(true);
  await scrollAway();
  await expect(video).not.toBeInViewport();
  await video.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  expect(await paused()).toBe(true);
  await gallery.getByRole('button', { name: 'Next slide' }).click();
  await gallery.getByRole('button', { name: 'Previous slide' }).click();
  expect(await paused()).toBe(true);

  await video.evaluate((el: HTMLVideoElement) => {
    void el.play().catch(() => {});
  });
  await expect.poll(paused).toBe(false);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(paused).toBe(true);
  await scrollAway();
  await expect(video).not.toBeInViewport();
  await video.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  expect(await paused()).toBe(true);
  expect(errors).toEqual([]);
});

test('blocked autoplay leaves native video controls usable', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 390, height: 400 });
  await page.addInitScript(() => {
    // Simulate a browser policy blocking both native and script-driven autoplay.
    Object.defineProperty(HTMLMediaElement.prototype, 'autoplay', {
      get: () => true,
      set: () => {},
      configurable: true,
    });
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      if (!this.hasAttribute('data-allow-play')) {
        return Promise.reject(
          new DOMException('Autoplay blocked', 'NotAllowedError'),
        );
      }
      return play.call(this);
    };
  });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('projects/neuraverse/');
  const video = page.locator('video');
  await video.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  expect(await video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);
  await expect(video).toHaveAttribute('controls', '');
  await video.evaluate((el: HTMLVideoElement) => {
    el.setAttribute('data-allow-play', '');
    return el.play();
  });
  await expect
    .poll(() => video.evaluate((el: HTMLVideoElement) => el.currentTime))
    .toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('mixed gallery enlarges the matching screenshot and restores its slide and focus', async ({
  page,
  isMobile,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('projects/neuraverse/');
  const gallery = page.getByRole('region', { name: 'Neuraverse media' });
  // Arrow keys work from the page before the gallery receives focus.
  await page.keyboard.press('ArrowLeft');
  await expect(activeSlide(gallery)).toHaveAttribute(
    'aria-label',
    /^9 of 9: Bridge interaction/,
  );
  const enlarge = gallery.getByRole('button', {
    name: 'Enlarge screenshot: Bridge interaction',
  });
  await enlarge.click();
  const dialog = page.getByRole('dialog', { name: 'Neuraverse media' });
  const image = dialog.locator(
    '.pswp__item[aria-hidden="false"] img.pswp__img:not(.pswp__img--placeholder)',
  );
  await expect(image).toHaveAttribute('alt', /character near the Bridge/);
  if (isMobile) {
    await image.tap();
    await expect(enlarge).toBeFocused();
  } else {
    await page.keyboard.press('ArrowRight');
    await expect(dialog.locator('video')).toBeVisible();
    await expect(activeSlide(gallery)).toHaveAttribute(
      'aria-label',
      /^1 of 9:/,
    );
    await page.keyboard.press('ArrowRight');
    await expect(image).toHaveAttribute('alt', /Neuraverse world map/);
    await page.keyboard.press('Escape');
    await expect(
      gallery.getByRole('button', { name: 'Enlarge screenshot: World map' }),
    ).toBeFocused();
    await expect(activeSlide(gallery)).toHaveAttribute(
      'aria-label',
      /^2 of 9: World map/,
    );
  }
  await expect(dialog).toHaveCount(0);
});

test('video enlarges in place, keeps its position and returns to the gallery', async ({
  page,
  isMobile,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('projects/neuraverse/');
  const gallery = page.getByRole('region', { name: 'Neuraverse media' });
  const video = page.locator('video');
  await video.scrollIntoViewIfNeeded();
  await video.evaluate(async (el: HTMLVideoElement) => {
    await el.play();
    el.currentTime = 12;
  });
  await expect
    .poll(() => video.evaluate((el: HTMLVideoElement) => el.seeking))
    .toBe(false);
  await expect
    .poll(() => video.evaluate((el: HTMLVideoElement) => el.currentTime))
    .toBeGreaterThanOrEqual(12);
  const enlarge = gallery.getByRole('button', {
    name: 'Enlarge gameplay video',
  });
  await enlarge.click();
  const dialog = page.getByRole('dialog', { name: 'Neuraverse media' });
  await expect(dialog.locator('video')).toBeVisible();
  await expect(video).toHaveCount(1);
  await expect
    .poll(() => video.evaluate((el: HTMLVideoElement) => el.paused))
    .toBe(false);
  expect(
    await video.evaluate((el: HTMLVideoElement) => el.currentTime),
  ).toBeGreaterThanOrEqual(12);

  if (!isMobile) {
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab');
      expect(
        await dialog.evaluate((el) => el.contains(document.activeElement)),
      ).toBe(true);
    }
    await video.evaluate((el: HTMLVideoElement) => el.pause());
    const position = await video.evaluate(
      (el: HTMLVideoElement) => el.currentTime,
    );
    await video.focus();
    await page.keyboard.press('ArrowRight');
    await expect(activeSlide(gallery)).toHaveAttribute(
      'aria-label',
      /^2 of 9:/,
    );
    expect(
      await video.evaluate((el: HTMLVideoElement) => el.currentTime),
    ).toBeCloseTo(position, 1);
    await dialog.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(dialog.locator('video')).toBeVisible();
    await page.keyboard.press('Escape');
  } else {
    await dialog.getByRole('button', { name: 'Close enlarged video' }).tap();
  }
  await expect(dialog).toHaveCount(0);
  await expect(gallery.locator('video')).toBeVisible();
  await expect(enlarge).toBeFocused();
  expect(
    await video.evaluate((el: HTMLVideoElement) => el.currentTime),
  ).toBeGreaterThanOrEqual(12);
});

test('touch swipes select a slide without opening the viewer', async ({
  page,
  context,
  browserName,
  isMobile,
}) => {
  test.skip(
    browserName !== 'chromium' || !isMobile,
    'Chromium touch input scenario',
  );
  await page.goto('projects/forge/');
  const viewport = page.locator('[data-gallery-viewport]');
  await viewport.scrollIntoViewIfNeeded();
  const bounds = (await viewport.boundingBox())!;
  const client = await context.newCDPSession(page);
  const start = bounds.x + bounds.width * 0.85;
  const end = bounds.x + bounds.width * 0.15;
  const y = bounds.y + bounds.height / 2;
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: start, y }],
  });
  for (let step = 1; step <= 8; step++) {
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: start + ((end - start) * step) / 8, y }],
    });
  }
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
  await expect(
    activeSlide(page.locator('[data-project-gallery]')),
  ).toHaveAttribute('aria-label', /^2 of 5:/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
