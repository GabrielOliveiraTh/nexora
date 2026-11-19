import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User } from '@models/Common.model';
import { UserRole } from '@models/Common.model';
import { useAppDispatch } from '@hooks/useAppStore';
import { authLoaded, authCleared } from '@redux/auth/slice';
import { readSession, writeSession, clearSession } from '@context/AuthContext/auth-storage';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  permissions: Record<string, boolean>;
  login: (user: User, permissions: Record<string, boolean>) => void;
  logout: () => void;
  hasPermission: (key: string) => boolean;
  hasAnyPermission: (keys: string[]) => boolean;
  hasAllPermissions: (keys: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  // Restore synchronously so the very first render (and the router's
  // beforeLoad guard) already sees the persisted session.
  const [session, setSession] = useState(() => readSession());

  const user = session?.user ?? null;
  const permissions = session?.permissions ?? {};
  const isAuthenticated = user !== null;

  // Keep the Redux auth slice in sync with a restored session (e.g. after F5).
  useEffect(() => {
    if (session) {
      dispatch(authLoaded(session));
    }
    // Only on mount: login/logout dispatch on their own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback((newUser: User, newPermissions: Record<string, boolean>) => {
    const next = { user: newUser, permissions: newPermissions };
    setSession(next);
    writeSession(next);
    dispatch(authLoaded(next));
  }, [dispatch]);

  const logout = useCallback(() => {
    setSession(null);
    clearSession();
    dispatch(authCleared());
  }, [dispatch]);

  const hasPermission = useCallback(
    (key: string) => permissions[key] === true || user?.role === UserRole.Admin,
    [permissions, user],
  );

  const hasAnyPermission = useCallback(
    (keys: string[]) => keys.some((key) => hasPermission(key)),
    [hasPermission],
  );

  const hasAllPermissions = useCallback(
    (keys: string[]) => keys.every((key) => hasPermission(key)),
    [hasPermission],
  );

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, permissions, login, logout, hasPermission, hasAnyPermission, hasAllPermissions }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
