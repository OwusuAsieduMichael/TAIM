/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  /** When `"true"`, role login pages call the real API even in dev (default is UI-preview bypass). */
  readonly VITE_USE_REAL_ROLE_AUTH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
