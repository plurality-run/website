import type { APIRoute } from 'astro';
import { site } from '../config/site';
import { getPublishedUpdates } from '../lib/updates';

export const GET: APIRoute = async () => {
  const updates = await getPublishedUpdates();
  const paths = ['/', ...updates.map((update) => `/updates/${update.id}/`)];
  const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, (c) => `&#${c.charCodeAt(0)};`);
  const urls = paths.map((path) => `<url><loc>${escapeXml(new URL(path, site.url).href)}</loc></url>`);
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
