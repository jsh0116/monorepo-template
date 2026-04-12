import { setupServer } from 'msw/node';
import type { HttpHandler } from 'msw';
import { beforeAll, afterEach, afterAll } from 'vitest';

type MswServerOptions = {
  /** Default handlers to apply across all tests */
  handlers?: HttpHandler[];
};

/**
 * Creates a shared MSW server with lifecycle hooks for Vitest.
 *
 * Usage in a test setup file (e.g., `vitest.setup.ts`):
 * ```ts
 * import { createMswServer } from 'testing/mocks';
 * import { handlers } from './mocks/handlers';
 *
 * createMswServer({ handlers });
 * ```
 *
 * Or use the returned server for per-test handler overrides:
 * ```ts
 * import { createMswServer } from 'testing/mocks';
 * import { http, HttpResponse } from 'msw';
 *
 * const server = createMswServer();
 *
 * test('override example', () => {
 *   server.use(
 *     http.get('/api/users', () => HttpResponse.json([]))
 *   );
 * });
 * ```
 */
export function createMswServer(options: MswServerOptions = {}) {
  const { handlers = [] } = options;
  const server = setupServer(...handlers);

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  return server;
}
