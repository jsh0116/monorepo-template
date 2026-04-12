import { test as base, type Page } from '@playwright/test';

type AuthFixtureOptions = {
  /** Function to perform login and return any auth state */
  login: (page: Page) => Promise<void>;
};

/**
 * Creates Playwright test fixtures with pre-authenticated state.
 *
 * Usage:
 * ```ts
 * import { createAuthFixtures } from 'testing/playwright';
 *
 * const test = createAuthFixtures({
 *   login: async (page) => {
 *     await page.goto('/login');
 *     await page.fill('[name=email]', 'test@example.com');
 *     await page.fill('[name=password]', 'password');
 *     await page.click('button[type=submit]');
 *   },
 * });
 *
 * test('authenticated page', async ({ authedPage }) => {
 *   await authedPage.goto('/dashboard');
 * });
 * ```
 */
export function createAuthFixtures(options: AuthFixtureOptions) {
  return base.extend<{ authedPage: Page }>({
    authedPage: async ({ page }, use) => {
      await options.login(page);
      await use(page);
    },
  });
}
