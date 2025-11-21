/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_PORTAL_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}