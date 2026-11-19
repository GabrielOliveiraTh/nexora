/**
 * The app runs 100% frontend by default (mock data + local fallbacks in the
 * thunks). Without a backend, every `/api` or `/ws` call goes through the Vite
 * proxy and logs ECONNREFUSED, so network access is opt-in.
 *
 * Set VITE_BACKEND_ENABLED=true (e.g. in .env.local) when the backend is up
 * on :8080, then restart `npm run dev`.
 */
export const BACKEND_ENABLED = import.meta.env.VITE_BACKEND_ENABLED === 'true';

/** Rejection used when the backend is disabled (callers fall back locally). */
export class BackendDisabledError extends Error {
  constructor(target: string) {
    super(`Backend disabled (VITE_BACKEND_ENABLED != "true"): skipped ${target}`);
    this.name = 'BackendDisabledError';
  }
}
