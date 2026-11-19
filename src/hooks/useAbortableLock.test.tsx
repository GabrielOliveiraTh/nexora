import { describe, it, expect, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { Socket } from 'socket.io-client';
import { WebSocketProvider } from '@context/WebSocketContext/WebSocketContext';
import { SimultaneousEditingProvider } from '@context/SimultaneousEditingContext/SimultaneousEditingContext';
import { useAbortableLock } from '@hooks/useAbortableLock';

type Ack = (err: Error | null, response?: unknown) => void;
type Handler = (data: unknown) => void;

/** Minimal socket.io client double. `respond` decides each ack. */
function createMockSocket(respond: (event: string, payload: unknown, ack: Ack) => void, connected = true) {
  const handlers = new Map<string, Set<Handler>>();
  const emitted: { event: string; payload: unknown }[] = [];
  const socket = {
    connected,
    on: (event: string, cb: Handler) => {
      if (!handlers.has(event)) handlers.set(event, new Set());
      handlers.get(event)?.add(cb);
      return socket;
    },
    off: (event: string, cb: Handler) => {
      handlers.get(event)?.delete(cb);
      return socket;
    },
    emit: vi.fn((event: string, payload: unknown) => {
      emitted.push({ event, payload });
      return socket;
    }),
    timeout: () => ({
      emit: (event: string, payload: unknown, ack: Ack) => {
        emitted.push({ event, payload });
        respond(event, payload, ack);
      },
    }),
    connect: () => socket,
    disconnect: () => socket,
  };
  const serverPush = (event: string, data: unknown) => {
    for (const cb of handlers.get(event) ?? []) cb(data);
  };
  return { socket: socket as unknown as Socket, emitted, serverPush };
}

function renderLock(mock: ReturnType<typeof createMockSocket>, initialEnabled: boolean, userId = 'me') {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <WebSocketProvider socketFactory={() => mock.socket} ackTimeoutMs={50}>
      <SimultaneousEditingProvider>{children}</SimultaneousEditingProvider>
    </WebSocketProvider>
  );
  return renderHook(({ enabled }) => useAbortableLock('deal', 'd-1', userId, enabled), {
    wrapper,
    initialProps: { enabled: initialEnabled },
  });
}

const grant = (_event: string, payload: unknown, ack: Ack) => {
  const { entityType, entityId } = payload as { entityType: string; entityId: string };
  ack(null, { data: { entityType, entityId, userId: 'me', userName: 'Me', lockedAt: 1 } });
};

describe('useAbortableLock (BUG-13)', () => {
  it('(a) acquires on open and (b) releases on close', async () => {
    const mock = createMockSocket(grant);
    const { rerender, result } = renderLock(mock, true);

    await waitFor(() => expect(mock.emitted).toContainEqual({ event: 'lock:acquire', payload: { entityType: 'deal', entityId: 'd-1' } }));
    expect(result.current.isLocked).toBe(false);
    expect(result.current.lockFailed).toBe(false);

    rerender({ enabled: false });
    await waitFor(() => expect(mock.emitted).toContainEqual({ event: 'lock:release', payload: { entityType: 'deal', entityId: 'd-1' } }));
  });

  it('(c) a lock:changed from another user locks the form immediately, and unlocks on release', async () => {
    const mock = createMockSocket(grant);
    const { result } = renderLock(mock, false);

    act(() => {
      mock.serverPush('lock:changed', {
        entityType: 'deal',
        entityId: 'd-1',
        lock: { entityType: 'deal', entityId: 'd-1', userId: 'other', userName: 'Other', lockedAt: 1 },
      });
    });
    expect(result.current.isLocked).toBe(true);

    act(() => {
      mock.serverPush('lock:changed', { entityType: 'deal', entityId: 'd-1', lock: null });
    });
    expect(result.current.isLocked).toBe(false);
  });

  it('(d) an error ack flags lockFailed', async () => {
    const mock = createMockSocket((_e, _p, ack) => ack(null, { error: true, code: 'LOCKED', message: 'busy' }));
    const { result } = renderLock(mock, true);
    await waitFor(() => expect(result.current.lockFailed).toBe(true));
  });

  it('(d) an ack timeout flags lockFailed', async () => {
    const mock = createMockSocket((_e, _p, ack) => setTimeout(() => ack(new Error('timeout')), 10));
    const { result } = renderLock(mock, true);
    await waitFor(() => expect(result.current.lockFailed).toBe(true));
  });

  it('offline (no connection) does not block editing and emits nothing', async () => {
    const respond = vi.fn();
    const mock = createMockSocket(respond, false);
    const { result } = renderLock(mock, true);
    await act(async () => {
      await Promise.resolve();
    });
    expect(respond).not.toHaveBeenCalled();
    expect(result.current.lockFailed).toBe(false);
    expect(result.current.isLocked).toBe(false);
  });
});
