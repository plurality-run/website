import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isPublished } from '../src/lib/publication.ts';
import { site } from '../src/config/site.ts';

const now = new Date('2026-11-09T12:00:00Z');
const entry = (draft, date) => ({ data: { draft, published: new Date(date) } });

test('drafts never publish, even with a past date', () => {
  assert.equal(isPublished(entry(true, '2026-01-01'), now), false);
});
test('future entries stay unpublished', () => {
  assert.equal(isPublished(entry(false, '2099-01-01'), now), false);
});
test('explicitly published entries become eligible at the given UTC instant', () => {
  assert.equal(isPublished(entry(false, now), now), true);
  assert.equal(isPublished(entry(false, '2026-11-09T12:00:01Z'), now), false);
});
test('invalid dates are not published', () => {
  assert.equal(isPublished(entry(false, 'invalid'), now), false);
});
test('public site and external links use HTTPS', () => {
  for (const value of [site.url, ...Object.values(site.links)]) {
    assert.equal(new URL(value).protocol, 'https:');
  }
});
