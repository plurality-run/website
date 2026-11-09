import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cp, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

// Build in a disposable copy: a failed test must never leave a publishable fixture in the working tree.
test('Markdown publication and preview indexing work in real static builds', { timeout: 60_000 }, async () => {
  const scratch = await mkdtemp(join(tmpdir(), 'plurality-build-test-'));
  try {
    for (const name of ['src', 'public', 'package.json', 'astro.config.mjs', 'tsconfig.json']) {
      await cp(resolve(name), join(scratch, name), { recursive: true });
    }
    await symlink(resolve('node_modules'), join(scratch, 'node_modules'), 'dir');
    const fixture = join(scratch, 'src/content/updates/build-fixture.md');
    const body = (draft) => `---\ntitle: Publication test fixture\ndescription: Temporary build verification only.\npublished: 2000-01-01\nkind: news\ndraft: ${draft}\n---\n\n## A rendered Markdown heading\n\nContent fixture body.\n`;
    const build = (branch = 'main', platform = 'workers') => execFileSync(
      process.execPath, [resolve('node_modules/.bin/astro'), 'build'],
      {
        cwd: scratch,
        env: {
          ...process.env,
          WORKERS_CI: platform === 'workers' ? '1' : '',
          WORKERS_CI_BRANCH: platform === 'workers' ? branch : '',
          CF_PAGES_BRANCH: platform === 'pages' ? branch : '',
          ASTRO_TELEMETRY_DISABLED: '1', RAYON_NUM_THREADS: '2',
        },
        encoding: 'utf8', timeout: 20_000, stdio: 'pipe',
      },
    );
    const html = () => readFile(join(scratch, 'dist/index.html'), 'utf8');
    const article = join(scratch, 'dist/updates/build-fixture/index.html');
    await writeFile(fixture, body(true));
    build();
    assert.equal(existsSync(article), false);
    assert.doesNotMatch(await html(), /Publication test fixture/);

    await writeFile(fixture, body(false));
    build();
    assert.match(await html(), /Publication test fixture/);
    assert.match(await readFile(article, 'utf8'), /A rendered Markdown heading/);
    assert.match(await readFile(join(scratch, 'dist/sitemap.xml'), 'utf8'), /https:\/\/plurality.run\/updates\/build-fixture\//);
    assert.doesNotMatch(await html(), /noindex/);

    build('celie/preview-test');
    assert.match(await html(), /name="robots" content="noindex, nofollow"/);
    assert.match(await readFile(article, 'utf8'), /noindex, nofollow/);
    assert.equal(await readFile(join(scratch, 'dist/robots.txt'), 'utf8'), 'User-agent: *\nDisallow: /\n');
    assert.match(await html(), /rel="canonical" href="https:\/\/plurality.run\/"/);

    // Missing CI branch metadata must not accidentally make a preview indexable.
    build('');
    assert.match(await html(), /name="robots" content="noindex, nofollow"/);

    build('test/preview', 'pages');
    assert.match(await html(), /name="robots" content="noindex, nofollow"/);
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
});
