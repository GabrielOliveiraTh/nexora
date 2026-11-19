import type { WSResponse, WSError } from '@appTypes/WSocket.type';

export function isWsError<T>(response: WSResponse<T>): response is WSError {
  return 'error' in response && response.error === true;
}

export function unwrapWsResponse<T>(response: WSResponse<T>): T {
  if (isWsError(response)) {
    throw new Error(`[WS ${response.code}] ${response.message}`);
  }
  return response.data;
}
