import { describe, it, expect } from 'vitest';
import { isWsError, unwrapWsResponse } from '@helpers/socket/socket.helper';
import type { WSResponse } from '@appTypes/WSocket.type';

describe('socket.helper', () => {
  describe('isWsError', () => {
    it('returns true for error responses', () => {
      const response: WSResponse<string> = { error: true, code: 'ERR_001', message: 'Failed' };
      expect(isWsError(response)).toBe(true);
    });

    it('returns false for success responses', () => {
      const response: WSResponse<string> = { data: 'hello' };
      expect(isWsError(response)).toBe(false);
    });
  });

  describe('unwrapWsResponse', () => {
    it('extracts data from success responses', () => {
      const response: WSResponse<{ id: string }> = { data: { id: '123' } };
      expect(unwrapWsResponse(response)).toEqual({ id: '123' });
    });

    it('throws on error responses', () => {
      const response: WSResponse<string> = { error: true, code: 'ERR_001', message: 'Boom' };
      expect(() => unwrapWsResponse(response)).toThrow('[WS ERR_001] Boom');
    });
  });
});
