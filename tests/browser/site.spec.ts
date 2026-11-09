import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const width of [320, 375, 768, 1280, 1440]) {
  test(`homepage is usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Connect your agents.Keep the history.');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const img of await page.locator('img').all()) {
      expect(await img.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
    }
    await page.getByRole('link', { name: 'Meet Plurality' }).click();
    await expect(page).toHaveURL(/#direction$/);
    await expect(page.getByRole('heading', { name: /One useful connection\.\s*Not a whole new stack\./ })).toBeVisible();
    expect(errors).toEqual([]);
    // No embedded frames yet; an in-page scan avoids an unnecessary second context.
    await expect(page.locator('iframe')).toHaveCount(0);
    const scan = await new AxeBuilder({ page }).setLegacyMode(true).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(scan.violations).toEqual([]);
  });
}

test('keyboard navigation starts with a working skip link', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test('all on-page anchors and local assets resolve', async ({ page, request }) => {
  await page.goto('/');
  const anchors = await page.locator('a[href]').evaluateAll((links) => links.map((link) => link.getAttribute('href')!));
  for (const href of anchors) {
    const url = new URL(href, 'http://127.0.0.1:4321');
    if (url.origin !== 'http://127.0.0.1:4321') continue;
    if (url.hash) expect(await page.locator(url.hash).count()).toBe(1);
    else expect((await request.get(url.pathname)).ok()).toBe(true);
  }
  const assets = await page.locator('img[src], link[rel="icon"], link[rel="apple-touch-icon"], link[rel="stylesheet"]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('src') || node.getAttribute('href')!));
  for (const asset of assets) expect((await request.get(asset)).ok()).toBe(true);
});

test('metadata, social image, and crawler files are present', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://plurality.run/');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Plurality/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://plurality.run/brand/social-card.png');
  const image = await request.get('/brand/social-card.png');
  expect(image.ok()).toBe(true);
  expect(image.headers()['content-type']).toContain('image/png');
  expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap: https://plurality.run/sitemap.xml');
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('<loc>https://plurality.run/</loc>');
  expect(sitemap).not.toContain('first-note');
});

test('starter draft and unpublished navigation do not appear', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('#updates')).toHaveCount(0);
  expect(await page.content()).not.toContain('starter draft');
  expect((await request.get('/updates/first-note/')).status()).toBe(404);
});

test('custom error page offers a working home link and is not indexable', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A connectionnot quite made.');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await page.getByRole('link', { name: 'Back to Plurality' }).click();
  await expect(page).toHaveURL('http://127.0.0.1:4321/');
});

test('homepage needs no client JavaScript or third-party requests', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const origins = new Set<string>();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));
  await page.goto('http://127.0.0.1:4321/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('script')).toHaveCount(0);
  expect([...origins]).toEqual(['http://127.0.0.1:4321']);
  await context.close();
});
