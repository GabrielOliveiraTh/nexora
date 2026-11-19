import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from '@redux/auth/slice';
import { AuthProvider, useAuth } from '@context/AuthContext/AuthContext';
import { writeSession, AUTH_STORAGE_KEY } from '@context/AuthContext/auth-storage';
import { UserRole } from '@models/Common.model';

const user = { id: 'u-1', name: 'Demo User', email: 'user@test.com', avatar: null, role: UserRole.Admin, teamId: 't', isActive: true };

function setup() {
  const store = configureStore({ reducer: { auth: authReducer } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <AuthProvider>{children}</AuthProvider>
    </Provider>
  );
  return { store, ...renderHook(() => useAuth(), { wrapper }) };
}

describe('AuthProvider', () => {
  beforeEach(() => sessionStorage.clear());

  it('is authenticated on the very first render when a session exists (BUG-01)', () => {
    writeSession({ user, permissions: {} });
    const { result, store } = setup();
    expect(result.current.isAuthenticated).toBe(true);
    expect(store.getState().auth.user?.email).toBe('user@test.com');
  });

  it('logout clears storage, context and Redux (BUG-04)', () => {
    const { result, store } = setup();
    act(() => result.current.login(user, { 'deals.edit': true }));
    expect(store.getState().auth.user?.id).toBe('u-1');
    expect(sessionStorage.getItem(AUTH_STORAGE_KEY)).not.toBeNull();

    act(() => result.current.logout());
    expect(result.current.isAuthenticated).toBe(false);
    expect(store.getState().auth.user).toBeNull();
    expect(sessionStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });
});
