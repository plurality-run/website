import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4321',
    browserName: 'chromium',
    reducedMotion: 'reduce',
    launchOptions: process.env.CHROMIUM_EXECUTABLE_PATH
      ? {
          executablePath: process.env.CHROMIUM_EXECUTABLE_PATH,
          args: JSON.parse(process.env.CHROMIUM_ARGS || '[]'),
        }
      : {},
  },
  webServer: {
    // Exercise the portable static output, without keeping a framework server in memory.
    command: process.env.TEST_WORKERS
      ? 'npm run build && wrangler dev --local --ip 127.0.0.1 --port 4321'
      : 'npm run build && sirv dist --host 127.0.0.1 --port 4321',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      ASTRO_TELEMETRY_DISABLED: '1', RAYON_NUM_THREADS: '2',
      WRANGLER_SEND_METRICS: 'false',
      WORKERS_CI: '', WORKERS_CI_BRANCH: '', CF_PAGES_BRANCH: '',
    },
  },
});
