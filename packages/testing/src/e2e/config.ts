import { defineConfig, type PlaywrightTestConfig } from '@playwright/test';

type CreatePlaywrightConfigOptions = {
  /** Base URL for the app under test (default: http://localhost:3000) */
  baseURL?: string;
  /** Test directory relative to consuming project root */
  testDir?: string;
  /** Additional Playwright config overrides */
  overrides?: PlaywrightTestConfig;
};

/**
 * Creates a shared Playwright config with sensible defaults.
 *
 * Usage in consuming app's `playwright.config.ts`:
 * ```ts
 * import { createPlaywrightConfig } from 'testing/playwright';
 * export default createPlaywrightConfig({ baseURL: 'http://localhost:3000' });
 * ```
 */
export function createPlaywrightConfig(
  options: CreatePlaywrightConfigOptions = {},
) {
  const {
    baseURL = 'http://localhost:3000',
    testDir = './e2e',
    overrides = {},
  } = options;

  return defineConfig({
    testDir,
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: process.env.CI ? 'github' : 'html',
    use: {
      baseURL,
      trace: 'on-first-retry',
      screenshot: 'only-on-failure',
    },
    projects: [
      {
        name: 'chromium',
        use: { browserName: 'chromium' },
      },
    ],
    ...overrides,
  });
}
