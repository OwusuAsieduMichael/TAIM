/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_API_BACKEND?: string;
  readonly VITE_GAS_URL?: string;
  /** When `"true"`, role login pages call the real API even in dev (default is UI-preview bypass). */
  readonly VITE_USE_REAL_ROLE_AUTH?: string;
  /** Set to `"false"` to hide demo credentials and one-tap sign-in. */
  readonly VITE_DEMO_LOGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
