import { readFile, copyFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { site } from '../src/config/site.ts';

const asset = (name) => new URL(`../public/brand/${name}`, import.meta.url);
const root = new URL('../', import.meta.url);
const browser = await chromium.launch({
  ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}),
});
try {
  const page = await browser.newPage({ deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const symbol = await readFile(asset('favicon.svg'), 'utf8');
  for (const [size, name] of [[32, 'favicon-32.png'], [180, 'apple-touch-icon.png']]) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<style>html,body{margin:0;width:100%;height:100%}svg{width:100%;height:100%;display:block}</style>${symbol}`);
    await page.screenshot({ path: asset(name).pathname });
  }
  const tokens = await readFile(new URL('src/styles/tokens.css', root), 'utf8');
  const logo = await readFile(asset('plurality-lockup.svg'), 'utf8');
  const font = async (weight) => (await readFile(new URL(`node_modules/@fontsource/source-sans-3/files/source-sans-3-latin-${weight}-normal.woff2`, root))).toString('base64');
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(`<!doctype html><html lang="en"><meta charset="utf-8"><style>
    ${tokens}
    @font-face{font-family:'Source Sans 3';src:url(data:font/woff2;base64,${await font(400)}) format('woff2');font-weight:400}
    @font-face{font-family:'Source Sans 3';src:url(data:font/woff2;base64,${await font(600)}) format('woff2');font-weight:600}
    *{box-sizing:border-box}body{margin:0;width:1200px;height:630px;padding:48px 64px;background:radial-gradient(ellipse at 100% 0%,var(--color-rose-soft),transparent 70%),var(--color-paper);color:var(--color-ink);font-family:var(--font-body)}
    header{display:flex;align-items:center;justify-content:space-between}header svg{height:78px;width:auto}header span{font-size:17px;letter-spacing:2px;border-left:4px solid var(--color-rose);padding-left:14px}
    h1{font-size:84px;line-height:1.07;letter-spacing:-3px;font-weight:600;margin:53px 0 25px}h1 span{background:linear-gradient(transparent 82%,var(--color-copper) 82%,var(--color-copper) 95%,transparent 95%)}
    p{font-size:25px;margin:0;color:var(--color-muted)}footer{margin-top:46px;padding-top:20px;border-top:1px solid var(--color-line);font-size:21px}
    </style><body><header>${logo}<span>EARLY DEVELOPMENT</span></header><h1>Connect your agents.<br><span>Keep the history.</span></h1><p>Open infrastructure. Practical services.</p><footer>${new URL(site.url).host}</footer></body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: asset('social-card.png').pathname });
  await copyFile(new URL('node_modules/@fontsource/source-sans-3/LICENSE', root), asset('source-sans-3-LICENSE.txt'));
} finally {
  await browser.close();
}
