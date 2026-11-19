import type { User } from '@models/Common.model';

export const AUTH_STORAGE_KEY = 'crm_auth';

export interface StoredSession {
  user: User;
  permissions: Record<string, boolean>;
}

function isStoredSession(value: unknown): value is StoredSession {
  if (!value || typeof value !== 'object') return false;
  const { user, permissions } = value as Partial<StoredSession>;
  return (
    !!user &&
    typeof user === 'object' &&
    typeof user.id === 'string' &&
    typeof user.email === 'string' &&
    !!permissions &&
    typeof permissions === 'object'
  );
}

/**
 * Reads the persisted session synchronously. A corrupted or malformed value
 * is removed from storage so it doesn't keep failing on every load.
 */
export function readSession(): StoredSession | null {
  if (typeof sessionStorage === 'undefined') return null;
  const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;
  try {
    const parsed: unknown = JSON.parse(stored);
    if (isStoredSession(parsed)) return parsed;
  } catch {
    /* fall through to cleanup */
  }
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  return null;
}

export function writeSession(session: StoredSession): void {
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}
