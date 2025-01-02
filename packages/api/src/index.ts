import type { ListRequest } from 'entity';

import webAPIFetch from './fetch';
import type { Headers, Queries, RequestData } from './types';

export const isServerSide = typeof window === 'undefined';

export function convertListRequestToQueries(data: ListRequest): Queries {
  return {
    filter: data.filter,
    orderBy: data.orderBy,
    pageSize: data.pageSize ? `${data.pageSize}` : undefined,
    pageToken: data.pageToken,
  };
}

export async function fetch<Q, R>(requestData: RequestData<Q>): Promise<R> {
  const response = await webAPIFetch<Q, R>(requestData);

  return response;
}

export function modifyDefaultHeaders(
  headers?: Headers,
  isServer?: boolean
): Headers {
  const newHeaders: Headers = {};
  newHeaders['Accept-Encoding'] = 'gzip, deflate';
  newHeaders['Content-Type'] = 'application/json';

  if (headers) {
    Object.keys(headers).forEach((key) => {
      if (
        headers[key] &&
        (key.toLocaleLowerCase() !== 'authorization' || isServer)
      ) {
        newHeaders[key] = headers[key];
      }
    });
  }

  return newHeaders;
}

export function serializeQueries(queries?: Queries): string {
  if (!queries || Object.keys(queries).length === 0) {
    return '';
  }

  const encodedQueryString = Object.keys(queries).reduce((prev, curr) => {
    if (Array.isArray(queries[curr])) {
      return `${prev}${!!prev ? '&' : ''}${curr}=${encodeURIComponent(
        (queries[curr] as Array<string>).join(',')
      )}`;
    }

    if (!queries[curr]) {
      return prev;
    }

    return `${prev}${!!prev ? '&' : ''}${curr}=${encodeURIComponent(
      queries[curr] as string
    )}`;
  }, '');

  return encodedQueryString;
}
