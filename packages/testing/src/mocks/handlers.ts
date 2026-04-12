import { http, type HttpHandler, type JsonBodyType, HttpResponse } from 'msw';

export type ApiHandlerMap = Record<
  string,
  {
    method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
    body: JsonBodyType;
    status?: number;
  }
>;

/**
 * Creates MSW request handlers from a URL-to-response map.
 *
 * Usage:
 * ```ts
 * import { createMswHandlers } from 'testing/mocks';
 *
 * const handlers = createMswHandlers('/api', {
 *   '/users': { body: [{ id: 1, name: 'Alice' }] },
 *   '/users/1': { body: { id: 1, name: 'Alice' } },
 *   '/users': { method: 'post', body: { id: 2, name: 'Bob' }, status: 201 },
 * });
 * ```
 */
export function createMswHandlers(
  baseUrl: string,
  handlerMap: ApiHandlerMap,
): HttpHandler[] {
  return Object.entries(handlerMap).map(
    ([path, { method = 'get', body, status = 200 }]) => {
      const url = `${baseUrl}${path}`;
      return http[method](url, () => HttpResponse.json(body, { status }));
    },
  );
}
