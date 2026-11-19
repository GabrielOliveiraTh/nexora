import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { authReducer, authLoaded, authCleared, permissionsUpdated } from '@redux/auth/slice';
import { UserRole } from '@models/Common.model';
import { MOCK_USER_ID } from '@mock/contacts.mock';

function createStore() {
  return configureStore({
    reducer: { auth: authReducer },
  });
}

const mockUser = {
  id: MOCK_USER_ID,
  name: 'Demo User',
  email: 'demo@crm.com',
  avatar: null,
  role: UserRole.Admin,
  teamId: 'team-1',
  isActive: true,
};

const mockPermissions = {
  'contacts.create': true,
  'contacts.edit': true,
  'contacts.delete': true,
  'contacts.export': true,
  'contacts.import': true,
  'contacts.bulkEdit': true,
  'deals.create': true,
  'deals.edit': true,
  'deals.delete': true,
};

describe('auth slice', () => {
  it('starts with no user', () => {
    const store = createStore();
    expect(store.getState().auth.user).toBeNull();
    expect(store.getState().auth.status).toBe('idle');
    expect(store.getState().auth.permissions).toEqual({});
  });

  it('loads auth state with user and permissions', () => {
    const store = createStore();
    store.dispatch(authLoaded({ user: mockUser, permissions: mockPermissions }));

    const state = store.getState().auth;
    expect(state.user).toEqual(mockUser);
    expect(state.status).toBe('succeeded');
    expect(state.permissions).toEqual(mockPermissions);
  });

  it('clears auth state on logout', () => {
    const store = createStore();
    store.dispatch(authLoaded({ user: mockUser, permissions: mockPermissions }));
    store.dispatch(authCleared());

    const state = store.getState().auth;
    expect(state.user).toBeNull();
    expect(state.status).toBe('idle');
    expect(state.permissions).toEqual({});
  });

  it('updates permissions incrementally', () => {
    const store = createStore();
    store.dispatch(authLoaded({ user: mockUser, permissions: mockPermissions }));
    store.dispatch(permissionsUpdated({ 'reports.view': true }));

    const perms = store.getState().auth.permissions;
    expect(perms['contacts.create']).toBe(true);
    expect(perms['reports.view']).toBe(true);
  });

  it('overrides existing permissions on update', () => {
    const store = createStore();
    store.dispatch(authLoaded({ user: mockUser, permissions: mockPermissions }));
    store.dispatch(permissionsUpdated({ 'contacts.delete': false }));

    expect(store.getState().auth.permissions['contacts.delete']).toBe(false);
    expect(store.getState().auth.permissions['contacts.create']).toBe(true);
  });

  it('full login-logout cycle preserves clean state', () => {
    const store = createStore();

    store.dispatch(authLoaded({ user: mockUser, permissions: mockPermissions }));
    expect(store.getState().auth.user?.id).toBe(MOCK_USER_ID);

    store.dispatch(authCleared());
    expect(store.getState().auth.user).toBeNull();

    store.dispatch(authLoaded({ user: { ...mockUser, name: 'Other' }, permissions: {} }));
    expect(store.getState().auth.user?.name).toBe('Other');
    expect(store.getState().auth.permissions).toEqual({});
  });
});
