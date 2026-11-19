import { describe, it, expect, beforeEach } from 'vitest';
import { AUTH_STORAGE_KEY, readSession, writeSession, clearSession } from '@context/AuthContext/auth-storage';
import { UserRole } from '@models/Common.model';

const session = {
  user: { id: 'u-1', name: 'Demo', email: 'user@test.com', avatar: null, role: UserRole.Admin, teamId: 't', isActive: true },
  permissions: { 'contacts.create': true },
};

describe('auth storage (BUG-01)', () => {
  beforeEach(() => sessionStorage.clear());

  it('restores a valid session synchronously', () => {
    writeSession(session);
    expect(readSession()).toEqual(session);
  });

  it('returns null and removes a corrupted session', () => {
    sessionStorage.setItem(AUTH_STORAGE_KEY, 'not-json');
    expect(readSession()).toBeNull();
    expect(sessionStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it('rejects a structurally invalid session', () => {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ foo: 1 }));
    expect(readSession()).toBeNull();
    expect(sessionStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it('clears the session', () => {
    writeSession(session);
    clearSession();
    expect(readSession()).toBeNull();
  });
});
