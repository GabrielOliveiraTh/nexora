import { createContext, useContext, useEffect, useRef, useCallback, useState, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { WSResponse } from '@appTypes/WSocket.type';
import { isWsError } from '@helpers/socket/socket.helper';
import { BACKEND_ENABLED } from '@config/backend/backend.config';

/** How long an emit waits for the server ack before rejecting. */
export const WS_ACK_TIMEOUT_MS = 5000;

/** Thrown by `emit` when there's no live connection (demo / offline mode). */
export class SocketOfflineError extends Error {
  constructor() {
    super('Socket not connected');
    this.name = 'SocketOfflineError';
  }
}

interface WebSocketContextValue {
  socket: Socket;
  isConnected: () => boolean;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  emit: <T>(event: string, payload: unknown) => Promise<T>;
  on: (event: string, callback: (data: unknown) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export function createAppSocket(): Socket {
  // NOTE: the first argument of `io()` is a *namespace*; the HTTP path that the
  // Vite proxy forwards is `/ws`, so it must be passed as `path`.
  return io({
    path: '/ws',
    withCredentials: true,
    transports: ['websocket'],
    autoConnect: false,
  });
}

interface WebSocketProviderProps {
  children: ReactNode;
  /** Injectable for tests (mock socket). */
  socketFactory?: () => Socket;
  ackTimeoutMs?: number;
  /** When false the socket never connects (offline/demo mode). */
  enabled?: boolean;
}

export function WebSocketProvider({
  children,
  socketFactory = createAppSocket,
  ackTimeoutMs = WS_ACK_TIMEOUT_MS,
  enabled = BACKEND_ENABLED,
}: WebSocketProviderProps) {
  // Created synchronously so listeners registered by children's effects
  // (which run before this provider's effects) are attached to a real socket.
  const [socket] = useState(socketFactory);
  const roomsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) return;
    const handleConnect = () => {
      for (const room of roomsRef.current) {
        socket.emit('join', { room });
      }
    };
    socket.on('connect', handleConnect);
    socket.connect();

    return () => {
      socket.off('connect', handleConnect);
      socket.disconnect();
    };
  }, [socket, enabled]);

  const isConnected = useCallback(() => socket.connected, [socket]);

  const joinRoom = useCallback((room: string) => {
    roomsRef.current.add(room);
    if (socket.connected) socket.emit('join', { room });
  }, [socket]);

  const leaveRoom = useCallback((room: string) => {
    roomsRef.current.delete(room);
    if (socket.connected) socket.emit('leave', { room });
  }, [socket]);

  const emit = useCallback(<T,>(event: string, payload: unknown): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!socket.connected) {
        reject(new SocketOfflineError());
        return;
      }
      socket.timeout(ackTimeoutMs).emit(event, payload, (err: Error | null, response: WSResponse<T>) => {
        if (err) {
          reject(new Error(`[WS timeout] No ack for "${event}" after ${ackTimeoutMs}ms`));
        } else if (isWsError(response)) {
          reject(new Error(`[WS ${response.code}] ${response.message}`));
        } else {
          resolve(response.data);
        }
      });
    });
  }, [socket, ackTimeoutMs]);

  const on = useCallback((event: string, callback: (data: unknown) => void): (() => void) => {
    socket.on(event, callback);
    return () => {
      socket.off(event, callback);
    };
  }, [socket]);

  return (
    <WebSocketContext.Provider value={{ socket, isConnected, joinRoom, leaveRoom, emit, on }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket(): WebSocketContextValue {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error('useWebSocket must be used within WebSocketProvider');
  return context;
}
