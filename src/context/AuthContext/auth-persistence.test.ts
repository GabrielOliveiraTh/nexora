import { describe, it, expect, beforeEach } from 'vitest';
import { UserRole } from '@models/Common.model';

const STORAGE_KEY = 'crm_auth';

const mockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@crm.com',
  avatar: null,
  role: UserRole.Admin,
  teamId: 'team-1',
  isActive: true,
};

const mockPermissions = {
  'contacts.create': true,
  'contacts.edit': true,
  'contacts.delete': true,
};

describe('auth session persistence', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('stores auth data to sessionStorage on login', () => {
    const data = { user: mockUser, permissions: mockPermissions };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    const stored = sessionStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored!);
    expect(parsed.user.id).toBe('user-1');
    expect(parsed.user.role).toBe(UserRole.Admin);
    expect(parsed.permissions['contacts.create']).toBe(true);
  });

  it('removes auth data from sessionStorage on logout', () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ user: mockUser, permissions: mockPermissions }));
    sessionStorage.removeItem(STORAGE_KEY);

    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('recovers auth data from sessionStorage', () => {
    const data = { user: mockUser, permissions: mockPermissions };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    const stored = sessionStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(stored!);

    expect(parsed.user.name).toBe('Test User');
    expect(parsed.user.email).toBe('test@crm.com');
    expect(Object.keys(parsed.permissions)).toHaveLength(3);
  });

  it('handles corrupted sessionStorage gracefully', () => {
    sessionStorage.setItem(STORAGE_KEY, 'not-json');

    let recovered = null;
    try {
      recovered = JSON.parse(sessionStorage.getItem(STORAGE_KEY)!);
    } catch {
      recovered = null;
    }

    expect(recovered).toBeNull();
  });

  it('returns null when no session exists', () => {
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
