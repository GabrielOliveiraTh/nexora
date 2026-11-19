import { createContext, useContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useWebSocket, SocketOfflineError } from '@context/WebSocketContext/WebSocketContext';

export interface EditLock {
  entityId: string;
  entityType: string;
  userId: string;
  userName: string;
  lockedAt: number;
}

/**
 * - `acquired`: the server granted the lock.
 * - `failed`: the server refused it, answered with an error or timed out.
 * - `offline`: no realtime connection (demo mode); locking isn't enforced.
 */
export type LockAcquireResult = 'acquired' | 'failed' | 'offline';

type LockListener = (lock: EditLock | null, entityType: string, entityId: string) => void;

interface SimultaneousEditingContextValue {
  acquireLock: (entityType: string, entityId: string) => Promise<LockAcquireResult>;
  releaseLock: (entityType: string, entityId: string) => Promise<void>;
  getLock: (entityType: string, entityId: string) => EditLock | null;
  isLockedByOther: (entityType: string, entityId: string, currentUserId: string) => boolean;
  onLockChange: (callback: LockListener) => () => void;
}

const SimultaneousEditingContext = createContext<SimultaneousEditingContextValue | null>(null);

const lockKey = (entityType: string, entityId: string) => `${entityType}:${entityId}`;

export function SimultaneousEditingProvider({ children }: { children: ReactNode }) {
  const { emit, on } = useWebSocket();
  // Locks live in state so every change (local or `lock:changed` from the
  // server) re-renders consumers and the warning shows/hides immediately.
  const [locks, setLocks] = useState<Record<string, EditLock>>({});
  const listenersRef = useRef<Set<LockListener>>(new Set());

  const applyLock = useCallback((entityType: string, entityId: string, lock: EditLock | null) => {
    setLocks((prev) => {
      const key = lockKey(entityType, entityId);
      if (lock) return { ...prev, [key]: lock };
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    for (const listener of listenersRef.current) {
      listener(lock, entityType, entityId);
    }
  }, []);

  // Locks taken/released by other users.
  useEffect(() => {
    return on('lock:changed', (data) => {
      const lockData = data as { lock: EditLock | null; entityType: string; entityId: string };
      applyLock(lockData.entityType, lockData.entityId, lockData.lock);
    });
  }, [on, applyLock]);

  const acquireLock = useCallback(async (entityType: string, entityId: string): Promise<LockAcquireResult> => {
    try {
      const lock = await emit<EditLock>('lock:acquire', { entityType, entityId });
      applyLock(entityType, entityId, lock);
      return 'acquired';
    } catch (error) {
      return error instanceof SocketOfflineError ? 'offline' : 'failed';
    }
  }, [emit, applyLock]);

  const releaseLock = useCallback(async (entityType: string, entityId: string): Promise<void> => {
    try {
      await emit('lock:release', { entityType, entityId });
    } catch {
      // Server unreachable: the lock will expire server-side; still clear it locally.
    }
    applyLock(entityType, entityId, null);
  }, [emit, applyLock]);

  const getLock = useCallback(
    (entityType: string, entityId: string): EditLock | null => locks[lockKey(entityType, entityId)] ?? null,
    [locks],
  );

  const isLockedByOther = useCallback((entityType: string, entityId: string, currentUserId: string): boolean => {
    const lock = locks[lockKey(entityType, entityId)];
    return lock !== undefined && lock.userId !== currentUserId;
  }, [locks]);

  const onLockChange = useCallback((callback: LockListener): (() => void) => {
    listenersRef.current.add(callback);
    return () => {
      listenersRef.current.delete(callback);
    };
  }, []);

  return (
    <SimultaneousEditingContext.Provider value={{ acquireLock, releaseLock, getLock, isLockedByOther, onLockChange }}>
      {children}
    </SimultaneousEditingContext.Provider>
  );
}

export function useSimultaneousEditing(): SimultaneousEditingContextValue {
  const context = useContext(SimultaneousEditingContext);
  if (!context) throw new Error('useSimultaneousEditing must be used within SimultaneousEditingProvider');
  return context;
}
