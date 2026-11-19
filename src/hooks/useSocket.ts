import { useEffect, useRef, useCallback } from 'react';
import { useWebSocket } from '@context/WebSocketContext/WebSocketContext';

export function useSocket<T = unknown>(
  room: string,
  event: string,
  callback: (data: T) => void,
  enabled = true,
): void {
  const { joinRoom, leaveRoom, on } = useWebSocket();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    joinRoom(room);
    const unsub = on(event, (data) => callbackRef.current(data as T));

    return () => {
      unsub();
      leaveRoom(room);
    };
  }, [room, event, enabled, joinRoom, leaveRoom, on]);
}

export function useSocketEmit() {
  const { emit } = useWebSocket();

  return useCallback(
    <T,>(event: string, payload: unknown) => emit<T>(event, payload),
    [emit],
  );
}
