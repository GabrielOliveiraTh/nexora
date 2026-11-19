import type { ReactNode } from 'react';
import { useAuth } from '@context/AuthContext/AuthContext';

interface GrantChildrenHOCProps {
  authorizationKey: string | string[];
  keyMatch?: 'ALL' | 'ANY';
  children: ReactNode;
  fallback?: ReactNode;
}

export function GrantChildrenHOC({
  authorizationKey,
  keyMatch = 'ANY',
  children,
  fallback = null,
}: GrantChildrenHOCProps): ReactNode {
  const { hasAnyPermission, hasAllPermissions } = useAuth();

  const keys = Array.isArray(authorizationKey) ? authorizationKey : [authorizationKey];

  const isAllowed = keyMatch === 'ALL'
    ? hasAllPermissions(keys)
    : hasAnyPermission(keys);

  if (!isAllowed) return fallback;
  return children;
}
