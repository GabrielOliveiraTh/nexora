import type { ReactNode } from 'react';

interface AuthGuardContext {
  isAuthenticated: boolean;
}

export function requireAuth(context: AuthGuardContext): { redirect: string } | null {
  if (!context.isAuthenticated) {
    return { redirect: '/login' };
  }
  return null;
}

export function requireGuest(context: AuthGuardContext): { redirect: string } | null {
  if (context.isAuthenticated) {
    return { redirect: '/' };
  }
  return null;
}

export function PendingComponent(): ReactNode {
  return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
}

export function RouteErrorComponent({ error, reset }: { error: unknown; reset: () => void }): ReactNode {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div role="alert" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
      <h2>Something went wrong</h2>
      <p style={{ opacity: 0.65 }}>{message}</p>
      <button type="button" onClick={reset}>Try again</button>{' '}
      <a href="/">Go to dashboard</a>
    </div>
  );
}
