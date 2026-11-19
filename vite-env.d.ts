/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  /** "true" when the backend is running on :8080 (REST at /api, socket.io at /ws). */
  readonly VITE_BACKEND_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
