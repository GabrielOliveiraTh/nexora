import { useEffect, useRef, useCallback, useState } from 'react';
import { useSimultaneousEditing, type LockAcquireResult } from '@context/SimultaneousEditingContext/SimultaneousEditingContext';

interface UseAbortableLockResult {
  acquire: () => Promise<LockAcquireResult>;
  release: () => Promise<void>;
  /** Another user holds the lock. */
  isLocked: boolean;
  /** We tried to take the lock and the server refused / didn't answer. */
  lockFailed: boolean;
}

/**
 * Edit lock for a single entity. When `enabled` is true the lock is acquired
 * automatically and released when it turns false, the entity changes or the
 * component unmounts.
 */
export function useAbortableLock(
  entityType: string,
  entityId: string,
  currentUserId: string,
  enabled = false,
): UseAbortableLockResult {
  const { acquireLock, releaseLock, isLockedByOther } = useSimultaneousEditing();
  const heldRef = useRef(false);
  const pendingRef = useRef<Promise<LockAcquireResult> | null>(null);
  const [lockFailed, setLockFailed] = useState(false);

  const acquire = useCallback(async (): Promise<LockAcquireResult> => {
    const pending = acquireLock(entityType, entityId);
    pendingRef.current = pending;
    const result = await pending;
    if (pendingRef.current === pending) pendingRef.current = null;
    heldRef.current = result === 'acquired';
    setLockFailed(result === 'failed');
    return result;
  }, [acquireLock, entityType, entityId]);

  const release = useCallback(async (): Promise<void> => {
    // If an acquire is still in flight, wait for it so we don't leak the lock.
    if (pendingRef.current) await pendingRef.current;
    setLockFailed(false);
    if (heldRef.current) {
      heldRef.current = false;
      await releaseLock(entityType, entityId);
    }
  }, [releaseLock, entityType, entityId]);

  useEffect(() => {
    if (!enabled || !entityId) return;
    void acquire();
    return () => {
      void release();
    };
  }, [enabled, entityId, acquire, release]);

  return {
    acquire,
    release,
    isLocked: !!entityId && isLockedByOther(entityType, entityId, currentUserId),
    lockFailed: enabled && lockFailed,
  };
}
